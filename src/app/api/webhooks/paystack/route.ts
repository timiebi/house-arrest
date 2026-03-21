import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const paystackSecret = process.env.PAYSTACK_SECRET_KEY || '';

function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader || !paystackSecret) return false;
  const digest = createHmac('sha512', paystackSecret).update(rawBody).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(digest), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}

type PaystackWebhookEvent = {
  event?: string;
  data?: {
    reference?: string;
    amount?: number;
    currency?: string;
    customer?: { email?: string };
    metadata?: {
      order_id?: string;
      productId?: string;
      driveFileId?: string;
    };
  };
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-paystack-signature');

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: PaystackWebhookEvent;
  try {
    event = JSON.parse(rawBody) as PaystackWebhookEvent;
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  if (event.event !== 'charge.success') {
    return NextResponse.json({ ok: true, ignored: true }, { status: 200 });
  }

  const reference = event.data?.reference;
  const orderIdFromMetadata = event.data?.metadata?.order_id;
  const packId = event.data?.metadata?.productId;
  if (!reference || !packId) {
    return NextResponse.json({ error: 'Missing payment metadata' }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  let orderId = orderIdFromMetadata || null;
  if (!orderId) {
    const { data: byRef } = await supabase
      .from('orders')
      .select('id')
      .eq('paystack_reference', reference)
      .single();
    orderId = byRef?.id || null;
  }

  if (!orderId) {
    const { data: insertedOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        email: event.data?.customer?.email || 'customer@example.com',
        total_cents: Math.max(0, Number(event.data?.amount || 0)),
        currency: event.data?.currency || 'USD',
        status: 'paid',
        paystack_reference: reference,
      })
      .select('id')
      .single();

    if (orderError || !insertedOrder) {
      return NextResponse.json({ error: 'Could not create order from webhook' }, { status: 500 });
    }
    orderId = insertedOrder.id;
  }

  const { data: currentOrder } = await supabase
    .from('orders')
    .select('id, status, charged_amount_minor, charged_currency')
    .eq('id', orderId)
    .single();

  // Idempotency guard: payment already fulfilled.
  if (currentOrder?.status === 'paid' || currentOrder?.status === 'fulfilled') {
    return NextResponse.json({ ok: true, alreadyFulfilled: true }, { status: 200 });
  }

  const chargedAmount = Number(event.data?.amount || 0);
  const chargedCurrency = (event.data?.currency || '').toUpperCase();
  if (
    currentOrder?.charged_amount_minor &&
    currentOrder.charged_amount_minor !== chargedAmount
  ) {
    return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
  }
  if (
    currentOrder?.charged_currency &&
    chargedCurrency &&
    currentOrder.charged_currency.toUpperCase() !== chargedCurrency
  ) {
    return NextResponse.json({ error: 'Currency mismatch' }, { status: 400 });
  }

  await supabase
    .from('orders')
    .update({
      status: 'paid',
      paystack_reference: reference,
    })
    .eq('id', orderId);

  const { data: existingItem } = await supabase
    .from('order_items')
    .select('id')
    .eq('order_id', orderId)
    .eq('patch_id', packId)
    .maybeSingle();

  if (!existingItem) {
    const { data: patch } = await supabase
      .from('patches')
      .select('price_cents')
      .eq('id', packId)
      .single();
    await supabase.from('order_items').insert({
      order_id: orderId,
      patch_id: packId,
      quantity: 1,
      price_cents: patch?.price_cents || 0,
    });
  }

  let rawToken: string | null = null;
  const { data: existingGrant } = await supabase
    .from('download_grants')
    .select('id')
    .eq('order_id', orderId)
    .eq('patch_id', packId)
    .maybeSingle();

  if (!existingGrant) {
    rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const { error: grantError } = await supabase.from('download_grants').insert({
      order_id: orderId,
      patch_id: packId,
      token_hash: tokenHash,
      downloads_remaining: 5,
    });
    if (grantError) {
      return NextResponse.json({ error: 'Could not create download grant' }, { status: 500 });
    }

  }

  const { data: existingDelivery } = await supabase
    .from('download_token_deliveries')
    .select('id')
    .eq('order_id', orderId)
    .eq('patch_id', packId)
    .maybeSingle();

  if (!existingDelivery && rawToken) {
    await supabase.from('download_token_deliveries').insert({
      order_id: orderId,
      patch_id: packId,
      raw_token: rawToken,
    });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

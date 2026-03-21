import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY!;

export async function POST(request: NextRequest) {
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  // Verify Paystack signature using timing-safe comparison
  const signature = request.headers.get('x-paystack-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const expectedSignature = createHmac('sha512', paystackSecretKey)
    .update(rawBody)
    .digest('hex');

  try {
    const sigBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    if (sigBuffer.length !== expectedBuffer.length || !timingSafeEqual(sigBuffer, expectedBuffer)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: { event: string; data: { reference: string; amount: number; currency: string; metadata?: { order_id?: string; pack_id?: string } } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (event.event !== 'charge.success') {
    return NextResponse.json({ received: true });
  }

  const { reference, amount, currency, metadata } = event.data;
  const orderId = metadata?.order_id;

  if (!orderId || !reference) {
    return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Generate a token hash for the grant (raw token is not needed by webhook)
  const rawToken = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(rawToken).digest('hex');

  // Use the idempotent DB function for fulfilment
  const { data: result, error: rpcError } = await supabase.rpc('fulfil_order', {
    p_order_id: orderId,
    p_reference: reference,
    p_verified_amount: amount,
    p_verified_currency: currency,
    p_token_hash: tokenHash,
  });

  if (rpcError) {
    // Return 200 so Paystack doesn't keep retrying for DB errors we can't fix
    return NextResponse.json({ received: true, error: 'fulfilment_error' });
  }

  if (!result?.ok) {
    return NextResponse.json({ received: true, error: result?.error || 'fulfilment_failed' });
  }

  return NextResponse.json({ received: true });
}

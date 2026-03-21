import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash, createHmac, randomBytes } from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY!;

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  // Verify Paystack signature
  const signature = request.headers.get('x-paystack-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const expectedSignature = createHmac('sha512', paystackSecretKey)
    .update(rawBody)
    .digest('hex');

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event !== 'charge.success') {
    // Acknowledge events we don't handle
    return NextResponse.json({ received: true });
  }

  const { reference, metadata } = event.data;
  const orderId = metadata?.order_id as string | undefined;
  const packId = metadata?.pack_id as string | undefined;

  if (!orderId || !packId) {
    return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Check if this order has already been fulfilled
  const { data: order } = await supabase
    .from('orders')
    .select('id, status')
    .eq('id', orderId)
    .single();

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  if (order.status === 'paid') {
    // Already fulfilled — idempotent
    return NextResponse.json({ received: true });
  }

  // Mark order as paid
  await supabase
    .from('orders')
    .update({
      status: 'paid',
      paystack_reference: reference,
    })
    .eq('id', orderId);

  // Create download grant
  const rawToken = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(rawToken).digest('hex');

  await supabase.from('download_grants').insert({
    order_id: orderId,
    patch_id: packId,
    token_hash: tokenHash,
    downloads_remaining: 5,
  });

  // Store the raw token on the order so the thank-you page can retrieve it
  // We use a dedicated column or we can look it up via the grant.
  // For now, the thank-you page will verify the payment and look up the grant.

  return NextResponse.json({ received: true });
}

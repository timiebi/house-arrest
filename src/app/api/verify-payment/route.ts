import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash, randomBytes } from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY!;

const NO_STORE = { 'Cache-Control': 'no-store' };

export async function POST(request: NextRequest) {
  let body: { reference?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400, headers: NO_STORE });
  }

  const reference = (body.reference ?? '').trim();
  if (!reference) {
    return NextResponse.json({ error: 'Missing reference' }, { status: 400, headers: NO_STORE });
  }

  // Verify the transaction with Paystack
  const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${paystackSecretKey}` },
  });
  const paystackData = await paystackRes.json();

  if (!paystackData.status || paystackData.data?.status !== 'success') {
    return NextResponse.json({ error: 'Payment not confirmed' }, { status: 402, headers: NO_STORE });
  }

  const verifiedAmount = paystackData.data.amount as number;
  const verifiedCurrency = paystackData.data.currency as string;

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Find the order by paystack_reference
  const { data: order } = await supabase
    .from('orders')
    .select('id, email, total_cents, currency, status')
    .eq('paystack_reference', reference)
    .single();

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404, headers: NO_STORE });
  }

  // Validate that Paystack's verified amount/currency match our order
  if (order.total_cents !== verifiedAmount) {
    return NextResponse.json({ error: 'Amount mismatch' }, { status: 400, headers: NO_STORE });
  }
  if (order.currency.toLowerCase() !== verifiedCurrency.toLowerCase()) {
    return NextResponse.json({ error: 'Currency mismatch' }, { status: 400, headers: NO_STORE });
  }

  // Generate a download token and fulfil via the idempotent RPC
  const rawToken = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(rawToken).digest('hex');

  const { data: result, error: rpcError } = await supabase.rpc('fulfil_order', {
    p_order_id: order.id,
    p_reference: reference,
    p_verified_amount: verifiedAmount,
    p_verified_currency: verifiedCurrency,
    p_token_hash: tokenHash,
  });

  if (rpcError || !result?.ok) {
    return NextResponse.json(
      { error: result?.error || 'Could not fulfil order' },
      { status: 500, headers: NO_STORE },
    );
  }

  // If the order was already fulfilled (by webhook), look up the existing grant's token_hash
  // — the RPC did ON CONFLICT DO NOTHING, so our new tokenHash wasn't inserted.
  // We need to return the existing token. Since we can't recover the raw token from the hash,
  // update the grant with our new token so the user gets a working download link.
  if (result.already_fulfilled) {
    // Fetch the existing grant and update its token so this user can download
    const { data: items } = await supabase
      .from('order_items')
      .select('patch_id')
      .eq('order_id', order.id)
      .limit(1);

    const packId = items?.[0]?.patch_id;
    if (packId) {
      await supabase
        .from('download_grants')
        .update({ token_hash: tokenHash, updated_at: new Date().toISOString() })
        .eq('order_id', order.id)
        .eq('patch_id', packId);
    }
  }

  // Fetch order items for the response
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('id, order_id, patch_id, quantity, price_cents, patches ( id, name )')
    .eq('order_id', order.id);

  return NextResponse.json({
    order: { ...order, status: 'paid' },
    items: orderItems || [],
    download_token: rawToken,
  }, { headers: NO_STORE });
}

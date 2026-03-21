import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash, randomBytes } from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY!;

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get('reference');
  if (!reference) {
    return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
  }

  // Verify the transaction with Paystack
  const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${paystackSecretKey}` },
  });
  const paystackData = await paystackRes.json();

  if (!paystackData.status || paystackData.data?.status !== 'success') {
    return NextResponse.json({ error: 'Payment not confirmed' }, { status: 402 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Find the order by paystack_reference
  const { data: order } = await supabase
    .from('orders')
    .select('id, email, total_cents, currency, status')
    .eq('paystack_reference', reference)
    .single();

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // If the webhook hasn't fired yet, fulfil the order now
  if (order.status !== 'paid') {
    await supabase.from('orders').update({ status: 'paid' }).eq('id', order.id);
  }

  // Fetch order items
  const { data: items } = await supabase
    .from('order_items')
    .select('id, order_id, patch_id, quantity, price_cents, patches ( id, name )')
    .eq('order_id', order.id);

  // Ensure a download grant exists (webhook may or may not have created one yet)
  const packId = (items && items.length > 0) ? items[0].patch_id : null;

  let downloadToken: string | null = null;

  if (packId) {
    const { data: existingGrant } = await supabase
      .from('download_grants')
      .select('id, downloads_remaining')
      .eq('order_id', order.id)
      .eq('patch_id', packId)
      .single();

    if (existingGrant) {
      // Grant exists (webhook already fired) — generate a fresh token for the user
      const rawToken = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(rawToken).digest('hex');
      await supabase
        .from('download_grants')
        .update({ token_hash: tokenHash, updated_at: new Date().toISOString() })
        .eq('id', existingGrant.id);
      downloadToken = rawToken;
    } else {
      // Webhook hasn't fired yet — create the grant now
      const rawToken = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(rawToken).digest('hex');
      await supabase.from('download_grants').insert({
        order_id: order.id,
        patch_id: packId,
        token_hash: tokenHash,
        downloads_remaining: 5,
      });
      downloadToken = rawToken;
    }
  }

  return NextResponse.json({
    order,
    items: items || [],
    download_token: downloadToken,
  });
}

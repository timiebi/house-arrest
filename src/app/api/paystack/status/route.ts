import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get('reference');
  if (!reference) {
    return NextResponse.json({ error: 'Missing payment reference.' }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: order } = await supabase
    .from('orders')
    .select('id, status, email, total_cents, currency, paystack_reference')
    .eq('paystack_reference', reference)
    .single();

  if (!order) {
    return NextResponse.json({ status: 'pending' }, { status: 200 });
  }

  const { data: items } = await supabase
    .from('order_items')
    .select('id, patch_id, quantity, price_cents, patches(id, name)')
    .eq('order_id', order.id);

  const firstItem = items?.[0];
  const { data: delivery } = await supabase
    .from('download_token_deliveries')
    .select('raw_token')
    .eq('order_id', order.id)
    .eq('patch_id', firstItem?.patch_id || '')
    .maybeSingle();

  const normalizedItems = (items || []).map((row: any) => ({
    id: row.id,
    patch_id: row.patch_id,
    quantity: row.quantity,
    price_cents: row.price_cents,
    patch_name: Array.isArray(row.patches) ? row.patches[0]?.name : row.patches?.name,
  }));

  return NextResponse.json({
    status: order.status || 'pending',
    order_id: order.id,
    token: delivery?.raw_token || null,
    items: normalizedItems,
  });
}

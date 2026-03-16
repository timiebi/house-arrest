import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pack_id, pack_name, price_cents, currency, email } = body as {
      pack_id: string;
      pack_name?: string;
      price_cents: number;
      currency?: string;
      email?: string;
    };
    if (!pack_id || price_cents == null) {
      return NextResponse.json({ error: 'Missing pack_id or price_cents' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        email: typeof email === 'string' && email.trim() ? email.trim() : 'customer@example.com',
        total_cents: price_cents,
        currency: currency || 'USD',
        status: 'paid',
      })
      .select('id')
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: orderError?.message || 'Failed to create order' }, { status: 500 });
    }

    const { error: itemError } = await supabase.from('order_items').insert({
      order_id: order.id,
      patch_id: pack_id,
      quantity: 1,
      price_cents,
    });

    if (itemError) {
      return NextResponse.json({ error: itemError.message }, { status: 500 });
    }

    // TODO: send post-purchase email with link to /purchase/thank-you?order_id=...

    return NextResponse.json({ order_id: order.id });
  } catch (e) {
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v7 as uuidv7 } from 'uuid';


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY!;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pack_id, currency, email } = body as {
      pack_id: string;
      currency: string;
      email: string;
    };

    const trimmedPackId = pack_id.trim();
    const trimmedEmail = email.trim();

    if (!trimmedPackId) {
      return NextResponse.json({ error: 'sample pack not found' }, { status: 400 });
    }

    if (!trimmedEmail) {
      return NextResponse.json({ error: 'e-mail is required' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const orderCurrency = 'NGN' // paystack test mode doesn't support USD, so we default to NGN for now

    const { data: packInfo, error: packError } = await supabase
      .from('patches')
      .select('id, name, price_cents, currency, file_path, delivery_url, status')
      .eq('status', 'published')
      .eq('id', trimmedPackId)
      .single();

    if (packError || !packInfo || packInfo.status !== 'published') {
      return NextResponse.json({ error: 'sample pack not found' }, { status: 404 });
    }

    // we generate a unique reference for the order to pass to Paystack
    const ref = `sl_${uuidv7()}`;

    // Create order with pending status — only marked paid after Paystack confirms
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        email: email.trim(),
        total_cents: packInfo.price_cents,
        currency: 'NGN',
        status: 'pending',
        paystack_reference: ref,
      })
      .select('id')
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Could not start checkout right now. Please try again.' }, { status: 500 });
    }

    // Initialize Paystack transaction
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || '';
    const callbackUrl = `${origin}/purchase/thank - you`;

    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecretKey} `,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: trimmedEmail,
        amount: packInfo.price_cents, // Paystack expects amount in the smallest currency unit (kobo/cents)
        currency: orderCurrency,
        callback_url: callbackUrl,
        reference: ref,
        metadata: {
          order_id: order.id,
          pack_id,
        },
      }),
    });

    const paystackData = await paystackRes.json();
    if (!paystackData.status || !paystackData.data?.authorization_url) {
      return NextResponse.json({ error: 'Could not initialize payment. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({
      authorization_url: paystackData.data.authorization_url,
      reference: paystackData.data.reference,
      order_id: order.id,
    });
  } catch {
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}

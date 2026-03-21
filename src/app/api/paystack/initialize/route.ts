import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { extractGoogleDriveFileId } from '@/lib/drive';
import { getUsdToNgnRate, usdCentsToNgnKobo } from '@/lib/fx';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(request: Request) {
  try {
    if (!paystackSecret) {
      return NextResponse.json({ error: 'Payments are temporarily unavailable.' }, { status: 500 });
    }

    const body = await request.json();
    const { pack_id, email } = body as { pack_id?: string; email?: string };
    if (!pack_id) {
      return NextResponse.json({ error: 'Missing pack id.' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: pack, error: packError } = await supabase
      .from('patches')
      .select('id, name, price_cents, currency, status, delivery_url')
      .eq('id', pack_id)
      .single();

    if (packError || !pack || pack.status !== 'published') {
      return NextResponse.json({ error: 'This pack is not available right now.' }, { status: 404 });
    }

    const buyerEmail = typeof email === 'string' && email.trim() ? email.trim() : 'customer@example.com';
    const baseCurrency = (pack.currency || 'USD').toUpperCase();
    const baseAmountMinor = Math.max(0, Number(pack.price_cents) || 0);
    let paystackCurrency = baseCurrency;
    let paystackAmountMinor = baseAmountMinor;
    let fxRate: number | null = null;

    // If packs are priced in USD, transparently charge in NGN for Paystack.
    if (baseCurrency === 'USD') {
      fxRate = await getUsdToNgnRate();
      paystackCurrency = 'NGN';
      paystackAmountMinor = usdCentsToNgnKobo(baseAmountMinor, fxRate);
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        email: buyerEmail,
        total_cents: paystackAmountMinor,
        currency: paystackCurrency,
        charged_currency: paystackCurrency,
        charged_amount_minor: paystackAmountMinor,
        usd_price_cents: baseCurrency === 'USD' ? baseAmountMinor : null,
        fx_rate: fxRate,
        status: 'pending',
      })
      .select('id')
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Could not start checkout right now. Please try again.' }, { status: 500 });
    }

    const driveFileId = extractGoogleDriveFileId(pack.delivery_url);

    const callbackUrl = `${appUrl}/purchase/thank-you`;
    const payload = {
      email: buyerEmail,
      amount: paystackAmountMinor,
      currency: paystackCurrency,
      callback_url: callbackUrl,
      metadata: {
        order_id: order.id,
        productId: pack.id,
        driveFileId: driveFileId,
        displayCurrency: baseCurrency,
        displayAmountMinor: baseAmountMinor,
        chargedCurrency: paystackCurrency,
        chargedAmountMinor: paystackAmountMinor,
        fxRate: fxRate,
      },
    };

    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const paystackJson = await paystackRes.json();
    if (!paystackRes.ok || !paystackJson?.status || !paystackJson?.data?.authorization_url) {
      return NextResponse.json({ error: 'Could not open payment page. Please try again.' }, { status: 500 });
    }

    const reference: string | null = paystackJson?.data?.reference || null;
    if (reference) {
      await supabase.from('orders').update({ paystack_reference: reference }).eq('id', order.id);
    }

    return NextResponse.json({
      authorization_url: paystackJson.data.authorization_url as string,
      reference,
      order_id: order.id,
    });
  } catch {
    return NextResponse.json({ error: 'Could not start checkout right now. Please try again.' }, { status: 500 });
  }
}

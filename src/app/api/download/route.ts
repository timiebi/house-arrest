import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'Missing download token' }, { status: 400 });
  }

  const tokenHash = createHash('sha256').update(token).digest('hex');
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Atomic decrement via DB function — handles expiry, revocation, and limit checks
  const { data: result, error: rpcError } = await supabase.rpc('decrement_download', {
    p_token_hash: tokenHash,
  });

  if (rpcError) {
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }

  if (!result?.ok) {
    const errorMap: Record<string, { message: string; status: number }> = {
      invalid_token: { message: 'Invalid download token', status: 403 },
      revoked: { message: 'Download token revoked', status: 403 },
      expired: { message: 'Download token expired', status: 403 },
      limit_reached: { message: 'Download limit reached', status: 403 },
    };
    const err = errorMap[result?.error] ?? { message: 'Download failed', status: 403 };
    return NextResponse.json({ error: err.message }, { status: err.status });
  }

  const { data: patch } = await supabase
    .from('patches')
    .select('delivery_url')
    .eq('id', result.patch_id)
    .single();

  if (!patch?.delivery_url) {
    return NextResponse.json({ error: 'Pack delivery link not configured yet' }, { status: 404 });
  }

  return NextResponse.redirect(patch.delivery_url);
}

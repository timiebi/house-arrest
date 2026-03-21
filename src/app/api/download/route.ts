import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'Missing download token' }, { status: 400 });
  }

  const tokenHash = createHash('sha256').update(token).digest('hex');
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: grant } = await supabase
    .from('download_grants')
    .select('id, patch_id, downloads_remaining, expires_at, revoked')
    .eq('token_hash', tokenHash)
    .single();

  if (!grant) {
    return NextResponse.json({ error: 'Invalid download token' }, { status: 403 });
  }

  if (grant.revoked) {
    return NextResponse.json({ error: 'Download token revoked' }, { status: 403 });
  }

  if (new Date(grant.expires_at).getTime() <= Date.now()) {
    return NextResponse.json({ error: 'Download token expired' }, { status: 403 });
  }

  const { data: decremented } = await supabase
    .from('download_grants')
    .update({
      downloads_remaining: Math.max(0, grant.downloads_remaining - 1),
      updated_at: new Date().toISOString(),
    })
    .eq('id', grant.id)
    .gt('downloads_remaining', 0)
    .select('id')
    .single();

  if (!decremented) {
    return NextResponse.json({ error: 'Download limit reached' }, { status: 403 });
  }

  const { data: patch } = await supabase
    .from('patches')
    .select('delivery_url')
    .eq('id', grant.patch_id)
    .single();

  if (!patch?.delivery_url) {
    return NextResponse.json({ error: 'Pack delivery link not configured yet' }, { status: 404 });
  }

  return NextResponse.redirect(patch.delivery_url);
}

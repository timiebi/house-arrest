import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import { extractGoogleDriveFileId } from '@/lib/drive';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const googleDriveApiKey = process.env.GOOGLE_DRIVE_API_KEY;

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

  const { data: decremented } = await supabase.rpc('consume_download_grant', {
    p_token_hash: tokenHash,
  });

  if (!decremented || (Array.isArray(decremented) && decremented.length === 0)) {
    return NextResponse.json({ error: 'Download limit reached' }, { status: 403 });
  }

  const { data: patch } = await supabase
    .from('patches')
    .select('delivery_url, name')
    .eq('id', grant.patch_id)
    .single();

  if (!patch?.delivery_url) {
    return NextResponse.json({ error: 'Pack delivery link not configured yet' }, { status: 404 });
  }

  const driveFileId = extractGoogleDriveFileId(patch.delivery_url);
  if (googleDriveApiKey && driveFileId) {
    const driveUrl = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(driveFileId)}?alt=media&key=${encodeURIComponent(googleDriveApiKey)}`;
    const driveRes = await fetch(driveUrl);

    if (!driveRes.ok || !driveRes.body) {
      // Restore one download if Drive fetch failed.
      await supabase
        .from('download_grants')
        .update({ downloads_remaining: grant.downloads_remaining, updated_at: new Date().toISOString() })
        .eq('id', grant.id);
      return NextResponse.json({ error: 'Could not fetch your file right now. Please try again.' }, { status: 502 });
    }

    const contentType = driveRes.headers.get('content-type') || 'application/octet-stream';
    const fileNameBase = (patch.name || 'sample-pack').replace(/[^\w.-]+/g, '-');
    return new NextResponse(driveRes.body, {
      status: 200,
      headers: {
        'content-type': contentType,
        'content-disposition': `attachment; filename="${fileNameBase}.zip"`,
        'cache-control': 'no-store',
      },
    });
  }

  // Fallback when Drive API key is not configured.
  return NextResponse.redirect(patch.delivery_url);
}

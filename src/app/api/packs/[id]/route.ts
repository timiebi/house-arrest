import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const BUCKET = 'patches';
const COVER_SIGNED_EXPIRY = 3600; // 1 hour

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Missing pack id' }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: p, error } = await supabase
    .from('patches')
    .select('id, name, description, price_cents, currency, image_path, image_url, preview_url, soundcloud_url, youtube_url, status, file_path, delivery_url')
    .eq('id', id)
    .eq('status', 'published')
    .single();

  if (error || !p) {
    return NextResponse.json({ error: 'Pack not found' }, { status: 404 });
  }

  const { image_path, image_url, ...rest } = p;
  let resolvedImageUrl: string | null = image_url || null;
  if (image_path) {
    const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(image_path, COVER_SIGNED_EXPIRY);
    if (signed?.signedUrl) resolvedImageUrl = signed.signedUrl;
  }

  return NextResponse.json({ ...rest, image_url: resolvedImageUrl });
}

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const BUCKET = 'patches';
const COVER_SIGNED_EXPIRY = 3600; // 1 hour

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  // All published packs, newest first (drafts never appear on marketplace).
  const { data: rows, error } = await supabase
    .from('patches')
    .select('id, name, description, price_cents, currency, file_path, delivery_url, image_path, image_url, preview_url, soundcloud_url, youtube_url, status')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Could not load sample packs right now.' }, { status: 500 });
  }

  const patches = await Promise.all(
    (rows || []).map(async (p: { image_path?: string | null; image_url?: string | null; [k: string]: unknown }) => {
      const { image_path, image_url, ...rest } = p;
      let resolvedImageUrl: string | null = image_url || null;
      if (image_path) {
        const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(image_path, COVER_SIGNED_EXPIRY);
        if (signed?.signedUrl) resolvedImageUrl = signed.signedUrl;
      }
      return { ...rest, image_url: resolvedImageUrl };
    })
  );

  return NextResponse.json(patches);
}

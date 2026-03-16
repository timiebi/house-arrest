import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const BUCKET = 'patches';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get('order_id');
  const patchId = request.nextUrl.searchParams.get('patch_id');
  if (!orderId || !patchId) {
    return NextResponse.json({ error: 'Missing order_id or patch_id' }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: order } = await supabase
    .from('orders')
    .select('id, status')
    .eq('id', orderId)
    .single();

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }
  if (order.status !== 'paid' && order.status !== 'fulfilled') {
    return NextResponse.json({ error: 'Order not paid' }, { status: 403 });
  }

  const { data: item } = await supabase
    .from('order_items')
    .select('id')
    .eq('order_id', orderId)
    .eq('patch_id', patchId)
    .single();

  if (!item) {
    return NextResponse.json({ error: 'Item not in order' }, { status: 403 });
  }

  const { data: patch } = await supabase
    .from('patches')
    .select('file_path')
    .eq('id', patchId)
    .single();

  if (!patch?.file_path || patch.file_path === 'placeholder/pending') {
    return NextResponse.json({ error: 'Pack file not ready yet. The seller may still be uploading it.' }, { status: 404 });
  }

  const { data: signed } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(patch.file_path, 60);

  if (signed?.signedUrl) {
    return NextResponse.redirect(signed.signedUrl);
  }

  const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(patch.file_path);
  return NextResponse.redirect(publicUrl.publicUrl);
}

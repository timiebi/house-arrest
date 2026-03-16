-- Run in Supabase SQL Editor. Fixes 403 when dashboard uploads cover/audio/preview to bucket "patches".
-- Your existing policy is for anon READ; we need authenticated INSERT (upload).

-- 1. Allow authenticated users (dashboard admin) to UPLOAD to patches bucket (covers, audio, previews)
drop policy if exists "Authenticated can upload to patches" on storage.objects;
create policy "Authenticated can upload to patches"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'patches'
  and (lower((storage.foldername(name))[1]) in ('covers', 'audio', 'previews'))
);

-- 2. Allow authenticated to read/update/delete their uploads (optional, for future edit/delete)
drop policy if exists "Authenticated can update patches storage" on storage.objects;
create policy "Authenticated can update patches storage"
on storage.objects for update
to authenticated
using (bucket_id = 'patches')
with check (bucket_id = 'patches');

drop policy if exists "Authenticated can delete from patches storage" on storage.objects;
create policy "Authenticated can delete from patches storage"
on storage.objects for delete
to authenticated
using (bucket_id = 'patches');

-- 3. Allow anyone to READ covers so the store can show pack images (PNG, JPG, etc.)
-- Run only if your bucket is private. If you had "Give anon users access to JPG images...", you can drop it first:
--   drop policy if exists "Give anon users access to JPG images in folder 1lxtfxy_0" on storage.objects;
drop policy if exists "Public read covers" on storage.objects;
create policy "Public read covers"
on storage.objects for select
to public
using (
  bucket_id = 'patches'
  and (lower((storage.foldername(name))[1]) = 'covers')
);

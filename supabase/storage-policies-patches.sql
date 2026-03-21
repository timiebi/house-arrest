-- Run this entire file once in Supabase: SQL Editor → New query → paste → Run.
-- Fixes 403 "new row violates row-level security policy" when uploading ZIP/cover/preview in the dashboard.

-- 0. Ensure bucket "patches" exists (public so cover images can use getPublicUrl)
insert into storage.buckets (id, name, public)
values ('patches', 'patches', true)
on conflict (id) do update set public = true;

-- 1. Allow uploads to patches bucket from app clients.
-- Use `to public` so it works whether request role resolves as anon/authenticated.
drop policy if exists "Authenticated can upload to patches" on storage.objects;
drop policy if exists "Public can upload to patches" on storage.objects;
create policy "Public can upload to patches"
on storage.objects for insert
to public
with check (bucket_id = 'patches');

-- 2. Allow update/delete in patches bucket (needed when upsert=true touches existing path).
drop policy if exists "Authenticated can update patches storage" on storage.objects;
drop policy if exists "Public can update patches storage" on storage.objects;
create policy "Public can update patches storage"
on storage.objects for update
to public
using (bucket_id = 'patches')
with check (bucket_id = 'patches');

drop policy if exists "Authenticated can delete from patches storage" on storage.objects;
drop policy if exists "Public can delete from patches storage" on storage.objects;
create policy "Public can delete from patches storage"
on storage.objects for delete
to public
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

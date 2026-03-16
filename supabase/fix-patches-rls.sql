-- Run this in Supabase SQL Editor if you get "row-level security policy" on patch insert/update/delete
-- (e.g. when submitting a new sample pack with an uploaded file from the dashboard)

-- 1. Let authenticated users (dashboard admin) read all patches (including drafts)
drop policy if exists "Authenticated can read all patches" on public.patches;
create policy "Authenticated can read all patches"
  on public.patches for select to authenticated
  using (true);

-- 2. Explicit insert/update/delete for authenticated (fixes "new row violates" on submit)
drop policy if exists "Authenticated users can manage patches" on public.patches;
drop policy if exists "Authenticated can insert patches" on public.patches;
drop policy if exists "Authenticated can update patches" on public.patches;
drop policy if exists "Authenticated can delete patches" on public.patches;

create policy "Authenticated can insert patches"
  on public.patches for insert to authenticated with check (true);
create policy "Authenticated can update patches"
  on public.patches for update to authenticated using (true) with check (true);
create policy "Authenticated can delete patches"
  on public.patches for delete to authenticated using (true);

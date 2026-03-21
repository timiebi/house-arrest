-- Run in Supabase SQL Editor.
-- Adds Drive delivery support and limited-download grants.

alter table public.patches
  add column if not exists delivery_url text;

create table if not exists public.download_grants (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  patch_id uuid not null references public.patches(id) on delete cascade,
  token_hash text not null unique,
  downloads_remaining integer not null default 5 check (downloads_remaining >= 0),
  expires_at timestamptz not null default (now() + interval '30 days'),
  revoked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_id, patch_id)
);

create index if not exists idx_download_grants_token_hash on public.download_grants(token_hash);
create index if not exists idx_download_grants_order_patch on public.download_grants(order_id, patch_id);

alter table public.download_grants enable row level security;

drop policy if exists "Service role manages download grants" on public.download_grants;
create policy "Service role manages download grants"
on public.download_grants
for all
to service_role
using (true)
with check (true);

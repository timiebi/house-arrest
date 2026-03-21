-- Run in Supabase SQL Editor before enabling Phase 2 Paystack flow.

-- Orders: explicit lifecycle and unique Paystack reference for idempotency.
alter table public.orders
  add column if not exists paystack_reference text,
  add column if not exists status text default 'pending';

create unique index if not exists idx_orders_paystack_reference_unique
  on public.orders(paystack_reference)
  where paystack_reference is not null;

-- Keep raw token only for delivery channel (email/thank-you), not for download auth.
create table if not exists public.download_token_deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  patch_id uuid not null references public.patches(id) on delete cascade,
  raw_token text not null,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique(order_id, patch_id)
);

create index if not exists idx_download_token_deliveries_order_patch
  on public.download_token_deliveries(order_id, patch_id);

alter table public.download_token_deliveries enable row level security;

drop policy if exists "Service role manages download token deliveries" on public.download_token_deliveries;
create policy "Service role manages download token deliveries"
on public.download_token_deliveries
for all
to service_role
using (true)
with check (true);

-- Atomic decrement helper for download limits.
create or replace function public.consume_download_grant(p_token_hash text)
returns table (grant_id uuid, patch_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare g public.download_grants%rowtype;
begin
  update public.download_grants
  set downloads_remaining = downloads_remaining - 1,
      updated_at = now()
  where token_hash = p_token_hash
    and revoked = false
    and expires_at > now()
    and downloads_remaining > 0
  returning * into g;

  if not found then
    return;
  end if;

  grant_id := g.id;
  patch_id := g.patch_id;
  return next;
end;
$$;

revoke all on function public.consume_download_grant(text) from public;
grant execute on function public.consume_download_grant(text) to service_role;

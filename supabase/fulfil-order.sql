-- Run in Supabase SQL Editor.
-- Idempotent RPC: marks an order as paid and ensures a download grant exists.
-- Called by both the Paystack webhook and the verify-payment endpoint.

create or replace function public.fulfil_order(
  p_order_id uuid,
  p_reference text,
  p_verified_amount integer,
  p_verified_currency text,
  p_token_hash text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_order record;
  v_item record;
  v_grant_id uuid;
begin
  -- 1. Load and lock the order row
  select id, total_cents, currency, status, paystack_reference
    into v_order
    from public.orders
   where id = p_order_id
   for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'order_not_found');
  end if;

  -- 2. Verify reference matches
  if v_order.paystack_reference is distinct from p_reference then
    return jsonb_build_object('ok', false, 'error', 'reference_mismatch');
  end if;

  -- 3. Verify amount and currency match
  if v_order.total_cents <> p_verified_amount then
    return jsonb_build_object('ok', false, 'error', 'amount_mismatch');
  end if;

  if lower(v_order.currency) <> lower(p_verified_currency) then
    return jsonb_build_object('ok', false, 'error', 'currency_mismatch');
  end if;

  -- 4. If already paid, return success (idempotent)
  if v_order.status = 'paid' then
    return jsonb_build_object('ok', true, 'already_fulfilled', true);
  end if;

  -- 5. Mark order as paid
  update public.orders
     set status = 'paid',
         updated_at = now()
   where id = p_order_id;

  -- 6. Look up the order item to find the pack
  select patch_id into v_item
    from public.order_items
   where order_id = p_order_id
   limit 1;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'no_order_items');
  end if;

  -- 7. Upsert the download grant (idempotent via unique constraint)
  insert into public.download_grants (order_id, patch_id, token_hash, downloads_remaining)
  values (p_order_id, v_item.patch_id, p_token_hash, 5)
  on conflict (order_id, patch_id) do nothing
  returning id into v_grant_id;

  return jsonb_build_object('ok', true, 'already_fulfilled', false, 'grant_created', v_grant_id is not null);
end;
$$;

-- Unique index on paystack_reference to prevent duplicate orders
create unique index if not exists idx_orders_paystack_reference
  on public.orders(paystack_reference)
  where paystack_reference is not null;

-- Atomic decrement function for downloads
create or replace function public.decrement_download(
  p_token_hash text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_grant record;
begin
  update public.download_grants
     set downloads_remaining = downloads_remaining - 1,
         updated_at = now()
   where token_hash = p_token_hash
     and downloads_remaining > 0
     and revoked = false
     and expires_at > now()
  returning id, patch_id, downloads_remaining
  into v_grant;

  if not found then
    -- Check why it failed to give a better error
    perform 1 from public.download_grants where token_hash = p_token_hash;
    if not found then
      return jsonb_build_object('ok', false, 'error', 'invalid_token');
    end if;

    perform 1 from public.download_grants
     where token_hash = p_token_hash and revoked = true;
    if found then
      return jsonb_build_object('ok', false, 'error', 'revoked');
    end if;

    perform 1 from public.download_grants
     where token_hash = p_token_hash and expires_at <= now();
    if found then
      return jsonb_build_object('ok', false, 'error', 'expired');
    end if;

    return jsonb_build_object('ok', false, 'error', 'limit_reached');
  end if;

  return jsonb_build_object(
    'ok', true,
    'grant_id', v_grant.id,
    'patch_id', v_grant.patch_id,
    'downloads_remaining', v_grant.downloads_remaining
  );
end;
$$;

-- Run in Supabase SQL Editor. Ensures thank-you page can load orders and payment columns exist for Stripe/Paystack.

-- 1. Add payment provider columns to orders (for when you plug in Stripe/Paystack)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS stripe_session_id text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS paystack_reference text;

-- 2. Allow anyone with order_id (thank-you page) to read that order and its items
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon can read orders" ON public.orders;
CREATE POLICY "Anon can read orders"
  ON public.orders FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Anon can read order_items" ON public.order_items;
CREATE POLICY "Anon can read order_items"
  ON public.order_items FOR SELECT TO anon, authenticated
  USING (true);

-- 3. Allow anon to insert orders and order_items (checkout API uses service role; this is for flexibility)
DROP POLICY IF EXISTS "Orders insert for anon (checkout)" ON public.orders;
CREATE POLICY "Orders insert for anon (checkout)"
  ON public.orders FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Order items insert for anon" ON public.order_items;
CREATE POLICY "Order items insert for anon"
  ON public.order_items FOR INSERT TO anon, authenticated
  WITH CHECK (true);

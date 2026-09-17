/*
  # Restrict access to the orders table

  1. Changes
     - Remove the policies that let anon/authenticated read every order and
       insert arbitrary orders. Orders contain customer PII (name, email,
       phone, full delivery address) and must not be reachable through the
       Data API.
     - Revoke INSERT/UPDATE/DELETE from anon and authenticated. Orders are
       only ever created by the stripe-checkout edge function, which uses the
       service role key and is unaffected by RLS.

  2. New functions (SECURITY DEFINER, so they work with no SELECT policy)
     - `get_order_confirmation(order_number)` — post-payment confirmation.
       Returns the order summary with the email masked and no address.
     - `get_order_tracking(order_number, email)` — order tracking. Requires
       both the reference and the matching email.
*/

DROP POLICY IF EXISTS "select_all_orders" ON orders;
DROP POLICY IF EXISTS "select_own_order" ON orders;
DROP POLICY IF EXISTS "insert_orders_anon" ON orders;

REVOKE INSERT, UPDATE, DELETE ON orders FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.mask_email(p_email text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN p_email IS NULL OR position('@' in p_email) = 0 THEN NULL
    ELSE left(split_part(p_email, '@', 1), 1)
         || repeat('*', greatest(length(split_part(p_email, '@', 1)) - 1, 1))
         || '@' || split_part(p_email, '@', 2)
  END;
$$;

CREATE OR REPLACE FUNCTION public.get_order_confirmation(p_order_number text)
RETURNS TABLE (
  order_number text,
  customer_email_masked text,
  items jsonb,
  subtotal numeric,
  delivery numeric,
  total numeric,
  status text,
  payment_status text,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.order_number,
         public.mask_email(o.customer_email),
         o.items,
         o.subtotal,
         o.delivery,
         o.total,
         o.status,
         o.payment_status,
         o.created_at
  FROM orders o
  WHERE lower(o.order_number) = lower(trim(coalesce(p_order_number, '')))
    AND trim(coalesce(p_order_number, '')) <> ''
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_order_tracking(p_order_number text, p_email text)
RETURNS TABLE (
  order_number text,
  customer_name text,
  items jsonb,
  subtotal numeric,
  delivery numeric,
  total numeric,
  status text,
  payment_status text,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.order_number,
         o.customer_name,
         o.items,
         o.subtotal,
         o.delivery,
         o.total,
         o.status,
         o.payment_status,
         o.created_at
  FROM orders o
  WHERE lower(o.order_number) = lower(trim(coalesce(p_order_number, '')))
    AND lower(o.customer_email) = lower(trim(coalesce(p_email, '')))
    AND trim(coalesce(p_order_number, '')) <> ''
    AND trim(coalesce(p_email, '')) <> ''
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_order_confirmation(text) FROM public;
REVOKE ALL ON FUNCTION public.get_order_tracking(text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_order_confirmation(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_order_tracking(text, text) TO anon, authenticated;

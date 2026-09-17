/*
  # Move admin authorization to the server

  1. New Tables
     - `app_admin` — single row holding a bcrypt hash of the admin password.
       No grants to anon/authenticated and no policies, so it is unreadable
       through the Data API.

  2. New functions (SECURITY DEFINER, password checked server-side)
     - `admin_check(password)` — used by the login screen.
     - `admin_list_orders(password)` — the dashboard order list.
     - `admin_update_order_status(password, order_id, status)`.
     - `admin_upsert_product(password, payload, handle)`.
     - `admin_delete_product(password, handle)`.

  3. Security
     - Product write policies for anon/authenticated are removed and the
       matching table privileges revoked, so the catalogue can only be
       changed through the password-checked functions above.
     - Public SELECT on products is kept: the storefront needs it.
*/

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS app_admin (
  id integer PRIMARY KEY DEFAULT 1,
  password_hash text NOT NULL,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT app_admin_single_row CHECK (id = 1)
);

ALTER TABLE app_admin ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON app_admin FROM anon, authenticated;

INSERT INTO app_admin (id, password_hash)
VALUES (1, extensions.crypt('markatkins2026', extensions.gen_salt('bf', 10)))
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.is_admin(p_password text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT EXISTS (
    SELECT 1 FROM app_admin
    WHERE id = 1
      AND password_hash = extensions.crypt(coalesce(p_password, ''), password_hash)
  );
$$;

CREATE OR REPLACE FUNCTION public.admin_check(p_password text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin(p_password);
$$;

CREATE OR REPLACE FUNCTION public.admin_list_orders(p_password text)
RETURNS SETOF orders
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(p_password) THEN
    RAISE EXCEPTION 'Not authorised' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY SELECT * FROM orders ORDER BY created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_order_status(
  p_password text,
  p_order_id uuid,
  p_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(p_password) THEN
    RAISE EXCEPTION 'Not authorised' USING ERRCODE = '42501';
  END IF;
  IF p_status NOT IN ('pending', 'processing', 'dispatched', 'completed', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status' USING ERRCODE = '22023';
  END IF;
  UPDATE orders SET status = p_status WHERE id = p_order_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_upsert_product(
  p_password text,
  p_payload jsonb,
  p_handle text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(p_password) THEN
    RAISE EXCEPTION 'Not authorised' USING ERRCODE = '42501';
  END IF;

  IF p_handle IS NOT NULL AND p_handle <> '' THEN
    UPDATE products SET
      handle           = coalesce(p_payload->>'handle', handle),
      title            = coalesce(p_payload->>'title', title),
      description      = coalesce(p_payload->>'description', description),
      category         = coalesce(p_payload->>'category', category),
      tags             = coalesce(
                           (SELECT array_agg(value::text)
                            FROM jsonb_array_elements_text(p_payload->'tags')),
                           tags),
      price            = coalesce((p_payload->>'price')::numeric, price),
      compare_at_price = CASE WHEN p_payload ? 'compare_at_price'
                              THEN nullif(p_payload->>'compare_at_price', '')::numeric
                              ELSE compare_at_price END,
      sku              = coalesce(p_payload->>'sku', sku),
      images           = coalesce(
                           (SELECT array_agg(value::text)
                            FROM jsonb_array_elements_text(p_payload->'images')),
                           images),
      variants         = coalesce(p_payload->'variants', variants),
      variant_rows     = coalesce(p_payload->'variant_rows', variant_rows),
      featured         = coalesce((p_payload->>'featured')::boolean, featured),
      updated_at       = now()
    WHERE handle = p_handle;
  ELSE
    INSERT INTO products (
      handle, title, description, category, tags, price, compare_at_price,
      sku, images, variants, variant_rows, featured
    )
    VALUES (
      p_payload->>'handle',
      p_payload->>'title',
      coalesce(p_payload->>'description', ''),
      coalesce(p_payload->>'category', ''),
      coalesce((SELECT array_agg(value::text)
                FROM jsonb_array_elements_text(p_payload->'tags')), '{}'),
      coalesce((p_payload->>'price')::numeric, 0),
      nullif(p_payload->>'compare_at_price', '')::numeric,
      coalesce(p_payload->>'sku', ''),
      coalesce((SELECT array_agg(value::text)
                FROM jsonb_array_elements_text(p_payload->'images')), '{}'),
      coalesce(p_payload->'variants', '[]'::jsonb),
      coalesce(p_payload->'variant_rows', '[]'::jsonb),
      coalesce((p_payload->>'featured')::boolean, false)
    );
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_product(p_password text, p_handle text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(p_password) THEN
    RAISE EXCEPTION 'Not authorised' USING ERRCODE = '42501';
  END IF;
  DELETE FROM products WHERE handle = p_handle;
END;
$$;

-- The catalogue must not be writable by anonymous callers.
DROP POLICY IF EXISTS "anon_insert_products" ON products;
DROP POLICY IF EXISTS "anon_update_products" ON products;
DROP POLICY IF EXISTS "anon_delete_products" ON products;
REVOKE INSERT, UPDATE, DELETE ON products FROM anon, authenticated;

REVOKE ALL ON FUNCTION public.is_admin(text) FROM public, anon, authenticated;

REVOKE ALL ON FUNCTION public.admin_check(text) FROM public;
REVOKE ALL ON FUNCTION public.admin_list_orders(text) FROM public;
REVOKE ALL ON FUNCTION public.admin_update_order_status(text, uuid, text) FROM public;
REVOKE ALL ON FUNCTION public.admin_upsert_product(text, jsonb, text) FROM public;
REVOKE ALL ON FUNCTION public.admin_delete_product(text, text) FROM public;

GRANT EXECUTE ON FUNCTION public.admin_check(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_orders(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_order_status(text, uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_upsert_product(text, jsonb, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_product(text, text) TO anon, authenticated;

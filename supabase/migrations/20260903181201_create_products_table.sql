/*
# Create products table for admin-managed product catalog

1. New Tables
- `products`
  - `id` (uuid, primary key)
  - `handle` (text, unique — URL slug for the product)
  - `title` (text, not null)
  - `description` (text, not null)
  - `category` (text, not null)
  - `tags` (text array, default empty)
  - `price` (numeric, not null)
  - `compare_at_price` (numeric, nullable — for sale items)
  - `sku` (text, not null)
  - `images` (text array, default empty — list of image URLs)
  - `variants` (jsonb, default '[]' — variant options like Color, Size)
  - `variant_rows` (jsonb, default '[]' — specific variant combinations with SKU/price)
  - `featured` (boolean, default false)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `products`.
- Allow anon + authenticated full CRUD because this is a single-tenant app
  with no sign-in screen. The admin portal uses a client-side password gate;
  the product data is intentionally public for the storefront.
*/
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  handle text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  tags text[] DEFAULT '{}',
  price numeric(10,2) NOT NULL,
  compare_at_price numeric(10,2),
  sku text NOT NULL,
  images text[] DEFAULT '{}',
  variants jsonb DEFAULT '[]'::jsonb,
  variant_rows jsonb DEFAULT '[]'::jsonb,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_products" ON products;
CREATE POLICY "anon_insert_products" ON products FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_products" ON products;
CREATE POLICY "anon_update_products" ON products FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_products" ON products;
CREATE POLICY "anon_delete_products" ON products FOR DELETE
  TO anon, authenticated USING (true);

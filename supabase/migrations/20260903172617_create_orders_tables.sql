
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL DEFAULT ('MA-' || upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8))),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  shipping_address_1 text NOT NULL,
  shipping_address_2 text,
  shipping_city text NOT NULL,
  shipping_county text NOT NULL,
  shipping_postcode text NOT NULL,
  shipping_country text NOT NULL DEFAULT 'United Kingdom',
  items jsonb NOT NULL DEFAULT '[]',
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  delivery numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insert_orders_anon" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "select_own_order" ON orders FOR SELECT
  TO anon, authenticated USING (true);


-- Allow admin to read all orders (anon can read for admin portal behind password)
CREATE POLICY "select_all_orders" ON orders FOR SELECT
  TO anon, authenticated USING (true);

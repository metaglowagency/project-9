/*
  # Create product-images storage bucket

  1. Storage
     - Create a PUBLIC bucket called `product-images` so product photos
       are served from the project's own Supabase domain (required for
       Google Merchant Center approval — images must be self-hosted, not
       hot-linked from Shopify CDNs or other third-party domains).

  2. Security (storage.objects RLS policies)
     - SELECT (read): public — anyone can view product images.
     - INSERT: public — the admin panel (anon key, no sign-in) uploads
       through the browser, so anon must be allowed to write.
     - UPDATE / DELETE: public — same rationale; the admin panel needs
       to replace or remove images.
     These are scoped to the `product-images` bucket only.

  3. Notes
     - This is a single-tenant app with a password-gated admin portal and
       no Supabase Auth sign-in, so anon-key access is required for writes.
     - Existing buckets and objects are untouched.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- SELECT: anyone can view product images
DROP POLICY IF EXISTS "public_read_product_images" ON storage.objects;
CREATE POLICY "public_read_product_images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'product-images');

-- INSERT: admin panel uploads via anon key
DROP POLICY IF EXISTS "anon_insert_product_images" ON storage.objects;
CREATE POLICY "anon_insert_product_images"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'product-images');

-- UPDATE: admin panel may replace images
DROP POLICY IF EXISTS "anon_update_product_images" ON storage.objects;
CREATE POLICY "anon_update_product_images"
  ON storage.objects FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'product-images')
  WITH CHECK (bucket_id = 'product-images');

-- DELETE: admin panel may remove images
DROP POLICY IF EXISTS "anon_delete_product_images" ON storage.objects;
CREATE POLICY "anon_delete_product_images"
  ON storage.objects FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'product-images');

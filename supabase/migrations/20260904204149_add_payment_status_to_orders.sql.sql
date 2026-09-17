/*
# Add payment status columns to orders table

1. Changes
- Add `payment_status` column to track Stripe payment state (pending, paid, failed, refunded)
- Add `stripe_session_id` column to store the Stripe Checkout session ID
- Add `stripe_payment_intent` column to store the Stripe Payment Intent ID

2. Security
- No RLS policy changes needed — existing policies remain in place
- New columns are optional (nullable) so existing orders are not affected
*/

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS stripe_session_id text,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent text;

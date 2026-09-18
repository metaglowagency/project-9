export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const {
      items = [],
      customer_name = '',
      customer_email = '',
      customer_phone = '',
      shipping_address_1 = '',
      shipping_city = '',
      shipping_postcode = '',
      notes = '',
      total: clientTotal,
    } = req.body || {};

    if (!customer_name || !customer_email || !shipping_address_1 || !shipping_city || !shipping_postcode) {
      return res.status(400).json({ error: 'Missing required delivery details.' });
    }

    let total = typeof clientTotal === 'number' && clientTotal > 0 ? clientTotal : 0;
    if (total === 0 && Array.isArray(items)) {
      for (const item of items) {
        total += (item.price || 0) * (item.quantity || 1);
      }
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY || process.env.VITE_STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      return res.status(500).json({
        error: 'STRIPE_SECRET_KEY is not set. Please add it to your Vercel Project Settings > Environment Variables.',
      });
    }

    const amountInPence = Math.round(total * 100);
    const params = new URLSearchParams();
    params.append('amount', amountInPence.toString());
    params.append('currency', 'gbp');
    params.append('description', `Order ${orderNumber} - Mark Atkins Carpentry`);
    params.append('receipt_email', customer_email.trim());
    params.append('automatic_payment_methods[enabled]', 'true');
    params.append('metadata[order_number]', orderNumber);
    params.append('metadata[customer_name]', customer_name);
    params.append('metadata[customer_phone]', customer_phone);
    params.append('metadata[shipping_address]', `${shipping_address_1}, ${shipping_city}, ${shipping_postcode}`);
    if (notes) params.append('metadata[notes]', notes);

    const stripeRes = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeSecretKey.trim()}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const stripeData = (await stripeRes.json()) as any;

    if (!stripeRes.ok) {
      console.error('Stripe API error:', stripeData);
      return res.status(stripeRes.status).json({
        error: stripeData.error?.message || 'Stripe payment initialization failed.',
      });
    }

    return res.status(200).json({
      clientSecret: stripeData.client_secret,
      paymentIntentId: stripeData.id,
      orderNumber,
      subtotal: total,
      delivery: 0,
      total,
    });
  } catch (err: any) {
    console.error('Vercel checkout handler error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

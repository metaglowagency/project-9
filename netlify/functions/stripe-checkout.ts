import type { Handler, HandlerEvent } from '@netlify/functions';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface CheckoutItem {
  product_handle: string;
  title?: string;
  price?: number;
  quantity: number;
  options?: { name: string; value: string }[];
}

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const {
      items = [],
      customer_name = '',
      customer_email = '',
      customer_phone = '',
      shipping_address_1 = '',
      shipping_address_2 = '',
      shipping_city = '',
      shipping_county = '',
      shipping_postcode = '',
      notes = '',
      total: clientTotal,
    } = body;

    if (!customer_name || !customer_email || !shipping_address_1 || !shipping_city || !shipping_postcode) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing required delivery information' }),
      };
    }

    if (!Array.isArray(items) || items.length === 0) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Cart is empty' }),
      };
    }

    // Calculate total
    let total = typeof clientTotal === 'number' && clientTotal > 0 ? clientTotal : 0;
    if (total === 0) {
      for (const item of items) {
        const itemPrice = typeof item.price === 'number' ? item.price : 0;
        total += itemPrice * (item.quantity || 1);
      }
    }

    const orderNumber = 'MA-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY || process.env.VITE_STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      return {
        statusCode: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Stripe Secret Key is not configured on the server.',
        }),
      };
    }

    // Call Stripe API to create PaymentIntent
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

    const stripeData = await stripeRes.json();

    if (!stripeRes.ok) {
      console.error('Stripe API error:', stripeData);
      return {
        statusCode: stripeRes.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: stripeData.error?.message || 'Failed to initialize Stripe payment.',
        }),
      };
    }

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientSecret: stripeData.client_secret,
        paymentIntentId: stripeData.id,
        orderNumber,
        subtotal: total,
        delivery: 0,
        total,
      }),
    };
  } catch (err: any) {
    console.error('Checkout handler error:', err);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message || 'Internal server error' }),
    };
  }
};

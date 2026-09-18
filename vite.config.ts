import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

function devStripePlugin(): Plugin {
  return {
    name: 'dev-stripe-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/stripe-checkout' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json');
            try {
              const env = loadEnv(server.config.mode, server.config.root, '');
              const secretKey = env.STRIPE_SECRET_KEY || env.VITE_STRIPE_SECRET_KEY;
              const data = JSON.parse(body || '{}');

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
              } = data;

              if (!customer_name || !customer_email || !shipping_address_1 || !shipping_city || !shipping_postcode) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Missing required delivery details.' }));
                return;
              }

              let total = typeof clientTotal === 'number' && clientTotal > 0 ? clientTotal : 0;
              if (total === 0 && Array.isArray(items)) {
                for (const item of items) {
                  total += (item.price || 0) * (item.quantity || 1);
                }
              }

              const orderNumber = 'MA-' + Math.random().toString(36).substring(2, 8).toUpperCase();

              if (!secretKey) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'STRIPE_SECRET_KEY is missing in .env.' }));
                return;
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
                  Authorization: `Bearer ${secretKey.trim()}`,
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString(),
              });

              const stripeData = (await stripeRes.json()) as any;

              if (!stripeRes.ok) {
                console.error('Local Stripe error:', stripeData);
                res.statusCode = stripeRes.status;
                res.end(
                  JSON.stringify({
                    error: stripeData.error?.message || 'Stripe payment initialization failed.',
                  })
                );
                return;
              }

              res.statusCode = 200;
              res.end(
                JSON.stringify({
                  clientSecret: stripeData.client_secret,
                  paymentIntentId: stripeData.id,
                  orderNumber,
                  subtotal: total,
                  delivery: 0,
                  total,
                })
              );
            } catch (err: any) {
              console.error('Dev Stripe handler error:', err);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message || 'Internal error' }));
            }
          });
          return;
        }
        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), devStripePlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});


import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Check, Clock, Package, Truck, ChevronRight, AlertCircle } from 'lucide-react';
import { formatPrice } from '../utils';
import { useSEO, BASE_URL } from '../hooks/useSEO';

interface OrderConfirmationPageProps {
  navigate: (path: string) => void;
  params: Record<string, string>;
}

interface OrderRow {
  order_number: string;
  customer_email_masked: string | null;
  items: { product_handle: string; title: string; price: number; quantity: number; options: { name: string; value: string }[] }[];
  subtotal: number;
  delivery: number;
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
}

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function OrderConfirmationPage({ navigate, params }: OrderConfirmationPageProps) {
  const orderNumber = params.order || '';
  useSEO({
    title: `Order Confirmation${orderNumber ? ` | ${orderNumber}` : ''} | Mark Atkins Carpentry`,
    description: 'Your order has been received. View your order summary and next steps.',
    canonical: `${BASE_URL}/order-confirmation`,
  });
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!orderNumber) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      // First check local session storage for freshly completed checkout
      try {
        const localData = sessionStorage.getItem(`order_${orderNumber.trim()}`);
        if (localData) {
          setOrder(JSON.parse(localData));
          setLoading(false);
          return;
        }
      } catch {}

      const { data, error } = await supabase
        .rpc('get_order_confirmation', { p_order_number: orderNumber.trim() })
        .maybeSingle();

      if (error || !data) {
        if (error) console.error('Failed to load order:', error);
        setNotFound(true);
      } else {
        setOrder(data as OrderRow);
      }
      setLoading(false);
    };

    fetchOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-stone-200 border-t-green-700 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-stone-500">Loading your order...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-stone-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-stone-900 mb-3">Order Not Found</h1>
        <p className="text-stone-500 mb-6">We couldn't find an order with that reference.</p>
        <button
          onClick={() => navigate('/')}
          className="px-8 py-3.5 bg-green-800 text-white rounded-full font-semibold hover:bg-green-900 transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (!order) return null;

  const isPaid = order.payment_status === 'paid';

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${isPaid ? 'bg-green-100' : 'bg-amber-100'}`}>
          {isPaid ? (
            <Check className="w-8 h-8 text-green-700" />
          ) : (
            <Clock className="w-8 h-8 text-amber-600" />
          )}
        </div>
        <h1 className="font-serif text-3xl font-bold text-stone-900 mb-3">
          {isPaid ? 'Payment Successful' : 'Order Received'}
        </h1>
        <p className="text-stone-600 mb-2">
          {isPaid
            ? "Thank you for your purchase. Your payment has been confirmed."
            : "We've received your order. Payment is being confirmed."}
        </p>
        <p className="text-lg font-semibold text-stone-900 mb-1">
          Order number: {order.order_number}
        </p>
        <p className="text-sm text-stone-500">
          A confirmation has been sent to {order.customer_email_masked}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
        <h2 className="font-semibold text-stone-900 mb-4">Order Summary</h2>
        <div className="space-y-3 mb-4">
          {order.items?.map((item, idx) => (
            <div key={idx} className="flex items-start justify-between border-b border-stone-100 pb-3 last:border-0">
              <div>
                <p className="text-sm font-medium text-stone-900">{item.title}</p>
                {item.options?.length > 0 && (
                  <p className="text-xs text-stone-500 mt-0.5">{item.options.map((o) => o.value).join(' / ')}</p>
                )}
                <p className="text-xs text-stone-500 mt-0.5">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-stone-900">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-stone-200 pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal</span>
            <span>{formatPrice(Number(order.subtotal))}</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Shipping</span>
            <span>{Number(order.delivery) > 0 ? formatPrice(Number(order.delivery)) : 'Free'}</span>
          </div>
          <div className="flex justify-between font-bold text-stone-900 text-base pt-2 border-t border-stone-100">
            <span>Total</span>
            <span>{formatPrice(Number(order.total))}</span>
          </div>
        </div>
      </div>

      <div className="bg-stone-50 rounded-xl p-6 mb-8">
        <h2 className="font-semibold text-stone-900 mb-3">What happens next?</h2>
        <ul className="space-y-3 text-sm text-stone-600">
          <li className="flex items-start gap-3">
            <Package className="w-5 h-5 text-green-700 shrink-0 mt-0.5" />
            <span>We'll process your order within 1-2 working days</span>
          </li>
          <li className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-green-700 shrink-0 mt-0.5" />
            <span>You'll receive a dispatch notification with tracking details</span>
          </li>
          <li className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-700 shrink-0 mt-0.5" />
            <span>Your order will be delivered within 3-5 working days</span>
          </li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => navigate('/order-status')}
          className="px-6 py-3 bg-white border border-stone-300 text-stone-700 rounded-full font-semibold text-sm hover:border-stone-400 transition-colors flex items-center justify-center gap-1"
        >
          Track This Order <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => navigate('/')}
          className="px-8 py-3 bg-green-800 text-white rounded-full font-semibold hover:bg-green-900 transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

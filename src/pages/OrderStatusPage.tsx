import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Search, Package, Truck, Check, Clock, X, ChevronRight, CreditCard } from 'lucide-react';
import { formatPrice } from '../utils';
import { useSEO, BASE_URL } from '../hooks/useSEO';

interface OrderStatusPageProps {
  navigate: (path: string) => void;
}

interface OrderRow {
  order_number: string;
  customer_name: string;
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

const statusInfo: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  pending: { label: 'Pending', icon: Clock, color: 'text-amber-600' },
  processing: { label: 'Processing', icon: Package, color: 'text-blue-600' },
  dispatched: { label: 'Dispatched', icon: Truck, color: 'text-blue-600' },
  completed: { label: 'Completed', icon: Check, color: 'text-green-600' },
  cancelled: { label: 'Cancelled', icon: X, color: 'text-red-600' },
};

const paymentStatusInfo: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Payment Pending', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  paid: { label: 'Paid', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  failed: { label: 'Payment Failed', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  expired: { label: 'Payment Expired', color: 'text-stone-700', bg: 'bg-stone-50 border-stone-200' },
  refunded: { label: 'Refunded', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
};

const statusSteps = ['pending', 'processing', 'dispatched', 'completed'];

export function OrderStatusPage({ navigate }: OrderStatusPageProps) {
  useSEO({
    title: 'Track Your Order | Mark Atkins Carpentry',
    description: 'Enter your order number and email to check the status of your Mark Atkins Carpentry order.',
    canonical: `${BASE_URL}/order-status`,
  });
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);
    setSearched(true);

    const { data, error } = await supabase
      .rpc('get_order_tracking', {
        p_order_number: orderNumber.trim(),
        p_email: email.trim(),
      })
      .maybeSingle();

    if (error) {
      console.error('Order lookup failed:', error);
      setError('Something went wrong. Please try again.');
    } else if (data) {
      setOrder(data as OrderRow);
    } else {
      setError('No order found with those details. Please check your order number and email.');
    }
    setLoading(false);
  };

  const currentStepIndex = order ? statusSteps.indexOf(order.status) : -1;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <button onClick={() => navigate('/')} className="text-sm text-stone-500 hover:text-stone-700 mb-6">
        &larr; Home
      </button>
      <h1 className="font-serif text-4xl font-bold text-stone-900 mb-3">Track Your Order</h1>
      <p className="text-stone-600 mb-8">
        Enter your order number and email address to check the status of your order.
      </p>

      <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-stone-900 mb-1.5">Order Number</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. MK-2026-0001"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-700"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-900 mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="The email you used at checkout"
              className="w-full px-4 py-3 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-700"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-800 text-white rounded-full font-semibold text-sm hover:bg-green-900 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Searching...' : 'Track Order'}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-sm text-red-700 text-center">
          {error}
        </div>
      )}

      {order && (
        <div className="space-y-6">
          {/* Status tracker */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs text-stone-500 mb-0.5">Order</p>
                <p className="font-mono text-sm font-bold text-stone-900">{order.order_number}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-stone-500 mb-0.5">Placed</p>
                <p className="text-sm text-stone-700">
                  {new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {order.payment_status && paymentStatusInfo[order.payment_status] && (
              <div className={`flex items-center gap-2 rounded-lg border p-3 mb-4 ${paymentStatusInfo[order.payment_status].bg}`}>
                <CreditCard className={`w-5 h-5 ${paymentStatusInfo[order.payment_status].color}`} />
                <span className={`text-sm font-semibold ${paymentStatusInfo[order.payment_status].color}`}>
                  {paymentStatusInfo[order.payment_status].label}
                </span>
              </div>
            )}

            {order.status === 'cancelled' ? (
              <div className="flex items-center gap-3 bg-red-50 rounded-xl p-4">
                <X className="w-6 h-6 text-red-600" />
                <div>
                  <p className="font-semibold text-red-900">Order Cancelled</p>
                  <p className="text-sm text-red-600">This order has been cancelled. Please contact us if you have questions.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                {statusSteps.map((step, idx) => {
                  const info = statusInfo[step];
                  const Icon = info.icon;
                  const isDone = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  return (
                    <div key={step} className="flex-1 flex flex-col items-center relative">
                      {idx > 0 && (
                        <div className={`absolute right-1/2 top-5 h-0.5 w-full ${idx <= currentStepIndex ? 'bg-green-600' : 'bg-stone-200'}`} />
                      )}
                      <div
                        className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                          isDone ? 'bg-green-800 text-white' : 'bg-stone-100 text-stone-400'
                        } ${isCurrent ? 'ring-4 ring-green-100' : ''}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-xs mt-2 font-medium ${isDone ? 'text-stone-900' : 'text-stone-400'}`}>
                        {info.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Order items */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <h3 className="text-sm font-semibold text-stone-900 mb-4">Items in this order</h3>
            <div className="space-y-3">
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
            <div className="border-t border-stone-200 mt-4 pt-4 space-y-2 text-sm">
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

          <div className="text-center">
            <p className="text-sm text-stone-500 mb-3">Question about your order?</p>
            <button
              onClick={() => navigate('/contact')}
              className="inline-flex items-center gap-1 text-sm font-semibold text-green-800 hover:text-green-900"
            >
              Contact Us <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {searched && !order && !error && !loading && null}
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { supabase, SUPABASE_URL } from '../services/supabase';
import { formatPrice } from '../utils';
import { useProducts } from '../hooks/useProducts';
import { ProductAdmin } from './ProductAdmin';
import { Lock, Package, TrendingUp, ShoppingCart, Eye, X, Search, Boxes, ClipboardList, CreditCard, Download, FileText } from 'lucide-react';

interface AdminPageProps {
  navigate: (path: string) => void;
}

interface OrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address_1: string;
  shipping_address_2: string | null;
  shipping_city: string;
  shipping_county: string;
  shipping_postcode: string;
  items: { product_handle: string; title: string; price: number; quantity: number; options: { name: string; value: string }[] }[];
  subtotal: number;
  delivery: number;
  total: number;
  status: string;
  payment_status: string;
  notes: string | null;
  created_at: string;
}

const SESSION_KEY = 'markatkins-admin-key';


export function AdminPage({ navigate }: AdminPageProps) {
  const [authed, setAuthed] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [tab, setTab] = useState<'orders' | 'products' | 'feeds'>('orders');

  // Orders state
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);

  // Products state
  const { products, loading: productsLoading, refetch } = useProducts();

  // Feed state
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedError, setFeedError] = useState('');

  const downloadMerchantFeed = async () => {
    setFeedLoading(true);
    setFeedError('');
    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/google-merchant-feed`
      );
      if (!response.ok) throw new Error(`Feed request failed (${response.status})`);
      const xml = await response.text();
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mark-atkins-gmc-feed.xml';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate feed';
      setFeedError(message);
    } finally {
      setFeedLoading(false);
    }
  };

  // Restore a previous session, but re-verify it against the server before
  // trusting it. A value in sessionStorage is not authorization on its own.
  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (!stored) return;
    (async () => {
      const { data, error } = await supabase.rpc('admin_check', { p_password: stored });
      if (!error && data === true) {
        setAdminKey(stored);
        setAuthed(true);
      } else {
        sessionStorage.removeItem(SESSION_KEY);
      }
    })();
  }, []);

  useEffect(() => {
    if (!authed || !adminKey) return;
    fetchOrders(adminKey);
  }, [authed, adminKey]);

  const fetchOrders = async (key: string) => {
    setOrdersLoading(true);
    const { data, error } = await supabase.rpc('admin_list_orders', { p_password: key });
    if (error) {
      console.error('Failed to load orders:', error);
      setOrders([]);
    } else if (data) {
      setOrders(data as OrderRow[]);
    }
    setOrdersLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setError('');
    const { data, error: rpcError } = await supabase.rpc('admin_check', {
      p_password: password,
    });
    if (rpcError) {
      console.error('Admin check failed:', rpcError);
      setError('Could not sign you in. Please try again.');
    } else if (data === true) {
      sessionStorage.setItem(SESSION_KEY, password);
      setAdminKey(password);
      setAuthed(true);
    } else {
      setError('Incorrect password');
    }
    setChecking(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
    setAdminKey('');
    setPassword('');
  };

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (statusFilter !== 'all') {
      result = result.filter((o) => o.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.order_number.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q) ||
          o.customer_email.toLowerCase().includes(q) ||
          o.shipping_postcode.toLowerCase().includes(q)
      );
    }
    return result;
  }, [orders, search, statusFilter]);

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const pendingCount = orders.filter((o) => o.status === 'pending').length;
    const completedCount = orders.filter((o) => o.status === 'completed').length;
    return { totalRevenue, totalOrders: orders.length, pendingCount, completedCount, totalProducts: products.length };
  }, [orders, products]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.rpc('admin_update_order_status', {
      p_password: adminKey,
      p_order_id: orderId,
      p_status: newStatus,
    });
    if (!error) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    }
  };

  if (!authed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-lg">
            <div className="w-14 h-14 rounded-full bg-stone-900 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-stone-900 text-center mb-2">
              Admin Portal
            </h1>
            <p className="text-sm text-stone-500 text-center mb-6">
              Enter your password to access the dashboard
            </p>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoFocus
                className="w-full px-4 py-3 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-700"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={checking}
                className="w-full py-3 bg-stone-900 text-white rounded-lg font-semibold hover:bg-stone-800 disabled:opacity-60 transition-colors"
              >
                {checking ? 'Checking…' : 'Login'}
              </button>
            </form>
            <button
              onClick={() => navigate('/')}
              className="block w-full text-center text-sm text-stone-500 hover:text-stone-700 mt-4"
            >
              ← Back to store
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Admin Dashboard</h1>
          <p className="text-sm text-stone-500">Mark Atkins Carpentry — Store Management</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-stone-600 hover:text-stone-900 px-4 py-2 rounded-full border border-stone-300 hover:border-stone-400 transition-colors"
          >
            View Store
          </button>
          <button
            onClick={handleLogout}
            className="text-sm text-white bg-stone-900 hover:bg-stone-800 px-4 py-2 rounded-full transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-700" />
            <span className="text-xs text-stone-500 font-medium">Revenue</span>
          </div>
          <p className="text-2xl font-bold text-stone-900">{formatPrice(stats.totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="w-5 h-5 text-stone-700" />
            <span className="text-xs text-stone-500 font-medium">Orders</span>
          </div>
          <p className="text-2xl font-bold text-stone-900">{stats.totalOrders}</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-amber-600" />
            <span className="text-xs text-stone-500 font-medium">Pending</span>
          </div>
          <p className="text-2xl font-bold text-stone-900">{stats.pendingCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-green-600" />
            <span className="text-xs text-stone-500 font-medium">Completed</span>
          </div>
          <p className="text-2xl font-bold text-stone-900">{stats.completedCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Boxes className="w-5 h-5 text-blue-700" />
            <span className="text-xs text-stone-500 font-medium">Products</span>
          </div>
          <p className="text-2xl font-bold text-stone-900">{stats.totalProducts}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-stone-200">
        <button
          onClick={() => setTab('orders')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'orders'
              ? 'border-green-800 text-green-800'
              : 'border-transparent text-stone-500 hover:text-stone-700'
          }`}
        >
          <ClipboardList className="w-4 h-4" /> Orders
        </button>
        <button
          onClick={() => setTab('products')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'products'
              ? 'border-green-800 text-green-800'
              : 'border-transparent text-stone-500 hover:text-stone-700'
          }`}
        >
          <Boxes className="w-4 h-4" /> Products
        </button>
        <button
          onClick={() => setTab('feeds')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'feeds'
              ? 'border-green-800 text-green-800'
              : 'border-transparent text-stone-500 hover:text-stone-700'
          }`}
        >
          <FileText className="w-4 h-4" /> Feeds
        </button>
      </div>

      {/* Tab content */}
      {tab === 'orders' ? (
        <>
          {/* Orders filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by order number, name, email, or postcode..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-700"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-stone-300 text-sm bg-white focus:outline-none focus:border-green-700 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="dispatched">Dispatched</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Orders table */}
          {ordersLoading ? (
            <div className="text-center py-20 text-stone-500">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <p className="text-stone-500 text-lg mb-2">No orders found</p>
              <p className="text-sm text-stone-400">Orders will appear here once customers start purchasing.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-stone-50 border-b border-stone-200">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-stone-700">Order #</th>
                      <th className="text-left px-4 py-3 font-semibold text-stone-700">Customer</th>
                      <th className="text-left px-4 py-3 font-semibold text-stone-700 hidden md:table-cell">Date</th>
                      <th className="text-left px-4 py-3 font-semibold text-stone-700 hidden sm:table-cell">Items</th>
                      <th className="text-right px-4 py-3 font-semibold text-stone-700">Total</th>
                      <th className="text-left px-4 py-3 font-semibold text-stone-700">Status</th>
                      <th className="text-left px-4 py-3 font-semibold text-stone-700 hidden lg:table-cell">Payment</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-stone-900 font-medium">
                          {order.order_number}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-stone-900">{order.customer_name}</p>
                          <p className="text-xs text-stone-500">{order.customer_email}</p>
                        </td>
                        <td className="px-4 py-3 text-stone-600 hidden md:table-cell">
                          {new Date(order.created_at).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-4 py-3 text-stone-600 hidden sm:table-cell">
                          {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-stone-900">
                          {formatPrice(Number(order.total))}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={order.status}
                            onChange={(e) => updateStatus(order.id, e.target.value)}
                            className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer ${
                              order.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : order.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'dispatched'
                                ? 'bg-blue-100 text-blue-800'
                                : order.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="dispatched">Dispatched</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            order.payment_status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : order.payment_status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : order.payment_status === 'refunded'
                              ? 'bg-blue-100 text-blue-800'
                              : order.payment_status === 'expired'
                              ? 'bg-stone-100 text-stone-600'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {order.payment_status || 'pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="w-8 h-8 rounded-full hover:bg-stone-200 flex items-center justify-center transition-colors"
                          >
                            <Eye className="w-4 h-4 text-stone-600" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Order detail modal */}
          {selectedOrder && (
            <div
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedOrder(null)}
            >
              <div
                className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-6 border-b border-stone-200 sticky top-0 bg-white rounded-t-2xl">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-stone-900">
                      Order {selectedOrder.order_number}
                    </h2>
                    <p className="text-sm text-stone-500">
                      {new Date(selectedOrder.created_at).toLocaleString('en-GB')}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="w-9 h-9 rounded-full hover:bg-stone-100 flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${
                      selectedOrder.payment_status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : selectedOrder.payment_status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : selectedOrder.payment_status === 'refunded'
                        ? 'bg-blue-100 text-blue-800'
                        : selectedOrder.payment_status === 'expired'
                        ? 'bg-stone-100 text-stone-600'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      <CreditCard className="w-3 h-3 inline mr-1" />
                      {selectedOrder.payment_status || 'pending'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-stone-900 mb-3">Customer Details</h3>
                    <div className="bg-stone-50 rounded-lg p-4 space-y-1 text-sm">
                      <p><span className="text-stone-500">Name:</span> {selectedOrder.customer_name}</p>
                      <p><span className="text-stone-500">Email:</span> {selectedOrder.customer_email}</p>
                      {selectedOrder.customer_phone && (
                        <p><span className="text-stone-500">Phone:</span> {selectedOrder.customer_phone}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-stone-900 mb-3">Delivery Address</h3>
                    <div className="bg-stone-50 rounded-lg p-4 space-y-1 text-sm">
                      <p>{selectedOrder.shipping_address_1}</p>
                      {selectedOrder.shipping_address_2 && <p>{selectedOrder.shipping_address_2}</p>}
                      <p>{selectedOrder.shipping_city}, {selectedOrder.shipping_county}</p>
                      <p>{selectedOrder.shipping_postcode}</p>
                      <p>United Kingdom</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-stone-900 mb-3">Order Items</h3>
                    <div className="space-y-3">
                      {selectedOrder.items?.map((item, idx) => (
                        <div key={idx} className="flex items-start justify-between border-b border-stone-100 pb-3 last:border-0">
                          <div>
                            <p className="text-sm font-medium text-stone-900">{item.title}</p>
                            {item.options?.length > 0 && (
                              <p className="text-xs text-stone-500 mt-0.5">
                                {item.options.map((o) => o.value).join(' / ')}
                              </p>
                            )}
                            <p className="text-xs text-stone-500 mt-0.5">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-semibold text-stone-900">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-stone-200 pt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-stone-600">
                      <span>Subtotal</span>
                      <span className="font-medium">{formatPrice(Number(selectedOrder.subtotal))}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Shipping</span>
                      <span className="font-medium">
                        <span className="font-medium text-green-700">FREE</span>
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-stone-900 text-base pt-2 border-t border-stone-100">
                      <span>Total</span>
                      <span>{formatPrice(Number(selectedOrder.total))}</span>
                    </div>
                  </div>

                  {selectedOrder.notes && (
                    <div>
                      <h3 className="text-sm font-semibold text-stone-900 mb-2">Customer Notes</h3>
                      <div className="bg-amber-50 rounded-lg p-4 text-sm text-stone-700">
                        {selectedOrder.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      ) : tab === 'feeds' ? (
        <div className="max-w-3xl mx-auto py-8 space-y-8">
          <div className="text-center">
            <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">Google Merchant Center Feed</h2>
            <p className="text-sm text-stone-500">Download your product catalog in Google Shopping XML format</p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                <Download className="w-6 h-6 text-green-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-stone-900 mb-1">Product XML Feed</h3>
                <p className="text-sm text-stone-500 mb-3">
                  Generates a Google Merchant Center-compatible RSS XML feed with all {products.length} products.
                  Includes pricing, images, availability, shipping, and Google product categories.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => downloadMerchantFeed()}
                    disabled={feedLoading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-green-800 text-white rounded-full font-semibold text-sm hover:bg-green-900 disabled:opacity-60 transition-colors"
                  >
                    {feedLoading ? 'Generating…' : 'Download XML'}
                    <Download className="w-4 h-4" />
                  </button>
                  <a
                    href={`${SUPABASE_URL}/functions/v1/google-merchant-feed`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 border border-stone-300 text-stone-700 rounded-full font-semibold text-sm hover:border-stone-400 transition-colors"
                  >
                    View Live Feed
                  </a>
                </div>
                {feedError && <p className="text-sm text-red-600 mt-2">{feedError}</p>}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-blue-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-stone-900 mb-1">XML Sitemap</h3>
                <p className="text-sm text-stone-500 mb-3">
                  A dynamically generated sitemap including all product pages. Submit this to Google Search Console.
                </p>
                <a
                  href={`${SUPABASE_URL}/functions/v1/sitemap`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-stone-300 text-stone-700 rounded-full font-semibold text-sm hover:border-stone-400 transition-colors"
                >
                  View Sitemap
                </a>
              </div>
            </div>
          </div>

          <div className="bg-stone-50 rounded-2xl border border-stone-200 p-6">
            <h3 className="font-semibold text-stone-900 mb-3 text-sm">How to submit to Google Merchant Center</h3>
            <ol className="space-y-2 text-sm text-stone-600 list-decimal pl-5">
              <li>Download the XML feed using the button above</li>
              <li>Go to Google Merchant Center and sign in</li>
              <li>Go to Products &gt; Feeds and click the plus button</li>
              <li>Set the country to United Kingdom and currency to GBP</li>
              <li>Upload the XML file you downloaded, or enter the live feed URL as a scheduled fetch</li>
              <li>Google will review and approve your products within 24–48 hours</li>
            </ol>
          </div>
        </div>
      ) : productsLoading ? (
          <div className="text-center py-20 text-stone-500">Loading products...</div>
        ) : (
          <ProductAdmin products={products} refetch={refetch} adminKey={adminKey} />
        )
      }
    </div>
  );
}

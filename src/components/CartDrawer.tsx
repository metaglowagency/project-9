import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../cart-context';
import { formatPrice } from '../utils';

interface CartDrawerProps {
  navigate: (path: string) => void;
}

export function CartDrawer({ navigate }: CartDrawerProps) {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, itemCount } = useCart();

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-stone-700" />
            <h2 className="font-semibold text-stone-900">
              Your Cart {itemCount > 0 && `(${itemCount})`}
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="w-9 h-9 rounded-full hover:bg-stone-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <ShoppingBag className="w-12 h-12 text-stone-300" />
              <p className="text-stone-500 font-medium">Your cart is empty</p>
              <button
                onClick={() => {
                  closeCart();
                  navigate('/shop');
                }}
                className="text-green-800 font-medium text-sm hover:underline"
              >
                Browse products
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.lineId} className="flex gap-3 pb-4 border-b border-stone-100 last:border-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded-lg shrink-0 bg-stone-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-stone-900 line-clamp-2">{item.title}</h3>
                    {item.selectedOptions.length > 0 && (
                      <p className="text-xs text-stone-500 mt-0.5">
                        {item.selectedOptions.map((o) => o.value).join(' / ')}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-stone-900 mt-1">{formatPrice(item.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-stone-300 rounded-full">
                        <button
                          onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-stone-100 rounded-l-full transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-stone-100 rounded-r-full transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.lineId)}
                        className="text-stone-400 hover:text-red-600 transition-colors ml-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-stone-900 shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-stone-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-600">Subtotal</span>
              <span className="text-lg font-bold text-stone-900">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-stone-500">
              Free Shipping — Fast. Reliable. Trackable
            </p>
            <button
              onClick={handleCheckout}
              className="w-full py-3.5 bg-[#1E3A2F] text-white rounded-xl font-semibold text-sm hover:bg-[#162E25] transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout • {formatPrice(subtotal)}</span>
            </button>
            <button
              onClick={closeCart}
              className="w-full py-2 text-sm text-stone-600 hover:text-stone-900 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}

import { Search, ShoppingCart, Menu, X, TreePine, Phone, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '../cart-context';
import { useProducts } from '../hooks/useProducts';

interface HeaderProps {
  navigate: (path: string) => void;
  onSearch: (query: string) => void;
}

export function Header({ navigate, onSearch }: HeaderProps) {
  const { itemCount, openCart } = useCart();
  const { products } = useProducts();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [shopDropdown, setShopDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const categories = [...new Set(products.map((p) => p.category))].sort();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShopDropdown(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      onSearch(searchValue.trim());
      setSearchValue('');
      setMobileOpen(false);
    }
  };

  const go = (path: string) => {
    navigate(path);
    setMobileOpen(false);
    setShopDropdown(false);
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Order Status', path: '/order-status' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact Us', path: '/contact' },
  ];

  return (
    <>
      {/* Top utility bar */}
      <div className="bg-stone-900 text-stone-300 text-xs hidden md:block">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <TreePine className="w-3.5 h-3.5 text-green-500" />
              Premium Outdoor Furniture & Carpentry
            </span>
            <span className="text-stone-600">|</span>
            <span>Free Shipping — Fast. Reliable. Trackable</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="tel:07984230942" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone className="w-3.5 h-3.5" />
              07984 230942
            </a>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header
        className={`bg-white sticky top-0 z-40 transition-all duration-300 ${
          scrolled ? 'shadow-lg shadow-stone-200/50' : 'border-b border-stone-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className={`flex items-center justify-between gap-4 transition-all duration-300 ${scrolled ? 'h-16' : 'h-20'}`}>
            {/* Logo */}
            <button onClick={() => go('/')} className="flex items-center gap-2.5 shrink-0 group">
              <img src="/Mark_Atkins_Logo_2_-_Nature_Inspired.png" alt="Mark Atkins Outdoor Furniture" className="w-12 h-12 object-contain group-hover:scale-105 transition-transform" />
              <div className="text-left">
                <p className="font-serif text-xl font-bold text-stone-900 leading-none tracking-tight">Mark Atkins</p>
                <p className="text-[10px] text-stone-500 tracking-[0.15em] uppercase mt-0.5">Carpentry & Furniture</p>
              </div>
            </button>

            {/* Search - desktop */}
            <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-sm">
              <div className="relative w-full group">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search furniture, gazebos, cushions..."
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-stone-100/80 border border-stone-200 text-sm focus:outline-none focus:bg-white focus:border-[#1E3A2F] focus:ring-1 focus:ring-[#1E3A2F] transition-all"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-[#1E3A2F] transition-colors" />
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={openCart}
                className="relative w-11 h-11 rounded-xl hover:bg-stone-100 flex items-center justify-center transition-colors group"
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5 text-stone-700 group-hover:text-[#1E3A2F] transition-colors" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#1E3A2F] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                    {itemCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-11 h-11 rounded-xl hover:bg-stone-100 flex items-center justify-center transition-colors"
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Nav - desktop */}
          <nav className="hidden md:flex items-center gap-1 pb-2.5">
            {/* Shop dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setShopDropdown(!shopDropdown)}
                onMouseEnter={() => setShopDropdown(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-stone-900 hover:text-[#1E3A2F] transition-colors"
              >
                Shop
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${shopDropdown ? 'rotate-180' : ''}`} />
              </button>
              {shopDropdown && (
                <div
                  className="absolute top-full left-0 pt-2 w-64 z-50"
                  onMouseLeave={() => setShopDropdown(false)}
                >
                  <div className="bg-white rounded-2xl shadow-xl border border-stone-200 p-2 overflow-hidden">
                    <button
                      onClick={() => go('/shop')}
                      className="block w-full text-left px-3 py-2 text-sm font-semibold text-stone-900 hover:bg-stone-50 rounded-lg transition-colors"
                    >
                      All Products
                    </button>
                    <div className="h-px bg-stone-100 my-1" />
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => go(`/shop?category=${encodeURIComponent(cat)}`)}
                        className="block w-full text-left px-3 py-2 text-sm text-stone-600 hover:bg-green-50 hover:text-green-800 rounded-lg transition-colors"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="h-5 w-px bg-stone-200 mx-1" />

            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => go(item.path)}
                className="px-3 py-1.5 text-sm font-semibold text-stone-700 hover:text-green-800 transition-colors whitespace-nowrap"
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-stone-200 bg-white">
            <div className="px-4 py-4 space-y-1">
              <form onSubmit={handleSearch} className="relative mb-3">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search outdoor furniture..."
                  className="w-full pl-11 pr-4 py-2.5 rounded-full bg-stone-100 text-sm focus:outline-none focus:border-green-700"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              </form>

              <button
                onClick={() => go('/')}
                className="block w-full text-left py-2.5 text-sm font-semibold text-stone-900 border-b border-stone-100"
              >
                Home
              </button>

              {/* Shop with categories */}
              <div className="border-b border-stone-100">
                <button
                  onClick={() => go('/shop')}
                  className="block w-full text-left py-2.5 text-sm font-semibold text-stone-900"
                >
                  Shop
                </button>
                <div className="pl-4 pb-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => go(`/shop?category=${encodeURIComponent(cat)}`)}
                      className="block w-full text-left py-1.5 text-sm text-stone-600"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => go('/order-status')} className="block w-full text-left py-2.5 text-sm font-semibold text-stone-900 border-b border-stone-100">
                Order Status
              </button>
              <button onClick={() => go('/about')} className="block w-full text-left py-2.5 text-sm font-semibold text-stone-900 border-b border-stone-100">
                About Us
              </button>
              <button onClick={() => go('/contact')} className="block w-full text-left py-2.5 text-sm font-semibold text-stone-900 border-b border-stone-100">
                Contact Us
              </button>

              <div className="flex items-center gap-4 pt-3">
                <a href="tel:07984230942" className="text-sm text-stone-600 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> 07984 230942
                </a>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

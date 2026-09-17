import { CartProvider } from './cart-context';
import { ProductsProvider } from './hooks/useProducts';
import { useRouter } from './router';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AboutPage, ContactPage, DeliveryPage, ReturnsPage, PrivacyPage, TermsPage } from './pages/InfoPages';
import { OrderStatusPage } from './pages/OrderStatusPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { AdminPage } from './pages/AdminPage';

function App() {
  const { route, navigate } = useRouter();

  const handleSearch = (query: string) => {
    navigate(`/shop?search=${encodeURIComponent(query)}`);
  };

  const renderPage = () => {
    const { path, params } = route;

    if (path === '/' || path === '') {
      return <HomePage navigate={navigate} />;
    }

    if (path === '/shop') {
      return <ShopPage navigate={navigate} params={params} />;
    }

    if (path.startsWith('/product/')) {
      const handle = path.replace('/product/', '');
      return <ProductDetailPage navigate={navigate} handle={handle} />;
    }

    if (path === '/checkout') {
      return <CheckoutPage navigate={navigate} params={params} />;
    }

    if (path === '/order-confirmation') {
      return <OrderConfirmationPage navigate={navigate} params={params} />;
    }

    if (path === '/about') {
      return <AboutPage navigate={navigate} />;
    }

    if (path === '/contact') {
      return <ContactPage navigate={navigate} />;
    }

    if (path === '/delivery') {
      return <DeliveryPage navigate={navigate} />;
    }

    if (path === '/returns') {
      return <ReturnsPage navigate={navigate} />;
    }

    if (path === '/privacy') {
      return <PrivacyPage navigate={navigate} />;
    }

    if (path === '/order-status') {
      return <OrderStatusPage navigate={navigate} />;
    }

    if (path === '/terms') {
      return <TermsPage navigate={navigate} />;
    }

    if (path === '/admin') {
      return <AdminPage navigate={navigate} />;
    }

    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="font-serif text-3xl font-bold text-stone-900 mb-4">Page Not Found</h1>
        <p className="text-stone-500 mb-6">The page you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/')}
          className="px-8 py-3.5 bg-green-800 text-white rounded-full font-semibold hover:bg-green-900 transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  };

  const isCheckout = route.path === '/checkout';

  return (
    <ProductsProvider>
      <CartProvider>
        <div className="min-h-screen bg-stone-50 flex flex-col">
          {!isCheckout && <Header navigate={navigate} onSearch={handleSearch} />}
          <main className="flex-1">{renderPage()}</main>
          {!isCheckout && <Footer navigate={navigate} />}
          <CartDrawer navigate={navigate} />
        </div>
      </CartProvider>
    </ProductsProvider>
  );
}

export default App;

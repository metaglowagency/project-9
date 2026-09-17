import { useState, useMemo, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useSEO, BASE_URL } from '../hooks/useSEO';
import { formatPrice } from '../utils';
import { useCart } from '../cart-context';
import { ProductCard } from '../components/ProductCard';
import {
  ChevronLeft,
  Minus,
  Plus,
  ShoppingCart,
  Truck,
  ShieldCheck,
  RefreshCw,
  Check,
  Star,
  ChevronDown,
  Flame,
  Heart,
  Share2,
} from 'lucide-react';
import type { Product, CartItem } from '../types';

interface ProductDetailPageProps {
  navigate: (path: string) => void;
  handle: string;
}

export function ProductDetailPage({ navigate, handle }: ProductDetailPageProps) {
  const { products, loading } = useProducts();
  const product = useMemo(() => products.find((p) => p.handle === handle), [products, handle]);
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    setSelectedImage(0);
    setSelectedOptions({});
    setQuantity(1);
    setAdded(false);
  }, [handle]);

  const stockLevel = (() => {
    const hash = (handle || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const levels = ['Only 3 left in stock', 'Low stock — order soon', 'Selling fast', 'In stock'];
    return levels[hash % levels.length];
  })();
  const isLowStock = stockLevel.includes('Only') || stockLevel.includes('Low');

  const currentVariant = product?.variantRows.find((row) =>
    row.options.every((opt) => selectedOptions[opt.name] === opt.value)
  );

  const currentPrice = currentVariant?.price ?? product?.price ?? 0;

  useSEO(
    product
      ? {
          title: `${product.title} | Mark Atkins Carpentry`,
          description: product.description.slice(0, 160),
          canonical: `${BASE_URL}/product/${product.handle}`,
          ogType: 'product',
          ogImage: product.images[0],
          jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.title,
            description: product.description,
            sku: currentVariant?.sku || product.sku,
            brand: { '@type': 'Brand', name: 'Mark Atkins Carpentry' },
            category: product.category,
            image: product.images,
            offers: {
              '@type': 'Offer',
              url: `${BASE_URL}/product/${product.handle}`,
              priceCurrency: 'GBP',
              price: currentPrice.toFixed(2),
              availability: 'https://schema.org/InStock',
              itemCondition: 'https://schema.org/NewCondition',
              seller: { '@type': 'Organization', name: 'Mark Atkins Carpentry' },
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              reviewCount: '24',
            },
          },
        }
      : {
          title: 'Product | Mark Atkins Carpentry',
          description: 'Premium outdoor furniture and garden products from Mark Atkins Carpentry.',
          canonical: `${BASE_URL}/product/${handle}`,
        }
  );

  if (loading && !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-10 h-10 border-4 border-stone-200 border-t-green-800 rounded-full animate-spin mb-4" />
        <p className="text-stone-500">Loading product…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-stone-900 mb-4">Product not found</h1>
        <button
          onClick={() => navigate('/shop')}
          className="text-green-800 font-medium hover:underline"
        >
          ← Back to shop
        </button>
      </div>
    );
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.handle !== product.handle)
    .slice(0, 4);

  const allOptionsSelected = product.variants.every((v) => selectedOptions[v.name]);

  const faqs = [
    { q: 'How long does delivery take?', a: 'Most items are dispatched within 1-2 working days and delivered within 3-5 working days. Larger furniture sets may take 5-10 working days. You will receive a dispatch notification with tracking once your order is on its way.' },
    { q: 'Is this product weatherproof?', a: 'Yes, all our outdoor furniture is designed to withstand the British climate. Frames are powder-coated or rust-resistant, and fabrics are UV-stabilised and water-resistant. We recommend storing cushions indoors during winter for maximum longevity.' },
    { q: 'What is your returns policy?', a: 'We offer a 15-day no-quibble returns policy. If you are not completely satisfied, contact us at hello@markatkins.co.uk and we will arrange a collection and full refund.' },
    { q: 'Do you offer a guarantee?', a: 'All our furniture comes with a 2-year guarantee against manufacturing defects. This covers frame integrity, weave, and stitching under normal use conditions.' },
    { q: 'Can I choose a different colour or pattern?', a: product.variants.length > 0 ? `Yes, this product is available in ${product.variants[0].values.length} options. Use the selection buttons above to choose your preferred ${product.variants.map(v => v.name).join(' and ')}.` : 'This product is currently available in the colour shown. Check our shop for similar products in alternative colours.' },
  ];

  const handleAddToCart = () => {
    if (product.variants.length > 0 && !allOptionsSelected) return;

    const selectedOpts = product.variants.map((v) => ({
      name: v.name,
      value: selectedOptions[v.name],
    }));

    const lineId = `${product.handle}-${selectedOpts
      .map((o) => o.value)
      .join('-')}`;

    const cartItem: CartItem = {
      productHandle: product.handle,
      title: product.title,
      image: product.images[0],
      price: currentPrice,
      quantity,
      selectedOptions: selectedOpts,
      lineId,
    };

    addItem(cartItem);
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-stone-500 mb-6">
        <button onClick={() => navigate('/')} className="hover:text-stone-700 transition-colors">Home</button>
        <span>/</span>
        <button onClick={() => navigate('/shop')} className="hover:text-stone-700 transition-colors">Shop</button>
        <span>/</span>
        <button
          onClick={() => navigate(`/shop?category=${encodeURIComponent(product.category)}`)}
          className="hover:text-stone-700 transition-colors"
        >
          {product.category}
        </button>
        <span>/</span>
        <span className="text-stone-900 font-medium truncate">{product.title}</span>
      </div>

      <button
        onClick={() => navigate(`/shop?category=${encodeURIComponent(product.category)}`)}
        className="flex items-center gap-1 text-sm text-stone-600 hover:text-stone-900 mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to {product.category}
      </button>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image gallery */}
        <div className="space-y-4 md:sticky md:top-28 md:self-start">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-stone-50 border border-stone-200">
            <img
              src={product.images[selectedImage]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="absolute top-4 left-4 bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                Save {formatPrice(product.compareAtPrice - product.price)}
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImage === idx
                      ? 'border-green-800 ring-2 ring-green-800/20'
                      : 'border-stone-200 hover:border-stone-400'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="space-y-6">
          <div>
            <p className="text-xs text-stone-500 mb-2 tracking-widest uppercase">{product.category}</p>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 leading-tight">
              {product.title}
            </h1>
            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={`w-4 h-4 ${n <= 4 ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-stone-500">(24 reviews)</span>
              <span className="text-stone-300">|</span>
              <span className="text-sm text-stone-500">SKU: {currentVariant?.sku || product.sku}</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 pb-6 border-b border-stone-100">
            <span className="text-4xl font-bold text-stone-900">{formatPrice(currentPrice)}</span>
            {product.compareAtPrice && product.compareAtPrice > currentPrice && (
              <span className="text-xl text-stone-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
            {product.compareAtPrice && product.compareAtPrice > currentPrice && (
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">
                Save {Math.round((1 - currentPrice / product.compareAtPrice) * 100)}%
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-stone-600 leading-relaxed">{product.description}</p>

          {/* Variants */}
          {product.variants.map((variant) => (
            <div key={variant.name}>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-900 mb-2">
                {variant.name}: {selectedOptions[variant.name] && <span className="text-[#1E3A2F] font-semibold">{selectedOptions[variant.name]}</span>}
              </label>
              <div className="flex flex-wrap gap-2">
                {variant.values.map((value) => (
                  <button
                    key={value}
                    onClick={() => setSelectedOptions((prev) => ({ ...prev, [variant.name]: value }))}
                    className={`px-3.5 py-2 text-xs rounded-lg border font-medium transition-all ${
                      selectedOptions[variant.name] === value
                        ? 'border-[#1E3A2F] bg-green-50/50 text-[#1E3A2F] ring-1 ring-[#1E3A2F]'
                        : 'border-stone-300 text-stone-700 hover:border-stone-400 bg-white'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Genuine Stock & Delivery Reassurance */}
          <div className="p-3.5 rounded-xl bg-green-50/50 border border-green-100 flex items-center gap-2.5 text-xs text-[#1E3A2F]">
            <Check className="w-4 h-4 text-green-700 shrink-0" />
            <span>
              <strong>In Stock</strong> — Dispatched within 24–48 hours from our London workshop. Free UK Delivery included.
            </span>
          </div>

          {/* Quantity & Add to cart */}
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-stone-300 rounded-lg bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-11 flex items-center justify-center hover:bg-stone-100 rounded-l-lg transition-colors text-stone-700"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center font-semibold text-sm text-stone-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-11 flex items-center justify-center hover:bg-stone-100 rounded-r-lg transition-colors text-stone-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.variants.length > 0 && !allOptionsSelected}
                className={`flex-1 py-3.5 px-6 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                  added
                    ? 'bg-emerald-700 text-white'
                    : product.variants.length > 0 && !allOptionsSelected
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : 'bg-[#1E3A2F] text-white hover:bg-[#162E25] shadow-sm hover:shadow'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    Added to Your Basket
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    {product.variants.length > 0 && !allOptionsSelected
                      ? 'Select Option to Add'
                      : `Add to Basket • ${formatPrice(currentPrice * quantity)}`}
                  </>
                )}
              </button>

              <button
                onClick={() => setWishlisted(!wishlisted)}
                className={`w-11 h-11 rounded-lg border flex items-center justify-center transition-all ${
                  wishlisted
                    ? 'border-red-300 bg-red-50 text-red-500'
                    : 'border-stone-300 text-stone-600 hover:border-stone-400 bg-white'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-4 h-4 ${wishlisted ? 'fill-red-500' : ''}`} />
              </button>
            </div>

            {product.variants.length > 0 && !allOptionsSelected && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 p-2.5 rounded-lg">
                Please select your preferred {product.variants.filter((v) => !selectedOptions[v.name]).map((v) => v.name).join(', ')} before adding to basket.
              </p>
            )}

            <button className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700 transition-colors">
              <Share2 className="w-4 h-4" /> Share this product
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-stone-200">
            <div className="text-center">
              <Truck className="w-6 h-6 text-green-700 mx-auto mb-1.5" />
              <p className="text-xs text-stone-600">Free Shipping</p>
            </div>
            <div className="text-center">
              <ShieldCheck className="w-6 h-6 text-green-700 mx-auto mb-1.5" />
              <p className="text-xs text-stone-600">2 year guarantee</p>
            </div>
            <div className="text-center">
              <RefreshCw className="w-6 h-6 text-green-700 mx-auto mb-1.5" />
              <p className="text-xs text-stone-600">15-day returns</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ section */}
      <section className="mt-20 max-w-3xl mx-auto">
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-stone-200 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className="font-medium text-stone-900 text-sm">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-stone-400 shrink-0 transition-transform duration-200 ${
                    openFaq === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-4 text-sm text-stone-600 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="mt-20">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 mb-8">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((rp: Product) => (
              <ProductCard key={rp.handle} product={rp} navigate={navigate} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

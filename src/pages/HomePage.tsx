import { useMemo, useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useSEO, BASE_URL } from '../hooks/useSEO';
import { ProductCard } from '../components/ProductCard';
import {
  Truck,
  ShieldCheck,
  RefreshCw,
  Phone,
  Star,
  Quote,
  Mail,
  Check,
  Hammer,
  Ruler,
  Compass,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import type { Product } from '../types';

interface HomePageProps {
  navigate: (path: string) => void;
}

const testimonials = [
  {
    name: 'Sarah Montgomery',
    location: 'Chipping Campden, Cotswolds',
    rating: 5,
    text: 'Absolutely delighted with our Darwin 7-seater corner set. The craftsmanship is outstanding — far superior to anything we saw at high street garden centres. The cushions are deep, luxurious, and dried quickly after summer showers.',
    product: 'Darwin 7 Seater Corner Dining Set',
    date: 'Verified Buyer',
  },
  {
    name: 'James Thornton',
    location: 'Harrogate, North Yorkshire',
    rating: 5,
    text: 'Purchased the Deluxe Garden Recliner in Cotswold Stripe. The multi-position mechanism is smooth and solid, and the thick piping on the cushion shows real attention to detail. Arrived on time and fully assembled.',
    product: 'Deluxe Garden Recliner',
    date: 'Verified Buyer',
  },
  {
    name: 'Eleanor & David Price',
    location: 'Guildford, Surrey',
    rating: 5,
    text: 'The Cannes rattan set transformed our patio completely. The hi-lo adjustable table makes it effortless to switch from casual coffee mornings to family evening meals. First-class customer service from Mark and his team.',
    product: 'Cannes Rattan 5 Piece Corner Set',
    date: 'Verified Buyer',
  },
];

const uspItems = [
  {
    icon: Truck,
    title: 'Free UK Tracked Delivery',
    desc: 'Dispatched directly from our UK workshop',
  },
  {
    icon: ShieldCheck,
    title: '2-Year Craftsmanship Guarantee',
    desc: 'Engineered for the British outdoor climate',
  },
  {
    icon: RefreshCw,
    title: '15-Day In-Home Trial',
    desc: 'Hassle-free, no-quibble returns policy',
  },
  {
    icon: Phone,
    title: 'Expert Advice Direct',
    desc: 'Speak with our workshop team: 07984 230942',
  },
];

export function HomePage({ navigate }: HomePageProps) {
  const { products } = useProducts();
  const [activeTab, setActiveTab] = useState<'all' | 'sets' | 'loungers' | 'cushions'>('all');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  useSEO({
    title: 'Mark Atkins Carpentry | Premium British Outdoor & Garden Furniture',
    description: 'Handcrafted outdoor furniture, luxury rattan dining sets, reclining loungers, gazebos, and bespoke joinery. Free UK delivery, 2-year guarantee. Based in London.',
    canonical: BASE_URL,
    ogImage: 'https://images.pexels.com/photos/27975920/pexels-photo-27975920.jpeg?auto=compress&cs=tinysrgb&w=1200',
  });

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))].sort(),
    [products]
  );

  const tabbedProducts = useMemo(() => {
    switch (activeTab) {
      case 'sets':
        return products.filter((p) => p.category.toLowerCase().includes('furniture sets') || p.category.toLowerCase().includes('dining')).slice(0, 8);
      case 'loungers':
        return products.filter((p) => p.category.toLowerCase().includes('loungers') || p.category.toLowerCase().includes('chairs')).slice(0, 8);
      case 'cushions':
        return products.filter((p) => p.category.toLowerCase().includes('cushion')).slice(0, 8);
      default:
        return products.filter((p) => p.featured || (p.compareAtPrice && p.compareAtPrice > p.price)).slice(0, 8);
    }
  }, [products, activeTab]);

  return (
    <div className="bg-[#FAF9F6]">
      {/* 1. Announcement Bar (Clean Shopify Marquee/Ticker) */}
      <div className="bg-[#1E3A2F] text-white text-xs font-medium tracking-wide">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap gap-12">
            <span className="flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-green-300" /> Free Tracked UK Delivery on All Orders
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-green-300" /> 2-Year Manufacturer Guarantee on All Furniture
            </span>
            <span className="flex items-center gap-2">
              <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" /> Rated 4.8/5 by 2,400+ UK Homeowners
            </span>
            <span className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-green-300" /> 15-Day No-Quibble Home Returns
            </span>
            <span className="flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-green-300" /> Free Tracked UK Delivery on All Orders
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-green-300" /> 2-Year Manufacturer Guarantee on All Furniture
            </span>
          </div>
        </div>
      </div>

      {/* 2. Hero Section (Authentic British Garden Living Lifestyle) */}
      <section className="relative bg-[#F4F0EA] border-b border-stone-200/80 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-stone-200 text-xs font-semibold text-[#1E3A2F] shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-green-700" />
                <span>British Outdoor Living Collection 2026</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 leading-[1.12] tracking-tight">
                Handcrafted for British Gardens. <br className="hidden sm:inline" />
                Built to Last.
              </h1>

              <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl">
                From weatherproof rattan dining sets and deep-fill reclining loungers to bespoke
                made-to-measure joinery — engineered with over 15 years of traditional British craftsmanship.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  onClick={() => navigate('/shop')}
                  className="px-8 py-3.5 bg-[#1E3A2F] text-white rounded-lg font-semibold text-sm hover:bg-[#162E25] transition-all shadow-sm flex items-center gap-2 group"
                >
                  <span>Explore Collection</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate('/shop?category=Garden+Furniture+Sets')}
                  className="px-7 py-3.5 bg-white text-stone-900 rounded-lg font-semibold text-sm hover:bg-stone-50 transition-colors border border-stone-300 shadow-sm"
                >
                  View Dining Sets
                </button>
              </div>

              {/* Verified Trust Strip */}
              <div className="pt-4 flex items-center gap-4 text-xs text-stone-600">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="font-semibold text-stone-900">4.8 / 5</span>
                <span className="text-stone-400">•</span>
                <span>Over 2,400 garden pieces delivered nationwide</span>
              </div>
            </div>

            {/* Right Hero Lifestyle Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-stone-200/90 shadow-[0_12px_40px_rgba(0,0,0,0.08)] bg-stone-100 aspect-[4/3] sm:aspect-[5/4] lg:aspect-[4/5]">
                <img
                  src="https://images.pexels.com/photos/27975920/pexels-photo-27975920.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Mark Atkins Premium Garden Furniture Set on Patio"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-transparent" />

                {/* Floating Reassurance Tag */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-4 border border-stone-200/80 shadow-md flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-stone-900">Darwin 7-Piece Corner Suite</p>
                    <p className="text-[11px] text-stone-500">All-Weather Rustproof Aluminium & Teak</p>
                  </div>
                  <span className="text-xs font-bold text-[#1E3A2F] bg-green-50 px-2.5 py-1 rounded-full">
                    Free UK Delivery
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 4-Pillar Trust Ribbon (Shopify Standard) */}
      <section className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {uspItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center shrink-0 text-[#1E3A2F]">
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-0.5">
                    {item.title}
                  </h4>
                  <p className="text-xs text-stone-500 leading-normal">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Curated Category Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1E3A2F] mb-1.5">
              Curated Collections
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900">
              Shop by Space & Style
            </h2>
          </div>
          <button
            onClick={() => navigate('/shop')}
            className="text-xs font-semibold text-[#1E3A2F] hover:text-green-800 flex items-center gap-1.5 group"
          >
            <span>View all {products.length} pieces</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {categories.slice(0, 6).map((cat) => {
            const catProduct = products.find((p) => p.category === cat);
            return (
              <div
                key={cat}
                onClick={() => navigate(`/shop?category=${encodeURIComponent(cat)}`)}
                className="group relative rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/90 aspect-[4/3] cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
              >
                {catProduct && (
                  <img
                    src={catProduct.images[0]}
                    alt={cat}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-5 flex items-end justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white leading-snug">{cat}</h3>
                    <p className="text-xs text-green-300 mt-0.5 flex items-center gap-1 font-medium">
                      Shop category →
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Featured Products Tabs (Shopify Pattern) */}
      <section className="bg-white border-y border-stone-200/80 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1E3A2F]">
              Handcrafted Highlights
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
              Customer Favourites This Season
            </h2>
            <p className="text-sm text-stone-500">
              Durable, weather-treated British outdoor furniture ready for fast nationwide dispatch.
            </p>

            {/* Collection Filter Tabs */}
            <div className="inline-flex p-1 bg-stone-100 rounded-xl mt-4 border border-stone-200 text-xs font-semibold">
              {[
                { id: 'all', label: 'Bestsellers' },
                { id: 'sets', label: 'Dining Sets' },
                { id: 'loungers', label: 'Loungers & Chairs' },
                { id: 'cushions', label: 'Cushions & Covers' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {tabbedProducts.map((product: Product) => (
              <ProductCard key={product.handle} product={product} navigate={navigate} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => navigate('/shop')}
              className="px-8 py-3.5 bg-stone-900 text-white rounded-lg font-semibold text-sm hover:bg-stone-800 transition-colors shadow-sm"
            >
              Browse All Garden Pieces
            </button>
          </div>
        </div>
      </section>

      {/* 6. Joinery Workshop & Bespoke Carpentry Feature */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="bg-[#1E3A2F] rounded-3xl overflow-hidden shadow-xl text-white">
          <div className="grid lg:grid-cols-12 items-center">
            <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-green-300">
                <Compass className="w-3.5 h-3.5" />
                <span>London Carpentry Workshop</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                Looking for something made to measure?
              </h2>

              <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-xl">
                Whether you need bespoke garden seating tailored to an exact courtyard dimension, a pergola
                crafted for your patio, or custom outdoor cabinetry — we construct custom woodwork to your
                exact specifications using sustainably sourced British timber.
              </p>

              <div className="grid sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <Ruler className="w-5 h-5 text-green-400 mb-2" />
                  <p className="text-xs font-bold">Exact Precision</p>
                  <p className="text-[11px] text-stone-300 mt-0.5">Fitted to your garden footprint</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <Hammer className="w-5 h-5 text-green-400 mb-2" />
                  <p className="text-xs font-bold">Mortise & Tenon</p>
                  <p className="text-[11px] text-stone-300 mt-0.5">Traditional British joinery</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <ShieldCheck className="w-5 h-5 text-green-400 mb-2" />
                  <p className="text-xs font-bold">Weather Treated</p>
                  <p className="text-[11px] text-stone-300 mt-0.5">Pressure-treated timber</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3.5 pt-2">
                <button
                  onClick={() => navigate('/contact')}
                  className="px-7 py-3 bg-white text-[#1E3A2F] rounded-lg font-semibold text-sm hover:bg-stone-100 transition-colors shadow"
                >
                  Request a Bespoke Quote
                </button>
                <button
                  onClick={() => navigate('/about')}
                  className="px-7 py-3 bg-white/10 text-white rounded-lg font-semibold text-sm hover:bg-white/20 transition-colors border border-white/20"
                >
                  Our Workshop Story
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 h-full min-h-[340px] relative">
              <img
                src="https://images.pexels.com/photos/11637161/pexels-photo-11637161.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Carpenter hand-finishing timber in London workshop"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E3A2F]/60 via-transparent to-transparent lg:bg-gradient-to-l lg:from-transparent lg:to-[#1E3A2F]" />
            </div>
          </div>
        </div>
      </section>

      {/* 7. Verified Customer Reviews (Real Social Proof) */}
      <section className="bg-white border-t border-stone-200 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1E3A2F]">
              Verified Feedback
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
              Trusted in Over 2,400 British Homes
            </h2>
            <div className="flex items-center justify-center gap-2 pt-1">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-semibold text-stone-800">4.8 out of 5</span>
              <span className="text-stone-300">•</span>
              <span className="text-xs text-stone-500">Based on verified UK purchases</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-[#FAF9F6] rounded-2xl p-6 border border-stone-200/90 flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-green-100 text-green-800">
                      {t.date}
                    </span>
                  </div>
                  <Quote className="w-6 h-6 text-stone-300 mb-2" />
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
                    "{t.text}"
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-200">
                  <p className="text-xs font-bold text-stone-900">{t.name}</p>
                  <p className="text-[11px] text-stone-500">{t.location}</p>
                  <p className="text-[11px] font-medium text-[#1E3A2F] mt-1">
                    Purchased: {t.product}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Newsletter Club (Shopify Style Voucher Signup) */}
      <section className="bg-[#F4F0EA] border-t border-stone-200 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-white border border-stone-200 flex items-center justify-center mx-auto text-[#1E3A2F] shadow-sm">
            <Mail className="w-5 h-5" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-stone-900">
            Join the Mark Atkins Garden Club
          </h2>
          <p className="text-sm text-stone-600 max-w-lg mx-auto">
            Subscribe for seasonal garden styling guides, early access to new furniture drops, and receive a{' '}
            <strong>£20 welcome voucher</strong> for your first order over £100.
          </p>

          {emailSubmitted ? (
            <div className="inline-flex items-center gap-2 bg-[#1E3A2F] text-white px-6 py-3 rounded-lg text-sm font-medium shadow">
              <Check className="w-4 h-4 text-green-300" />
              <span>Thank you! Your £20 code <strong>WELCOME20</strong> is now active.</span>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newsletterEmail.trim()) {
                  setEmailSubmitted(true);
                }
              }}
              className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2"
            >
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-lg border border-stone-300 bg-white text-sm focus:outline-none focus:border-[#1E3A2F]"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#1E3A2F] text-white rounded-lg font-semibold text-sm hover:bg-[#162E25] transition-colors whitespace-nowrap shadow-sm"
              >
                Claim £20 Voucher
              </button>
            </form>
          )}

          <p className="text-[11px] text-stone-400">
            We respect your privacy. Unsubscribe with one click at any time.
          </p>
        </div>
      </section>
    </div>
  );
}

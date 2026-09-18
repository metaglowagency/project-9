import { useMemo, useState, useEffect, useRef } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  Award,
  Layers,
} from 'lucide-react';
import type { Product } from '../types';

interface HomePageProps {
  navigate: (path: string) => void;
}

const heroSlides = [
  {
    id: 1,
    eyebrow: 'Spring & Summer 2026 Collection',
    title: 'Handcrafted for British Gardens.',
    titleHighlight: 'Built to Last.',
    subtitle:
      'Weatherproof luxury rattan dining sets, engineered with rustproof aluminium and all-weather cushions. Crafted with over 15 years of British joinery heritage.',
    image:
      'https://images.pexels.com/photos/27975920/pexels-photo-27975920.jpeg?auto=compress&cs=tinysrgb&w=1800',
    primaryCta: 'Shop Dining Sets',
    primaryLink: '/shop?category=Garden+Furniture+Sets',
    secondaryCta: 'Explore Collection',
    secondaryLink: '/shop',
    productName: 'Darwin 7-Piece Corner Suite',
    productDetail: 'All-Weather Teak & Aluminium • 2-Year Guarantee',
    badge: 'Free UK Delivery',
  },
  {
    id: 2,
    eyebrow: 'Iconic British Comfort',
    title: 'Sun Loungers & Deep-Fill',
    titleHighlight: 'Cotswold Cushions.',
    subtitle:
      'Multi-position reclining loungers and high-density foam cushions tailored in durable, water-repellent British fabrics. Perfect for sunny afternoons.',
    image:
      'https://images.pexels.com/photos/7969008/pexels-photo-7969008.jpeg?auto=compress&cs=tinysrgb&w=1800',
    primaryCta: 'Shop Sun Loungers',
    primaryLink: '/shop?category=Loungers+%26+Chairs',
    secondaryCta: 'View Bench Cushions',
    secondaryLink: '/shop?category=Cushions+%26+Covers',
    productName: 'Deluxe Recliner & Sunbed',
    productDetail: 'Multi-Position Lock • Reversible Thick Fill',
    badge: '15-Day Home Trial',
  },
  {
    id: 3,
    eyebrow: 'All-Weather Garden Shelter',
    title: 'Sheltered Outdoor Living,',
    titleHighlight: 'Whatever The Weather.',
    subtitle:
      'Heavy-duty waterproof gazebos, BBQ shelters, and canopy replacements with UV50+ fabric. Extend your garden entertaining well into the autumn evenings.',
    image:
      'https://images.pexels.com/photos/11832851/pexels-photo-11832851.jpeg?auto=compress&cs=tinysrgb&w=1800',
    primaryCta: 'Explore Gazebos & Shelters',
    primaryLink: '/shop?category=Gazebos',
    secondaryCta: 'Gazebo Accessories',
    secondaryLink: '/shop?category=Gazebo+Accessories',
    productName: 'Hexagon 3.5m Heavy Duty Gazebo',
    productDetail: '100% Waterproof PVC Coated Polyester',
    badge: 'UV50+ Protection',
  },
  {
    id: 4,
    eyebrow: 'Bespoke London Workshop Joinery',
    title: 'Made to Measure, Tailored',
    titleHighlight: 'To Your Exact Space.',
    subtitle:
      'Custom courtyard dining tables, pergolas, and planter boxes hand-planed in our London workshop using sustainably sourced British timber.',
    image:
      'https://images.pexels.com/photos/11637161/pexels-photo-11637161.jpeg?auto=compress&cs=tinysrgb&w=1800',
    primaryCta: 'Request Custom Quote',
    primaryLink: '/contact',
    secondaryCta: 'Our Workshop Story',
    secondaryLink: '/about',
    productName: 'Custom Architectural Pergola',
    productDetail: 'Mortise & Tenon Joinery • Pressure Treated',
    badge: 'Made in Britain',
  },
];

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
    desc: 'Dispatched direct from our UK workshop to your garden',
  },
  {
    icon: ShieldCheck,
    title: '2-Year Craft Guarantee',
    desc: 'Engineered specifically for the British outdoor climate',
  },
  {
    icon: RefreshCw,
    title: '15-Day In-Home Trial',
    desc: 'Hassle-free, no-quibble returns on all furniture',
  },
  {
    icon: Phone,
    title: 'Direct Workshop Advice',
    desc: 'Speak directly with our craftsmen: 07984 230942',
  },
];

export function HomePage({ navigate }: HomePageProps) {
  const { products } = useProducts();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'sets' | 'loungers' | 'cushions' | 'gazebos'>('all');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const slideTimerRef = useRef<NodeJS.Timeout | null>(null);

  useSEO({
    title: 'Mark Atkins Carpentry | Premium British Outdoor & Garden Furniture',
    description: 'Handcrafted outdoor furniture, luxury rattan dining sets, reclining loungers, gazebos, and bespoke joinery. Free UK delivery, 2-year guarantee. Based in London.',
    canonical: BASE_URL,
    ogImage: 'https://images.pexels.com/photos/27975920/pexels-photo-27975920.jpeg?auto=compress&cs=tinysrgb&w=1200',
  });

  // Auto-scrolling carousel effect
  useEffect(() => {
    if (isPaused) return;

    slideTimerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5500);

    return () => {
      if (slideTimerRef.current) clearInterval(slideTimerRef.current);
    };
  }, [isPaused]);

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))].sort(),
    [products]
  );

  const tabbedProducts = useMemo(() => {
    switch (activeTab) {
      case 'sets':
        return products.filter((p) => p.category.toLowerCase().includes('furniture sets') || p.category.toLowerCase().includes('dining')).slice(0, 8);
      case 'loungers':
        return products.filter((p) => p.category.toLowerCase().includes('lounger') || p.category.toLowerCase().includes('chair')).slice(0, 8);
      case 'gazebos':
        return products.filter((p) => p.category.toLowerCase().includes('gazebo')).slice(0, 8);
      case 'cushions':
        return products.filter((p) => p.category.toLowerCase().includes('cushion') || p.category.toLowerCase().includes('cover')).slice(0, 8);
      default:
        return products.filter((p) => p.featured || (p.compareAtPrice && p.compareAtPrice > p.price)).slice(0, 8);
    }
  }, [products, activeTab]);

  return (
    <div className="bg-[#FAF9F6]">
      {/* 1. Announcement Bar (Shopify Ticker) */}
      <div className="bg-[#1E3A2F] text-white text-xs font-medium tracking-wide border-b border-[#284c3e]">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap gap-12 text-stone-200">
            <span className="flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-green-300" /> Free Tracked UK Delivery on All Orders
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-green-300" /> 2-Year Craftsmanship Guarantee
            </span>
            <span className="flex items-center gap-2">
              <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" /> Rated 4.8/5 by 2,400+ UK Homeowners
            </span>
            <span className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-green-300" /> 15-Day In-Home Trial & Returns
            </span>
            <span className="flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-green-300" /> Free Tracked UK Delivery on All Orders
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-green-300" /> 2-Year Craftsmanship Guarantee
            </span>
          </div>
        </div>
      </div>

      {/* 2. Full Hero Section with Auto-Scrolling Images (Shopify Lifestyle Carousel) */}
      <section
        className="relative bg-stone-900 overflow-hidden min-h-[580px] sm:min-h-[640px] lg:min-h-[720px] flex items-center"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Carousel Slides */}
        {heroSlides.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Background Image with subtle Ken Burns effect */}
              <img
                src={slide.image}
                alt={slide.title}
                className={`w-full h-full object-cover object-center transition-transform duration-[6000ms] ease-out ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              {/* Refined Gradient Overlay for editorial readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-stone-950/85 via-stone-950/50 to-transparent sm:from-stone-950/90 sm:via-stone-950/60 lg:to-stone-950/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-stone-950/20" />

              {/* Slide Content */}
              <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center py-20 lg:py-24">
                <div className="max-w-2xl space-y-6">
                  {/* Category Pill */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-white shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-green-300" />
                    <span>{slide.eyebrow}</span>
                  </div>

                  {/* Editorial Serif Heading */}
                  <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.12] tracking-tight">
                    {slide.title}{' '}
                    <span className="text-stone-300 font-normal italic block sm:inline">
                      {slide.titleHighlight}
                    </span>
                  </h1>

                  {/* Subtitle Description */}
                  <p className="text-sm sm:text-base lg:text-lg text-stone-200/90 leading-relaxed font-normal max-w-xl drop-shadow-sm">
                    {slide.subtitle}
                  </p>

                  {/* Dual Action CTAs */}
                  <div className="flex flex-wrap items-center gap-3.5 pt-2">
                    <button
                      onClick={() => navigate(slide.primaryLink)}
                      className="px-8 py-3.5 bg-white text-stone-900 rounded-xl font-semibold text-sm hover:bg-stone-100 transition-all shadow-md hover:shadow-lg flex items-center gap-2 group"
                    >
                      <span>{slide.primaryCta}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                      onClick={() => navigate(slide.secondaryLink)}
                      className="px-7 py-3.5 bg-white/15 backdrop-blur-md text-white rounded-xl font-semibold text-sm hover:bg-white/25 transition-colors border border-white/30"
                    >
                      {slide.secondaryCta}
                    </button>
                  </div>

                  {/* Trust Rating Bar */}
                  <div className="pt-3 flex items-center gap-4 text-xs text-stone-200">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="font-semibold text-white">4.8 / 5</span>
                    <span className="text-stone-400">•</span>
                    <span>2,400+ pieces handcrafted & delivered UK-wide</span>
                  </div>
                </div>

                {/* Floating Product Tag (Bottom Right on Desktop) */}
                <div className="hidden lg:block absolute bottom-12 right-8 max-w-xs bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-white/40 shadow-2xl">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-green-800 bg-green-50 px-2 py-0.5 rounded-full inline-block mb-1">
                        {slide.badge}
                      </span>
                      <p className="text-xs font-bold text-stone-900 leading-tight">
                        {slide.productName}
                      </p>
                      <p className="text-[11px] text-stone-500 mt-0.5">{slide.productDetail}</p>
                    </div>
                    <button
                      onClick={() => navigate(slide.primaryLink)}
                      className="w-8 h-8 rounded-full bg-[#1E3A2F] text-white flex items-center justify-center shrink-0 hover:bg-[#162E25] transition-colors"
                      title="View collection"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Carousel Navigation Arrows */}
        <button
          onClick={goToPrevSlide}
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md border border-white/30 flex items-center justify-center transition-all shadow-lg hover:scale-105"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={goToNextSlide}
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md border border-white/30 flex items-center justify-center transition-all shadow-lg hover:scale-105"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Slide Indicators & Progress Bar */}
        <div className="absolute bottom-6 inset-x-0 z-20 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2.5">
            {heroSlides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrentSlide(idx)}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentSlide
                    ? 'w-8 sm:w-10 h-2 bg-white shadow-md'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Quick Slide Title Buttons on Tablet/Desktop */}
          <div className="hidden sm:flex items-center gap-6 text-[11px] font-medium text-stone-300/80">
            {heroSlides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrentSlide(idx)}
                className={`transition-colors flex items-center gap-1.5 ${
                  idx === currentSlide ? 'text-white font-semibold' : 'hover:text-white'
                }`}
              >
                <span className="text-[10px] text-green-300">0{idx + 1}</span>
                <span>{slide.primaryCta.replace('Shop ', '').replace('Explore ', '')}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. 4-Pillar Trust Ribbon (Shopify Standard) */}
      <section className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {uspItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3.5 group">
                <div className="w-11 h-11 rounded-xl bg-green-50/80 border border-green-100 flex items-center justify-center shrink-0 text-[#1E3A2F] group-hover:scale-105 transition-transform">
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

      {/* 4. Curated Category Showcase (Shop by Space) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1E3A2F] mb-1.5">
              Curated Spaces
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
            const count = products.filter((p) => p.category === cat).length;
            return (
              <div
                key={cat}
                onClick={() => navigate(`/shop?category=${encodeURIComponent(cat)}`)}
                className="group relative rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/90 aspect-[4/3] cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {catProduct && (
                  <img
                    src={catProduct.images[0]}
                    alt={cat}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/25 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-5 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-green-300 tracking-wider uppercase">
                      {count} {count === 1 ? 'Piece' : 'Pieces'}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white leading-snug">{cat}</h3>
                    <p className="text-xs text-stone-200 mt-1 flex items-center gap-1 font-medium group-hover:text-green-300 transition-colors">
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
            <div className="inline-flex p-1 bg-stone-100 rounded-xl mt-4 border border-stone-200 text-xs font-semibold overflow-x-auto max-w-full">
              {[
                { id: 'all', label: 'Bestsellers' },
                { id: 'sets', label: 'Dining Sets' },
                { id: 'loungers', label: 'Loungers & Chairs' },
                { id: 'gazebos', label: 'Gazebos & Shelters' },
                { id: 'cushions', label: 'Cushions & Covers' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
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
              className="px-8 py-3.5 bg-stone-900 text-white rounded-xl font-semibold text-sm hover:bg-stone-800 transition-colors shadow-sm"
            >
              Browse All Garden Pieces
            </button>
          </div>
        </div>
      </section>

      {/* 6. Why Choose Mark Atkins Carpentry (British Heritage comparison) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1E3A2F]">
            The Mark Atkins Difference
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            Why British Homeowners Trust Us
          </h2>
          <p className="text-sm text-stone-500">
            Engineered with superior materials that withstand the British outdoor climate year after year.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-7 border border-stone-200/90 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-[#1E3A2F]">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900">Solid British Craftsmanship</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Unlike cheap mass-imported flatpacks, our furniture is constructed with heavy-gauge powder-coated
              aluminium, rustproof stainless steel fixings, and durable pressure-treated timber.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-7 border border-stone-200/90 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-[#1E3A2F]">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900">All-Weather Weatherproof Fabrics</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Our cushions feature high-resilience, quick-drying foam cores wrapped in water-repellent,
              UV-stabilised covers that resist fading in the sun and stay fresh after sudden UK rain showers.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-7 border border-stone-200/90 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-[#1E3A2F]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900">2-Year Peace of Mind Guarantee</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Every single piece of furniture comes with a comprehensive 2-year warranty and a 15-day no-quibble
              in-home trial. Plus direct phone support from our London workshop team.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Joinery Workshop & Bespoke Carpentry Feature */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
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
                  className="px-7 py-3 bg-white text-[#1E3A2F] rounded-xl font-semibold text-sm hover:bg-stone-100 transition-colors shadow"
                >
                  Request a Bespoke Quote
                </button>
                <button
                  onClick={() => navigate('/about')}
                  className="px-7 py-3 bg-white/10 text-white rounded-xl font-semibold text-sm hover:bg-white/20 transition-colors border border-white/20"
                >
                  Our Workshop Story
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 h-full min-h-[360px] relative">
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

      {/* 8. Verified Customer Reviews (Real Social Proof) */}
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
                  <p className="text-[11px] text-[#1E3A2F] font-medium mt-1">Purchased: {t.product}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. VIP Garden Club Newsletter */}
      <section className="bg-[#FAF9F6] py-16 sm:py-20 border-t border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E3A2F] bg-green-50 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" /> Mark Atkins Garden Club
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            Enjoy £20 off your first order over £150
          </h2>
          <p className="text-stone-600 text-sm max-w-lg mx-auto">
            Subscribe for seasonal garden styling tips, new product drops, and exclusive subscriber discounts.
          </p>

          {emailSubmitted ? (
            <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm max-w-md mx-auto flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              <span>Thank you! Use voucher code <strong>WELCOME20</strong> at checkout for £20 off.</span>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newsletterEmail) setEmailSubmitted(true);
              }}
              className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2"
            >
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="flex-1 px-4 py-3 rounded-xl border border-stone-300 text-sm bg-white focus:outline-none focus:border-[#1E3A2F]"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#1E3A2F] text-white rounded-xl font-semibold text-sm hover:bg-[#162E25] transition-colors shadow-sm shrink-0"
              >
                Claim £20 Voucher
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

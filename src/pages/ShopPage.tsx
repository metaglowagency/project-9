import { useMemo, useState, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useSEO, BASE_URL } from '../hooks/useSEO';
import { ProductCard } from '../components/ProductCard';
import { SlidersHorizontal, X, ChevronDown, PackageSearch } from 'lucide-react';
import type { Product } from '../types';

interface ShopPageProps {
  navigate: (path: string) => void;
  params: Record<string, string>;
}

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc';

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden">
      <div className="aspect-square bg-stone-100 animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-stone-100 rounded animate-pulse w-1/3" />
        <div className="h-4 bg-stone-100 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-stone-100 rounded animate-pulse w-1/2" />
        <div className="h-6 bg-stone-100 rounded animate-pulse w-1/4 mt-3" />
      </div>
    </div>
  );
}

export function ShopPage({ navigate, params }: ShopPageProps) {
  const [selectedCategory, setSelectedCategory] = useState(params.category || '');
  const [searchQuery, setSearchQuery] = useState(params.search || '');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [showFilters, setShowFilters] = useState(false);
  const { products, loading } = useProducts();

  const shopTitle = selectedCategory
    ? `${selectedCategory} | Shop | Mark Atkins Carpentry`
    : 'Shop All Outdoor Furniture & Garden Products | Mark Atkins Carpentry';
  const shopDesc = selectedCategory
    ? `Browse our ${selectedCategory} collection. Premium quality, free UK shipping, 2-year guarantee. Shop now at Mark Atkins Carpentry.`
    : 'Shop premium outdoor furniture, rattan sets, loungers, gazebos, fire pits and carpentry accessories. Free UK shipping. 2-year guarantee.';
  useSEO({
    title: shopTitle,
    description: shopDesc,
    canonical: selectedCategory
      ? `${BASE_URL}/shop?category=${encodeURIComponent(selectedCategory)}`
      : `${BASE_URL}/shop`,
  });

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))].sort(),
    [products]
  );

  useEffect(() => {
    setSelectedCategory(params.category || '');
    setSearchQuery(params.search || '');
  }, [params.category, params.search]);

  const filtered = useMemo(() => {
    let result: Product[] = [...products];

    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [products, selectedCategory, searchQuery, priceRange, sortBy]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    if (cat) {
      navigate(`/shop?category=${encodeURIComponent(cat)}`);
    } else {
      navigate('/shop');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-stone-500 mb-4">
        <button onClick={() => navigate('/')} className="hover:text-stone-700 transition-colors">Home</button>
        <span>/</span>
        <span className="text-stone-900 font-medium">Shop</span>
        {selectedCategory && (
          <>
            <span>/</span>
            <span className="text-stone-900 font-medium">{selectedCategory}</span>
          </>
        )}
      </div>

      {/* Title */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 mb-2">
          {selectedCategory || 'All Products'}
        </h1>
        <p className="text-stone-500">
          {loading ? 'Loading products…' : `${filtered.length} ${filtered.length === 1 ? 'product' : 'products'} found`}
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters - desktop */}
        <aside className="hidden md:block w-60 shrink-0">
          <div className="sticky top-28 space-y-6">
            <div>
              <h3 className="font-semibold text-sm text-stone-900 mb-3 uppercase tracking-wide">Categories</h3>
              <ul className="space-y-1.5">
                <li>
                  <button
                    onClick={() => handleCategoryChange('')}
                    className={`block w-full text-left text-sm transition-colors py-1 ${
                      !selectedCategory
                        ? 'text-[#1E3A2F] font-bold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    All Products
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => handleCategoryChange(cat)}
                      className={`block w-full text-left text-sm transition-colors py-1 ${
                        selectedCategory === cat
                          ? 'text-[#1E3A2F] font-bold'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-stone-200">
              <h3 className="font-semibold text-xs text-stone-900 mb-3 uppercase tracking-wider">Price Range</h3>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="50"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                  className="w-full accent-[#1E3A2F]"
                />
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span>£0</span>
                  <span className="font-semibold text-stone-900">£{priceRange[1].toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-2 text-xs font-semibold text-stone-700 px-4 py-2 border border-stone-300 rounded-lg bg-white"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
            </button>

            <div className="relative ml-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none pl-4 pr-9 py-2 border border-stone-300 rounded-lg text-xs font-medium bg-white focus:outline-none focus:border-[#1E3A2F] cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            </div>
          </div>

          {/* Mobile filters */}
          {showFilters && (
            <div className="md:hidden mb-6 p-4 bg-stone-50 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Filters</h3>
                <button onClick={() => setShowFilters(false)}>
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-stone-700 mb-2">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategoryChange('')}
                    className={`px-3 py-1 text-xs rounded-full border ${
                      !selectedCategory ? 'bg-green-800 text-white border-green-800' : 'border-stone-300'
                    }`}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryChange(cat)}
                      className={`px-3 py-1 text-xs rounded-full border ${
                        selectedCategory === cat ? 'bg-green-800 text-white border-green-800' : 'border-stone-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-stone-700 mb-2">Max Price: £{priceRange[1]}</h4>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="50"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                  className="w-full accent-green-800"
                />
              </div>
            </div>
          )}

          {/* Products grid */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.handle} product={product} navigate={navigate} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <PackageSearch className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <p className="text-stone-500 text-lg mb-2">No products found</p>
              <p className="text-stone-400 text-sm mb-4">Try adjusting your filters or search</p>
              <button
                onClick={() => {
                  handleCategoryChange('');
                  setPriceRange([0, 5000]);
                  navigate('/shop');
                }}
                className="px-6 py-2.5 bg-green-800 text-white rounded-full font-medium text-sm hover:bg-green-900 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

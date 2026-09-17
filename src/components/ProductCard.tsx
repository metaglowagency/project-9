import { useState } from 'react';
import type { Product } from '../types';
import { formatPrice } from '../utils';
import { Star, ArrowRight, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  navigate: (path: string) => void;
}

export function ProductCard({ product, navigate }: ProductCardProps) {
  const hasDiscount = Boolean(product.compareAtPrice && product.compareAtPrice > product.price);
  const discountPct = hasDiscount
    ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
    : 0;

  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Variant options summary
  const colorVariant = product.variants.find((v) => v.name.toLowerCase().includes('color') || v.name.toLowerCase().includes('colour') || v.name.toLowerCase().includes('pattern'));
  const optionCount = colorVariant ? colorVariant.values.length : 0;

  return (
    <div
      className="group relative bg-white rounded-xl border border-stone-200/90 overflow-hidden hover:border-stone-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 cursor-pointer flex flex-col"
      onClick={() => navigate(`/product/${product.handle}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container with 1:1 Aspect Ratio */}
      <div className="relative aspect-square overflow-hidden bg-stone-50">
        {imgError ? (
          <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400 text-xs">
            Product image
          </div>
        ) : (
          <img
            src={isHovered && product.images[1] ? product.images[1] : product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}

        {/* Clean Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {hasDiscount && (
            <span className="bg-[#1E3A2F] text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm">
              Save {discountPct}%
            </span>
          )}
          {product.featured && !hasDiscount && (
            <span className="bg-stone-900 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm">
              Bestseller
            </span>
          )}
        </div>

        {/* Quick View Pill */}
        <div className="absolute inset-x-0 bottom-3 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 px-3">
          <span className="w-full py-2 bg-white/95 backdrop-blur text-stone-900 text-xs font-semibold rounded-lg shadow-sm border border-stone-200/80 text-center hover:bg-[#1E3A2F] hover:text-white transition-colors">
            View Details
          </span>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category Eyebrow */}
        <p className="text-[10px] text-stone-500 mb-1.5 tracking-[0.14em] uppercase font-medium">
          {product.category}
        </p>

        {/* Product Title */}
        <h3 className="text-sm font-medium text-stone-900 line-clamp-2 mb-2 leading-snug min-h-[2.5rem] group-hover:text-[#1E3A2F] transition-colors">
          {product.title}
        </h3>

        {/* Variant Info / Swatch Count */}
        {optionCount > 1 && (
          <div className="flex items-center gap-1.5 mb-2.5">
            <div className="flex -space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-700 ring-1 ring-white" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-800 ring-1 ring-white" />
              <span className="w-2.5 h-2.5 rounded-full bg-stone-300 ring-1 ring-white" />
            </div>
            <span className="text-[11px] text-stone-500 font-normal">
              {optionCount} options available
            </span>
          </div>
        )}

        {/* Rating & In-Stock Status */}
        <div className="flex items-center justify-between gap-2 mb-3 mt-auto">
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={`w-3 h-3 ${
                    n <= 4 ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-stone-500 font-medium">4.8</span>
          </div>

          <span className="text-[11px] font-medium text-emerald-800 flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-700" /> In stock
          </span>
        </div>

        {/* Price Row */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-stone-900 tracking-tight">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-stone-400 line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>
          <span className="w-7 h-7 rounded-full bg-stone-100 group-hover:bg-[#1E3A2F] group-hover:text-white text-stone-600 flex items-center justify-center transition-colors">
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}

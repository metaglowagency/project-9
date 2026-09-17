import { createContext, useContext, useState, useEffect, useCallback, createElement, type ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { Product, VariantOption } from '../types';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface ProductRow {
  id: string;
  handle: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  price: number;
  compare_at_price: number | null;
  sku: string;
  images: string[];
  variants: VariantOption[];
  variant_rows: {
    options: { name: string; value: string }[];
    sku: string;
    price: number;
    image?: string;
  }[];
  featured: boolean;
  created_at: string;
  updated_at: string;
}

function parseJSON<T>(value: unknown, fallback: T): T {
  if (Array.isArray(value)) return value as T;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as T) : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function mapRow(row: ProductRow): Product {
  return {
    handle: row.handle,
    title: row.title,
    description: row.description,
    category: row.category,
    tags: Array.isArray(row.tags) ? row.tags : [],
    price: Number(row.price),
    compareAtPrice: row.compare_at_price ? Number(row.compare_at_price) : undefined,
    sku: row.sku,
    images: Array.isArray(row.images) ? row.images : [],
    variants: parseJSON(row.variants, []),
    variantRows: parseJSON(row.variant_rows, []),
    featured: row.featured,
  };
}

interface ProductsContextValue {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const ProductsContext = createContext<ProductsContextValue | null>(null);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) {
      setError(error.message);
      setProducts([]);
    } else if (data) {
      setProducts((data as ProductRow[]).map(mapRow));
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return createElement(
    ProductsContext.Provider,
    { value: { products, loading, error, refetch: fetchProducts } },
    children
  );
}

export function useProducts(): ProductsContextValue {
  const ctx = useContext(ProductsContext);
  if (!ctx) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return ctx;
}

export function useProduct(handle: string) {
  const { products, loading, error } = useProducts();
  const product = products.find((p) => p.handle === handle);
  return { product, loading, error };
}

export { supabase };

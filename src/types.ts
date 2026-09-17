export interface ProductVariant {
  name: string;
  value: string;
}

export interface VariantOption {
  name: string;
  values: string[];
}

export interface Product {
  handle: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  price: number;
  compareAtPrice?: number;
  sku: string;
  images: string[];
  variants: VariantOption[];
  variantRows: {
    options: { name: string; value: string }[];
    sku: string;
    price: number;
    image?: string;
  }[];
  featured?: boolean;
}

export interface CartItem {
  productHandle: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  selectedOptions: { name: string; value: string }[];
  lineId: string;
}


export interface ProductVariant {
  size: number;
  label: string;
  price: number;
  isSubscription?: boolean;
  shopifyId: string; // The numeric ID from Shopify Admin
}

export interface Product {
  id: string;
  name: string;
  flavor: string;
  color: string;
  bgColor: string;
  textColor: string;
  description: string;
  image: string;
  features: string[];
  variants: ProductVariant[];
  isPro?: boolean;
}

export interface CartItem extends Product {
  selectedVariant: ProductVariant;
  quantity: number;
}

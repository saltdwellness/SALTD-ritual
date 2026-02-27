// constants.ts — static PRODUCTS array for local cart mapping.
// These mirror the Shopify product data and are used by App.tsx to map
// Shopify cart line items back to local Product objects.
// Once Shopify is live, these are still used for cart display (name, image, flavor, etc.)
import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 'kala-khatta',
    name: 'SALTD.',
    flavor: 'Kala Khatta',
    color: '#8A307F',
    bgColor: 'bg-[#8A307F]',
    textColor: 'text-[#8A307F]',
    description: 'Black plum & tamarind. Bold, tart, and loaded with the full electrolyte stack — 6 minerals, 8 vitamins, zero sugar.',
    image: '/mockups/Mockupv2-1.png',
    features: ['6 Electrolytes', 'Ashwagandha KSM-66', '8 Vitamins', 'Zero Sugar'],
    variants: [
      { size: 10, label: 'Ritual Pack (10 sticks)', price: 299, compareAtPrice: 349, isSubscription: false, shopifyId: 'variant_kalakhatta_10' },
      { size: 30, label: 'Month Supply (30 sticks)', price: 799, compareAtPrice: 999, isSubscription: false, shopifyId: 'variant_kalakhatta_30' },
      { size: 30, label: 'Monthly Ritual (30 sticks)', price: 719, isSubscription: true, shopifyId: 'variant_kalakhatta_sub' },
    ],
  },
  {
    id: 'banta-lime-spark',
    name: 'SALTD.',
    flavor: 'Banta Lime Spark',
    color: '#7AB800',
    bgColor: 'bg-[#7AB800]',
    textColor: 'text-[#7AB800]',
    description: 'The marble-stopper soda reimagined — citric acid, B12, full electrolyte stack. Zero sugar, zero crash.',
    image: '/mockups/MockupV2-2.png',
    features: ['6 Electrolytes', 'Vitamin B12', '8 Vitamins', 'Zero Sugar'],
    variants: [
      { size: 10, label: 'Ritual Pack (10 sticks)', price: 299, compareAtPrice: 349, isSubscription: false, shopifyId: 'variant_banta_10' },
      { size: 30, label: 'Month Supply (30 sticks)', price: 799, compareAtPrice: 999, isSubscription: false, shopifyId: 'variant_banta_30' },
      { size: 30, label: 'Monthly Ritual (30 sticks)', price: 719, isSubscription: true, shopifyId: 'variant_banta_sub' },
    ],
  },
  {
    id: 'peach-himalayan',
    name: 'SALTD.',
    flavor: 'Peach Himalayan',
    color: '#E8845A',
    bgColor: 'bg-[#E8845A]',
    textColor: 'text-[#E8845A]',
    description: 'Soft, warm, grounded. Elevated magnesium for recovery and sleep. The evening ritual.',
    image: '/mockups/Mockupv2-1.png',
    features: ['6 Electrolytes', 'High Magnesium', '8 Vitamins', 'Zero Sugar'],
    variants: [
      { size: 10, label: 'Ritual Pack (10 sticks)', price: 299, compareAtPrice: 349, isSubscription: false, shopifyId: 'variant_peach_10' },
      { size: 30, label: 'Month Supply (30 sticks)', price: 799, compareAtPrice: 999, isSubscription: false, shopifyId: 'variant_peach_30' },
      { size: 30, label: 'Monthly Ritual (30 sticks)', price: 719, isSubscription: true, shopifyId: 'variant_peach_sub' },
    ],
  },
];

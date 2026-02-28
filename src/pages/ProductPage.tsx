// ProductPage.tsx — individual product page, SEO-rich, all content from Shopify
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product, ProductVariant } from '../types';
import { fetchAllProducts, ShopifyProductFull, setSEO, VARIANT_MAP } from '../shopify';
import { FAQSection } from './FAQPage';

interface ProductPageProps {
  onAddToCart: (product: Product, variant: ProductVariant) => void;
}

const HANDLE_COLOR_FALLBACK: Record<string, string> = {
  'kala-khatta':     '#8A307F',
  'banta-lime-spark':'#7AB800',
  'peach-himalayan': '#E8845A',
};
const BG_MAP: Record<string, string> = {
  '#8A307F':'linear-gradient(135deg,#f5eef8,#ede0f5)',
  '#7AB800':'linear-gradient(135deg,#f2fce4,#e8f9cc)',
  '#E8845A':'linear-gradient(135deg,#fdf0ea,#fbe3d4)',
};

function toCartProduct(sp: ShopifyProductFull): Product {
  const accentColor: string = (typeof sp.flavorColor === 'string' ? sp.flavorColor : null) ?? HANDLE_COLOR_FALLBACK[sp.handle] ?? '#2E5BFF';
  const variants: ProductVariant[] = sp.variants.edges.map(({ node: v }) => ({
    size:           parseInt(v.title.match(/\((\d+)\)/)?.[1] ?? '10', 10),
    label:          v.title,
    price:          parseFloat(v.price.amount),
    compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice.amount) : undefined,
    isSubscription: v.title.toLowerCase().includes('subscription') || v.title.toLowerCase().includes('auto-ship'),
    shopifyId:      Object.entries(VARIANT_MAP).find(([, gid]) => gid === v.id)?.[0] ?? v.id,
  }));
  return {
    id: sp.handle, name: 'SALTD',
    flavor: sp.flavorSubtitle ?? sp.title,
    color: accentColor, bgColor: `bg-[${accentColor}]`, textColor: `text-[${accentColor}]`,
    description: sp.description,
    image: sp.images.edges[0]?.node.url ?? '/mockups/Mockupv2-1.png',
    features: sp.features.length ? sp.features : ['6 Electrolytes','Infused Ashwagandha','All 8 Vitamins','Zero Sugar'],
    variants,
  };
}

// Static products — shown when Shopify isn't connected yet.
// All content (science, FAQs, ingredients) now pulled from shopify.ts fetchAllProducts.
// Fallback defaults are also defined in shopify.ts, not here.
const STATIC_PRODUCTS: ShopifyProductFull[] = [
  {
    id: 'static-kala-khatta', handle: 'kala-khatta', title: 'Kala Khatta',
    description: 'Black plum & tamarind. Bold, tart, and loaded with the full electrolyte stack — 6 minerals, 8 vitamins, zero sugar.',
    descriptionHtml: '', productType: '', tags: [], vendor: 'SALTD.', featuredImage: null,
    availableForSale: true, flavorSubtitle: 'Kala Khatta',
    flavorColor: '#8A307F' as unknown as { value: string }, flavorBg: null, flavorTagline: { value: 'Kala Khatta' },
    featuresField: { value: '["6 Electrolytes","Ashwagandha KSM-66","8 Vitamins","Zero Sugar"]' },
    scienceCopy: null, ingredientsField: null,
    faq1Q: null, faq1A: null, faq2Q: null, faq2A: null, faq3Q: null, faq3A: null, faq4Q: null, faq4A: null,
    features: ['6 Electrolytes', 'Ashwagandha KSM-66', '8 Vitamins', 'Zero Sugar'],
    scienceText: 'Kala Khatta — black plum and tamarind — was never just a flavour. We loaded it with a complete electrolyte profile: sodium to drive cellular uptake, potassium for muscle function, magnesium to reduce cramping, calcium for nerve transmission, plus all 8 vitamins and 600mg of Ashwagandha KSM-66.',
    ingredients: [
      { name: 'Sodium', amount: '500mg', role: 'Primary hydration driver' },
      { name: 'Potassium', amount: '200mg', role: 'Muscle contraction and recovery' },
      { name: 'Magnesium', amount: '120mg', role: 'Reduces cramping, supports sleep' },
      { name: 'Ashwagandha KSM-66', amount: '600mg', role: 'Stress adaptation' },
      { name: 'Vitamin C', amount: '40mg', role: 'Immune support' },
      { name: 'B-Complex', amount: '8 vitamins', role: 'Energy metabolism' },
    ],
    faqs: [
      { q: 'What does Kala Khatta actually taste like?', a: 'Like the real thing — tart, tangy, a little sweet. Not artificial. Just honest flavour.' },
      { q: 'Can I drink it every day?', a: 'Yes. One stick a day builds cellular hydration that compounds over weeks.' },
      { q: 'Is there any sugar?', a: 'Zero. Monk Fruit only — no added sugar, no fructose, no maltodextrin.' },
      { q: 'When should I drink it?', a: 'Morning works best — before your first coffee or a workout.' },
    ],
    images: { edges: [{ node: { url: '/mockups/Mockupv2-1.png', altText: 'Kala Khatta' } }] },
    variants: { edges: [
      { node: { id: 'variant_kalakhatta_10',  title: 'Ritual Pack (10 sticks)',    price: { amount: '299', currencyCode: 'INR' }, compareAtPrice: { amount: '349', currencyCode: 'INR' }, availableForSale: true, quantityAvailable: 50, sku: null } },
      { node: { id: 'variant_kalakhatta_30',  title: 'Month Supply (30 sticks)',   price: { amount: '799', currencyCode: 'INR' }, compareAtPrice: { amount: '999', currencyCode: 'INR' }, availableForSale: true, quantityAvailable: 30, sku: null } },
    ] }, seo: { title: null, description: null },
  },
  {
    id: 'static-banta-lime-spark', handle: 'banta-lime-spark', title: 'Banta Lime Spark',
    description: 'The marble-stopper soda reimagined as a clean, electric hydration ritual.',
    descriptionHtml: '', productType: '', tags: [], vendor: 'SALTD.', featuredImage: null,
    availableForSale: true, flavorSubtitle: 'Banta Lime Spark',
    flavorColor: '#7AB800' as unknown as { value: string }, flavorBg: null, flavorTagline: { value: 'Banta Lime Spark' },
    featuresField: { value: '["6 Electrolytes","Vitamin B12","8 Vitamins","Zero Sugar"]' },
    scienceCopy: null, ingredientsField: null,
    faq1Q: null, faq1A: null, faq2Q: null, faq2A: null, faq3Q: null, faq3A: null, faq4Q: null, faq4A: null,
    features: ['6 Electrolytes', 'Vitamin B12', '8 Vitamins', 'Zero Sugar'],
    scienceText: 'Banta — the marble-stoppered lemon-lime soda reimagined as a high-performance hydration system. Citric acid naturally enhances mineral absorption. Paired with Vitamin B12 for cognitive edge and Ashwagandha for sustained energy.',
    ingredients: [
      { name: 'Sodium', amount: '500mg', role: 'Cellular hydration' },
      { name: 'Potassium', amount: '200mg', role: 'Electrolyte balance' },
      { name: 'Magnesium', amount: '120mg', role: 'ATP energy production' },
      { name: 'Ashwagandha KSM-66', amount: '600mg', role: 'Sustained energy' },
      { name: 'Vitamin B12', amount: '2.4mcg', role: 'Cognitive function' },
      { name: 'Citric Acid', amount: 'Natural', role: 'Enhances mineral bioavailability' },
    ],
    faqs: [
      { q: 'What does Banta Lime Spark taste like?', a: 'Sharp, citrusy, slightly effervescent — the same electric quality as the original banta, cleaner and without the crash.' },
      { q: 'Is this good for workouts?', a: 'Yes. Drink 30 minutes before or during for sustained performance.' },
      { q: 'Why does it have citric acid?', a: 'Citric acid increases bioavailability of minerals — your body absorbs electrolytes faster in a slightly acidic environment.' },
      { q: 'Can kids drink it?', a: 'Designed for adults. Consult a doctor regarding Ashwagandha content for children.' },
    ],
    images: { edges: [{ node: { url: '/mockups/MockupV2-2.png', altText: 'Banta Lime Spark' } }] },
    variants: { edges: [
      { node: { id: 'variant_banta_10',  title: 'Ritual Pack (10 sticks)',    price: { amount: '299', currencyCode: 'INR' }, compareAtPrice: { amount: '349', currencyCode: 'INR' }, availableForSale: true, quantityAvailable: 50, sku: null } },
      { node: { id: 'variant_banta_30',  title: 'Month Supply (30 sticks)',   price: { amount: '799', currencyCode: 'INR' }, compareAtPrice: { amount: '999', currencyCode: 'INR' }, availableForSale: true, quantityAvailable: 30, sku: null } },
    ] }, seo: { title: null, description: null },
  },
  {
    id: 'static-peach-himalayan', handle: 'peach-himalayan', title: 'Peach Himalayan',
    description: 'Soft, warm, grounded. The evening ritual. Elevated magnesium (150mg) for recovery and sleep.',
    descriptionHtml: '', productType: '', tags: [], vendor: 'SALTD.', featuredImage: null,
    availableForSale: true, flavorSubtitle: 'Peach Himalayan',
    flavorColor: '#E8845A' as unknown as { value: string }, flavorBg: null, flavorTagline: { value: 'Peach Himalayan' },
    featuresField: { value: '["6 Electrolytes","High Magnesium","8 Vitamins","Zero Sugar"]' },
    scienceCopy: null, ingredientsField: null,
    faq1Q: null, faq1A: null, faq2Q: null, faq2A: null, faq3Q: null, faq3A: null, faq4Q: null, faq4A: null,
    features: ['6 Electrolytes', 'High Magnesium', '8 Vitamins', 'Zero Sugar'],
    scienceText: 'Himalayan Peach carries a warmth ideal for evening use. Elevated magnesium (150mg) supports sleep quality, Ashwagandha reduces cortisol, and a full B-complex supports overnight recovery.',
    ingredients: [
      { name: 'Sodium', amount: '500mg', role: 'Overnight cellular hydration' },
      { name: 'Potassium', amount: '200mg', role: 'Muscle relaxation during sleep' },
      { name: 'Magnesium', amount: '150mg', role: 'Higher dose — supports sleep quality' },
      { name: 'Ashwagandha KSM-66', amount: '600mg', role: 'Cortisol reduction' },
      { name: 'Vitamin D3', amount: '400IU', role: 'Bone health and immune regulation' },
      { name: 'B-Complex', amount: '8 vitamins', role: 'Overnight repair' },
    ],
    faqs: [
      { q: 'What does Peach Himalayan taste like?', a: 'Soft, ripe peach — warm and comforting rather than stimulating. Perfect for evenings.' },
      { q: 'Can I use this before bed?', a: 'Yes — elevated magnesium and Ashwagandha work synergistically to support sleep and overnight recovery.' },
      { q: 'Does it have caffeine?', a: 'Zero. No caffeine, no stimulants.' },
      { q: 'What makes it different?', a: 'Higher magnesium (150mg vs 120mg) plus Vitamin D3 specifically for overnight immune regulation.' },
    ],
    images: { edges: [{ node: { url: '/mockups/Mockupv2-1.png', altText: 'Peach Himalayan' } }] },
    variants: { edges: [
      { node: { id: 'variant_peach_10',  title: 'Ritual Pack (10 sticks)',    price: { amount: '299', currencyCode: 'INR' }, compareAtPrice: { amount: '349', currencyCode: 'INR' }, availableForSale: true, quantityAvailable: 50, sku: null } },
      { node: { id: 'variant_peach_30',  title: 'Month Supply (30 sticks)',   price: { amount: '799', currencyCode: 'INR' }, compareAtPrice: { amount: '999', currencyCode: 'INR' }, availableForSale: true, quantityAvailable: 30, sku: null } },
    ] }, seo: { title: null, description: null },
  },
] as unknown as ShopifyProductFull[];

const ProductPage: React.FC<ProductPageProps> = ({ onAddToCart }) => {
  const { handle } = useParams<{ handle: string }>();

  // ── Eager init: show static content immediately, upgrade silently when Shopify responds ──
  const staticFallback = STATIC_PRODUCTS.find(p => p.handle === handle) ?? STATIC_PRODUCTS[0];
  const staticCart     = toCartProduct(staticFallback);

  const [product, setProduct]       = useState<ShopifyProductFull>(staticFallback);
  const [allProducts, setAllProducts] = useState<ShopifyProductFull[]>(STATIC_PRODUCTS);
  const [selected, setSelected]     = useState<ProductVariant>(staticCart.variants[0]);
  const [liveReady, setLiveReady]   = useState(false); // true once Shopify data arrives
  const [added, setAdded]           = useState(false);
  const [imgIdx, setImgIdx]         = useState(0);
  const [openFaq, setOpenFaq]       = useState<number | null>(null);

  // Force scroll to top on handle change — iOS Safari fix
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [handle]);

  // Reset to correct static product when handle changes
  useEffect(() => {
    const sf = STATIC_PRODUCTS.find(p => p.handle === handle) ?? STATIC_PRODUCTS[0];
    setProduct(sf);
    setSelected(toCartProduct(sf).variants[0]);
    setLiveReady(false);
    setImgIdx(0);
  }, [handle]);

  // Background fetch — silently upgrades to live data, page already visible
  useEffect(() => {
    let cancelled = false;
    fetchAllProducts().then(products => {
      if (cancelled) return;
      const pool = products.length > 0 ? products : STATIC_PRODUCTS;
      setAllProducts(pool);
      const found = pool.find(p => p.handle === handle);
      if (found) {
        setProduct(found);
        // Only reset selected if user hasn't interacted yet
        setSelected(prev => {
          const live = toCartProduct(found);
          const match = live.variants.find(v => v.label === prev.label);
          return match ?? live.variants[0];
        });
        setSEO({
          title: `${found.seo?.title ?? (found.flavorSubtitle ?? found.title)} — SALTD. Ritual Hydration`,
          description: found.seo?.description ?? found.description,
          ogImage: found.images.edges[0]?.node.url,
        });
        setLiveReady(true);
      }
    }).catch(() => {
      // Network error — static data already showing, nothing to do
      if (!cancelled) setLiveReady(false);
    });
    return () => { cancelled = true; };
  }, [handle]);

  // Product truly not found in static data either
  if (!product) return (
    <div className="bg-[#FAFAF8] min-h-screen flex flex-col items-center justify-center pt-20 gap-4">
      <p className="text-sm font-black text-black/40 uppercase tracking-widest">Product not found</p>
      <Link to="/shop" className="text-xs font-black uppercase tracking-[0.35em] text-[#2E5BFF]">← Back to Shop</Link>
    </div>
  );

  // Suppress unused warning — liveReady used for subtle shimmer future enhancement
  void liveReady;

  const p           = toCartProduct(product);
  const accentColor = (typeof product.flavorColor === 'string' ? product.flavorColor : null) ?? HANDLE_COLOR_FALLBACK[product.handle] ?? '#2E5BFF';
  const bgGrad      = (typeof product.flavorBg === 'string' ? product.flavorBg : null) ?? BG_MAP[accentColor] ?? 'linear-gradient(135deg,#f5f5f5,#ebebeb)';
  // All content now live from Shopify metafields — falls back to defaults in shopify.ts
  const details = {
    tagline:     product.flavorSubtitle ?? '',
    science:     product.scienceText,
    ingredients: product.ingredients,
    faqs:        product.faqs,
  };
  const allImages   = product.images.edges.map(e => e.node.url);
  const prodImg     = allImages[imgIdx] ?? allImages[0] ?? '/mockups/Mockupv2-1.png';

  const oneTime10  = p.variants.find(v => !v.isSubscription && v.size === 10);
  const oneTime30  = p.variants.find(v => !v.isSubscription && v.size === 30);
  const subVariant = p.variants.find(v => v.isSubscription);
  const variantNode = product.variants.edges.find(e => e.node.title === selected.label)?.node;
  const inStock = variantNode?.availableForSale ?? product.availableForSale;
  const compareAt = variantNode?.compareAtPrice ? parseFloat(variantNode.compareAtPrice.amount) : null;
  // Always read prices from Shopify nodes — single source of truth
  const livePrice = (label: string): number => {
    const node = product.variants.edges.find(e => e.node.title === label)?.node;
    return node ? parseFloat(node.price.amount) : 0;
  };

  const handleAdd = (v: ProductVariant) => { onAddToCart(p, v); setAdded(true); setTimeout(() => setAdded(false), 1800); };

  const otherProducts = allProducts.filter(ap => ap.handle !== handle).slice(0, 2);

  return (
    <div className="bg-[#FAFAF8] min-h-screen pt-14 md:pt-16">

      {/* Breadcrumb */}
      <div className="px-5 md:px-12 py-4 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.35em] text-black/30">
          <Link to="/" className="hover:text-[#2E5BFF] transition-colors">Home</Link>
          <span className="text-[#2E5BFF]">·</span>
          <Link to="/shop" className="hover:text-[#2E5BFF] transition-colors">Shop</Link>
          <span className="text-[#2E5BFF]">·</span>
          <span className="text-black/60">{p.flavor}</span>
        </div>
      </div>

      {/* Hero — product + purchase */}
      <div className="px-5 md:px-8 pb-6">
        <div className="max-w-[1440px] mx-auto bg-white rounded-3xl overflow-hidden" style={{ border:'1px solid rgba(0,0,0,0.06)', boxShadow:'0 2px 24px rgba(0,0,0,0.06)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Images */}
            <div className="relative flex items-center justify-center overflow-hidden" style={{ minHeight:'clamp(340px,50vw,580px)', background:bgGrad }}>
              <div className="absolute top-5 left-6">
                <p className="text-[9px] font-black uppercase tracking-[0.5em] text-black/20">SALTD<span style={{color:'#2E5BFF'}}>.</span></p>
              </div>
              {allImages.length > 1 && (
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
                  {allImages.slice(0,4).map((_,i) => (
                    <button key={i} onClick={()=>setImgIdx(i)}
                      className="w-2 h-2 rounded-full transition-all"
                      style={{ background: i === imgIdx ? accentColor : 'rgba(0,0,0,0.15)', transform: i === imgIdx ? 'scale(1.3)' : 'scale(1)' }} />
                  ))}
                </div>
              )}
              <img src={prodImg} alt={p.flavor}
                style={{ width:'min(300px,65%)', height:'auto', objectFit:'contain', filter:`drop-shadow(0 40px 80px ${accentColor}40)`, transition:'opacity 0.3s ease' }} />
            </div>

            {/* Purchase panel */}
            <div className="flex flex-col justify-center px-8 md:px-12 py-12 md:py-14 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  {p.features.slice(0,3).map(f => (
                    <span key={f} className="text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ background:`${accentColor}15`, color: accentColor }}>{f}</span>
                  ))}
                </div>
                <h1 className="text-[2.4rem] md:text-[3.2rem] font-black tracking-[-0.04em] text-[#1A1A1A] leading-[0.92] mb-3">"{p.flavor}"</h1>
                <p className="text-base text-black/55 font-medium leading-relaxed">{details.tagline}</p>
              </div>

              {/* Rating placeholder */}
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">{[1,2,3,4,5].map(s=><span key={s} style={{color:accentColor}} className="text-base leading-none">★</span>)}</div>
                <span className="text-xs font-black text-black/40">5.0</span>
                <span className="text-[9px] text-black/30 font-medium">· 24 reviews</span>
              </div>

              {/* Pack options */}
              <div className="space-y-3">
                <p className="text-[9px] font-black uppercase tracking-[0.5em] text-black/30">Choose your pack</p>

                {oneTime10 && (
                  <button onClick={() => setSelected(oneTime10)}
                    className="w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-200 text-left"
                    style={{ background: selected.shopifyId === oneTime10.shopifyId ? '#1A1A1A' : 'transparent', border: selected.shopifyId === oneTime10.shopifyId ? 'none' : '1.5px solid rgba(0,0,0,0.09)', color: selected.shopifyId === oneTime10.shopifyId ? 'white' : '#1A1A1A' }}>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em]">Ritual Pack — 10 sticks</p>
                      <p className="text-[9px] font-medium mt-0.5" style={{ color: selected.shopifyId === oneTime10.shopifyId ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.35)' }}>One-time · Try it out</p>
                    </div>
                    <span className="text-lg font-black">₹{livePrice(oneTime10.label).toFixed(0)}</span>
                  </button>
                )}

                {oneTime30 && (
                  <button onClick={() => setSelected(oneTime30)}
                    className="w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-200 text-left relative"
                    style={{ background: selected.shopifyId === oneTime30.shopifyId ? '#1A1A1A' : 'transparent', border: selected.shopifyId === oneTime30.shopifyId ? 'none' : '1.5px solid rgba(0,0,0,0.09)', color: selected.shopifyId === oneTime30.shopifyId ? 'white' : '#1A1A1A' }}>
                    <div className="absolute -top-2 right-4">
                      <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-white" style={{ background: accentColor }}>Best Value</span>
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em]">Monthly Ritual — 30 sticks</p>
                      <p className="text-[9px] font-medium mt-0.5" style={{ color: selected.shopifyId === oneTime30.shopifyId ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.35)' }}>30 sticks · Full month</p>
                    </div>
                    <span className="text-lg font-black">₹{livePrice(oneTime30.label).toFixed(0)}</span>
                  </button>
                )}


              </div>

              {/* Add to bag */}
              <div>
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-[2.5rem] font-black tracking-[-0.04em] text-[#1A1A1A]">₹{(livePrice(selected.label) || selected.price).toFixed(0)}</span>
                  {compareAt && compareAt > selected.price && <span className="text-base text-black/30 line-through font-medium">₹{compareAt.toFixed(0)}</span>}
                </div>
                <button onClick={() => inStock && handleAdd(selected)} disabled={!inStock}
                  className="w-full py-4 text-xs font-black uppercase tracking-[0.35em] rounded-2xl transition-all duration-300 active:scale-[0.98] disabled:opacity-40 mb-3"
                  style={{ background: added ? '#1A1A1A' : accentColor, color:'white' }}>
                  {added ? '✓ Pre-order Placed' : inStock ? 'Pre-order Now' : 'Out of Stock'}
                </button>
                <div className="flex flex-wrap gap-4 justify-center">
                  {['Free Shipping','Secure Checkout','Easy Returns'].map(t => (
                    <div key={t} className="flex items-center gap-1.5">
                      <span className="text-[#2E5BFF]">·</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-black/40">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Science / About section */}
      <div className="px-5 md:px-8 py-6">
        <div className="max-w-[1440px] mx-auto bg-[#1A1A1A] rounded-3xl px-8 md:px-14 py-14 md:py-16 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage:'linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)', backgroundSize:'80px 80px' }} />
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.6em] text-[#2E5BFF] mb-4">The Science</p>
              <h2 className="text-[1.8rem] md:text-[2.8rem] font-black tracking-[-0.04em] text-white leading-[0.95] mb-6">
                What's actually<br /><span className="text-white/20">inside.</span>
              </h2>
              <p className="text-sm text-white/55 font-medium leading-relaxed">{details.science}</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.6em] text-[#2E5BFF] mb-6">Key Ingredients</p>
              <div className="space-y-4">
                {details.ingredients.map((ing, i) => (
                  <div key={i} className="flex gap-4 pb-4 border-b border-white/[0.06] last:border-0 last:pb-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2E5BFF] mt-2 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between mb-1">
                        <p className="text-sm font-black text-white">{ing.name}</p>
                        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: accentColor }}>{ing.amount}</span>
                      </div>
                      <p className="text-xs text-white/40 font-medium leading-relaxed">{ing.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How to use */}
      <div className="px-5 md:px-8 py-6">
        <div className="max-w-[1440px] mx-auto">
          <p className="text-[9px] font-black uppercase tracking-[0.6em] text-[#2E5BFF] mb-6">The Ritual</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { n:'01', t:'Tear & Pour', d:'One stick into 250–500ml of water. Cold or room temperature. No blender, no measuring.' },
              { n:'02', t:'Stir', d:'10 seconds. It dissolves clean — no residue, no cloudiness. Just clear, flavoured water.' },
              { n:'03', t:'Drink Daily', d:'Make it a ritual. Every morning, every workout, every afternoon. Consistency is what makes it work.' },
            ].map((step, i) => (
              <div key={i} className="p-7 rounded-2xl bg-white border border-black/[0.06]">
                <span className="text-[9px] font-black uppercase tracking-[0.5em] text-[#2E5BFF] block mb-3">{step.n}</span>
                <h3 className="text-lg font-black text-[#1A1A1A] mb-2">"{step.t}"</h3>
                <p className="text-sm text-black/50 font-medium leading-relaxed">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="px-5 md:px-8 py-6">
        <div className="max-w-[1440px] mx-auto">
          <p className="text-[9px] font-black uppercase tracking-[0.6em] text-[#2E5BFF] mb-6">Common Questions</p>
          <div className="space-y-3">
            {details.faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-7 py-5 text-left">
                  <span className="text-sm font-black text-[#1A1A1A] pr-4">{faq.q}</span>
                  <span className="text-xl font-black shrink-0 transition-transform" style={{ color:'#2E5BFF', transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-7 pb-5">
                    <p className="text-sm text-black/55 font-medium leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="px-5 md:px-8 py-6">
        <div className="max-w-[1440px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon:'🏛️', label:'FSSAI Approved' },
            { icon:'🔬', label:'GMP Certified' },
            { icon:'🛡️', label:'FDA Compliant' },
            { icon:'🧪', label:'Lab Tested' },
          ].map(b => (
            <div key={b.label} className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-black/[0.06]">
              <span className="text-2xl">{b.icon}</span>
              <span className="text-xs font-black text-[#1A1A1A]">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Other products */}
      {otherProducts.length > 0 && (
        <div className="px-5 md:px-8 py-6 pb-8">
          <div className="max-w-[1440px] mx-auto">
            <p className="text-[9px] font-black uppercase tracking-[0.6em] text-[#2E5BFF] mb-3">Complete the ritual</p>
            <h2 className="text-[1.8rem] font-black tracking-[-0.03em] text-[#1A1A1A] mb-8">You might also like.</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {otherProducts.map(op => {
                const op_accent = (typeof op.flavorColor === 'string' ? op.flavorColor : null) ?? HANDLE_COLOR_FALLBACK[op.handle] ?? '#2E5BFF';
                const op_bg = (typeof op.flavorBg === 'string' ? op.flavorBg : null) ?? BG_MAP[op_accent] ?? 'linear-gradient(135deg,#f5f5f5,#ebebeb)';
                const op_price = parseFloat(op.variants.edges[0]?.node.price.amount ?? '0');
                return (
                  <Link key={op.id} to={`/product/${op.handle}`}
                    className="bg-white rounded-3xl overflow-hidden flex gap-0 group hover:-translate-y-1 transition-transform duration-300"
                    style={{ border:'1px solid rgba(0,0,0,0.06)', boxShadow:'0 2px 16px rgba(0,0,0,0.05)' }}>
                    <div className="w-32 shrink-0 flex items-center justify-center" style={{ background: op_bg }}>
                      <img src={op.images.edges[0]?.node.url ?? '/mockups/Mockupv2-1.png'} alt={op.title}
                        className="w-20 h-auto object-contain group-hover:scale-105 transition-transform duration-500"
                        style={{ filter:`drop-shadow(0 10px 20px ${op_accent}30)` }} />
                    </div>
                    <div className="flex flex-col justify-center px-6 py-5 gap-1">
                      <p className="text-[8px] font-black uppercase tracking-[0.5em]" style={{ color: op_accent }}>SALTD.</p>
                      <h3 className="text-base font-black text-[#1A1A1A]">"{op.flavorSubtitle ?? op.title}"</h3>
                      <p className="text-xs text-black/45 font-medium leading-relaxed mt-1 line-clamp-2">{op.description}</p>
                      <p className="text-sm font-black text-[#1A1A1A] mt-2">₹{op_price.toFixed(0)} <span className="text-[9px] text-black/30 font-medium">/ pack</span></p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── General Hydration FAQs ── */}
      <section className="py-14 md:py-20 bg-[#FAFAF8]">
        <div className="max-w-[860px] mx-auto px-6 md:px-12">
          <div className="text-center mb-12">
            <p className="text-xs font-black uppercase tracking-[0.5em] mb-3" style={{ color: accentColor }}>
              "Hydration FAQs"
            </p>
            <h2
              className="font-black text-[#0D0D10] leading-[1.0] tracking-[-0.03em] mb-4"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}
            >
              Common Questions About Electrolytes
            </h2>
            <p className="text-base text-[#1A1A1A]/55 font-medium">
              Everything you need to know about hydration and daily electrolyte use.
            </p>
          </div>
          <FAQSection compact maxQuestions={6} />
          <div className="text-center mt-8">
            <Link
              to="/faq"
              className="inline-block px-7 py-3.5 text-sm font-black uppercase tracking-[0.3em] rounded-full border-2 border-[#0D0D10]/20 text-[#0D0D10]/55 hover:border-[#0D0D10]/50 hover:text-[#0D0D10] transition-all"
            >
              View All FAQs →
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default ProductPage;

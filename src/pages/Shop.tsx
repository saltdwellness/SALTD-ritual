// Shop.tsx — fully dynamic, all product data from Shopify Storefront API
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Product, ProductVariant } from '../types';
import {
  fetchAllProducts, ShopifyProductFull,
  setSEO, seoForPage,
  VARIANT_MAP,
} from '../shopify';

interface ShopProps {
  onAddToCart: (product: Product, variant: ProductVariant) => void;
}

const HANDLE_COLOR_FALLBACK: Record<string, string> = {
  'kala-khatta':      '#8A307F',
  'banta-lime-spark': '#7AB800',
  'peach-himalayan':  '#E8845A',
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
    isSubscription: v.title.toLowerCase().includes('month'),
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

// Static fallback products — shown when Shopify isn't connected yet.
// These mirror the real product structure so ProductSection renders identically.
// Once VARIANT_MAP has real GIDs and Shopify API is live, these are never used.
const STATIC_PRODUCTS: ShopifyProductFull[] = [
  {
    id: 'static-kala-khatta',
    handle: 'kala-khatta',
    title: 'Kala Khatta',
    description: 'Black plum & tamarind. Bold, tart, and loaded with the full electrolyte stack — 6 minerals, 8 vitamins, zero sugar. The flavour of Indian summers, now doing something serious.',
    availableForSale: true,
    flavorSubtitle: 'Kala Khatta',
    flavorColor: '#8A307F',
    flavorBg: null,
    features: ['6 Electrolytes', 'Ashwagandha KSM-66', '8 Vitamins', 'Zero Sugar'],
    images: { edges: [{ node: { url: '/mockups/Mockupv2-1.png', altText: 'Kala Khatta' } }] },
    variants: {
      edges: [
        { node: { id: 'variant_kalakhatta_10', title: 'Ritual Pack (10 sticks)', price: { amount: '299', currencyCode: 'INR' }, compareAtPrice: { amount: '349', currencyCode: 'INR' }, availableForSale: true, quantityAvailable: 50 } },
        { node: { id: 'variant_kalakhatta_30', title: 'Month Supply (30 sticks)', price: { amount: '799', currencyCode: 'INR' }, compareAtPrice: { amount: '999', currencyCode: 'INR' }, availableForSale: true, quantityAvailable: 30 } },
        { node: { id: 'variant_kalakhatta_sub', title: 'Monthly Ritual (30 sticks)', price: { amount: '719', currencyCode: 'INR' }, compareAtPrice: null, availableForSale: true, quantityAvailable: 99 } },
      ],
    },
  },
  {
    id: 'static-banta-lime-spark',
    handle: 'banta-lime-spark',
    title: 'Banta Lime Spark',
    description: 'The marble-stopper soda you grew up with — reimagined as a clean, electric hydration ritual. Citric acid enhances mineral absorption. B12 for a cognitive edge.',
    availableForSale: true,
    flavorSubtitle: 'Banta Lime Spark',
    flavorColor: '#7AB800',
    flavorBg: null,
    features: ['6 Electrolytes', 'Vitamin B12', '8 Vitamins', 'Zero Sugar'],
    images: { edges: [{ node: { url: '/mockups/MockupV2-2.png', altText: 'Banta Lime Spark' } }] },
    variants: {
      edges: [
        { node: { id: 'variant_banta_10', title: 'Ritual Pack (10 sticks)', price: { amount: '299', currencyCode: 'INR' }, compareAtPrice: { amount: '349', currencyCode: 'INR' }, availableForSale: true, quantityAvailable: 50 } },
        { node: { id: 'variant_banta_30', title: 'Month Supply (30 sticks)', price: { amount: '799', currencyCode: 'INR' }, compareAtPrice: { amount: '999', currencyCode: 'INR' }, availableForSale: true, quantityAvailable: 30 } },
        { node: { id: 'variant_banta_sub', title: 'Monthly Ritual (30 sticks)', price: { amount: '719', currencyCode: 'INR' }, compareAtPrice: null, availableForSale: true, quantityAvailable: 99 } },
      ],
    },
  },
  {
    id: 'static-peach-himalayan',
    handle: 'peach-himalayan',
    title: 'Peach Himalayan',
    description: 'Soft, warm, grounded. The evening ritual. Elevated magnesium (150mg) for recovery and sleep quality. Himalayan pink salt for trace minerals beyond standard electrolytes.',
    availableForSale: true,
    flavorSubtitle: 'Peach Himalayan',
    flavorColor: '#E8845A',
    flavorBg: null,
    features: ['6 Electrolytes', 'High Magnesium', '8 Vitamins', 'Zero Sugar'],
    images: { edges: [{ node: { url: '/mockups/Mockupv2-1.png', altText: 'Peach Himalayan' } }] },
    variants: {
      edges: [
        { node: { id: 'variant_peach_10', title: 'Ritual Pack (10 sticks)', price: { amount: '299', currencyCode: 'INR' }, compareAtPrice: { amount: '349', currencyCode: 'INR' }, availableForSale: true, quantityAvailable: 50 } },
        { node: { id: 'variant_peach_30', title: 'Month Supply (30 sticks)', price: { amount: '799', currencyCode: 'INR' }, compareAtPrice: { amount: '999', currencyCode: 'INR' }, availableForSale: true, quantityAvailable: 30 } },
        { node: { id: 'variant_peach_sub', title: 'Monthly Ritual (30 sticks)', price: { amount: '719', currencyCode: 'INR' }, compareAtPrice: null, availableForSale: true, quantityAvailable: 99 } },
      ],
    },
  },
] as unknown as ShopifyProductFull[];

const ProductSection: React.FC<{
  sp: ShopifyProductFull; index: number;
  onAddToCart: (p: Product, v: ProductVariant) => void;
}> = ({ sp, index, onAddToCart }) => {
  const product     = toCartProduct(sp);
  const accentColor: string = (typeof sp.flavorColor === 'string' ? sp.flavorColor : null) ?? HANDLE_COLOR_FALLBACK[sp.handle] ?? '#2E5BFF';
  const bgGrad: string = (typeof sp.flavorBg === 'string' ? sp.flavorBg : null) ?? BG_MAP[accentColor] ?? 'linear-gradient(135deg,#f5f5f5,#ebebeb)';
  const [selected, setSelected] = useState<ProductVariant>(product.variants[0]);
  const [added,    setAdded]    = useState(false);
  const [hovered,  setHovered]  = useState(false);
  const [imgIdx,   setImgIdx]   = useState(0);

  // Separate one-time variants by size AND subscription variants
  const oneTime10 = product.variants.find(v => !v.isSubscription && v.size === 10);
  const oneTime30 = product.variants.find(v => !v.isSubscription && v.size === 30);
  const subVariant = product.variants.find(v => v.isSubscription);

  const allImages = sp.images.edges.map(e => e.node.url);
  const prodImg   = allImages[imgIdx] ?? allImages[0] ?? '/mockups/Mockupv2-1.png';
  const variantNode = sp.variants.edges.find(e => e.node.title === selected.label)?.node;
  const inStock   = variantNode?.availableForSale ?? sp.availableForSale;
  const qty       = variantNode?.quantityAvailable;
  const isLowStock = qty != null && qty > 0 && qty <= 5;
  const compareAt  = variantNode?.compareAtPrice ? parseFloat(variantNode.compareAtPrice.amount) : null;

  const handleAdd = (v: ProductVariant) => { onAddToCart(product, v); setAdded(true); setTimeout(() => setAdded(false), 1800); };

  return (
    <div className="bg-white overflow-hidden mb-4" style={{ borderRadius:24, border:'1px solid rgba(0,0,0,0.06)', boxShadow:'0 2px 16px rgba(0,0,0,0.05)' }}>
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Image */}
        <div className={`relative flex items-center justify-center overflow-hidden ${index%2!==0?'md:order-2':''}`}
          style={{ minHeight:'clamp(300px,45vw,520px)', background:bgGrad }}
          onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}>
          <span className="absolute top-5 left-6 text-[9px] font-black uppercase tracking-[0.5em] text-black/20">0{index+1}</span>
          <div className="absolute bottom-5 left-6 flex items-center gap-2 opacity-25">
            <div className="w-4 h-[1px] bg-black" />
            <span className="text-[8px] font-black uppercase tracking-[0.4em]">"{product.flavor}"</span>
          </div>
          {allImages.length > 1 && (
            <div className="absolute right-5 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
              {allImages.slice(0,4).map((_, i) => (
                <button key={i} onClick={()=>setImgIdx(i)}
                  className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{ background: i === imgIdx ? accentColor : 'rgba(0,0,0,0.15)' }} />
              ))}
            </div>
          )}
          <img src={prodImg} alt={sp.title}
            style={{ width:'min(280px,60%)', height:'auto', objectFit:'contain',
              transform: hovered ? 'scale(1.05) translateY(-8px)' : 'scale(1) translateY(0)',
              transition:'transform 0.6s cubic-bezier(0.16,1,0.3,1)',
              filter:`drop-shadow(0 30px 60px ${accentColor}35)`, willChange:'transform' }} />
        </div>

        {/* Info */}
        <div className={`flex flex-col justify-center px-8 md:px-12 py-12 md:py-14 gap-6 ${index%2!==0?'md:order-1':''}`}>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.6em] mb-3" style={{ color: accentColor }}>SALTD. — 0{index+1}</p>
            <h2 className="text-[2rem] md:text-[2.8rem] font-black tracking-[-0.04em] text-[#1A1A1A] leading-[0.95] mb-4">"{product.flavor}"</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {product.features.map(f => (
                <span key={f} className="text-[9px] font-black uppercase tracking-[0.3em] px-3 py-1.5 rounded-xl border border-black/10 text-black/50">{f}</span>
              ))}
            </div>
            <p className="text-sm text-black/55 leading-relaxed font-medium border-l-2 pl-4 rounded-sm" style={{ borderColor: accentColor }}>
              {sp.description}
            </p>
          </div>

          {/* Purchase options */}
          <div className="space-y-3">
            <p className="text-[9px] font-black uppercase tracking-[0.5em] text-black/30">Choose your pack</p>

            {/* One-time 10-pack */}
            {oneTime10 && (
              <button onClick={() => setSelected(oneTime10)}
                className="w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-200 text-left"
                style={{
                  background: selected.shopifyId === oneTime10.shopifyId ? '#1A1A1A' : 'transparent',
                  border: selected.shopifyId === oneTime10.shopifyId ? 'none' : '1.5px solid rgba(0,0,0,0.09)',
                  color: selected.shopifyId === oneTime10.shopifyId ? 'white' : '#1A1A1A',
                }}>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em]">Ritual Pack — 10 sticks</p>
                  <p className="text-[9px] font-medium mt-0.5" style={{ color: selected.shopifyId === oneTime10.shopifyId ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.35)' }}>One-time · Try it out</p>
                </div>
                <span className="text-lg font-black">₹{oneTime10.price.toFixed(0)}</span>
              </button>
            )}

            {/* One-time 30-pack */}
            {oneTime30 && (
              <button onClick={() => setSelected(oneTime30)}
                className="w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-200 text-left relative"
                style={{
                  background: selected.shopifyId === oneTime30.shopifyId ? '#1A1A1A' : 'transparent',
                  border: selected.shopifyId === oneTime30.shopifyId ? 'none' : '1.5px solid rgba(0,0,0,0.09)',
                  color: selected.shopifyId === oneTime30.shopifyId ? 'white' : '#1A1A1A',
                }}>
                <div className="absolute -top-2 right-4">
                  <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-white" style={{ background: accentColor }}>Best Value</span>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em]">Monthly Ritual — 30 sticks</p>
                  <p className="text-[9px] font-medium mt-0.5" style={{ color: selected.shopifyId === oneTime30.shopifyId ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.35)' }}>30 sticks · Full month</p>
                </div>
                <span className="text-lg font-black">₹{oneTime30.price.toFixed(0)}</span>
              </button>
            )}


          </div>

          {/* Price + Add to bag */}
          <div>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-[2.2rem] font-black tracking-[-0.04em] text-[#1A1A1A]">₹{selected.price.toFixed(0)}</span>
              {compareAt && compareAt > selected.price && <span className="text-base text-black/30 line-through font-medium">₹{compareAt.toFixed(0)}</span>}
              {isLowStock && <span className="text-xs font-black text-red-500 uppercase tracking-widest">Only {qty} left</span>}
            </div>
            <div className="flex gap-3">
              <button onClick={() => inStock && handleAdd(selected)} disabled={!inStock}
                className="flex-1 py-4 text-xs font-black uppercase tracking-[0.4em] rounded-2xl transition-all duration-300 active:scale-[0.97] disabled:opacity-40"
                style={{ background: added ? '#1A1A1A' : accentColor, color:'white' }}>
                {added ? '✓ Pre-order Placed' : inStock ? 'Pre-order Now' : 'Out of Stock'}
              </button>
              <Link to={`/product/${sp.handle}`}
                className="px-5 py-4 text-xs font-black uppercase tracking-[0.3em] rounded-2xl border border-black/08 text-black/40 hover:border-black/20 hover:text-black/70 transition-all flex items-center">
                Details
              </Link>
            </div>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap gap-5 pt-5 border-t border-black/[0.05]">
            {['Free Shipping','Secure Checkout','Easy Returns'].map(t => (
              <div key={t} className="flex items-center gap-1.5">
                <div className="w-3 h-[1.5px] bg-[#2E5BFF] rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-widest text-black/40">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Shop: React.FC<ShopProps> = ({ onAddToCart }) => {
  const [products, setProducts] = useState<ShopifyProductFull[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    setSEO(seoForPage('The Apothecary', 'Shop SALTD. ritual hydration sticks. Three Indian-inspired flavours — zero sugar, 6 electrolytes, 8 vitamins.'));
    fetchAllProducts().then(setProducts).catch(console.warn).finally(() => setLoading(false));
  }, []);

  // Use live Shopify products if available, otherwise show static previews
  const displayProducts = products.length > 0 ? products : STATIC_PRODUCTS;

  if (loading) return (
    <div className="bg-[#FAFAF8] min-h-screen flex items-center justify-center pt-20">
      <div className="w-6 h-6 border-2 border-[#2E5BFF]/20 border-t-[#2E5BFF] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="pt-14 md:pt-16 bg-[#FAFAF8] min-h-screen">
      {/* Header */}
      <div className="px-5 md:px-8 pt-8 pb-4">
        <div className="bg-[#1A1A1A] rounded-3xl px-8 md:px-14 py-14 md:py-20 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage:'linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)', backgroundSize:'80px 80px' }} />
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#2E5BFF] rounded-t-3xl" />
          <p className="text-[9px] font-black uppercase tracking-[0.6em] text-[#2E5BFF] mb-4">"THE APOTHECARY"</p>
          <h1 className="text-[3rem] md:text-[6rem] font-black tracking-[-0.04em] text-white leading-[0.92] mb-5">
            The<br />Collection<span style={{ color:'#2E5BFF' }}>.</span>
          </h1>
          <p className="text-sm text-white/45 font-medium max-w-sm leading-relaxed">
            Three flavors<span style={{color:'#2E5BFF'}}>.</span> One mission — make hydration something you actually look forward to every day<span style={{color:'#2E5BFF'}}>.</span>
          </p>
        </div>
      </div>

      {/* Products */}
      <div className="px-5 md:px-8 py-4 space-y-0">
        {displayProducts.map((sp, i) => (
          <ProductSection key={sp.id} sp={sp} index={i} onAddToCart={onAddToCart} />
        ))}
      </div>

      {/* Bundle CTA */}
      <div className="px-5 md:px-8 pb-16">
        <div className="bg-[#2E5BFF] rounded-3xl px-8 md:px-14 py-14 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage:'linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)', backgroundSize:'80px 80px' }} />
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.6em] text-white/40 mb-4">"BEST VALUE"</p>
              <h2 className="text-[2rem] md:text-[3.5rem] font-black tracking-[-0.04em] text-white leading-[0.95]">
                Try All Three<span className="text-white/30">.</span><br /><span className="text-white/20">The Full Ritual.</span>
              </h2>
              <p className="text-sm text-white/45 mt-4 max-w-xs leading-relaxed">One of each — the perfect way to discover your ritual.</p>
            </div>
            <button onClick={() => displayProducts.forEach(sp => { const p = toCartProduct(sp); onAddToCart(p, p.variants[0]); })}
              className="bg-white text-[#2E5BFF] px-10 py-4 text-xs font-black uppercase tracking-[0.4em] hover:bg-[#FAFAF8] transition-colors active:scale-[0.97] shrink-0 rounded-2xl">
              Add All Three
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;

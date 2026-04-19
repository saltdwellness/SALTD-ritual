// Home.tsx — mobile-first, smooth parallax, no orientation glitches
// Key mobile fixes applied throughout:
// 1. Parallax via requestAnimationFrame + direct DOM writes (no setState on scroll)
// 2. All parallax disabled on touch/mobile — CSS scroll only, no jank
// 3. EditorialPanels: auto-height on mobile, no vh-based minHeight overflow
// 4. Hover states properly ignored on touch devices
// 5. Hero image properly contained on mobile, no bleed
// 6. All text wraps cleanly at 320px+
// 7. prefers-reduced-motion respected
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FAQSection } from './FAQPage';
import { Product, ProductVariant } from '../types';
import {
  fetchAllProducts, fetchHomepageContent,
  ShopifyProductFull, HomepageContent, StatItem, ImpactPoint, RitualStep, TrustBadge, FallbackReview,
  setSEO, seoForPage, VARIANT_MAP,
} from '../shopify';

// ─── Types ──────────────────────────────────────────────────────
interface HomeProps { onAddToCart: (product: Product, variant: ProductVariant) => void; }

// ─── Constants ──────────────────────────────────────────────────
const COLOR: Record<string, string> = {
  'kala-khatta':     '#8A307F',
  'banta-lime-spark':'#7AB800',
  'peach-himalayan': '#E8845A',
};
const SHELF_BG: Record<string, string> = {
  '#8A307F':'linear-gradient(135deg,#f5eef8,#ede0f5)',
  '#7AB800':'linear-gradient(135deg,#f2fce4,#e8f9cc)',
  '#E8845A':'linear-gradient(135deg,#fdf0ea,#fbe3d4)',
};
const ACCENT = '#2E5BFF';

// ─── Helpers ─────────────────────────────────────────────────────
function toCartProduct(sp: ShopifyProductFull): Product {
  // flavorColor may come as plain string (normalised) or { value: string } (raw API) — handle both
  const rawColor = sp.flavorColor as unknown;
  const c: string = (rawColor && typeof rawColor === 'object' && 'value' in (rawColor as object))
    ? (rawColor as { value: string }).value
    : typeof rawColor === 'string' ? rawColor
    : COLOR[sp.handle] ?? ACCENT;
  // Image: prefer images array, fall back to featuredImage, then local mockup
  const imgUrl = sp.images.edges.length > 0
    ? sp.images.edges[0].node.url
    : sp.featuredImage?.url ?? '/mockups/Mockupv2-1.png';
  return {
    id: sp.handle, name: 'SALTD.',
    flavor: sp.title,  // always the Shopify product title
    color: c, bgColor: `bg-[${c}]`, textColor: `text-[${c}]`,
    description: sp.description,
    image: imgUrl,
    features: sp.features.length ? sp.features : ['6 Electrolytes','Ashwagandha','8 Vitamins','Zero Sugar'],
    variants: sp.variants.edges.map(({ node: v }) => ({
      size:           parseInt(v.title.match(/\((\d+)\)/)?.[1] ?? '10', 10),
      label:          v.title,
      price:          parseFloat(v.price.amount),
      compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice.amount) : undefined,
      isSubscription: v.title.toLowerCase().includes('subscription') || v.title.toLowerCase().includes('auto-ship'),
      shopifyId:      Object.entries(VARIANT_MAP).find(([, gid]) => gid === v.id)?.[0] ?? v.id,
    })),
  };
}

// Detect touch/mobile to fully disable parallax (no janky iOS scroll events)
const isTouchDevice = () =>
  typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

// Detect prefers-reduced-motion
const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─── Reveal on scroll ────────────────────────────────────────────
const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (prefersReducedMotion()) { el.style.opacity = '1'; el.style.transform = 'none'; return; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        io.disconnect();
      }
    }, { threshold: 0.06 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}
      style={{ opacity: 0, transform: 'translateY(24px)', transition: `opacity 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}s`, willChange: 'opacity,transform' }}>
      {children}
    </div>
  );
};

// ─── Welcome Modal ───────────────────────────────────────────────
const WelcomeModal: React.FC<{ content: HomepageContent | null }> = ({ content }) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    localStorage.removeItem('hc_seen');
    if (!sessionStorage.getItem('saltd_modal_shown')) {
      const t = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(t);
    }
  }, []);
  const close = () => { sessionStorage.setItem('saltd_modal_shown', '1'); setShow(false); };
  if (!show) return null;

  const headline = content?.modalHeadline ?? 'Welcome\nto\nHydration\n.Club';
  const body = content?.modalBody ?? 'High-performance hydration rituals for the modern palate.';

  return (
    <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-4"
      // Prevent body scroll while modal open
      style={{ touchAction: 'none' }}>
      <div className="absolute inset-0 bg-black/65 backdrop-blur-md" onClick={close}
        style={{ animation: 'mfade 0.35s ease forwards' }} />
      <div className="relative w-full max-w-[400px] bg-[#FAFAF8] z-10 rounded-3xl overflow-hidden shadow-2xl"
        style={{ animation: 'mslide 0.55s cubic-bezier(0.16,1,0.3,1) forwards', willChange: 'transform,opacity',
          // Cap height on short phones
          maxHeight: 'calc(100dvh - 32px)', overflowY: 'auto' }}>
        <div className="h-[3px] bg-[#2E5BFF]" />
        <div className="bg-[#1A1A1A] px-7 py-8">
          <p className="text-xs font-black uppercase tracking-[0.5em] text-white/40 mb-4">
            Hydration<span style={{ color: ACCENT }}>.</span>Club
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-white leading-[1.0] tracking-[-0.03em]">
            {headline.split('\n').map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </h2>
          <div className="mt-5 w-10 h-[2px] bg-[#2E5BFF]" />
        </div>
        <div className="px-7 py-6 space-y-4">
          <p className="text-base text-[#1A1A1A]/70 leading-relaxed">{body}</p>
          <div className="space-y-3">
            {[
              { n: '01', t: '6 electrolytes · 8 vitamins · zero sugar' },
              { n: '02', t: 'Nostalgic Indian flavors, reimagined' },
              { n: '03', t: 'One stick. One ritual. Every day.' },
            ].map(item => (
              <div key={item.n} className="flex items-start gap-3">
                <span className="text-sm font-black shrink-0 mt-0.5" style={{ color: ACCENT }}>{item.n}</span>
                <span className="text-sm font-semibold text-[#1A1A1A]/65 leading-snug">{item.t}</span>
              </div>
            ))}
          </div>
          <button onClick={close}
            className="w-full text-white py-5 text-sm font-black uppercase tracking-[0.35em] active:scale-[0.98] rounded-2xl mt-1 transition-opacity"
            style={{ background: ACCENT }}>
            Begin Ritual
          </button>
          <button onClick={close}
            className="w-full text-sm font-semibold text-[#1A1A1A]/45 py-1">
            Take me on a tour first →
          </button>
        </div>
      </div>
      <style>{`
        @keyframes mfade  { from{opacity:0} to{opacity:1} }
        @keyframes mslide { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:none} }
      `}</style>
    </div>
  );
};

// ─── Rotating Quote ──────────────────────────────────────────────
const RotatingQuote: React.FC<{ quotes: string[]; loaded: boolean }> = ({ quotes, loaded }) => {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);

  const allQuotes = React.useMemo(() => {
    try {
      const stored: Array<{ rating: number; text: string; flavor: string }> =
        JSON.parse(localStorage.getItem('saltd_reviews') || '[]');
      const good = stored.filter(r => r.rating >= 4 && r.text?.trim()).map(r => ({ text: r.text.trim(), author: r.flavor }));
      const base = quotes.map(q => ({ text: q, author: null as string | null }));
      return good.length ? [...good, ...base] : base;
    } catch { return quotes.map(q => ({ text: q, author: null as string | null })); }
  }, [quotes]);

  useEffect(() => {
    if (allQuotes.length <= 1) return;
    const t = setInterval(() => {
      setFade(false);
      setTimeout(() => { setIdx(i => (i + 1) % allQuotes.length); setFade(true); }, 400);
    }, 4500);
    return () => clearInterval(t);
  }, [allQuotes.length]);

  const q = allQuotes[idx] ?? allQuotes[0];
  return (
    <div className="border-l-[3px] pl-4 mb-7" style={{ borderColor: ACCENT, opacity: loaded ? 1 : 0, transform: loaded ? 'none' : 'translateY(12px)', transition: 'all 1s ease 0.45s' }}>
      <div style={{ opacity: fade ? 1 : 0, transition: 'opacity 0.4s ease' }}>
        {/* Clamp text to avoid overflow on tiny screens */}
        <p className="text-base text-[#1A1A1A]/70 font-medium leading-relaxed" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          "{q.text}"
        </p>

      </div>
    </div>
  );
};

// ─── Hero Marquee ─────────────────────────────────────────────────
// Infinite horizontal scrolling banner strip at the bottom of the hero.
// Uses 4 PNG banners (FEELING LOW + 3 colorways of SALTD. HYDRATE MORE).
// Drop these files into /public/banners/ at the paths below.
// Pure CSS animation, duplicated track for seamless loop, pause on hover,
// respects prefers-reduced-motion.
const HERO_BANNERS = [
  '/banners/feeling-low.png',
  '/banners/saltd-green.png',
  '/banners/saltd-orange.png',
  '/banners/saltd-purple.png',
];

const HeroMarquee: React.FC = () => (
  <div className="hero-marquee" aria-hidden>
    <div className="hero-marquee__track">
      {/* two sets for a seamless loop */}
      {[0, 1].map(set => (
        <React.Fragment key={set}>
          {HERO_BANNERS.map((src, i) => (
            <img
              key={`${set}-${i}`}
              src={src}
              alt=""
              className="hero-marquee__banner"
              loading="lazy"
              draggable={false}
            />
          ))}
        </React.Fragment>
      ))}
    </div>
  </div>
);

// ─── Hero ─────────────────────────────────────────────────────────
// Video background hero — autoplay looping video (muted, no controls).
// Mobile: video scales to cover, text overlaid with strong gradient.
// Desktop: video covers full section, parallax-free (video handles motion).
// Falls back gracefully if video fails to load (static bg color shows through).
const Hero: React.FC<{ content: HomepageContent; firstProduct: ShopifyProductFull | null }> = ({ content, firstProduct }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  const accent = firstProduct?.flavorColor ?? '#8A307F';
  const lines  = content.heroHeadline.split('\n').filter(Boolean);
  const [coords, city] = (content.heroLocationTag || '28.6139 N · New Delhi').split('·').map(s => s.trim());

  return (
    <section className="relative overflow-hidden"
      style={{ height: '100svh', minHeight: 560, background: '#0D0D0D' }}>

      {/* Subtle grid */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)', backgroundSize: '80px 80px' }} />

      {/* ── Content ── */}
      <div className="relative z-10 h-full flex flex-col justify-center px-5 sm:px-8 md:px-14 max-w-[1440px] mx-auto"
        style={{ paddingTop: 180 }}>
        <div className="w-full md:w-[54%]">

          {/* Label */}
          <div className="flex items-center gap-3 mb-5"
            style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'none' : 'translateX(-14px)', transition: 'all 0.9s ease 0.1s' }}>
            <div className="w-5 h-[2px] rounded-full" style={{ background: ACCENT }} />
            <span className="text-xs font-black uppercase tracking-[0.45em] text-white/60">c/o Hydration</span>
          </div>

          {/* Headline */}
          <h1 className="font-black tracking-[-0.04em] leading-[0.92] text-white mb-6"
            style={{ fontSize: 'clamp(2.5rem, 7.5vw, 6.8rem)', opacity: loaded ? 1 : 0, transform: loaded ? 'none' : 'translateY(22px)', transition: 'all 1s cubic-bezier(0.16,1,0.3,1) 0.2s' }}>
            {lines.map((line, i) => (
              <span key={i}>
                {i > 0 && i < lines.length - 1 ? <span style={{ color: ACCENT }}>{line}</span> : line}
                {i < lines.length - 1 && <br />}
              </span>
            ))}
          </h1>

          {/* Quote */}
          <div className="border-l-[3px] pl-4 mb-7"
            style={{ borderColor: ACCENT, opacity: loaded ? 1 : 0, transform: loaded ? 'none' : 'translateY(12px)', transition: 'all 1s ease 0.45s' }}>
            <p className="text-base font-medium leading-relaxed text-white/65">
              "{content.heroQuote || 'Finally a hydration drink that actually tastes like something — not a lab experiment.'}"
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 mb-8"
            style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'none' : 'translateY(14px)', transition: 'all 1s ease 0.6s' }}>
            <Link to="/shop"
              className="text-white px-7 py-4 text-sm font-black uppercase tracking-[0.35em] rounded-2xl active:scale-[0.97] transition-opacity"
              style={{ background: ACCENT }}>
              Shop Now
            </Link>
            <Link to="/ingredients"
              className="text-sm font-black uppercase tracking-[0.3em] text-white/50 flex items-center gap-2">
              Why SALTD. <span style={{ color: ACCENT }}>→</span>
            </Link>
          </div>

          {/* Location — desktop only */}
          <div className="hidden md:flex items-center gap-2"
            style={{ opacity: loaded ? 0.5 : 0, transition: 'opacity 1.2s ease 0.85s' }}>
            <span className="text-xs font-black uppercase tracking-[0.4em] text-white/40">{coords}</span>
            <span className="font-black" style={{ color: ACCENT }}>·</span>
            <span className="text-xs font-black uppercase tracking-[0.4em]" style={{ color: ACCENT }}>{city}</span>
          </div>
        </div>
      </div>

      {/* Rotating banner marquee — pinned just below navbar at top of hero */}
      <HeroMarquee />

      {/* Scroll indicator — mobile only, bottom center */}
      <div className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 opacity-40 z-20" aria-hidden>
        <div className="w-px h-9 bg-white/20 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1/2" style={{ background: ACCENT, animation: 'sd 1.8s ease infinite' }} />
        </div>
      </div>

      <style>{`
        @keyframes sd { 0%{transform:translateY(-100%)} 100%{transform:translateY(200%)} }

        /* ─── Hero marquee ─── */
        .hero-marquee {
          position: absolute;
          left: 0;
          right: 0;
          top: 72px;
          z-index: 15;
          padding: 18px 0;
          overflow: hidden;
          transform: rotate(-2deg);
          margin: 0 -3vw;
          pointer-events: auto;
          /* soft fade at both edges */
          -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%);
                  mask-image: linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%);
        }
        .hero-marquee__track {
          display: flex;
          gap: 18px;
          width: max-content;
          animation: hero-marquee-scroll 38s linear infinite;
          will-change: transform;
        }
        .hero-marquee:hover .hero-marquee__track { animation-play-state: paused; }
        .hero-marquee__banner {
          flex: 0 0 auto;
          height: clamp(64px, 8vw, 110px);
          width: auto;
          display: block;
          border-radius: 4px;
          user-select: none;
          -webkit-user-drag: none;
        }
        @keyframes hero-marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-marquee__track { animation: none; }
        }
      `}</style>
    </section>
  );
};

// ─── Stats Bar ───────────────────────────────────────────────────
// Stat icons — inline SVGs matched to each stat
const STAT_ICONS: Record<string, React.ReactNode> = {
  'Electrolytes': (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="14" stroke="white" strokeWidth="1.5" opacity="0.3"/>
      <path d="M16 6 L19 13 L26 13 L20.5 17.5 L22.5 25 L16 20.5 L9.5 25 L11.5 17.5 L6 13 L13 13 Z" fill="white" opacity="0.85"/>
    </svg>
  ),
  'Vitamins': (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <rect x="9" y="4" width="6" height="24" rx="3" fill="white" opacity="0.25"/>
      <rect x="4" y="13" width="24" height="6" rx="3" fill="white" opacity="0.85"/>
      <rect x="9" y="4" width="6" height="11" rx="3" fill="white" opacity="0.85"/>
    </svg>
  ),
  'Sugar': (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="11" stroke="white" strokeWidth="1.8" opacity="0.85"/>
      <line x1="8" y1="24" x2="24" y2="8" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.85"/>
    </svg>
  ),
  'Flavors': (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <path d="M16 4 C10 4 5 9 5 15 C5 21 9 26 16 28 C23 26 27 21 27 15 C27 9 22 4 16 4Z" fill="white" opacity="0.2"/>
      <path d="M16 8 C12 8 8 12 8 16 C8 20 11 23 16 25 C21 23 24 20 24 16 C24 12 20 8 16 8Z" fill="white" opacity="0.5"/>
      <circle cx="16" cy="16" r="4" fill="white" opacity="0.9"/>
    </svg>
  ),
  'Ashwagandha': (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <path d="M16 28 C16 28 8 22 8 15 C8 10 11 6 16 6 C21 6 24 10 24 15 C24 22 16 28 16 28Z" fill="white" opacity="0.18"/>
      <path d="M16 28 C16 28 8 22 8 15 C8 10 11 6 16 6 C21 6 24 10 24 15 C24 22 16 28 16 28Z" stroke="white" strokeWidth="1.6"/>
      <path d="M16 6 L16 28" stroke="white" strokeWidth="1.4" strokeDasharray="2 2" opacity="0.5"/>
      <path d="M10 13 C12 11 14 13 16 12 C18 11 20 13 22 12" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.7"/>
    </svg>
  ),
};

const getStatIcon = (label: string): React.ReactNode => {
  const key = Object.keys(STAT_ICONS).find(k => label.toLowerCase().includes(k.toLowerCase()));
  return key ? STAT_ICONS[key] : null;
};

const StatsBar: React.FC<{ stats: StatItem[] }> = ({ stats }) => (
  <section className="bg-[#1A1A1A] py-8 md:py-16 px-5 md:px-12">
    <div className="max-w-[1440px] mx-auto grid grid-cols-2 md:grid-cols-4">
      {stats.map((x, i) => (
        <Reveal key={x.label} delay={i * 0.06}>
          <div className={`flex flex-col px-4 py-5 ${i < 3 ? 'md:border-r border-white/[0.07]' : ''} ${i < 2 ? 'border-b md:border-b-0 border-white/[0.07]' : ''}`}>
            <div className="mb-3 opacity-90">{getStatIcon(x.label)}</div>
            <span className="text-[2.8rem] md:text-[4rem] font-black text-white tracking-[-0.04em] leading-none">{x.number}</span>
            <span className="text-sm md:text-base font-black uppercase tracking-[0.28em] mt-3 text-white">{x.label}</span>
            <span className="text-sm md:text-base text-white font-medium mt-1">{x.subtitle}</span>
          </div>
        </Reveal>
      ))}
    </div>
  </section>
);

// ─── Editorial Panels ─────────────────────────────────────────────
// BMW M-style: full-bleed image background, text overlaid.
// Mobile: image is a static background, no parallax, auto height so text never clips.
// Desktop: rAF-based parallax on the image div, no setState, 60fps smooth.
interface EditorialPanel { handle: string; label: string; tagline: string; description: string; color: string; img: string; }

const PANEL_FALLBACKS: EditorialPanel[] = [
  { handle: 'kala-khatta',     label: 'Kala Khatta',     color: '#8A307F', img: '/mockups/Mockupv2-1.png', tagline: 'The flavour of Indian summers.\nNow doing something serious.', description: 'Black plum & tamarind. Bold, tart, loaded with 6 minerals, 8 vitamins, zero sugar.' },
  { handle: 'banta-lime-spark',label: 'Banta Lime Spark',color: '#7AB800', img: '/mockups/MockupV2-2.png', tagline: 'Marine Lines in a stick.\nElectric, sharp, alive.',             description: 'The marble-stopper soda you grew up with — reimagined as a clean morning ritual.' },
  { handle: 'peach-himalayan', label: 'Peach Himalayan', color: '#E8845A', img: '/mockups/Mockupv2-1.png', tagline: 'Soft, warm, grounded.\nThe evening ritual.',                    description: 'Elevated magnesium for recovery and sleep. The ritual that ends every good day.' },
];

const SingleEditorialPanel: React.FC<{ panel: EditorialPanel; index: number }> = ({ panel, index }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imgRef     = useRef<HTMLDivElement>(null);
  const [visible,  setVisible] = useState(false);
  const isEven = index % 2 === 0;

  // Entrance animation
  useEffect(() => {
    const el = sectionRef.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.08 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Desktop-only smooth parallax — direct DOM write, no re-renders
  useEffect(() => {
    if (isTouchDevice() || prefersReducedMotion()) return;
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const el = sectionRef.current; const img = imgRef.current;
          if (!el || !img) { ticking = false; return; }
          const rect = el.getBoundingClientRect();
          const vh   = window.innerHeight;
          // progress: 0 when bottom of section at bottom of viewport → 1 when top at top
          const prog = Math.min(Math.max(1 - rect.bottom / (vh + rect.height), 0), 1);
          img.style.transform = `translateY(${prog * -55}px) scale(1.04)`;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const taglines = panel.tagline.split('\n');

  return (
    <div ref={sectionRef} className="relative overflow-hidden" style={{ background: '#FAFAF8' }}>
      {/* ── Background image ── */}
      {/* Desktop: contained in a div that gets parallax transform */}
      {/* Mobile: static, slightly dimmed, no transform */}
      <div ref={imgRef}
        className="absolute inset-0"
        style={{ willChange: 'transform', transform: 'translateY(0) scale(1.04)' }}>
        <img
          src={panel.img} alt="" aria-hidden
          className="w-full h-full object-cover object-center"
          style={{
            // On mobile opacity is lower so text is always readable without needing huge overlay
            opacity: visible ? 0.38 : 0.05,
            filter: `saturate(0.85) brightness(0.92)`,
            transition: 'opacity 1.1s cubic-bezier(0.16,1,0.3,1)',
          }}
        />
      </div>

      {/* ── Gradient overlays for text readability ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden style={{
        background: isEven
          ? `linear-gradient(to right, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.55) 38%, rgba(255,255,255,0.08) 62%, transparent 100%)`
          : `linear-gradient(to left,  rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.55) 38%, rgba(255,255,255,0.08) 62%, transparent 100%)`,
      }} />
      {/* Mobile: extra full overlay */}
      <div className="md:hidden absolute inset-0 pointer-events-none" aria-hidden
        style={{ background: 'rgba(255,255,255,0.08)' }} />
      {/* Bottom blend */}
      <div className="absolute bottom-0 inset-x-0 h-24 pointer-events-none" aria-hidden
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.30))' }} />

      {/* Accent top line */}
      <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: `linear-gradient(to right, ${panel.color}, transparent)`, opacity: 0.6 }} />

      {/* ── Content ──
           Mobile: centered, full-width, generous vertical padding
           Desktop: left or right aligned per isEven, max 560px wide  */}
      <div className={`relative z-10 max-w-[1440px] mx-auto px-5 sm:px-8 md:px-16 py-12 md:py-24 flex ${isEven ? 'md:justify-start' : 'md:justify-end'} justify-start`}>
        <div className="w-full md:max-w-[540px]"
          style={{
            opacity:    visible ? 1 : 0,
            transform:  visible ? 'none' : 'translateY(36px)',
            transition: `opacity 1s cubic-bezier(0.16,1,0.3,1), transform 1s cubic-bezier(0.16,1,0.3,1)`,
          }}>

          {/* Index + label */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-7 h-[2px] rounded-full" style={{ background: panel.color }} />
            <span className="text-xs font-black uppercase tracking-[0.45em]" style={{ color: panel.color }}>
              {String(index + 1).padStart(2, '0')} — "{panel.label}"
            </span>
          </div>

          {/* Big tagline */}
          <h2 className="font-black tracking-[-0.03em] leading-[0.93] text-[#1A1A1A] mb-5"
            style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)' }}>
            {taglines.map((line, i) => (
              <span key={i}>{line}{i < taglines.length - 1 && <br />}</span>
            ))}
          </h2>

          {/* Description */}
          <p className="text-base text-[#1A1A1A]/65 font-medium leading-relaxed mb-8">
            {panel.description}
          </p>

          {/* Feature chips */}
          <div className="flex flex-wrap gap-2 mb-9">
            {['6 Electrolytes', '8 Vitamins', 'Zero Sugar', 'Ashwagandha'].map(f => (
              <span key={f} className="text-xs font-black uppercase tracking-wide px-3 py-1.5 rounded-full border"
                style={{ borderColor: `${panel.color}50`, color: panel.color, background: `${panel.color}14` }}>
                {f}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4">
            <Link to={`/product/${panel.handle}`}
              className="flex items-center gap-2 px-7 py-4 rounded-2xl font-black text-sm uppercase tracking-[0.4em] text-white active:scale-[0.97] transition-opacity"
              style={{ background: panel.color }}>
              Explore <span>→</span>
            </Link>
            <Link to="/shop" className="text-sm font-black uppercase tracking-[0.3em] text-[#1A1A1A]/40">
              All Flavors
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative corner tag — desktop only */}
      <div className={`hidden md:flex absolute bottom-7 ${isEven ? 'right-12' : 'left-12'} items-center gap-3 opacity-25`} aria-hidden>
        <span className="text-xs font-black uppercase tracking-[0.5em] text-[#1A1A1A]">SALTD.</span>
        <div className="w-5 h-px bg-white/40" />
        <span className="text-xs font-black uppercase tracking-[0.5em]" style={{ color: panel.color }}>
          Hydration<span style={{ color: ACCENT }}>.</span>Club
        </span>
      </div>
    </div>
  );
};

const FlavorEditorialPanels: React.FC<{ products: ShopifyProductFull[] }> = ({ products }) => {
  const panels: EditorialPanel[] = products.length > 0
    ? products.map((sp, i) => ({
        handle:      sp.handle,
        label:       sp.title,
        tagline:     PANEL_FALLBACKS[i]?.tagline ?? sp.description,
        description: sp.description ?? PANEL_FALLBACKS[i]?.description ?? '',
        color:       sp.flavorColor ?? COLOR[sp.handle] ?? ACCENT,
        img:         sp.images.edges.length > 0
          ? sp.images.edges[0].node.url
          : sp.featuredImage?.url ?? PANEL_FALLBACKS[i]?.img ?? '/mockups/Mockupv2-1.png',
      }))
    : PANEL_FALLBACKS;
  return (
    <section>
      {/* ── Flavours intro header ── */}
      <div className="bg-[#FAFAF8] px-5 md:px-12 pt-12 pb-6 md:pt-20 md:pb-10">
        <div className="max-w-[1440px] mx-auto">
          <Reveal>
            <p className="text-xs font-black uppercase tracking-[0.6em] mb-4" style={{ color: ACCENT }}>
              — The Collection
            </p>
            <h2
              className="font-black tracking-[-0.04em] text-[#1A1A1A] leading-[0.93]"
              style={{ fontSize: 'clamp(2.4rem, 6vw, 5rem)' }}
            >
              Three Flavours.
              <br />
              <span style={{ color: 'rgba(26,26,26,0.14)' }}>One Ritual.</span>
            </h2>
            <p className="mt-5 text-base md:text-lg font-medium leading-relaxed max-w-lg" style={{ color: 'rgba(26,26,26,0.50)' }}>
              Each one built on a flavour you already know — and formulated to do something serious.
            </p>
          </Reveal>
        </div>
      </div>
      {panels.map((p, i) => <SingleEditorialPanel key={p.handle} panel={p} index={i} />)}
    </section>
  );
};

// ─── Impact Statement ─────────────────────────────────────────────
const ImpactStatement: React.FC<{ content: HomepageContent }> = ({ content }) => (
  <section className="bg-[#1A1A1A] py-12 md:py-24 px-5 md:px-12 overflow-hidden">
    <div className="max-w-[1440px] mx-auto">
      <Reveal>
        <p className="text-sm font-black uppercase tracking-[0.6em] mb-7" style={{ color: ACCENT }}>{content.impactSectionLabel || 'The Foundation'}</p>
      </Reveal>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-14 md:gap-24 items-start">
        <Reveal>
          <h2 className="font-black tracking-[-0.04em] text-white leading-[0.93]"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 4.8rem)' }}>
            {content.impactHeadline.split(' ').slice(0,-2).join(' ')}<br />
            <span style={{ color: ACCENT }}>{content.impactHeadline.split(' ').slice(-2,-1)[0]}</span>{' '}
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>{content.impactHeadline.split(' ').slice(-1)[0]}</span>
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <div className="space-y-7 pt-1 md:pt-5">
            {content.impactPoints.map(item => (
              <div key={item.n} className="flex gap-4 pb-5 border-b last:border-0 last:pb-0" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                <span className="text-sm font-black uppercase tracking-[0.4em] mt-1 shrink-0 w-6" style={{ color: ACCENT }}>{item.n}</span>
                <div>
                  <h3 className="text-xl font-black text-white mb-2">{item.title}</h3>
                  <p className="text-base font-medium leading-relaxed" style={{ color: 'rgba(255,255,255,0.60)' }}>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);

// ─── Product Shelf ────────────────────────────────────────────────
const FALLBACK_FLAVORS = [
  { handle: 'kala-khatta',     label: 'Kala Khatta',     color: '#8A307F', img: '/mockups/Mockupv2-1.png', desc: 'Black plum & tamarind. Bold, tart, loaded with the full electrolyte stack.' },
  { handle: 'banta-lime-spark',label: 'Banta Lime Spark',color: '#7AB800', img: '/mockups/MockupV2-2.png', desc: 'The marble-stopper soda you grew up with — reimagined as a clean hydration ritual.' },
  { handle: 'peach-himalayan', label: 'Peach Himalayan', color: '#E8845A', img: '/mockups/Mockupv2-1.png', desc: 'Soft, warm, grounded. Elevated magnesium for recovery and sleep.' },
];

const ProductShelf: React.FC<{ products: ShopifyProductFull[]; onAddToCart: (p: Product, v: ProductVariant) => void; content: HomepageContent }> = ({ products, onAddToCart, content }) => {
  const [added, setAdded] = useState<number | null>(null);

  const handleAdd = useCallback((idx: number, sp: ShopifyProductFull) => {
    const p = toCartProduct(sp);
    onAddToCart(p, p.variants[0]);
    setAdded(idx); setTimeout(() => setAdded(null), 1800);
  }, [onAddToCart]);

  return (
    <section className="py-10 md:py-20 bg-[#FAFAF8]">
      <div className="px-5 md:px-12 mb-7 md:mb-12 max-w-[1440px] mx-auto">
        <Reveal>
          <p className="text-sm font-black uppercase tracking-[0.6em] mb-3" style={{ color: ACCENT }}>01 — "STANDARD SERIES"</p>
          <h2 className="font-black tracking-[-0.04em] text-[#1A1A1A] leading-[0.95] mb-3"
            style={{ fontSize: 'clamp(2rem, 5vw, 4.2rem)' }}>
            {content.shopSectionHeadline || 'Our Flavours.'}
          </h2>
          <p className="text-base md:text-lg font-semibold leading-relaxed max-w-xl" style={{ color: 'rgba(26,26,26,0.55)' }}>
            {content.shopSectionSubtext || 'Three distinctly Indian flavours. Each one carries a complete electrolyte stack, zero sugar, and a taste that feels familiar — only better.'}
          </p>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 px-5 md:px-12 max-w-[1440px] mx-auto">
        {(products.length > 0 ? products : null)?.map((sp, i) => {
          const p    = toCartProduct(sp);
          const rawCol = sp.flavorColor as unknown;
          const col: string = (rawCol && typeof rawCol === 'object' && 'value' in (rawCol as object))
            ? (rawCol as { value: string }).value
            : typeof rawCol === 'string' ? rawCol
            : COLOR[sp.handle] ?? ACCENT;
          const bg   = SHELF_BG[col]  ?? 'linear-gradient(135deg,#f5f5f5,#ebebeb)';
          const img  = sp.images.edges.length > 0
            ? sp.images.edges[0].node.url
            : sp.featuredImage?.url ?? FALLBACK_FLAVORS[i]?.img ?? '/mockups/Mockupv2-1.png';
          const v    = sp.variants.edges[0]?.node;
          const px   = v ? parseFloat(v.price.amount) : 0;
          const cmp  = v?.compareAtPrice ? parseFloat(v.compareAtPrice.amount) : null;
          return (
            <Reveal key={sp.id} delay={i * 0.07}>
              <div className="rounded-3xl overflow-hidden flex flex-col" style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.07)' }}>
                <div className="relative overflow-hidden" style={{ background: bg, height: 240 }}>
                  <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-2 z-10">
                    {p.features.slice(0, 2).map(f => (
                      <span key={f} className="text-xs font-black uppercase tracking-wide px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.9)', color: col }}>{f}</span>
                    ))}
                  </div>
                  <img src={img} alt={sp.title} className="w-full h-full object-contain"
                    style={{ filter: `drop-shadow(0 20px 44px ${col}35)` }} />
                </div>
                <div className="bg-white px-4 py-4 flex flex-col gap-3 flex-1">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.5em] mb-1" style={{ color: 'rgba(26,26,26,0.35)' }}>SALTD.</p>
                    <h3 className="text-xl font-black text-[#1A1A1A] tracking-[-0.02em] mb-2">"{p.flavor}"</h3>
                    <p className="text-sm font-medium leading-relaxed line-clamp-2" style={{ color: 'rgba(26,26,26,0.58)' }}>{sp.description}</p>
                  </div>
                  <div className="flex items-baseline gap-2 mt-auto">
                    <span className="text-2xl font-black text-[#1A1A1A] tracking-tight">₹{px.toFixed(0)}</span>
                    {cmp && cmp > px && <span className="text-base line-through font-medium" style={{ color: 'rgba(26,26,26,0.35)' }}>₹{cmp.toFixed(0)}</span>}
                    <span className="text-xs font-bold uppercase tracking-widest ml-1" style={{ color: 'rgba(26,26,26,0.35)' }}>/ pack</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleAdd(i, sp)}
                      className="flex-1 py-4 text-sm font-black uppercase tracking-[0.4em] rounded-2xl text-white active:scale-[0.97] transition-all"
                      style={{ background: added === i ? '#1A1A1A' : col }}>
                      {added === i ? '✓ Added' : 'Add to Bag'}
                    </button>
                    <Link to={`/product/${sp.handle}`}
                      className="flex-1 py-4 text-sm font-black uppercase tracking-[0.4em] rounded-2xl border-2 text-center active:scale-[0.97] transition-all font-black"
                      style={{ borderColor: col, color: col }}>
                      View →
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        }) ?? FALLBACK_FLAVORS.map((f, i) => (
          <Reveal key={f.handle} delay={i * 0.07}>
            <div className="rounded-3xl overflow-hidden flex flex-col" style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.07)' }}>
              <div className="relative overflow-hidden" style={{ background: SHELF_BG[f.color] ?? 'linear-gradient(135deg,#f5f5f5,#ebebeb)', height: 280 }}>
                <img src={f.img} alt={f.label} className="w-full h-full object-contain"
                  style={{ filter: `drop-shadow(0 20px 44px ${f.color}35)` }} />
              </div>
              <div className="bg-white px-4 py-4 flex flex-col gap-3 flex-1">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.5em] mb-1" style={{ color: 'rgba(26,26,26,0.35)' }}>SALTD.</p>
                  <h3 className="text-xl font-black text-[#1A1A1A] tracking-[-0.02em] mb-2">"{f.label}"</h3>
                  <p className="text-sm font-medium leading-relaxed" style={{ color: 'rgba(26,26,26,0.58)' }}>{f.desc}</p>
                </div>
                <div className="flex gap-2 mt-auto">
                  <Link to={`/product/${f.handle}`} className="flex-1 py-4 text-sm font-black uppercase tracking-[0.4em] rounded-2xl text-white text-center active:scale-[0.97]"
                    style={{ background: f.color }}>Buy Now →</Link>
                  <Link to={`/product/${f.handle}`}
                    className="flex-1 py-4 text-sm font-black uppercase tracking-[0.4em] rounded-2xl border-2 text-center active:scale-[0.97]"
                    style={{ borderColor: f.color, color: f.color }}>
                    View →
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

// ─── How It Works ─────────────────────────────────────────────────
const HomeFAQSection: React.FC = () => (
  <section className="py-12 md:py-24 bg-white">
    <div className="max-w-[900px] mx-auto px-5 md:px-12">
      <div className="text-center mb-7">
        <p className="text-xs font-black uppercase tracking-[0.5em] mb-4" style={{ color: ACCENT }}>"Answers"</p>
        <h2
          className="font-black text-[#0D0D10] leading-[1.0] tracking-[-0.04em] mb-4"
          style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}
        >
          Hydration &amp; Electrolyte FAQ
        </h2>
        <p className="text-base text-[#1A1A1A]/55 font-medium max-w-[500px] mx-auto leading-relaxed">
          Everything you need to know about electrolytes and daily hydration.
        </p>
      </div>
      <FAQSection compact maxQuestions={6} />
      <div className="text-center mt-10">
        <Link
          to="/faq"
          className="inline-block px-8 py-4 text-sm font-black uppercase tracking-[0.3em] rounded-full border-2 border-[#0D0D10]/20 text-[#0D0D10]/60 hover:border-[#0D0D10]/50 hover:text-[#0D0D10] transition-all"
        >
          View All FAQs →
        </Link>
      </div>
    </div>
  </section>
);


const RITUAL_ICONS = [
  // Tear & Pour — stick with water droplets
  <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
    <rect x="20" y="2" width="8" height="28" rx="4" fill="white" opacity="0.15"/>
    <rect x="20" y="2" width="8" height="28" rx="4" stroke="white" strokeWidth="1.8"/>
    <path d="M24 34 C24 34 18 41 18 44 C18 47 20.7 48 24 48 C27.3 48 30 47 30 44 C30 41 24 34 24 34Z" fill="white" opacity="0.7"/>
    <circle cx="12" cy="38" r="3" fill="white" opacity="0.35"/>
    <circle cx="36" cy="42" r="2" fill="white" opacity="0.25"/>
  </svg>,
  // Stir — glass with swirl
  <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
    <rect x="10" y="12" width="28" height="32" rx="4" stroke="white" strokeWidth="1.8" fill="white" opacity="0.08"/>
    <path d="M18 28 C20 24 28 24 30 28 C32 32 20 32 22 28" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8"/>
    <rect x="22" y="2" width="4" height="14" rx="2" fill="white" opacity="0.6"/>
    <path d="M10 18 L38 18" stroke="white" strokeWidth="1" opacity="0.3"/>
  </svg>,
  // Drink & Track — checkmark streak
  <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="20" stroke="white" strokeWidth="1.8" opacity="0.2"/>
    <path d="M14 24 L21 31 L34 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="38" cy="10" r="5" fill="white" opacity="0.85"/>
    <path d="M35.5 10 L37.5 12 L41 8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>,
];

const HowItWorks: React.FC<{ content: HomepageContent }> = ({ content }) => (
  <section className="py-10 md:py-16 px-5 md:px-12 bg-[#FAFAF8]">
    <div className="max-w-[1440px] mx-auto">
      <Reveal>
        <p className="text-xs font-black uppercase tracking-[0.5em] mb-6" style={{ color: ACCENT }}>{content.ritualSectionLabel || '02 — "THE RITUAL"'}</p>
      </Reveal>
      <div className="grid grid-cols-3 gap-3 md:gap-5">
        {content.ritualSteps.map((s, i) => (
          <Reveal key={s.n} delay={i * 0.07}>
            <div className="flex flex-col gap-3 p-4 md:p-5 rounded-2xl border border-[#1A1A1A]/[0.07] bg-white">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${ACCENT}0D` }}>
                {RITUAL_ICONS[i]}
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.4em] mb-1" style={{ color: ACCENT }}>{s.n}</p>
                <h3 className="text-sm md:text-base font-black text-[#1A1A1A] mb-1">{s.title}</h3>
                <p className="text-xs font-medium leading-relaxed hidden md:block" style={{ color: 'rgba(26,26,26,0.55)' }}>{s.desc}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

// ─── Reviews Section ──────────────────────────────────────────────
interface Review { orderId: string; orderName: string; rating: number; text: string; flavor: string; date: string; }

const ReviewsSection: React.FC<{ products: ShopifyProductFull[]; content: HomepageContent | null }> = ({ products, content }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    try {
      const s: Review[] = JSON.parse(localStorage.getItem('saltd_reviews') || '[]');
      setReviews(s.filter(r => r.rating >= 4 && r.text?.trim()));
    } catch { setReviews([]); }
  }, []);

  const fallback = content?.fallbackReviews ?? [];
  const display = reviews.length >= 2
    ? reviews.slice(0, 6).map(r => {
        const sp = products.find(p => p.title.toLowerCase().includes(r.flavor.toLowerCase()));
        return { name: 'Verified Customer', age: undefined as number | undefined, role: r.flavor, rating: r.rating, text: r.text, flavor: r.flavor, accent: (sp?.flavorColor as string) ?? ACCENT };
      })
    : fallback.map(r => ({ ...r, age: r.age as number | undefined }));

  const total = display.length;
  // On desktop show 2, on mobile 1
  const visibleDesktop = 2;

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIdx(prev => (prev + 1) % total);
    }, 3200);
  };

  useEffect(() => {
    if (total > 0) startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [total]);

  const goTo = (i: number) => { setIdx(i); startTimer(); };
  const prev = () => { goTo((idx - 1 + total) % total); };
  const next = () => { goTo((idx + 1) % total); };

  const getCard = (i: number) => display[((i % total) + total) % total];

  if (total === 0) return null;

  return (
    <section className="py-12 md:py-24 bg-[#F4F4F2] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-5 md:px-12">
        <Reveal>
          <p className="text-sm font-black uppercase tracking-[0.6em] mb-4" style={{ color: ACCENT }}>03 — "REAL RESULTS"</p>
          <div className="flex flex-wrap items-end justify-between gap-3 mb-8">
            <h2 className="font-black tracking-[-0.04em] text-[#1A1A1A] leading-[0.95]"
              style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
              {(content?.reviewsHeadline || 'What people').split('\n')[0]}<br /><span style={{ color: 'rgba(26,26,26,0.16)' }}>{(content?.reviewsHeadline || 'What people\nare saying.').split('\n')[1] || 'are saying.'}</span>
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <span key={s} className="text-xl leading-none" style={{ color: ACCENT }}>★</span>)}</div>
                <span className="text-sm font-black text-[#1A1A1A]/45 ml-2">5.0 avg</span>
              </div>
              {/* Nav arrows */}
              <div className="flex gap-2">
                <button onClick={prev} className="w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                  style={{ borderColor: ACCENT, color: ACCENT }}>‹</button>
                <button onClick={next} className="w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                  style={{ borderColor: ACCENT, color: ACCENT }}>›</button>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Carousel track */}
        <div className="relative">
          {/* Mobile: single card */}
          <div className="md:hidden">
            <div className="rounded-2xl p-5 flex flex-col gap-4 transition-all duration-500" style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.07)' }}>
              {(() => { const r = getCard(idx); return (
                <>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <span key={s} className="text-xl leading-none" style={{ color: s <= r.rating ? r.accent : 'rgba(0,0,0,0.08)' }}>★</span>)}</div>
                    <span className="text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full" style={{ background: `${r.accent}28`, color: r.accent }}>{r.flavor}</span>
                  </div>
                  <p className="text-base text-[#1A1A1A]/80 font-medium leading-relaxed flex-1">"{r.text}"</p>
                  <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0" style={{ background: r.accent }}>{r.name.charAt(0)}</div>
                    <div>
                      <p className="text-sm font-black text-[#1A1A1A]">{r.name}{r.age ? `, ${r.age}` : ''}</p>
                      <p className="text-xs font-medium mt-0.5" style={{ color: 'rgba(26,26,26,0.55)' }}>{r.role}</p>
                    </div>
                    <div className="ml-auto w-4 h-[2px] rounded-full" style={{ background: r.accent }} />
                  </div>
                </>
              ); })()}
            </div>
          </div>

          {/* Desktop: 2 cards side by side */}
          <div className="hidden md:grid grid-cols-2 gap-5">
            {[0, 1].map(offset => {
              const r = getCard(idx + offset);
              return (
                <div key={offset} className="rounded-2xl p-5 flex flex-col gap-4 transition-all duration-500" style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.07)' }}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <span key={s} className="text-xl leading-none" style={{ color: s <= r.rating ? r.accent : 'rgba(0,0,0,0.08)' }}>★</span>)}</div>
                    <span className="text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full" style={{ background: `${r.accent}28`, color: r.accent }}>{r.flavor}</span>
                  </div>
                  <p className="text-base text-[#1A1A1A]/80 font-medium leading-relaxed flex-1">"{r.text}"</p>
                  <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0" style={{ background: r.accent }}>{r.name.charAt(0)}</div>
                    <div>
                      <p className="text-sm font-black text-[#1A1A1A]">{r.name}{r.age ? `, ${r.age}` : ''}</p>
                      <p className="text-xs font-medium mt-0.5" style={{ color: 'rgba(26,26,26,0.55)' }}>{r.role}</p>
                    </div>
                    <div className="ml-auto w-4 h-[2px] rounded-full" style={{ background: r.accent }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {display.map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                className="rounded-full transition-all duration-300"
                style={{ width: i === idx ? 20 : 8, height: 8, background: i === idx ? ACCENT : 'rgba(26,26,26,0.15)' }} />
            ))}
          </div>
        </div>

        <Reveal delay={0.15}>
          <div className="mt-8 text-center">
            <Link to="/account" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.4em]"
              style={{ color: 'rgba(26,26,26,0.35)' }}>
              Leave a review <span style={{ color: ACCENT }}>→</span>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

// ─── Trust Badges ─────────────────────────────────────────────────
const TrustBadges: React.FC<{ content: HomepageContent }> = ({ content }) => (
  <section className="py-10 md:py-20 px-5 md:px-12 bg-white border-y border-black/[0.06]">
    <div className="max-w-[1440px] mx-auto">
      <Reveal>
        <p className="text-sm font-black uppercase tracking-[0.6em] text-center mb-7" style={{ color: ACCENT }}>{content.trustSectionLabel || 'Made to standards that matter'}</p>
      </Reveal>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {content.trustBadges.map((b, i) => (
          <Reveal key={b.label} delay={i * 0.06}>
            <div className="flex flex-col items-center text-center gap-2 p-4 md:p-6 rounded-2xl border border-black/[0.07]">
              <span className="text-3xl md:text-4xl">{b.icon}</span>
              <div>
                <p className="text-sm md:text-base font-black text-[#1A1A1A]">{b.label}</p>
                <p className="text-xs md:text-sm font-medium leading-relaxed mt-1" style={{ color: 'rgba(26,26,26,0.55)' }}>{b.sub}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

// ─── Final CTA ────────────────────────────────────────────────────
const FinalCTA: React.FC<{ content: HomepageContent }> = ({ content }) => (
  <section className="py-14 md:py-28 px-5 md:px-12 relative overflow-hidden" style={{ background: ACCENT }}>
    <div className="absolute inset-0 pointer-events-none opacity-[0.05]" aria-hidden
      style={{ backgroundImage: 'linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)', backgroundSize: '80px 80px' }} />
    <div className="relative max-w-[1440px] mx-auto">
      <Reveal>
        <p className="text-sm font-black uppercase tracking-[0.6em] text-white/70 mb-5">04 — "BEGIN"</p>
        <h2 className="font-black tracking-[-0.04em] text-white leading-[0.92] mb-6"
          style={{ fontSize: 'clamp(2.4rem, 7vw, 6rem)' }}>
          {content.ctaHeadline.split('\n').map((line, i, arr) => (
            <span key={i}>
              {i === arr.length - 1 ? <span style={{ color: 'rgba(255,255,255,0.55)' }}>{line}</span> : line}
              {i < arr.length - 1 && <br />}
            </span>
          ))}
        </h2>
        <p className="text-base md:text-lg text-white/65 font-medium max-w-lg mb-10 leading-relaxed italic">
          "{content.ctaSubtext || content.ctaSubheadline}"
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/product/kala-khatta"
            className="bg-white px-9 py-5 text-sm font-black uppercase tracking-[0.35em] rounded-2xl active:scale-[0.97] text-center transition-opacity"
            style={{ color: ACCENT }}>
            {content.ctaButtonPrimary || 'Start Your Ritual'}
          </Link>
          <Link to="/account"
            className="border border-white/30 text-white px-9 py-5 text-sm font-black uppercase tracking-[0.4em] rounded-2xl text-center transition-all">
            {content.ctaButtonSecondary || 'My Account'}
          </Link>
        </div>
      </Reveal>
    </div>
  </section>
);

// ─── Home ─────────────────────────────────────────────────────────
const Home: React.FC<HomeProps> = ({ onAddToCart }) => {
  const [content,  setContent]  = useState<HomepageContent | null>(null);
  const [products, setProducts] = useState<ShopifyProductFull[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    setSEO(seoForPage('Home', 'High-performance electrolyte sticks in nostalgic Indian flavours. Zero sugar. One ritual.'));
    // Fetch content and products independently — page shows as soon as content loads
    // Products update silently; if they fail, ProductShelf stays hidden (no broken state)
    fetchHomepageContent()
      .then(setContent)
      .catch(() => {})
      .finally(() => setLoading(false));

    fetchAllProducts()
      .then(prods => { if (prods.length > 0) setProducts(prods); })
      .catch((err) => console.error('[SALTD] fetchAllProducts failed:', err));
  }, []);

  if (loading || !content) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAFAF8' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-7 h-7 rounded-full border-2 animate-spin" style={{ borderColor: `${ACCENT}30`, borderTopColor: ACCENT }} />
        <p className="text-sm font-black uppercase tracking-[0.5em] text-black/30">Loading</p>
      </div>
    </div>
  );

  return (
    <div className="bg-[#FAFAF8] overflow-x-hidden">
      <Hero content={content} firstProduct={products[0] ?? null} />
      <StatsBar stats={content.stats} />
      <FlavorEditorialPanels products={products} />
      <ImpactStatement content={content} />
      <ProductShelf products={products} onAddToCart={onAddToCart} content={content} />
      <HowItWorks content={content} />
      <ReviewsSection products={products} content={content} />
      <TrustBadges content={content} />
      <HomeFAQSection />
      <FinalCTA content={content} />
    </div>
  );
};

export default Home;

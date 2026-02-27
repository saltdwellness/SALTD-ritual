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
  ShopifyProductFull, HomepageContent, StatItem,
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
  const c = sp.flavorColor ?? COLOR[sp.handle] ?? ACCENT;
  return {
    id: sp.handle, name: 'SALTD.',
    flavor: sp.flavorSubtitle ?? sp.title,
    color: c, bgColor: `bg-[${c}]`, textColor: `text-[${c}]`,
    description: sp.description,
    image: sp.images.edges[0]?.node.url ?? '/mockups/Mockupv2-1.png',
    features: sp.features.length ? sp.features : ['6 Electrolytes','Ashwagandha','8 Vitamins','Zero Sugar'],
    variants: sp.variants.edges.map(({ node: v }) => ({
      size:           parseInt(v.title.match(/\((\d+)\)/)?.[1] ?? '10', 10),
      label:          v.title,
      price:          parseFloat(v.price.amount),
      compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice.amount) : undefined,
      isSubscription: v.title.toLowerCase().includes('month'),
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
        {q.author && <p className="text-xs font-black uppercase tracking-[0.4em] mt-1.5" style={{ color: ACCENT }}>— {q.author} customer</p>}
      </div>
    </div>
  );
};

// ─── Hero ─────────────────────────────────────────────────────────
// Mobile: no parallax, image is a fixed-opacity background element, text is always on top.
// Desktop: smooth rAF-based parallax that writes directly to style, no setState.
const Hero: React.FC<{ content: HomepageContent; firstProduct: ShopifyProductFull | null }> = ({ content, firstProduct }) => {
  const [loaded, setLoaded] = useState(false);
  const imgWrapRef = useRef<HTMLDivElement>(null);
  const isTouch = useRef(false);

  useEffect(() => {
    isTouch.current = isTouchDevice();
    const t = setTimeout(() => setLoaded(true), 80);

    // Desktop-only parallax via rAF — never calls setState
    if (!isTouch.current && !prefersReducedMotion()) {
      let ticking = false;
      const onScroll = () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            if (imgWrapRef.current) {
              imgWrapRef.current.style.transform = `translateY(${window.scrollY * 0.22}px)`;
            }
            ticking = false;
          });
          ticking = true;
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => { clearTimeout(t); window.removeEventListener('scroll', onScroll); };
    }
    return () => clearTimeout(t);
  }, []);

  const heroImg = firstProduct?.images.edges[0]?.node.url ?? '/mockups/Mockupv2-1.png';
  const accent  = firstProduct?.flavorColor ?? '#8A307F';
  const lines   = content.heroHeadline.split('\n').filter(Boolean);
  const [coords, city] = (content.heroLocationTag || '28.6139 N · New Delhi').split('·').map(s => s.trim());

  return (
    <section className="relative overflow-hidden"
      // Use 100svh (safe viewport height) so address bar on iOS doesn't cause overflow
      style={{ height: '100svh', minHeight: 560, background: `radial-gradient(ellipse at 72% 48%, ${accent}12 0%, transparent 65%), #FAFAF8` }}>

      {/* Subtle grid */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden
        style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.03) 1px,transparent 1px)', backgroundSize: '80px 80px' }} />

      {/* Product image wrapper — parallax on desktop, static on mobile */}
      <div ref={imgWrapRef}
        className="absolute inset-0 pointer-events-none select-none"
        style={{ willChange: 'transform' }}>
        <div className="absolute right-0 top-0 bottom-0 w-full md:w-[58%] flex items-center justify-center">
          <img
            src={heroImg} alt="" aria-hidden
            style={{
              // Mobile: smaller so it never bleeds behind text
              width: 'clamp(180px, 55vw, 480px)',
              height: 'auto',
              objectFit: 'contain',
              opacity: loaded ? 0.92 : 0,
              filter: `drop-shadow(0 40px 100px ${accent}55)`,
              // Shift right on mobile so it sits behind text without covering it
              transform: 'translateX(12%)',
              transition: 'opacity 1.1s ease 0.25s',
            }}
          />
        </div>
      </div>

      {/* Reading gradients — desktop & mobile */}
      <div className="absolute inset-y-0 left-0 w-full pointer-events-none" aria-hidden
        style={{ background: 'linear-gradient(to right, rgba(250,250,248,0.97) 0%, rgba(250,250,248,0.88) 42%, rgba(250,250,248,0.45) 70%, transparent 100%)' }} />
      {/* Extra full overlay on mobile for guaranteed readability */}
      <div className="md:hidden absolute inset-0 pointer-events-none" aria-hidden
        style={{ background: 'rgba(250,250,248,0.72)' }} />

      {/* Content — use padding-top for navbar, flex for vertical centering */}
      <div className="relative z-10 h-full flex flex-col justify-center px-5 sm:px-8 md:px-14 max-w-[1440px] mx-auto"
        style={{ paddingTop: 72 }}>
        <div className="w-full md:w-[52%]">

          {/* Label */}
          <div className="flex items-center gap-3 mb-5"
            style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'none' : 'translateX(-14px)', transition: 'all 0.9s ease 0.1s' }}>
            <div className="w-5 h-[2px] rounded-full" style={{ background: ACCENT }} />
            <span className="text-xs font-black uppercase tracking-[0.45em]" style={{ color: ACCENT }}>c/o Hydration</span>
          </div>

          {/* Headline — clamp so it never overflows on 320px screens */}
          <h1 className="font-black tracking-[-0.04em] leading-[0.92] text-[#1A1A1A] mb-6"
            style={{ fontSize: 'clamp(2.5rem, 7.5vw, 6.8rem)', opacity: loaded ? 1 : 0, transform: loaded ? 'none' : 'translateY(22px)', transition: 'all 1s cubic-bezier(0.16,1,0.3,1) 0.2s' }}>
            {lines.map((line, i) => (
              <span key={i}>
                {i > 0 && i < lines.length - 1 ? <span style={{ color: ACCENT }}>{line}</span> : line}
                {i < lines.length - 1 && <br />}
              </span>
            ))}
          </h1>

          <div className="border-l-[3px] pl-4 mb-7" style={{ borderColor: ACCENT, opacity: loaded ? 1 : 0, transform: loaded ? 'none' : 'translateY(12px)', transition: 'all 1s ease 0.45s' }}>
            <p className="text-base font-medium leading-relaxed" style={{ color: 'rgba(26,26,26,0.70)' }}>
              "Finally a hydration drink that actually tastes like something — not a lab experiment."
            </p>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] mt-2" style={{ color: ACCENT }}>— Joshua Matthews, 27 · Verified Customer</p>
          </div>

          {/* CTAs — stack on very small screens */}
          <div className="flex flex-wrap items-center gap-3 mb-8"
            style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'none' : 'translateY(14px)', transition: 'all 1s ease 0.6s' }}>
            <Link to="/shop"
              className="text-white px-7 py-4 text-sm font-black uppercase tracking-[0.35em] rounded-2xl active:scale-[0.97] transition-opacity"
              style={{ background: ACCENT }}>
              Shop Now
            </Link>
            <Link to="/ingredients"
              className="text-sm font-black uppercase tracking-[0.3em] text-[#1A1A1A]/50 flex items-center gap-2">
              Why SALTD. <span style={{ color: ACCENT }}>→</span>
            </Link>
          </div>

          {/* Location — desktop only */}
          <div className="hidden md:flex items-center gap-2"
            style={{ opacity: loaded ? 0.5 : 0, transition: 'opacity 1.2s ease 0.85s' }}>
            <span className="text-xs font-black uppercase tracking-[0.4em] text-[#1A1A1A]/45">{coords}</span>
            <span className="font-black" style={{ color: ACCENT }}>·</span>
            <span className="text-xs font-black uppercase tracking-[0.4em]" style={{ color: ACCENT }}>{city}</span>
          </div>
        </div>

        {/* Stat pills — desktop only, absolute bottom right */}
        <div className="hidden md:flex items-center gap-7 absolute bottom-10 right-14">
          {['6 Electrolytes', '8 Vitamins', 'Zero Sugar', 'Ashwagandha'].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: ACCENT }} />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-[#1A1A1A]/40">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator — mobile only, bottom center */}
      <div className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 opacity-40" aria-hidden>
        <div className="w-px h-9 bg-black/20 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1/2" style={{ background: ACCENT, animation: 'sd 1.8s ease infinite' }} />
        </div>
      </div>

      <style>{`@keyframes sd{0%{transform:translateY(-100%)}100%{transform:translateY(200%)}}`}</style>
    </section>
  );
};

// ─── Stats Bar ───────────────────────────────────────────────────
// Stat icons — inline SVGs matched to each stat
const STAT_ICONS: Record<string, React.ReactNode> = {
  'Electrolytes': (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="14" stroke="#2E5BFF" strokeWidth="1.5" opacity="0.3"/>
      <path d="M16 6 L19 13 L26 13 L20.5 17.5 L22.5 25 L16 20.5 L9.5 25 L11.5 17.5 L6 13 L13 13 Z" fill="#2E5BFF" opacity="0.85"/>
    </svg>
  ),
  'Vitamins': (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <rect x="9" y="4" width="6" height="24" rx="3" fill="#2E5BFF" opacity="0.25"/>
      <rect x="4" y="13" width="24" height="6" rx="3" fill="#2E5BFF" opacity="0.85"/>
      <rect x="9" y="4" width="6" height="11" rx="3" fill="#2E5BFF" opacity="0.85"/>
    </svg>
  ),
  'Sugar': (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="11" stroke="#2E5BFF" strokeWidth="1.8" opacity="0.85"/>
      <line x1="8" y1="24" x2="24" y2="8" stroke="#2E5BFF" strokeWidth="2" strokeLinecap="round" opacity="0.85"/>
    </svg>
  ),
  'Flavors': (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <path d="M16 4 C10 4 5 9 5 15 C5 21 9 26 16 28 C23 26 27 21 27 15 C27 9 22 4 16 4Z" fill="#2E5BFF" opacity="0.2"/>
      <path d="M16 8 C12 8 8 12 8 16 C8 20 11 23 16 25 C21 23 24 20 24 16 C24 12 20 8 16 8Z" fill="#2E5BFF" opacity="0.5"/>
      <circle cx="16" cy="16" r="4" fill="#2E5BFF" opacity="0.9"/>
    </svg>
  ),
};

const getStatIcon = (label: string): React.ReactNode => {
  const key = Object.keys(STAT_ICONS).find(k => label.toLowerCase().includes(k.toLowerCase()));
  return key ? STAT_ICONS[key] : null;
};

const StatsBar: React.FC<{ stats: StatItem[] }> = ({ stats }) => (
  <section className="bg-[#1A1A1A] py-12 md:py-20 px-5 md:px-12">
    <div className="max-w-[1440px] mx-auto grid grid-cols-2 md:grid-cols-4">
      {stats.map((x, i) => (
        <Reveal key={x.label} delay={i * 0.06}>
          <div className={`flex flex-col px-5 py-6 ${i < 3 ? 'md:border-r border-white/[0.07]' : ''} ${i < 2 ? 'border-b md:border-b-0 border-white/[0.07]' : ''}`}>
            <div className="mb-3 opacity-90">{getStatIcon(x.label)}</div>
            <span className="text-[2.4rem] md:text-[3.5rem] font-black text-white tracking-[-0.04em] leading-none">{x.number}</span>
            <span className="text-xs sm:text-sm font-black uppercase tracking-[0.28em] mt-3" style={{ color: ACCENT }}>{x.label}</span>
            <span className="text-sm text-white/55 font-medium mt-1">{x.subtitle}</span>
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
            opacity: visible ? 0.18 : 0.05,
            filter: `saturate(0.85) brightness(0.92)`,
            transition: 'opacity 1.1s cubic-bezier(0.16,1,0.3,1)',
          }}
        />
      </div>

      {/* ── Gradient overlays for text readability ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden style={{
        background: isEven
          ? `linear-gradient(to right, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.88) 42%, rgba(255,255,255,0.4) 72%, transparent 100%)`
          : `linear-gradient(to left,  rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.88) 42%, rgba(255,255,255,0.4) 72%, transparent 100%)`,
      }} />
      {/* Mobile: extra full overlay */}
      <div className="md:hidden absolute inset-0 pointer-events-none" aria-hidden
        style={{ background: 'rgba(255,255,255,0.35)' }} />
      {/* Bottom blend */}
      <div className="absolute bottom-0 inset-x-0 h-24 pointer-events-none" aria-hidden
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.75))' }} />

      {/* Accent top line */}
      <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: `linear-gradient(to right, ${panel.color}, transparent)`, opacity: 0.6 }} />

      {/* ── Content ──
           Mobile: centered, full-width, generous vertical padding
           Desktop: left or right aligned per isEven, max 560px wide  */}
      <div className={`relative z-10 max-w-[1440px] mx-auto px-5 sm:px-8 md:px-16 py-20 md:py-28 flex ${isEven ? 'md:justify-start' : 'md:justify-end'} justify-start`}>
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
        label:       sp.flavorSubtitle ?? sp.title,
        tagline:     PANEL_FALLBACKS[i]?.tagline ?? sp.description,
        description: sp.description ?? PANEL_FALLBACKS[i]?.description ?? '',
        color:       sp.flavorColor ?? COLOR[sp.handle] ?? ACCENT,
        img:         sp.images.edges[0]?.node.url ?? PANEL_FALLBACKS[i]?.img ?? '/mockups/Mockupv2-1.png',
      }))
    : PANEL_FALLBACKS;
  return (
    <section>
      {/* ── Flavours intro header ── */}
      <div className="bg-[#FAFAF8] px-5 md:px-12 pt-20 pb-10 md:pt-28 md:pb-12">
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
const ImpactStatement: React.FC = () => (
  <section className="bg-[#1A1A1A] py-20 md:py-28 px-5 md:px-12 overflow-hidden">
    <div className="max-w-[1440px] mx-auto">
      <Reveal>
        <p className="text-sm font-black uppercase tracking-[0.6em] mb-7" style={{ color: ACCENT }}>The Foundation</p>
      </Reveal>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-14 md:gap-24 items-start">
        <Reveal>
          <h2 className="font-black tracking-[-0.04em] text-white leading-[0.93]"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 4.8rem)' }}>
            Most hydration<br />drinks are built<br />on <span style={{ color: ACCENT }}>sugar.</span><br />
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>Ours isn't.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <div className="space-y-7 pt-1 md:pt-5">
            {[
              { n: '01', title: 'Zero Sugar, Full Spectrum', body: 'Every stick delivers a complete ionic profile — sodium, potassium, magnesium, calcium, chloride, and phosphate — without a gram of sugar.' },
              { n: '02', title: 'Nostalgia as a Vector',     body: 'We took the flavours Indian childhoods are built on — Kala Khatta, Banta, Peach — and made them the delivery mechanism for serious hydration.' },
              { n: '03', title: 'One Stick. Every Day.',     body: 'Consistency beats intensity. A daily ritual of one stick builds the kind of cellular hydration that compounds over weeks and months.' },
            ].map(item => (
              <div key={item.n} className="flex gap-5 pb-7 border-b last:border-0 last:pb-0" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
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

const ProductShelf: React.FC<{ products: ShopifyProductFull[]; onAddToCart: (p: Product, v: ProductVariant) => void }> = ({ products, onAddToCart }) => {
  const [added, setAdded] = useState<number | null>(null);

  const handleAdd = useCallback((idx: number, sp: ShopifyProductFull) => {
    const p = toCartProduct(sp);
    onAddToCart(p, p.variants[0]);
    setAdded(idx); setTimeout(() => setAdded(null), 1800);
  }, [onAddToCart]);

  return (
    <section className="py-14 md:py-24 bg-[#FAFAF8]">
      <div className="px-5 md:px-12 mb-10 md:mb-14 max-w-[1440px] mx-auto">
        <Reveal>
          <p className="text-sm font-black uppercase tracking-[0.6em] mb-3" style={{ color: ACCENT }}>01 — "STANDARD SERIES"</p>
          <h2 className="font-black tracking-[-0.04em] text-[#1A1A1A] leading-[0.95] mb-4"
            style={{ fontSize: 'clamp(2rem, 5vw, 4.2rem)' }}>
            Our Flavours.
          </h2>
          <p className="text-base md:text-lg font-semibold leading-relaxed max-w-xl" style={{ color: 'rgba(26,26,26,0.55)' }}>
            Three distinctly Indian flavours. Each one carries a complete electrolyte stack, zero sugar, and a taste that feels familiar — only better.
          </p>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 px-5 md:px-12 max-w-[1440px] mx-auto">
        {(products.length > 0 ? products : null)?.map((sp, i) => {
          const p    = toCartProduct(sp);
          const col  = sp.flavorColor ?? COLOR[sp.handle] ?? ACCENT;
          const bg   = SHELF_BG[col]  ?? 'linear-gradient(135deg,#f5f5f5,#ebebeb)';
          const img  = sp.images.edges[0]?.node.url ?? FALLBACK_FLAVORS[i]?.img ?? '/mockups/Mockupv2-1.png';
          const v    = sp.variants.edges[0]?.node;
          const px   = v ? parseFloat(v.price.amount) : 0;
          const cmp  = v?.compareAtPrice ? parseFloat(v.compareAtPrice.amount) : null;
          return (
            <Reveal key={sp.id} delay={i * 0.07}>
              <div className="rounded-3xl overflow-hidden flex flex-col" style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.07)' }}>
                <div className="relative overflow-hidden" style={{ background: bg, height: 280 }}>
                  <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-2 z-10">
                    {p.features.slice(0, 2).map(f => (
                      <span key={f} className="text-xs font-black uppercase tracking-wide px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.9)', color: col }}>{f}</span>
                    ))}
                  </div>
                  <img src={img} alt={sp.title} className="w-full h-full object-contain"
                    style={{ filter: `drop-shadow(0 20px 44px ${col}35)` }} />
                </div>
                <div className="bg-white px-5 py-6 flex flex-col gap-4 flex-1">
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
              <div className="bg-white px-5 py-6 flex flex-col gap-4 flex-1">
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
  <section className="py-24 md:py-32 bg-white">
    <div className="max-w-[900px] mx-auto px-6 md:px-12">
      <div className="text-center mb-14">
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
    <rect x="20" y="2" width="8" height="28" rx="4" fill="#2E5BFF" opacity="0.15"/>
    <rect x="20" y="2" width="8" height="28" rx="4" stroke="#2E5BFF" strokeWidth="1.8"/>
    <path d="M24 34 C24 34 18 41 18 44 C18 47 20.7 48 24 48 C27.3 48 30 47 30 44 C30 41 24 34 24 34Z" fill="#2E5BFF" opacity="0.7"/>
    <circle cx="12" cy="38" r="3" fill="#2E5BFF" opacity="0.35"/>
    <circle cx="36" cy="42" r="2" fill="#2E5BFF" opacity="0.25"/>
  </svg>,
  // Stir — glass with swirl
  <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
    <rect x="10" y="12" width="28" height="32" rx="4" stroke="#2E5BFF" strokeWidth="1.8" fill="#2E5BFF" opacity="0.08"/>
    <path d="M18 28 C20 24 28 24 30 28 C32 32 20 32 22 28" stroke="#2E5BFF" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8"/>
    <rect x="22" y="2" width="4" height="14" rx="2" fill="#2E5BFF" opacity="0.6"/>
    <path d="M10 18 L38 18" stroke="#2E5BFF" strokeWidth="1" opacity="0.3"/>
  </svg>,
  // Drink & Track — checkmark streak
  <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="20" stroke="#2E5BFF" strokeWidth="1.8" opacity="0.2"/>
    <path d="M14 24 L21 31 L34 18" stroke="#2E5BFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="38" cy="10" r="5" fill="#2E5BFF" opacity="0.85"/>
    <path d="M35.5 10 L37.5 12 L41 8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>,
];

const HowItWorks: React.FC = () => (
  <section className="py-18 md:py-28 px-5 md:px-12 bg-[#FAFAF8]">
    <div className="max-w-[1440px] mx-auto">
      <Reveal>
        <p className="text-sm font-black uppercase tracking-[0.6em] mb-4" style={{ color: ACCENT }}>02 — "THE RITUAL"</p>
        <h2 className="font-black tracking-[-0.04em] text-[#1A1A1A] leading-[0.95] mb-12"
          style={{ fontSize: 'clamp(2rem, 5vw, 3.8rem)' }}>
          How it<br /><span style={{ color: 'rgba(26,26,26,0.16)' }}>works.</span>
        </h2>
      </Reveal>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { n: '01', t: '"Tear & Pour"',   d: 'One stick into 250–500ml of water. No measuring, no tools. Just tear, pour, done.' },
          { n: '02', t: '"Stir"',          d: '10 seconds. Watch it dissolve clean and clear — no clumping, no residue.' },
          { n: '03', t: '"Drink & Track"', d: 'Sip. Feel it work. Track your daily ritual and build your streak.' },
        ].map((s, i) => (
          <Reveal key={s.n} delay={i * 0.09}>
            <div className="flex flex-col gap-5 p-7 rounded-3xl border border-[#1A1A1A]/[0.07] bg-white">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${ACCENT}0D` }}>
                {RITUAL_ICONS[i]}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] mb-2" style={{ color: ACCENT }}>{s.n}</p>
                <h3 className="text-2xl font-black text-[#1A1A1A] mb-2">{s.t}</h3>
                <p className="text-base font-medium leading-relaxed" style={{ color: 'rgba(26,26,26,0.60)' }}>{s.d}</p>
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

const ReviewsSection: React.FC<{ products: ShopifyProductFull[] }> = ({ products }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  useEffect(() => {
    try {
      const s: Review[] = JSON.parse(localStorage.getItem('saltd_reviews') || '[]');
      setReviews(s.filter(r => r.rating >= 4 && r.text?.trim()));
    } catch { setReviews([]); }
  }, []);

  const fallback = [
    { name: 'Joshua Matthews', age: 27, role: 'National Calisthenics Champion, Bangalore', rating: 5, text: 'Finally a hydration drink that doesn\'t taste like a science lab. The Kala Khatta hits exactly like I remember from childhood — tangy, bold, zero guilt.',    flavor: 'Kala Khatta',      accent: '#8A307F' },
    { name: 'Jeremiah Saji',   age: 25, role: 'Project Manager, Bangalore',                rating: 5, text: 'Three weeks of morning runs. Recovery is noticeably faster, and I actually look forward to it — that\'s never happened with supplements before.',             flavor: 'Banta Lime Spark', accent: '#7AB800' },
    { name: 'Amritanshu Jaiswal', age: 30, role: 'Founder, ScaleX, Bangalore',            rating: 5, text: 'Switched from a sugar-heavy sports drink. The difference in how I feel mid-afternoon is real. No crash, just consistent energy. Peach Himalayan is my go-to.', flavor: 'Peach Himalayan',  accent: '#E8845A' },
    { name: 'Ritika Saxena',   age: 30, role: 'Co-founder, ScaleX, Bangalore',            rating: 5, text: 'The taste of Banta took me straight back to Marine Lines. Except now it\'s doing something useful. This is exactly what India-first hydration should look like.', flavor: 'Banta Lime Spark', accent: '#7AB800' },
  ];

  const display = reviews.length >= 2
    ? reviews.slice(0, 4).map(r => {
        const sp = products.find(p => (p.flavorSubtitle ?? p.title).toLowerCase().includes(r.flavor.toLowerCase()));
        return { name: 'Verified Customer', role: r.flavor, rating: r.rating, text: r.text, flavor: r.flavor, accent: sp?.flavorColor ?? ACCENT };
      })
    : fallback;

  return (
    <section className="py-20 md:py-28 bg-[#F4F4F2]">
      <div className="max-w-[1440px] mx-auto px-5 md:px-12">
        <Reveal>
          <p className="text-sm font-black uppercase tracking-[0.6em] mb-4" style={{ color: ACCENT }}>03 — "REAL RESULTS"</p>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
            <h2 className="font-black tracking-[-0.04em] text-[#1A1A1A] leading-[0.95]"
              style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
              What people<br /><span style={{ color: 'rgba(26,26,26,0.16)' }}>are saying.</span>
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <span key={s} className="text-xl leading-none" style={{ color: ACCENT }}>★</span>)}</div>
              <span className="text-sm font-black text-[#1A1A1A]/45 ml-2">5.0 avg</span>
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {display.map((r, i) => (
            <Reveal key={i} delay={i * 0.07}>
              <div className="rounded-3xl p-7 flex flex-col gap-5" style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.07)' }}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex gap-0.5">{[1,2,3,4,5].map(s => (
                    <span key={s} className="text-xl leading-none" style={{ color: s <= r.rating ? r.accent : 'rgba(255,255,255,0.1)' }}>★</span>
                  ))}</div>
                  <span className="text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full"
                    style={{ background: `${r.accent}28`, color: r.accent }}>{r.flavor}</span>
                </div>
                {/* Full white, no opacity trick — white is white */}
                <p className="text-base text-[#1A1A1A]/80 font-medium leading-relaxed flex-1">"{r.text}"</p>
                <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0"
                    style={{ background: r.accent }}>{r.name.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-black text-[#1A1A1A]">{r.name}{(r as typeof fallback[0]).age ? `, ${(r as typeof fallback[0]).age}` : ''}</p>
                    <p className="text-xs font-medium mt-0.5" style={{ color: 'rgba(26,26,26,0.55)' }}>{r.role}</p>
                  </div>
                  <div className="ml-auto w-4 h-[2px] rounded-full" style={{ background: r.accent }} />
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15}>
          <div className="mt-10 text-center">
            <Link to="/account" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.4em]"
              style={{ color: 'rgba(255,255,255,0.40)' }}>
              Leave a review <span style={{ color: ACCENT }}>→</span>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

// ─── Trust Badges ─────────────────────────────────────────────────
const TrustBadges: React.FC = () => (
  <section className="py-14 md:py-24 px-5 md:px-12 bg-white border-y border-black/[0.06]">
    <div className="max-w-[1440px] mx-auto">
      <Reveal>
        <p className="text-sm font-black uppercase tracking-[0.6em] text-center mb-10" style={{ color: ACCENT }}>Made to standards that matter</p>
      </Reveal>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          { icon: '🏛️', label: 'FSSAI Approved', sub: 'Food Safety & Standards Authority of India' },
          { icon: '🔬', label: 'GMP Certified',   sub: 'Good Manufacturing Practice — WHO standard' },
          { icon: '🛡️', label: 'FDA Compliant',   sub: 'Manufactured in FDA-registered facility' },
          { icon: '🧪', label: 'Lab Tested',       sub: 'Every batch third-party tested for purity' },
        ].map((b, i) => (
          <Reveal key={b.label} delay={i * 0.06}>
            <div className="flex flex-col items-center text-center gap-3 p-5 md:p-7 rounded-3xl border border-black/[0.07]">
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
  <section className="py-20 md:py-32 px-5 md:px-12 relative overflow-hidden" style={{ background: ACCENT }}>
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
    Promise.all([fetchHomepageContent(), fetchAllProducts()])
      .then(([cms, prods]) => { setContent(cms); setProducts(prods); })
      .catch(() => fetchHomepageContent().then(setContent))
      .finally(() => setLoading(false));
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
      <WelcomeModal content={content} />
      <Hero content={content} firstProduct={products[0] ?? null} />
      <StatsBar stats={content.stats} />
      <FlavorEditorialPanels products={products} />
      <ImpactStatement />
      <ProductShelf products={products} onAddToCart={onAddToCart} />
      <HowItWorks />
      <ReviewsSection products={products} />
      <TrustBadges />
      <HomeFAQSection />
      <FinalCTA content={content} />
    </div>
  );
};

export default Home;

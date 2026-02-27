import React, { useState, useEffect } from 'react';
import { fetchHomepageContent } from '../shopify';
import { Link, useLocation } from 'react-router-dom';

interface NavbarProps {
  onCartOpen: () => void;
  cartCount: number;
}

const MARQUEE_KEYWORD_COLORS: Record<string, string> = {
  'KALA KHATTA':      '#8A307F',
  'BANTA LIME SPARK': '#7AB800',
  'PEACH HIMALAYAN':  '#E8845A',
  '6 ELECTROLYTES':   '#2E5BFF',
  'ALL 8 VITAMINS':   '#2E5BFF',
};
const MARQUEE_FALLBACK = [
  '"KALA KHATTA"', '"BANTA LIME SPARK"', '"PEACH HIMALAYAN"',
  '"6 ELECTROLYTES"', '"ZERO SUGAR"', '"ALL 8 VITAMINS"',
  '"FREE SHIPPING"', '"ONE STICK A DAY"',
];
function getMarqueeColor(text: string): string {
  const clean = text.replace(/[^A-Z0-9 ]/gi, '').trim().toUpperCase();
  return MARQUEE_KEYWORD_COLORS[clean] ?? 'rgba(255,255,255,0.5)';
}
function buildMarqueeWords(items: string[]): { text: string; color: string }[] {
  const result: { text: string; color: string }[] = [];
  items.forEach((item, i) => {
    result.push({ text: item, color: getMarqueeColor(item) });
    if (i < items.length - 1) result.push({ text: '·', color: '#2E5BFF' });
  });
  return result;
}

const Navbar: React.FC<NavbarProps> = ({ onCartOpen, cartCount }) => {
  const location = useLocation();
  const [scrolled,     setScrolled]     = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [marqueeItems, setMarqueeItems] = useState<string[]>(MARQUEE_FALLBACK);
  const isActive = (p: string) => location.pathname === p;

  useEffect(() => {
    fetchHomepageContent().then(c => {
      if (c.marqueeItems.length) {
        setMarqueeItems(c.marqueeItems.map((m: { text: string; color: string }) => m.text));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const links = [
    { label: '"EXPERIENCE"', path: '/' },
    { label: '"APOTHECARY"', path: '/shop' },
    { label: '"WHY SALTD."', path: '/ingredients' },
  ];

  return (
    <>
      {/* Fixed top marquee strip */}
      <div className="fixed top-0 left-0 right-0 z-[9100] overflow-hidden bg-[#0E0E0E] select-none" style={{ height: 28 }}>
        <div className="flex items-center gap-7 h-full"
          style={{ animation: 'nmq 32s linear infinite', width: 'max-content', willChange: 'transform' }}>
          {[...buildMarqueeWords(marqueeItems), ...buildMarqueeWords(marqueeItems)].map((w, i) => (
            <span key={i} className="text-[8px] font-black uppercase tracking-[0.45em] shrink-0 whitespace-nowrap" style={{ color: w.color }}>
              {w.text}
            </span>
          ))}
        </div>
        <style>{`@keyframes nmq{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
      </div>

      {/* Navbar */}
      <nav className="fixed left-0 right-0 z-[9000] px-4 py-3" style={{ top: 28 }}>
        <div className="max-w-[1440px] mx-auto rounded-2xl px-5 md:px-8 h-14 md:h-16 flex items-center justify-between transition-all duration-500"
          style={{
            background: scrolled ? 'rgba(250,250,248,0.95)' : 'rgba(250,250,248,0.75)',
            backdropFilter: 'blur(24px) saturate(180%)',
            boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.06), 0 1px 0 rgba(0,0,0,0.04)' : '0 1px 0 rgba(0,0,0,0.04)',
          }}>

          {/* Logo — increased size */}
          <Link to="/" className="flex items-center gap-3">
            <span className="text-xl font-black tracking-[-0.04em] text-[#1A1A1A]">
              SALTD<span style={{ color: '#2E5BFF' }}>.</span>
            </span>
            <span className="hidden sm:inline text-[7px] font-black uppercase tracking-[0.3em] text-black/20 border border-black/08 px-1.5 py-0.5 rounded-md">
              c/o HYDRATION
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-10">
            {links.map(l => (
              <Link key={l.path} to={l.path}
                className="text-[10px] font-black uppercase tracking-[0.3em] relative transition-colors"
                style={{ color: isActive(l.path) ? '#2E5BFF' : 'rgba(26,26,26,0.40)' }}>
                {l.label}
                {isActive(l.path) && <span className="absolute -bottom-0.5 left-0 right-0 h-[1.5px] bg-[#2E5BFF] rounded-full" />}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link to="/account"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
              style={{ background: isActive('/account') ? '#2E5BFF' : 'rgba(0,0,0,0.04)' }}
              title="Account">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={isActive('/account') ? 'white' : '#1A1A1A'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
            <button onClick={onCartOpen} className="group flex items-center gap-2">
              <span className="hidden sm:inline text-[10px] font-black uppercase tracking-[0.3em] text-black/30 group-hover:text-black transition-colors">Bag</span>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition-all"
                style={{ background: cartCount > 0 ? '#2E5BFF' : 'rgba(0,0,0,0.04)', color: cartCount > 0 ? '#fff' : '#1A1A1A' }}>
                {cartCount > 0 ? cartCount : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                )}
              </div>
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden flex flex-col gap-[5px] w-9 h-9 items-center justify-center">
              <span className={`block w-5 h-[1.5px] bg-[#1A1A1A] transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
              <span className={`block w-5 h-[1.5px] bg-[#1A1A1A] transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-[1.5px] bg-[#1A1A1A] transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden overflow-hidden transition-all duration-500 mx-auto max-w-[1440px]"
          style={{ maxHeight: menuOpen ? '300px' : '0', marginTop: 0 }}>
          <div className="rounded-2xl mt-2 px-5 py-2 border border-black/[0.06]" style={{ background: '#FFFFFF', boxShadow: '0 8px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)' }}>
            {[{ label:'"EXPERIENCE"', path:'/' }, { label:'"APOTHECARY"', path:'/shop' }, { label:'"WHY SALTD."', path:'/ingredients' }, { label:'"ACCOUNT"', path:'/account' }].map((l, i) => (
              <Link key={l.path} to={l.path}
                className="flex items-center justify-between py-4 border-b border-black/[0.04] last:border-0"
                style={{ opacity: menuOpen ? 1 : 0, transform: menuOpen ? 'none' : 'translateX(-12px)', transition: `all 0.35s ease ${i * 0.05}s` }}>
                <span className="text-sm font-black uppercase tracking-[0.2em]">{l.label}</span>
                {isActive(l.path) && <div className="w-1.5 h-1.5 rounded-full bg-[#2E5BFF]" />}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;

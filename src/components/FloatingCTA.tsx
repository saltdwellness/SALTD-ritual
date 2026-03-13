// FloatingCTA.tsx — "Get Hydrated" floating button
// Visible on all pages EXCEPT /shop, /product/*, /account, /order/*
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const ACCENT = '#2E5BFF';

const HIDDEN_ON = ['/shop', '/account'];

const FloatingCTA: React.FC = () => {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Hide on shop, product pages, account, order pages
  const isHidden =
    HIDDEN_ON.some(p => pathname.startsWith(p)) ||
    pathname.startsWith('/product/') ||
    pathname.startsWith('/order/');

  // Show after scrolling 120px, hide when near top
  useEffect(() => {
    if (isHidden) { setVisible(false); return; }
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 120);
      setVisible(y > 120);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHidden, pathname]);

  // Reset on route change
  useEffect(() => {
    setVisible(false);
    setScrolled(false);
  }, [pathname]);

  if (isHidden) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 z-50 pointer-events-none"
      style={{ transform: 'translateX(-50%)' }}
    >
      <Link
        to="/shop"
        className="pointer-events-auto flex items-center gap-3 px-7 py-4 rounded-full text-white text-sm font-black uppercase tracking-[0.35em] transition-all duration-500 active:scale-95 select-none"
        style={{
          background: ACCENT,
          boxShadow: `0 8px 32px ${ACCENT}55, 0 2px 8px rgba(0,0,0,0.18)`,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.95)',
          pointerEvents: visible ? 'auto' : 'none',
          transition: 'opacity 0.4s cubic-bezier(0.16,1,0.3,1), transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s ease',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 40px ${ACCENT}70, 0 4px 12px rgba(0,0,0,0.22)`;
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px) scale(1.03)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${ACCENT}55, 0 2px 8px rgba(0,0,0,0.18)`;
          (e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(1)';
        }}
      >
        <span style={{ fontSize: 16 }}>⚡</span>
        Get Hydrated
        <span className="font-black" style={{ opacity: 0.7 }}>→</span>
      </Link>
    </div>
  );
};

export default FloatingCTA;

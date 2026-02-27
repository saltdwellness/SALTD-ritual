// Footer.tsx — clean 3-column layout: Brand | Navigation | Newsletter
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ACCENT = '#2E5BFF';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent,  setSent]  = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setEmail('');
  };

  return (
    <footer className="bg-[#FAFAF8] px-5 md:px-8 pb-6">
      <div className="bg-[#1A1A1A] rounded-3xl overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-8 md:px-12 pt-14 md:pt-16 pb-0">

          {/* 3-column grid: Brand · Nav · Newsletter */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 mb-14">

            {/* ── Col 1: Brand ── */}
            <div className="flex flex-col gap-6">
              <span className="text-2xl font-black tracking-[-0.04em] text-white">
                SALTD<span style={{ color: ACCENT }}>.</span>
              </span>
              <p className="text-base text-white/55 leading-relaxed font-medium max-w-[220px]">
                "High-performance hydration rituals for the modern palate."
              </p>
              <div className="flex items-center gap-2.5 mt-auto">
                <div className="w-5 h-[1.5px] bg-white/25 rounded-full" />
                <span className="text-xs font-black uppercase tracking-[0.4em] text-white/35">Hydration.Club</span>
              </div>
            </div>

            {/* ── Col 2: Navigation ── */}
            <div className="grid grid-cols-2 gap-10">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.5em] mb-5" style={{ color: ACCENT }}>"Shop"</p>
                <div className="space-y-4">
                  {[{ label: 'All Products', path: '/shop' }, { label: 'Subscriptions', path: '/shop' }, { label: 'Our Story', path: '/story' }].map(l => (
                    <Link key={l.label} to={l.path} className="block text-base font-semibold text-white/55 hover:text-white transition-colors">{l.label}</Link>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.5em] mb-5" style={{ color: ACCENT }}>"Account"</p>
                <div className="space-y-4">
                  {[{ label: 'Sign In', path: '/account' }, { label: 'Order Tracking', path: '/account' }, { label: 'Support', path: '/account' }].map(l => (
                    <Link key={l.label} to={l.path} className="block text-base font-semibold text-white/55 hover:text-white transition-colors">{l.label}</Link>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Col 3: Newsletter ── */}
            <div className="flex flex-col gap-4">
              <p className="text-xs font-black uppercase tracking-[0.5em]" style={{ color: ACCENT }}>"Newsletter"</p>
              <p className="text-sm text-white/50 leading-relaxed">Early access, ritual tips, new flavors. No spam.</p>
              <form onSubmit={handleSubmit} className="flex rounded-xl overflow-hidden border border-white/[0.12] focus-within:border-[#2E5BFF]/50 transition-colors">
                <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)}
                  className="flex-1 min-w-0 px-4 py-3.5 text-sm bg-transparent outline-none placeholder:text-white/20 font-medium text-white" />
                <button type="submit" className="px-5 text-white text-base font-black transition-colors min-w-[48px] flex items-center justify-center"
                  style={{ background: ACCENT }}>
                  {sent ? '✓' : '→'}
                </button>
              </form>
              {sent && <p className="text-xs font-semibold" style={{ color: ACCENT }}>You're in. Ritual begins.</p>}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="py-6 border-t border-white/[0.07] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/35">© 2026 SALTD — Hydration.Club</p>
            <div className="flex gap-7">
              {['Privacy', 'Terms', 'Refunds'].map(t => (
                <a key={t} href="#" className="text-sm font-bold uppercase tracking-[0.3em] text-white/35 hover:text-white transition-colors">{t}</a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';

// ── HashRouter query param parser ────────────────────────────
// useSearchParams() does NOT work with HashRouter because everything
// after # is treated as a path. We parse the query string manually.
function useHashSearchParams(): URLSearchParams {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

const CART_KEYS = ['saltd_cart_id', 'saltd_cart_expiry', 'saltd_cart_local', 'saltd-ritual-cart'];

const OrderConfirmation: React.FC = () => {
  const { id: routeId }   = useParams<{ id: string }>();
  const params            = useHashSearchParams();
  const orderNumber       = params.get('order_number') || params.get('order_id') || routeId || '—';
  const [show, setShow]   = useState(false);

  useEffect(() => {
    // Clear ALL cart keys after successful checkout
    CART_KEYS.forEach(k => localStorage.removeItem(k));
    const t = setTimeout(() => setShow(true), 120);
    return () => clearTimeout(t);
  }, []);

  const steps = [
    { label: 'Placed',           done: true  },
    { label: 'Confirmed',        done: false },
    { label: 'Shipped',          done: false },
    { label: 'Out for Delivery', done: false },
    { label: 'Delivered',        done: false },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-[84px] flex items-center justify-center px-5 pb-12">
      <div
        className="w-full max-w-lg"
        style={{
          opacity: show ? 1 : 0,
          transform: show ? 'none' : 'translateY(20px)',
          transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Header */}
        <div className="bg-[#1A1A1A] rounded-t-3xl px-8 py-10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: 'linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)',
            backgroundSize: '80px 80px',
          }} />
          <div className="h-[3px] bg-[#2E5BFF] absolute top-0 left-0 right-0 rounded-t-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-[#2E5BFF] flex items-center justify-center shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white/40">Order Confirmed</span>
            </div>
            <h1 className="text-[2.2rem] font-black text-white leading-[1.05] tracking-[-0.03em] mb-3">
              "Your ritual<br />is on its way."
            </h1>
            <p className="text-sm text-white/40 font-medium">
              Order <span className="text-white font-black">#{orderNumber}</span>
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="bg-white rounded-b-3xl border border-black/[0.06] border-t-0 px-8 py-8 space-y-8">

          {/* Order timeline */}
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.5em] text-[#2E5BFF] mb-6">Order Status</p>
            <div className="flex items-start justify-between relative">
              <div className="absolute top-3 left-3 right-3 h-[1px] bg-black/08" />
              <div className="absolute top-3 left-3 h-[1px] bg-[#2E5BFF]" style={{ width: '8%' }} />
              {steps.map((s, i) => (
                <div key={s.label} className="flex flex-col items-center gap-2 z-10" style={{ width: `${100 / steps.length}%` }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px]"
                    style={{
                      background: s.done ? '#2E5BFF' : 'white',
                      border: s.done ? 'none' : '1.5px solid rgba(0,0,0,0.1)',
                    }}>
                    {s.done
                      ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      : <span className="text-black/15 text-[8px] font-black">{i + 1}</span>
                    }
                  </div>
                  <span className="text-[7px] font-black uppercase tracking-widest text-center leading-tight"
                    style={{ color: s.done ? '#2E5BFF' : 'rgba(0,0,0,0.2)' }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Info row */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-black/[0.06]">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.5em] text-black/20 mb-2">Delivery</p>
              <p className="text-sm font-black text-[#1A1A1A]">3–5 Business Days</p>
              <p className="text-xs text-black/30 font-medium mt-0.5">Tracking sent via email</p>
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.5em] text-black/20 mb-2">Questions?</p>
              <p className="text-sm font-black text-[#1A1A1A]">support@saltd.in</p>
              <p className="text-xs text-black/30 font-medium mt-0.5">Reply within 24hrs</p>
            </div>
          </div>

          {/* Ritual reminder */}
          <div className="bg-[#F4F7FF] rounded-2xl px-5 py-4 flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-[#2E5BFF]/10 flex items-center justify-center shrink-0">
              <span className="text-sm">💧</span>
            </div>
            <p className="text-xs text-black/40 font-medium leading-relaxed">
              While you wait — start tracking your hydration in your{' '}
              <Link to="/account" className="font-black text-[#1A1A1A] hover:text-[#2E5BFF] transition-colors">
                Account
              </Link>{' '}dashboard.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3">
            <Link
              to="/account"
              className="w-full bg-[#2E5BFF] text-white py-4 text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-[#1a3fd4] transition-colors text-center active:scale-[0.97] block"
            >
              Track My Order
            </Link>
            <Link
              to="/"
              className="w-full border border-black/08 text-[#1A1A1A] py-4 text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-black hover:text-white transition-colors text-center block"
            >
              Back to Home
            </Link>
          </div>
        </div>

        <p className="text-center text-[8px] font-black uppercase tracking-widest text-black/15 mt-6">
          SALTD. — Hydration.Club
        </p>
      </div>
    </div>
  );
};

export default OrderConfirmation;

import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  getCustomerOrders, getOrderStage, formatOrderDate, formatPrice,
  ShopifyOrder, STAGE_KEYS,
} from '../shopify';

// ── Constants ─────────────────────────────────────────────────
const ACCENT     = '#2E5BFF';
const TOKEN_KEY  = 'saltd_customer_token';
const CART_KEYS  = ['saltd_cart_id', 'saltd_cart_expiry', 'saltd_cart_local', 'saltd-ritual-cart'];
const STAGE_LABELS = ['Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];

// ── OrderConfirmation ─────────────────────────────────────────
// Reached from: Account page → "View Order" button on any order card.
// Not reachable from Shopify checkout (Shopify removed Additional Scripts).
// The customer lands on Shopify's hosted Thank You page after checkout,
// then comes here via Account once they sign in.
const OrderConfirmation: React.FC = () => {
  const { id: orderId } = useParams<{ id: string }>();
  const [order,  setOrder]  = useState<ShopifyOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [show,   setShow]   = useState(false);

  // Clear cart on load — this page is always a post-purchase destination
  useEffect(() => {
    CART_KEYS.forEach(k => localStorage.removeItem(k));
    const t = setTimeout(() => setShow(true), 120);
    return () => clearTimeout(t);
  }, []);

  // Attempt to load the specific order if the user is signed in
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token || !orderId) { setLoading(false); return; }

    getCustomerOrders(token)
      .then(orders => {
        // Match by Shopify order name (#1001) or numeric ID
        const match = orders.find(o =>
          o.id === orderId ||
          o.name === orderId ||
          o.name === `#${orderId}` ||
          o.id.endsWith(`/${orderId}`)
        );
        if (match) setOrder(match);
      })
      .catch(() => { /* not logged in or token expired — show static UI */ })
      .finally(() => setLoading(false));
  }, [orderId]);

  const stage    = order ? getOrderStage(order) : null;
  const stageIdx = stage ? STAGE_KEYS.indexOf(stage) : 0;
  const tracking = order?.fulfillments?.[0]?.trackingInfo?.[0];

  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-[84px] flex items-center justify-center px-5 pb-12">
      <div
        className="w-full max-w-lg"
        style={{
          opacity:    show ? 1 : 0,
          transform:  show ? 'none' : 'translateY(20px)',
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
              <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white/40">
                {order ? `Order ${order.name}` : 'Order Details'}
              </span>
            </div>
            <h1 className="text-[2.2rem] font-black text-white leading-[1.05] tracking-[-0.03em] mb-3">
              "Your ritual<br />is on its way."
            </h1>
            {order && (
              <p className="text-sm text-white/40 font-medium">
                {formatOrderDate(order.processedAt)} ·{' '}
                <span className="text-white font-black">
                  {formatPrice(order.currentTotalPrice.amount, order.currentTotalPrice.currencyCode)}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="bg-white rounded-b-3xl border border-black/[0.06] border-t-0 px-8 py-8 space-y-8">

          {/* Live order status — shown when order data is available */}
          {loading && (
            <div className="flex items-center gap-3 py-4">
              <div className="w-4 h-4 rounded-full border-2 border-[#2E5BFF] border-t-transparent animate-spin" />
              <span className="text-xs font-medium text-black/30">Loading order status…</span>
            </div>
          )}

          {!loading && order && stage && (
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.5em] text-[#2E5BFF] mb-5">Live Status</p>
              {/* Progress bar */}
              <div className="flex justify-between mb-2">
                {STAGE_LABELS.map((l, i) => (
                  <span key={l} className="text-[7px] font-black uppercase tracking-widest text-center leading-tight"
                    style={{ color: i <= stageIdx ? ACCENT : 'rgba(0,0,0,0.15)', width: `${100 / STAGE_LABELS.length}%` }}>
                    {l}
                  </span>
                ))}
              </div>
              <div className="h-[2px] bg-black/[0.06] relative mb-5">
                <div className="h-full bg-[#2E5BFF] transition-all duration-700"
                  style={{ width: `${(stageIdx / (STAGE_LABELS.length - 1)) * 100}%` }} />
              </div>

              {/* Tracking number */}
              {tracking && (
                <div className="bg-[#F4F7FF] px-4 py-3 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-[#2E5BFF] mb-1">Tracking Number</p>
                    <p className="text-sm font-black text-[#1A1A1A]">{tracking.number}</p>
                  </div>
                  {tracking.url && (
                    <a href={tracking.url} target="_blank" rel="noopener noreferrer"
                      className="text-[9px] font-black uppercase tracking-widest text-[#2E5BFF] border border-[#2E5BFF] px-3 py-2 rounded-full hover:bg-[#2E5BFF] hover:text-white transition-colors">
                      Track →
                    </a>
                  )}
                </div>
              )}

              {/* Line items */}
              <div className="space-y-2 mt-4">
                <p className="text-[8px] font-black uppercase tracking-[0.5em] text-black/20 mb-2">Items</p>
                {order.lineItems.edges.map(({ node }, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-black/[0.04] last:border-0">
                    <div>
                      <p className="text-xs font-black text-[#1A1A1A]">"{node.title}"</p>
                      <p className="text-[9px] text-black/30 font-medium">{node.variant?.title} × {node.quantity}</p>
                    </div>
                    {node.variant && (
                      <span className="text-sm font-black text-[#1A1A1A]">
                        {formatPrice(node.variant.priceV2.amount, node.variant.priceV2.currencyCode)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Static info — always shown */}
          {!loading && !order && (
            <div className="bg-[#F4F7FF] rounded-2xl px-5 py-4">
              <p className="text-xs font-black text-[#1A1A1A] mb-1">Check your email</p>
              <p className="text-xs text-black/40 font-medium leading-relaxed">
                Your order confirmation and tracking details were sent to the email you used at checkout.
                Sign in to your account to see live order status here.
              </p>
            </div>
          )}

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

          {/* Hydration reminder */}
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
              className="w-full bg-[#2E5BFF] text-white py-4 text-[10px] font-black uppercase tracking-[0.35em] rounded-2xl hover:bg-[#1a3fd4] transition-colors text-center active:scale-[0.97] block"
            >
              {order ? 'Back to Account' : 'Sign In to Track Order'}
            </Link>
            <Link
              to="/"
              className="w-full border border-black/08 text-[#1A1A1A] py-4 text-[10px] font-black uppercase tracking-[0.35em] rounded-2xl hover:bg-black hover:text-white transition-colors text-center block"
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

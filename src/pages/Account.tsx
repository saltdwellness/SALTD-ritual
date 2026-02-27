import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import {
  customerLogin, customerRegister, customerLogout,
  getCustomerOrders, getOrderStage, formatOrderDate, formatPrice,
  getSticksFromOrder, isShopifyReady,
  ShopifyOrder,
} from '../shopify';

const TOKEN_KEY = 'saltd_customer_token';
const ACCENT    = '#2E5BFF';

// ── Hydration tracking helpers ────────────────────────────────
const getTodayKey  = () => new Date().toISOString().split('T')[0];
const getStreak    = (): number => {
  const data = JSON.parse(localStorage.getItem('saltd_hydration') || '{}');
  let streak = 0; const d = new Date();
  while (true) {
    if (!data[d.toISOString().split('T')[0]]) break;
    streak++; d.setDate(d.getDate() - 1);
  }
  return streak;
};

// ── Reviews ───────────────────────────────────────────────────
interface Review { orderId: string; rating: number; text: string; createdAt: string }
const getReviews  = (): Review[] => JSON.parse(localStorage.getItem('saltd_reviews') || '[]');
const saveReview  = (r: Review) => {
  const all = getReviews().filter(x => x.orderId !== r.orderId);
  localStorage.setItem('saltd_reviews', JSON.stringify([...all, r]));
};

// ── Return request ────────────────────────────────────────────
type ReturnReason = 'damaged' | 'incorrect' | 'defect' | 'tampered';
interface ReturnRequest { orderId: string; reason: ReturnReason; description: string; submittedAt: string }
const getReturns  = (): ReturnRequest[] => JSON.parse(localStorage.getItem('saltd_returns') || '[]');
const saveReturn  = (r: ReturnRequest) => {
  const all = getReturns().filter(x => x.orderId !== r.orderId);
  localStorage.setItem('saltd_returns', JSON.stringify([...all, r]));
};

const RETURN_REASONS: { value: ReturnReason; label: string; desc: string }[] = [
  { value: 'damaged',   label: 'Damaged in transit',     desc: 'Product was physically damaged when it arrived' },
  { value: 'incorrect', label: 'Incorrect product',      desc: 'Wrong flavour, quantity, or variant was delivered' },
  { value: 'defect',    label: 'Manufacturing defect',   desc: 'Quality issue not caused by handling' },
  { value: 'tampered',  label: 'Tampered packaging',     desc: 'Seal or box was opened or compromised on delivery' },
];

// ── Order stage display ───────────────────────────────────────
const STAGE_LABELS = ['Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];
const STAGE_KEYS   = ['placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered'];

// ── Demo data ─────────────────────────────────────────────────
const DEMO_EMAIL    = 'sid@saltd.in';
const DEMO_PASSWORD = 'ritual2026';
const DEMO_TOKEN    = 'demo_token_saltd_sid';
const DEMO_ORDERS: ShopifyOrder[] = [
  {
    id: 'gid://shopify/Order/1001', name: '#1001',
    processedAt: '2026-02-10T10:30:00Z',
    fulfillmentStatus: 'UNFULFILLED', financialStatus: 'PAID',
    currentTotalPrice: { amount: '598', currencyCode: 'INR' },
    lineItems: { edges: [
      { node: { title: 'Kala Khatta',    quantity: 1, variant: { title: 'Ritual Pack (10)', priceV2: { amount: '299', currencyCode: 'INR' }, image: null } } },
      { node: { title: 'Banta Lime Spark', quantity: 1, variant: { title: 'Ritual Pack (10)', priceV2: { amount: '299', currencyCode: 'INR' }, image: null } } },
    ]},
    shippingAddress: { firstName: 'Siddharth', address1: '12 Hydration Lane', city: 'Bengaluru', country: 'India', zip: '560001' },
    fulfillments: [],
  },
  {
    id: 'gid://shopify/Order/1002', name: '#1002',
    processedAt: '2026-01-22T08:00:00Z',
    fulfillmentStatus: 'FULFILLED', financialStatus: 'PAID',
    currentTotalPrice: { amount: '799', currencyCode: 'INR' },
    lineItems: { edges: [
      { node: { title: 'Peach Himalayan', quantity: 1, variant: { title: 'Month Supply (30)', priceV2: { amount: '799', currencyCode: 'INR' }, image: null } } },
    ]},
    shippingAddress: { firstName: 'Siddharth', address1: '12 Hydration Lane', city: 'Bengaluru', country: 'India', zip: '560001' },
    fulfillments: [{ trackingInfo: [{ number: 'BD123456789IN', url: 'https://www.bluedart.com' }], updatedAt: '2026-01-25T10:00:00Z', status: 'DELIVERED' }],
  },
];

// ─────────────────────────────────────────────────────────────
// Return Request Form
// ─────────────────────────────────────────────────────────────
const ReturnForm: React.FC<{ order: ShopifyOrder; onClose: () => void }> = ({ order, onClose }) => {
  const existing     = getReturns().find(r => r.orderId === order.id);
  const [reason,     setReason]     = useState<ReturnReason | ''>('');
  const [desc,       setDesc]       = useState('');
  const [submitted,  setSubmitted]  = useState(!!existing);

  const deliveredAt  = order.fulfillments?.[0]?.updatedAt;
  const hoursSince   = deliveredAt
    ? (Date.now() - new Date(deliveredAt).getTime()) / 1000 / 3600
    : 0;
  const withinWindow = hoursSince <= 48 || !deliveredAt;

  const submit = () => {
    if (!reason) return;
    const req: ReturnRequest = {
      orderId: order.id, reason, description: desc,
      submittedAt: new Date().toISOString(),
    };
    saveReturn(req);
    setSubmitted(true);
    // In production: POST to your backend/Shopify webhook here
    const emailBody = encodeURIComponent(
      `Order: ${order.name}\nReason: ${RETURN_REASONS.find(r => r.value === reason)?.label}\nDescription: ${desc}`
    );
    window.open(`mailto:timepassventures@gmail.com?subject=Return Request — ${order.name}&body=${emailBody}`);
  };

  if (submitted || existing) return (
    <div className="bg-[#F0FFF4] border border-green-100 rounded-2xl p-6 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-green-700">Return Request Submitted</p>
      </div>
      <p className="text-xs text-black/40 font-medium leading-relaxed">
        We've received your request for order {order.name}. Our team will review and respond within <strong className="text-[#1A1A1A]">2–3 business days</strong>. Check your email for updates.
      </p>
      <p className="text-[9px] font-black uppercase tracking-widest text-black/25">
        Questions? Email timepassventures@gmail.com
      </p>
      <button onClick={onClose} className="text-[9px] font-black uppercase tracking-widest text-black/30 hover:text-[#1A1A1A] transition-colors">
        Close ↑
      </button>
    </div>
  );

  if (!withinWindow) return (
    <div className="bg-red-50 border border-red-100 rounded-2xl p-6 space-y-2">
      <p className="text-[11px] font-black uppercase tracking-[0.3em] text-red-500">Outside Return Window</p>
      <p className="text-xs text-black/40 font-medium leading-relaxed">
        Our policy requires return requests within <strong className="text-[#1A1A1A]">48 hours of delivery</strong>. This order was delivered more than 48 hours ago and is no longer eligible.
      </p>
      <p className="text-[9px] font-black uppercase tracking-widest text-black/25">
        For exceptions, email timepassventures@gmail.com
      </p>
      <button onClick={onClose} className="text-[9px] font-black uppercase tracking-widest text-black/30 hover:text-[#1A1A1A] transition-colors">
        Close ↑
      </button>
    </div>
  );

  return (
    <div className="border border-black/[0.07] bg-white rounded-2xl p-6 space-y-5">
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-[#2E5BFF] mb-1">Return Request — {order.name}</p>
        <p className="text-[10px] text-black/35 font-medium leading-relaxed">
          We accept returns only for damaged, incorrect, defective, or tampered products, within 48 hours of delivery. Product must be unused with intact seal.
        </p>
      </div>

      {/* Reason selection */}
      <div className="space-y-2">
        <p className="text-[8px] font-black uppercase tracking-[0.5em] text-black/30">Reason for Return</p>
        {RETURN_REASONS.map(r => (
          <button key={r.value} onClick={() => setReason(r.value)}
            className="w-full text-left px-4 py-3 rounded-xl border transition-all"
            style={{
              borderColor: reason === r.value ? ACCENT : 'rgba(0,0,0,0.07)',
              background: reason === r.value ? `${ACCENT}08` : 'transparent',
            }}>
            <p className="text-xs font-black text-[#1A1A1A]">{r.label}</p>
            <p className="text-[9px] text-black/30 font-medium mt-0.5">{r.desc}</p>
          </button>
        ))}
      </div>

      {/* Description */}
      <div>
        <p className="text-[8px] font-black uppercase tracking-[0.5em] text-black/30 mb-2">
          Describe the Issue <span className="text-black/20">(include photo details)</span>
        </p>
        <textarea
          value={desc} onChange={e => setDesc(e.target.value)}
          rows={3}
          placeholder="Describe what happened. If the product was damaged, mention the extent. We'll ask for photos via email."
          className="w-full text-sm text-[#1A1A1A] placeholder-black/20 border border-black/[0.08] rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-[#2E5BFF]/40 bg-transparent"
        />
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
        <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 mb-1">You'll need to send photos</p>
        <p className="text-[9px] text-black/35 font-medium">After submitting, we'll email you requesting photos of the outer packaging and product. Please keep them ready.</p>
      </div>

      <div className="flex gap-3">
        <button onClick={onClose}
          className="flex-1 py-3 text-[10px] font-black uppercase tracking-[0.3em] border border-black/08 rounded-2xl text-black/30 hover:text-[#1A1A1A] hover:border-black/20 transition-all">
          Cancel
        </button>
        <button onClick={submit} disabled={!reason}
          className="flex-1 py-3 text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all active:scale-[0.98]"
          style={{ background: reason ? '#1A1A1A' : 'rgba(0,0,0,0.04)', color: reason ? 'white' : 'rgba(0,0,0,0.2)' }}>
          Submit Request
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Review Form
// ─────────────────────────────────────────────────────────────
const ReviewPrompt: React.FC<{ order: ShopifyOrder; onSubmit: () => void }> = ({ order, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hover,  setHover]  = useState(0);
  const [text,   setText]   = useState('');

  const submit = () => {
    if (!rating) return;
    saveReview({ orderId: order.id, rating, text, createdAt: new Date().toISOString() });
    onSubmit();
  };

  return (
    <div className="border border-[#2E5BFF]/20 bg-[#F4F7FF] p-6 rounded-2xl mb-4">
      <p className="text-[8px] font-black uppercase tracking-[0.5em]" style={{ color: ACCENT }}>How was your ritual?</p>
      <p className="text-sm font-black text-[#1A1A1A] mt-1 mb-4">Leave a review for order {order.name}</p>
      <div className="flex gap-2 mb-4">
        {[1,2,3,4,5].map(s => (
          <button key={s} onClick={() => setRating(s)} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
            className="text-2xl transition-transform hover:scale-110 active:scale-95"
            style={{ color: s <= (hover || rating) ? ACCENT : 'rgba(0,0,0,0.1)' }}>★</button>
        ))}
      </div>
      {rating > 0 && (
        <textarea value={text} onChange={e => setText(e.target.value)}
          placeholder="Tell us more (optional)..." rows={2}
          className="w-full text-sm text-[#1A1A1A] placeholder-black/20 border border-black/08 rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-[#2E5BFF]/40 mb-3" />
      )}
      <button onClick={submit} disabled={!rating}
        className="w-full py-3 text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl transition-all active:scale-[0.98]"
        style={{ background: rating ? ACCENT : 'rgba(0,0,0,0.04)', color: rating ? 'white' : 'rgba(0,0,0,0.2)' }}>
        Submit Review
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Order Card
// ─────────────────────────────────────────────────────────────
const OrderCard: React.FC<{ order: ShopifyOrder }> = ({ order }) => {
  const [expanded,    setExpanded]    = useState(false);
  const [showReturn,  setShowReturn]  = useState(false);
  const stage    = getOrderStage(order);
  const stageIdx = STAGE_KEYS.indexOf(stage);
  const tracking = order.fulfillments?.[0]?.trackingInfo?.[0];
  const review   = getReviews().find(r => r.orderId === order.id);
  const returned = getReturns().find(r => r.orderId === order.id);

  const canReturn = stage === 'delivered';

  return (
    <div className="border border-black/[0.07] bg-white rounded-2xl mb-4 overflow-hidden">
      {/* Header row */}
      <button className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-black/[0.015] transition-colors" onClick={() => setExpanded(!expanded)}>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-base font-black text-[#1A1A1A] tracking-[-0.02em]">{order.name}</span>
            <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full"
              style={{ background: stage === 'delivered' ? 'rgba(46,91,255,0.08)' : 'rgba(0,0,0,0.04)', color: stage === 'delivered' ? ACCENT : 'rgba(0,0,0,0.4)' }}>
              {STAGE_LABELS[stageIdx]}
            </span>
            {returned && (
              <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-amber-50 text-amber-600">
                Return Requested
              </span>
            )}
          </div>
          <p className="text-xs text-black/30 font-medium">
            {formatOrderDate(order.processedAt)} · {formatPrice(order.currentTotalPrice.amount, order.currentTotalPrice.currencyCode)}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {review && (
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(s => (
                <span key={s} className="text-sm leading-none" style={{ color: s <= review.rating ? ACCENT : 'rgba(0,0,0,0.1)' }}>★</span>
              ))}
            </div>
          )}
          <span className="text-black/25 text-sm transition-transform duration-300" style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}>↓</span>
        </div>
      </button>

      {expanded && (
        <div className="px-6 pb-6 border-t border-black/[0.05] pt-5 space-y-5">
          {/* Progress */}
          <div>
            <div className="flex justify-between mb-3">
              {STAGE_LABELS.map((l, i) => (
                <span key={l} className="text-[7px] font-black uppercase tracking-widest text-center"
                  style={{ color: i <= stageIdx ? ACCENT : 'rgba(0,0,0,0.15)', width: `${100 / STAGE_LABELS.length}%` }}>{l}</span>
              ))}
            </div>
            <div className="h-[2px] bg-black/[0.06] relative">
              <div className="h-full bg-[#2E5BFF] transition-all duration-700"
                style={{ width: `${(stageIdx / (STAGE_LABELS.length - 1)) * 100}%` }} />
            </div>
          </div>

          {/* Tracking */}
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

          {/* Items */}
          <div className="space-y-2">
            <p className="text-[8px] font-black uppercase tracking-[0.5em] text-black/20">Items</p>
            {order.lineItems.edges.map(({ node }, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-black/[0.04] last:border-0">
                <div className="flex items-center gap-3">
                  {node.variant?.image && <img src={node.variant.image.url} alt="" className="w-8 h-8 object-cover rounded-lg" />}
                  <div>
                    <p className="text-xs font-black text-[#1A1A1A]">"{node.title}"</p>
                    <p className="text-[9px] text-black/30 font-medium">{node.variant?.title} × {node.quantity}</p>
                  </div>
                </div>
                {node.variant && <span className="text-sm font-black text-[#1A1A1A]">{formatPrice(node.variant.priceV2.amount, node.variant.priceV2.currencyCode)}</span>}
              </div>
            ))}
          </div>

          {/* Shipping address */}
          {order.shippingAddress && (
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.5em] text-black/20 mb-2">Shipping To</p>
              <p className="text-xs text-black/40 font-medium leading-relaxed">
                {order.shippingAddress.firstName}<br />
                {order.shippingAddress.address1}, {order.shippingAddress.city}<br />
                {order.shippingAddress.country} — {order.shippingAddress.zip}
              </p>
            </div>
          )}

          {/* Return section — only for delivered orders */}
          {canReturn && !showReturn && (
            <div className="pt-2 border-t border-black/[0.05]">
              {returned ? (
                <p className="text-[9px] font-black uppercase tracking-widest text-amber-600">
                  ↩ Return request submitted — we'll be in touch within 2–3 business days
                </p>
              ) : (
                <button onClick={() => setShowReturn(true)}
                  className="text-[9px] font-black uppercase tracking-widest text-black/25 hover:text-red-400 transition-colors flex items-center gap-1.5">
                  <span>↩</span> Request Return / Report Issue
                </button>
              )}
            </div>
          )}

          {showReturn && <ReturnForm order={order} onClose={() => setShowReturn(false)} />}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Hydration Stats
// ─────────────────────────────────────────────────────────────
const HydrationStats: React.FC = () => {
  const [data,  setData]  = useState<Record<string, number>>({});
  const [today, setToday] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('saltd_hydration') || '{}');
    setData(saved); setToday(!!saved[getTodayKey()]);
  }, []);

  const logToday = () => {
    const updated = { ...data, [getTodayKey()]: 1 };
    localStorage.setItem('saltd_hydration', JSON.stringify(updated));
    setData(updated); setToday(true);
  };

  const total  = Object.values(data).reduce((a, b) => a + b, 0);
  const streak = getStreak();
  const days   = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (27 - i));
    const key = d.toISOString().split('T')[0];
    return { key, done: !!data[key] };
  });

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-white border border-black/[0.07] rounded-2xl p-6 flex items-center justify-between">
        <div>
          <p className="text-[8px] font-black uppercase tracking-[0.5em] text-[#2E5BFF] mb-1">Today's Ritual</p>
          <p className="text-base font-black text-[#1A1A1A]">{today ? '"Done. Well hydrated."' : '"Did you drink your SALTD?"'}</p>
        </div>
        <button onClick={logToday} disabled={today}
          className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all active:scale-[0.97]"
          style={{ background: today ? 'rgba(46,91,255,0.08)' : ACCENT, color: today ? ACCENT : 'white' }}>
          {today ? '✓ Logged' : 'Log Ritual'}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-black/[0.07] rounded-2xl p-5">
          <p className="text-[8px] font-black uppercase tracking-[0.5em] text-black/20 mb-2">Current Streak</p>
          <p className="text-4xl font-black text-[#1A1A1A] tracking-[-0.04em]">{streak}<span className="text-base font-black text-black/20 ml-1">days</span></p>
        </div>
        <div className="bg-white border border-black/[0.07] rounded-2xl p-5">
          <p className="text-[8px] font-black uppercase tracking-[0.5em] text-black/20 mb-2">Total Sticks</p>
          <p className="text-4xl font-black text-[#1A1A1A] tracking-[-0.04em]">{total}<span className="text-base font-black text-black/20 ml-1">sticks</span></p>
        </div>
      </div>
      <div className="bg-white border border-black/[0.07] rounded-2xl p-5">
        <p className="text-[8px] font-black uppercase tracking-[0.5em] text-black/20 mb-4">Last 28 Days</p>
        <div className="grid grid-cols-7 gap-1.5">
          {days.map(d => (
            <div key={d.key} className="aspect-square rounded-lg transition-all"
              style={{ background: d.done ? ACCENT : 'rgba(0,0,0,0.04)' }} />
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Guest Order Lookup
// ─────────────────────────────────────────────────────────────
const GuestOrderLookup: React.FC = () => {
  const [orderId,   setOrderId]   = useState('');
  const [email,     setEmail]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [order,     setOrder]     = useState<ShopifyOrder | null>(null);

  // Demo guest lookup — matches demo order IDs
  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);

    await new Promise(r => setTimeout(r, 800));

    // Demo match
    const normalized = orderId.trim().replace(/^#/, '');
    const match = DEMO_ORDERS.find(o => o.name === `#${normalized}` || o.name === orderId.trim());

    if (match && email.toLowerCase().includes('@')) {
      setOrder(match);
    } else if (!match) {
      setError('Order not found. Check your order ID and try again. Order IDs look like #1001.');
    } else {
      setError('Email doesn\'t match. Use the email address you placed the order with.');
    }
    setLoading(false);
  };

  if (order) return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-[#2E5BFF]">Order Found</p>
        <button onClick={() => setOrder(null)} className="text-[9px] font-black uppercase tracking-widest text-black/25 hover:text-[#1A1A1A] transition-colors">
          ← Look Up Another
        </button>
      </div>
      <OrderCard order={order} />
    </div>
  );

  return (
    <div className="max-w-sm mx-auto">
      <div className="bg-white border border-black/[0.07] rounded-2xl p-7 space-y-5">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.5em] text-[#2E5BFF] mb-2">Track Your Order</p>
          <p className="text-sm text-black/35 font-medium leading-relaxed">
            No account needed. Enter your order ID from your confirmation email and the email you used to order.
          </p>
        </div>

        <form onSubmit={lookup} className="space-y-4">
          <div>
            <label className="text-[8px] font-black uppercase tracking-[0.5em] text-black/30 block mb-2">Order ID</label>
            <input
              value={orderId} onChange={e => setOrderId(e.target.value)} required
              className="w-full border border-black/[0.08] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-[#2E5BFF]/50 transition-colors bg-transparent"
              placeholder="#1001"
            />
          </div>
          <div>
            <label className="text-[8px] font-black uppercase tracking-[0.5em] text-black/30 block mb-2">Email Address</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full border border-black/[0.08] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-[#2E5BFF]/50 transition-colors bg-transparent"
              placeholder="you@example.com"
            />
          </div>

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-[#1A1A1A] text-white py-4 text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-[#2E5BFF] transition-colors flex items-center justify-center gap-2 active:scale-[0.97]">
            {loading
              ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              : 'Find My Order'
            }
          </button>
        </form>

        <div className="pt-2 border-t border-black/[0.05]">
          <p className="text-[9px] text-black/25 font-medium text-center">
            Your order ID is in your confirmation email subject line.
          </p>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Main Account Page
// ─────────────────────────────────────────────────────────────
const Account: React.FC = () => {
  // Page mode: guest lookup by default, sign-in secondary
  const [mode, setMode] = useState<'guest' | 'signin'>('guest');

  const getStoredToken = (): string | null => {
    const stored = localStorage.getItem(TOKEN_KEY);
    const expiry = localStorage.getItem(TOKEN_KEY + '_expiry');
    if (!stored) return null;
    if (stored === DEMO_TOKEN) return stored;
    if (expiry && Date.now() > parseInt(expiry)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_KEY + '_expiry');
      return null;
    }
    return stored;
  };

  const [token,    setToken]    = useState<string | null>(getStoredToken());
  const [orders,   setOrders]   = useState<ShopifyOrder[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [isLogin,  setIsLogin]  = useState(true);
  const [tab,      setTab]      = useState<'orders' | 'hydration' | 'settings'>('orders');

  // Auth form
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [name,     setName]     = useState('');

  const isShopifyConfigured = isShopifyReady();

  useEffect(() => {
    if (!token) return;
    if (token === DEMO_TOKEN) { setOrders(DEMO_ORDERS); return; }
    if (isShopifyConfigured) {
      setLoading(true);
      getCustomerOrders(token)
        .then(setOrders)
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : 'Session expired';
          if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('session')) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(TOKEN_KEY + '_expiry');
            setToken(null);
          } else { setError(msg); }
        })
        .finally(() => setLoading(false));
    }
  }, [token, isShopifyConfigured]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    // Demo bypass
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      localStorage.setItem(TOKEN_KEY, DEMO_TOKEN);
      setToken(DEMO_TOKEN); setLoading(false); return;
    }
    try {
      const result = isLogin
        ? await customerLogin(email, password)
        : await customerRegister(name, email, password);
      localStorage.setItem(TOKEN_KEY, result.accessToken);
      const expiry = result.expiresAt
        ? new Date(result.expiresAt).getTime()
        : Date.now() + 88 * 24 * 60 * 60 * 1000;
      localStorage.setItem(TOKEN_KEY + '_expiry', expiry.toString());
      setToken(result.accessToken);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally { setLoading(false); }
  };

  const handleLogout = async () => {
    if (token && token !== DEMO_TOKEN) {
      try { await customerLogout(token); } catch {}
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY + '_expiry');
    setToken(null); setOrders([]);
  };

  const TABS = [
    { id: 'orders',    label: '"Orders"' },
    { id: 'hydration', label: '"Hydration"' },
    { id: 'settings',  label: '"Settings"' },
  ] as const;

  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-[84px] md:pt-[88px]">
      {/* Dark header */}
      <div className="bg-[#1A1A1A] px-5 md:px-12 py-14 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)', backgroundSize: '80px 80px' }} />
        <div className="relative max-w-[1440px] mx-auto flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.6em] text-[#2E5BFF] mb-4">Orders & Account</p>
            <h1 className="text-[2.5rem] md:text-[5rem] font-black tracking-[-0.04em] text-white leading-[0.93]">
              {token ? '"Your Ritual."' : '"Track & Manage."'}
            </h1>
          </div>
          {token && (
            <button onClick={handleLogout} className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 hover:text-white transition-colors border border-white/10 px-4 py-2 rounded-xl hover:border-white/30">
              Sign Out
            </button>
          )}
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-5 md:px-12 py-10 md:py-16">

        {/* ── Logged in ── */}
        {token ? (
          <div>
            <div className="flex gap-0 mb-8 border-b border-black/[0.07] justify-center">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all border-b-2 -mb-[1px]"
                  style={{ color: tab === t.id ? ACCENT : 'rgba(0,0,0,0.25)', borderColor: tab === t.id ? ACCENT : 'transparent' }}>
                  {t.label}
                </button>
              ))}
            </div>

            {tab === 'orders' && (
              <div className="max-w-2xl mx-auto space-y-4">
                {loading && (
                  <div className="flex items-center gap-3 py-8">
                    <div className="w-4 h-4 border-2 border-[#2E5BFF]/20 border-t-[#2E5BFF] rounded-full animate-spin" />
                    <span className="text-sm text-black/30 font-medium">Loading orders...</span>
                  </div>
                )}
                {error && <p className="text-xs text-red-500 font-medium py-4">{error}</p>}
                {!loading && orders.length === 0 && !error && (
                  <div className="border border-black/[0.07] bg-white rounded-2xl p-10 text-center">
                    <p className="text-[8px] font-black uppercase tracking-[0.5em] text-black/20 mb-3">No Orders Yet</p>
                    <p className="text-sm text-black/30 font-medium mb-6">Your first ritual is just one click away.</p>
                    <Link to="/shop" className="inline-block bg-[#2E5BFF] text-white px-8 py-3 text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-[#1a3fd4] transition-colors">
                      Shop Now
                    </Link>
                  </div>
                )}
                {/* Review prompt */}
                {orders.filter(o => getOrderStage(o) === 'delivered' && !getReviews().some(r => r.orderId === o.id))
                  .slice(0, 1).map(order => (
                  <ReviewPrompt key={order.id + '_review'} order={order} onSubmit={() => {}} />
                ))}
                {orders.map(order => <OrderCard key={order.id} order={order} />)}
              </div>
            )}

            {tab === 'hydration' && (
              <div className="max-w-2xl mx-auto"><HydrationStats /></div>
            )}

            {tab === 'settings' && (
              <div className="max-w-sm mx-auto">
                <div className="bg-white border border-black/[0.07] rounded-2xl p-6 space-y-5">
                  <p className="text-[8px] font-black uppercase tracking-[0.5em] text-[#2E5BFF]">Account Settings</p>
                  <p className="text-sm text-black/40 font-medium leading-relaxed">
                    Manage your profile, address, and preferences in your{' '}
                    <a href={`https://${import.meta.env.VITE_SHOPIFY_STORE_DOMAIN}/account`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-[#2E5BFF] font-black hover:underline">
                      Shopify Account →
                    </a>
                  </p>
                  <button onClick={handleLogout}
                    className="w-full border border-black/08 text-[#1A1A1A] py-3 text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-[#1A1A1A] hover:text-white transition-all">
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

        ) : (
          /* ── Not logged in ── */
          <div>
            {/* Mode toggle — Guest lookup is default */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex border border-black/[0.08] rounded-2xl overflow-hidden">
                {([['guest', 'Track Order'], ['signin', 'Sign In / Register']] as const).map(([m, label]) => (
                  <button key={m} onClick={() => setMode(m)}
                    className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.25em] transition-all"
                    style={{ background: mode === m ? '#1A1A1A' : 'transparent', color: mode === m ? 'white' : 'rgba(0,0,0,0.35)' }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Guest: order lookup */}
            {mode === 'guest' && <GuestOrderLookup />}

            {/* Sign in / register */}
            {mode === 'signin' && (
              <div className="max-w-sm mx-auto">
                <div className="bg-white border border-black/[0.07] rounded-2xl overflow-hidden">
                  {/* Toggle */}
                  <div className="flex border-b border-black/[0.07]">
                    {(['Sign In', 'Register'] as const).map((l, i) => (
                      <button key={l} onClick={() => setIsLogin(i === 0)}
                        className="flex-1 py-3.5 text-[10px] font-black uppercase tracking-[0.3em] transition-all"
                        style={{ background: (i === 0) === isLogin ? '#1A1A1A' : 'transparent', color: (i === 0) === isLogin ? 'white' : 'rgba(0,0,0,0.3)' }}>
                        {l}
                      </button>
                    ))}
                  </div>

                  <div className="p-7 space-y-4">
                    <div className="bg-[#F4F7FF] border border-[#2E5BFF]/20 px-4 py-3 rounded-xl">
                      <p className="text-[9px] font-black text-[#2E5BFF] uppercase tracking-wider mb-1">Demo Access</p>
                      <p className="text-[10px] text-black/40 font-medium">Email: <span className="font-black text-[#1A1A1A]">sid@saltd.in</span></p>
                      <p className="text-[10px] text-black/40 font-medium">Password: <span className="font-black text-[#1A1A1A]">ritual2026</span></p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                      {!isLogin && (
                        <div>
                          <label className="text-[8px] font-black uppercase tracking-[0.5em] text-black/30 block mb-2">Name</label>
                          <input value={name} onChange={e => setName(e.target.value)} required
                            className="w-full border border-black/[0.08] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-[#2E5BFF] transition-colors bg-transparent"
                            placeholder="Your name" />
                        </div>
                      )}
                      <div>
                        <label className="text-[8px] font-black uppercase tracking-[0.5em] text-black/30 block mb-2">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                          className="w-full border border-black/[0.08] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-[#2E5BFF] transition-colors bg-transparent"
                          placeholder="you@example.com" />
                      </div>
                      <div>
                        <label className="text-[8px] font-black uppercase tracking-[0.5em] text-black/30 block mb-2">Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                          className="w-full border border-black/[0.08] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-[#2E5BFF] transition-colors bg-transparent"
                          placeholder="••••••••" />
                      </div>
                      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
                      <button type="submit" disabled={loading}
                        className="w-full bg-[#2E5BFF] text-white py-4 text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-[#1a3fd4] transition-colors flex items-center justify-center gap-2 active:scale-[0.97]">
                        {loading
                          ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          : isLogin ? 'Sign In' : 'Create Account'
                        }
                      </button>
                    </form>

                    <p className="text-center text-[9px] text-black/25 font-medium pt-1">
                      Accounts give you hydration tracking, review history, and faster lookup.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;

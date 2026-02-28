import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CartItem } from '../types';
import { ShopifyCart } from '../shopify';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string, shopifyId: string) => void;
  onUpdateQty: (shopifyId: string, qty: number) => void;
  onCheckout: () => void;
  isLoading?: boolean;
  isShopifyConfigured?: boolean;
  shopifyCart?: ShopifyCart | null;
  cartError?: string | null;
}

const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen, onClose, items, onRemove, onUpdateQty,
  onCheckout, isLoading, isShopifyConfigured, shopifyCart, cartError,
}) => {
  const [processing, setProcessing] = useState(false);

  // Always use Shopify's real subtotal when available; fall back to local price math
  const subtotal  = shopifyCart
    ? parseFloat(shopifyCart.cost.subtotalAmount.amount)
    : items.reduce((s, i) => s + i.selectedVariant.price * i.quantity, 0);
  const currency  = shopifyCart?.cost.subtotalAmount.currencyCode ?? 'INR';
  const count     = shopifyCart?.totalQuantity ?? items.reduce((s, i) => s + i.quantity, 0);

  const handleCheckout = () => {
    setProcessing(true);
    try { onCheckout(); }
    finally { setTimeout(() => setProcessing(false), 3000); }
  };

  const formatItemPrice = (item: CartItem): string => {
    // If Shopify cart exists, find the real line price from it
    if (shopifyCart) {
      const line = shopifyCart.lines.edges.find(
        e => e.node.merchandise.title === item.selectedVariant.label ||
             e.node.merchandise.product.title.toLowerCase().includes(item.flavor.toLowerCase().split(' ')[0])
      );
      if (line) {
        const amount = parseFloat(line.node.merchandise.priceV2.amount) * item.quantity;
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
      }
    }
    // Fallback: local price
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(
      item.selectedVariant.price * item.quantity
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[10000] transition-all duration-500"
        style={{
          background: isOpen ? 'rgba(0,0,0,0.45)' : 'transparent',
          backdropFilter: isOpen ? 'blur(4px)' : 'none',
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-[400px] bg-[#FAFAF8] z-[10001] flex flex-col"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)',
          willChange: 'transform',
        }}
      >
        {/* Top bar */}
        <div className="h-[3px] bg-[#2E5BFF] shrink-0" />

        {/* Header */}
        <div className="px-7 py-5 flex items-center justify-between border-b border-black/[0.06] shrink-0">
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.25em] text-[#1A1A1A]">"The Bag"</h2>
            <p className="text-[9px] font-bold text-black/25 uppercase tracking-widest mt-0.5">
              {count === 0 ? 'Empty' : `${count} item${count !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close cart"
            className="w-9 h-9 rounded-full flex items-center justify-center border border-black/08 hover:bg-[#1A1A1A] hover:text-white hover:border-transparent transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error banner */}
        {cartError && (
          <div className="mx-4 mt-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl shrink-0">
            <p className="text-[9px] font-black text-red-600 uppercase tracking-wider">{cartError}</p>
          </div>
        )}

        {/* Shopify not configured banner (dev only) */}
        {!isShopifyConfigured && items.length > 0 && !cartError && (
          <div className="mx-4 mt-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl shrink-0">
            <p className="text-[9px] font-black text-amber-700 uppercase tracking-wider leading-relaxed">
              ⚡ Demo mode — add Shopify keys to .env for live checkout
            </p>
          </div>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 z-20 flex items-center justify-center pointer-events-none">
            <div className="w-5 h-5 border-2 border-[#2E5BFF]/20 border-t-[#2E5BFF] rounded-full animate-spin" />
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-5 py-16">
              <div className="w-16 h-16 rounded-2xl border border-black/08 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-[#1A1A1A] mb-1">"Empty Bag"</p>
                <p className="text-[10px] text-black/25 font-medium">Start your ritual</p>
              </div>
              <button
                onClick={onClose}
                className="bg-[#2E5BFF] text-white px-8 py-3 text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-[#1A1A1A] transition-colors"
              >
                Shop Now
              </button>
            </div>
          ) : (
            items.map(item => (
              <div
                key={`${item.id}-${item.selectedVariant.shopifyId}`}
                className="flex gap-4 p-4 rounded-2xl border border-black/[0.05] bg-white"
              >
                {/* Image */}
                <div className="w-16 h-16 rounded-xl shrink-0 flex items-center justify-center bg-[#F4F4F2] overflow-hidden">
                  <img src={item.image} alt={item.flavor} className="w-full h-full object-cover" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <div>
                      <p className="text-[7px] font-black uppercase tracking-widest text-black/20">SALTD.</p>
                      <h3 className="text-xs font-black text-[#1A1A1A]">"{item.flavor}"</h3>
                      <p className="text-[9px] text-black/25 font-bold uppercase tracking-widest mt-0.5">
                        {item.selectedVariant.label}
                        {item.selectedVariant.isSubscription && (
                          <span className="ml-1.5 text-[#2E5BFF]">· Monthly</span>
                        )}
                      </p>
                    </div>
                    <span className="text-sm font-black text-[#1A1A1A] shrink-0">
                      {formatItemPrice(item)}
                    </span>
                  </div>

                  {/* Qty controls */}
                  <div className="flex items-center justify-between mt-2.5">
                    <div className="flex items-center rounded-xl border border-black/08 overflow-hidden">
                      <button
                        onClick={() => item.quantity > 1
                          ? onUpdateQty(item.selectedVariant.shopifyId, item.quantity - 1)
                          : onRemove(item.id, item.selectedVariant.shopifyId)}
                        aria-label="Decrease quantity"
                        className="w-8 h-8 flex items-center justify-center text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors text-sm font-black"
                      >−</button>
                      <span className="w-8 h-8 flex items-center justify-center text-xs font-black border-x border-black/08">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQty(item.selectedVariant.shopifyId, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="w-8 h-8 flex items-center justify-center text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors text-sm font-black"
                      >+</button>
                    </div>
                    <button
                      onClick={() => onRemove(item.id, item.selectedVariant.shopifyId)}
                      className="text-[9px] font-black uppercase tracking-widest text-black/15 hover:text-red-400 transition-colors"
                    >Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-5 border-t border-black/[0.06] space-y-4 shrink-0">
            {/* Trust signals */}
            <div className="flex items-center justify-between">
              {['Free Shipping', 'Secure', '30-Day Returns'].map(t => (
                <div key={t} className="flex items-center gap-1">
                  <div className="w-2.5 h-[1.5px] bg-[#2E5BFF]" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#2E5BFF]">{t}</span>
                </div>
              ))}
            </div>

            {/* Subtotal */}
            <div className="flex justify-between items-baseline">
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-black/25">Subtotal</span>
              <span className="text-3xl font-black text-[#1A1A1A] tracking-[-0.04em]">
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(subtotal)}
              </span>
            </div>

            {/* Checkout */}
            <button
              onClick={handleCheckout}
              disabled={processing || !!isLoading}
              className="w-full py-4 text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60"
              style={{
                background: processing ? '#1A1A1A' : '#2E5BFF',
                color: 'white',
              }}
            >
              {processing ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  {isShopifyConfigured ? 'Secure Checkout' : 'Checkout (Demo)'}
                </>
              )}
            </button>

            <p className="text-center text-[8px] font-black uppercase tracking-widest text-black/12">
              SSL Encrypted · Powered by true hydration
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;

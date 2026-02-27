import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Story from './pages/Story';
import Account from './pages/Account';
import OrderConfirmation from './pages/OrderConfirmation';
import ProductPage from './pages/ProductPage';
import IngredientsPage from './pages/IngredientsPage';
import FAQPage from './pages/FAQPage';
import { PrivacyPage, TermsPage, RefundsPage, ShippingPage } from './pages/LegalPages';
import { Product, CartItem, ProductVariant } from './types';
import { PRODUCTS } from './constants';
import {
  cartCreate, cartAddLines, cartUpdateLines, cartRemoveLines,
  cartFetch, goToCheckout, VARIANT_MAP, ShopifyCart, isShopifyReady,
} from './shopify';

const CART_ID_KEY       = 'saltd_cart_id';
const CART_LOCAL_KEY    = 'saltd_cart_local';
const TOKEN_EXPIRY_KEY  = 'saltd_cart_expiry';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    // iOS Safari ignores 'instant' sometimes — belt and braces approach
    try { window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); } catch {}
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0; // iOS Safari fallback
  }, [pathname]);
  return null;
};

function mapShopifyCart(shopifyCart: ShopifyCart): CartItem[] {
  return shopifyCart.lines.edges.map(({ node }) => {
    const variantGid = node.merchandise.id;
    const localKey   = Object.entries(VARIANT_MAP).find(([, gid]) => gid === variantGid)?.[0] ?? '';
    const product    = PRODUCTS.find(p => p.variants.some(v => v.shopifyId === localKey)) ?? PRODUCTS[0];
    const variant    = product.variants.find(v => v.shopifyId === localKey) ?? product.variants[0];
    return {
      ...product,
      selectedVariant: { ...variant, _lineId: node.id } as ProductVariant & { _lineId: string },
      quantity: node.quantity,
    };
  });
}

function findLineId(shopifyCart: ShopifyCart, localShopifyId: string): string | null {
  const gid = VARIANT_MAP[localShopifyId];
  if (!gid) return null;
  const edge = shopifyCart.lines.edges.find(e => e.node.merchandise.id === gid);
  return edge?.node.id ?? null;
}

const App: React.FC = () => {
  const [isCartOpen,  setIsCartOpen]  = useState(false);
  const [cart,        setCart]        = useState<CartItem[]>([]);
  const [shopifyCart, setShopifyCart] = useState<ShopifyCart | null>(null);
  const [isLoading,   setIsLoading]   = useState(false);
  const [cartError,   setCartError]   = useState<string | null>(null);
  const configured = useRef(isShopifyReady());

  useEffect(() => {
    if (configured.current) return;
    try {
      const saved = localStorage.getItem(CART_LOCAL_KEY);
      if (saved) setCart(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!configured.current) localStorage.setItem(CART_LOCAL_KEY, JSON.stringify(cart));
  }, [cart]);

  const getOrCreateCart = useCallback(async (): Promise<ShopifyCart> => {
    const savedId     = localStorage.getItem(CART_ID_KEY);
    const savedExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (savedId && savedExpiry && Date.now() < parseInt(savedExpiry)) {
      const existing = await cartFetch(savedId);
      if (existing) return existing;
    }
    const fresh  = await cartCreate();
    const expiry = Date.now() + 10 * 24 * 60 * 60 * 1000;
    localStorage.setItem(CART_ID_KEY, fresh.id);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString());
    return fresh;
  }, []);

  const syncShopify = useCallback(async () => {
    if (!configured.current) return;
    try {
      const sc = await getOrCreateCart();
      setShopifyCart(sc); setCart(mapShopifyCart(sc)); setCartError(null);
    } catch (e: unknown) {
      console.warn('[SALTD] Cart sync failed:', e instanceof Error ? e.message : e);
    }
  }, [getOrCreateCart]);

  useEffect(() => { if (configured.current) syncShopify(); }, []); // eslint-disable-line

  const handleAddToCart = useCallback(async (product: Product, variant: ProductVariant) => {
    setIsLoading(true); setCartError(null);
    try {
      if (configured.current) {
        const gid = VARIANT_MAP[variant.shopifyId];
        if (!gid || gid.includes('REPLACE_ME')) throw new Error(`Variant not mapped: ${variant.shopifyId}`);
        const sc      = await getOrCreateCart();
        const updated = await cartAddLines(sc.id, [{ merchandiseId: gid, quantity: 1 }]);
        setShopifyCart(updated); setCart(mapShopifyCart(updated));
      } else {
        setCart(prev => {
          const exists = prev.find(i => i.selectedVariant.shopifyId === variant.shopifyId);
          if (exists) return prev.map(i => i.selectedVariant.shopifyId === variant.shopifyId ? { ...i, quantity: i.quantity + 1 } : i);
          return [...prev, { ...product, selectedVariant: variant, quantity: 1 }];
        });
      }
      setIsCartOpen(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Could not add to cart';
      console.error('[SALTD] Add to cart failed:', msg); setCartError(msg);
    } finally { setIsLoading(false); }
  }, [getOrCreateCart]);

  const handleRemove = useCallback(async (_id: string, shopifyId: string) => {
    setIsLoading(true);
    try {
      if (configured.current && shopifyCart) {
        const lineId = findLineId(shopifyCart, shopifyId);
        if (lineId) { const u = await cartRemoveLines(shopifyCart.id, [lineId]); setShopifyCart(u); setCart(mapShopifyCart(u)); return; }
      }
      setCart(prev => prev.filter(i => i.selectedVariant.shopifyId !== shopifyId));
    } catch (e: unknown) { console.error('[SALTD] Remove failed:', e); }
    finally { setIsLoading(false); }
  }, [shopifyCart]);

  const handleUpdateQty = useCallback(async (shopifyId: string, qty: number) => {
    setIsLoading(true);
    try {
      if (configured.current && shopifyCart) {
        const lineId = findLineId(shopifyCart, shopifyId);
        if (lineId) {
          const updated = qty === 0
            ? await cartRemoveLines(shopifyCart.id, [lineId])
            : await cartUpdateLines(shopifyCart.id, [{ id: lineId, quantity: qty }]);
          setShopifyCart(updated); setCart(mapShopifyCart(updated)); return;
        }
      }
      setCart(prev => qty === 0 ? prev.filter(i => i.selectedVariant.shopifyId !== shopifyId) : prev.map(i => i.selectedVariant.shopifyId === shopifyId ? { ...i, quantity: qty } : i));
    } catch (e: unknown) { console.error('[SALTD] Update qty failed:', e); }
    finally { setIsLoading(false); }
  }, [shopifyCart]);

  const handleCheckout = useCallback(() => {
    if (configured.current && shopifyCart?.checkoutUrl) {
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
      goToCheckout(shopifyCart.checkoutUrl);
    } else { setCartError('Connect Shopify in .env to enable checkout.'); }
  }, [shopifyCart]);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen selection:bg-[#2E5BFF] selection:text-white">
        <Navbar onCartOpen={() => setIsCartOpen(true)} cartCount={cartCount} />
        <main className="flex-grow">
          <Routes>
            <Route path="/"                element={<Home    onAddToCart={handleAddToCart} />} />
            <Route path="/shop"            element={<Shop    onAddToCart={handleAddToCart} />} />
            <Route path="/product/:handle" element={<ProductPage onAddToCart={handleAddToCart} />} />
            <Route path="/story"           element={<Story />} />
            <Route path="/account"         element={<Account />} />
            <Route path="/order/:id"       element={<OrderConfirmation />} />
            <Route path="/ingredients"     element={<IngredientsPage />} />
            <Route path="/faq"             element={<FAQPage />} />
            <Route path="/privacy"         element={<PrivacyPage />} />
            <Route path="/terms"           element={<TermsPage />} />
            <Route path="/refunds"         element={<RefundsPage />} />
            <Route path="/shipping"        element={<ShippingPage />} />
          </Routes>
        </main>
        <Footer />
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cart}
          onRemove={handleRemove}
          onUpdateQty={handleUpdateQty}
          onCheckout={handleCheckout}
          isLoading={isLoading}
          isShopifyConfigured={configured.current}
          shopifyCart={shopifyCart}
          cartError={cartError}
        />
      </div>
    </Router>
  );
};

export default App;

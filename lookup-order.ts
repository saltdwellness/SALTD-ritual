// api/lookup-order.ts  →  place this at /api/lookup-order.ts in your project root
// Vercel serverless function — runs server-side only, Admin API key never reaches browser.
//
// SETUP (one-time in Vercel dashboard):
//   Project → Settings → Environment Variables:
//     SHOPIFY_ADMIN_TOKEN  = shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//     SHOPIFY_STORE_DOMAIN = g1bhpi-tq.myshopify.com
//
// Admin API access scopes needed:
//   read_orders  (nothing else)

import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory rate limit: 10 lookups per IP per minute
const rl = new Map<string, { n: number; reset: number }>();

function allow(ip: string): boolean {
  const now = Date.now();
  const e   = rl.get(ip);
  if (!e || now > e.reset) { rl.set(ip, { n: 1, reset: now + 60_000 }); return true; }
  if (e.n >= 10) return false;
  e.n++;
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const ip = ((req.headers['x-forwarded-for'] as string) ?? '').split(',')[0].trim() || 'unknown';
  if (!allow(ip)) return res.status(429).json({ found: false, order: null, error: 'Too many requests. Try again in a minute.' });

  const { orderId, email } = req.query;
  if (typeof orderId !== 'string' || typeof email !== 'string') {
    return res.status(400).json({ found: false, order: null, error: 'Missing parameters.' });
  }

  // Server-side input validation — never trust frontend
  const cleanId    = orderId.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 20);
  const cleanEmail = email.toLowerCase().trim().slice(0, 254);
  if (!cleanId || !cleanEmail.includes('@') || cleanEmail.length < 5) {
    return res.status(400).json({ found: false, order: null, error: 'Invalid parameters.' });
  }

  const adminToken  = process.env.SHOPIFY_ADMIN_TOKEN;
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  if (!adminToken || !storeDomain) {
    return res.status(500).json({ found: false, order: null, error: 'Server configuration error.' });
  }

  try {
    const shopifyRes = await fetch(
      `https://${storeDomain}/admin/api/2024-01/orders.json?name=${encodeURIComponent(cleanId)}&status=any&limit=1`,
      { headers: { 'X-Shopify-Access-Token': adminToken, 'Content-Type': 'application/json' } }
    );

    if (!shopifyRes.ok) return res.status(502).json({ found: false, order: null, error: 'Could not reach order system.' });

    type AdminOrder = {
      id: number; name: string; email: string; created_at: string;
      fulfillment_status: string | null; financial_status: string;
      current_total_price: string; currency: string;
      shipping_address: { firstName: string; address1: string; city: string; country: string; zip: string } | null;
      line_items: { title: string; quantity: number; variant_title: string; price: string }[];
    };
    const data = await shopifyRes.json() as { orders: AdminOrder[] };
    if (!data.orders?.length) return res.status(200).json({ found: false, order: null });

    const o = data.orders[0];
    // Must match email — prevents order ID enumeration
    if (o.email.toLowerCase() !== cleanEmail) return res.status(200).json({ found: false, order: null });

    // Return only fields the frontend needs — never expose the full admin object
    return res.status(200).json({
      found: true,
      order: {
        id:                o.id.toString(),
        name:              o.name,
        processedAt:       o.created_at,
        fulfillmentStatus: (o.fulfillment_status ?? 'unfulfilled').toUpperCase(),
        financialStatus:   o.financial_status.toUpperCase(),
        currentTotalPrice: { amount: o.current_total_price, currencyCode: o.currency ?? 'INR' },
        shippingAddress:   o.shipping_address ?? null,
        fulfillments:      [],
        lineItems: {
          edges: o.line_items.map(item => ({
            node: {
              title:    item.title,
              quantity: item.quantity,
              variant:  { title: item.variant_title, priceV2: { amount: item.price, currencyCode: 'INR' }, image: null },
            },
          })),
        },
      },
    });
  } catch {
    return res.status(500).json({ found: false, order: null, error: 'Lookup failed. Please try again.' });
  }
}

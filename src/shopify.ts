// ═══════════════════════════════════════════════════════════════
// shopify.ts — SALTD complete Storefront API layer
//
// PHILOSOPHY: All content lives in Shopify. No code changes needed
// for copy, prices, products, images, or homepage text.
//
// SETUP (one-time, then never touch code again):
//   1. .env → VITE_SHOPIFY_STORE_DOMAIN + VITE_SHOPIFY_STOREFRONT_TOKEN
//   2. Products → set metafields per product (flavor_color, flavor_tagline, etc.)
//   3. Content → Metaobjects → homepage_settings → fill in all fields
//   4. VARIANT_MAP → paste your 6 real variant GIDs (only code change ever needed)
// ═══════════════════════════════════════════════════════════════

const DOMAIN  = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN as string;
const TOKEN   = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN as string;
const API_VER = '2024-10';
const API_URL = `https://${DOMAIN}/api/${API_VER}/graphql.json`;

// ── Variant map — THE ONLY CODE YOU EVER NEED TO UPDATE ───────
// Keys match product handles in constants.ts.
// Values are GIDs from Shopify Admin → Products → [variant] → URL
export const VARIANT_MAP: Record<string, string> = {
  'variant_kalakhatta_10':   'gid://shopify/ProductVariant/48008265564408',
  'variant_kalakhatta_30':   'gid://shopify/ProductVariant/48008265597176',
  'variant_banta_10':        'gid://shopify/ProductVariant/48008269627640',
  'variant_banta_30':        'gid://shopify/ProductVariant/48008269660408',
  'variant_peach_10':        'gid://shopify/ProductVariant/48008270807288',
  'variant_peach_30':        'gid://shopify/ProductVariant/48008270840056',
};

export const isShopifyReady = (): boolean =>
  !!DOMAIN && !!TOKEN &&
  !Object.values(VARIANT_MAP).some(v => v.includes('REPLACE_ME'));


// ── Core GraphQL helper ────────────────────────────────────────
async function gql<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  if (!DOMAIN || !TOKEN) throw new Error('Store configuration missing. Check environment setup.');

  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(API_URL, {
      method:  'POST',
      headers: {
        'Content-Type':                      'application/json',
        'X-Shopify-Storefront-Access-Token': TOKEN,
      },
      body:   JSON.stringify({ query, variables }),
      signal: controller.signal,
    });

    if (!res.ok) {
      // Never leak raw HTTP status strings — prevents server-detail enumeration
      throw new Error(res.status === 401 ? 'Authentication error.' : 'Request failed. Please try again.');
    }

    const json = await res.json() as { data?: T; errors?: { message: string }[] };
    if (json.errors?.length) {
      const msg = json.errors[0]?.message ?? 'Unknown error';
      throw new Error(msg.length > 300 ? 'An error occurred. Please try again.' : msg);
    }
    if (!json.data) throw new Error('Empty response from store.');
    return json.data;
  } catch (e: unknown) {
    if (e instanceof Error && e.name === 'AbortError') throw new Error('Request timed out. Check your connection.');
    if (import.meta.env.DEV) console.error('[SALTD] Shopify API error:', e);
    throw e;
  } finally {
    clearTimeout(timer);
  }
}


// ═══════════════════════════════════════════════════════════════
// SECTION 1 — HOMEPAGE CONTENT (via Shopify Metaobjects)
//
// Setup in Shopify Admin (one-time):
//   1. Content → Metaobjects → Add definition
//      Type name: Homepage Settings   Handle: homepage_settings
//   2. Add these fields (all "Single line text" unless noted):
//        hero_headline        — multiline text
//        hero_subtext         — text (rotating quote 1)
//        hero_subtext_2       — text (rotating quote 2)
//        hero_subtext_3       — text (rotating quote 3)
//        hero_location        — e.g. "NEW DELHI"
//        hero_coords          — e.g. "28.6139° N 77.2090° E"
//        stats                — JSON (see DEFAULT_HOMEPAGE_CONTENT below for format)
//        marquee_items        — JSON
//        cta_headline         — text (use \n for line breaks)
//        cta_subheadline      — text
//        cta_subtext          — text
//        cta_button_primary   — text e.g. "Begin Your Ritual"
//        cta_button_secondary — text e.g. "Create Account"
//        modal_headline       — text (use \n for line breaks)
//        modal_body           — text
//        seo_title            — text
//        seo_description      — text
//   3. Content → Metaobjects → homepage_settings → Add entry
//      Handle: "main"  — fill in all the fields above
//
// After setup: change any copy directly in Shopify Admin, site updates live.
// ═══════════════════════════════════════════════════════════════

export interface StatItem {
  number: string; // e.g. "6"
  label: string;  // e.g. "Electrolytes"
  subtitle: string;
}

export interface MarqueeItem {
  text: string;
  color: string;
}

export interface ImpactPoint  { n: string; title: string; body: string; }
export interface RitualStep   { n: string; title: string; desc: string; }
export interface TrustBadge   { icon: string; label: string; sub: string; }
export interface FallbackReview { name: string; age: number; role: string; rating: number; text: string; flavor: string; accent: string; }

export interface HomepageContent {
  heroHeadline: string;
  heroSubtext: string;
  heroSubtext2: string;
  heroSubtext3: string;
  heroLocation: string;
  heroCoords: string;
  heroLocationTag: string;
  rotatingQuotes: string[];
  stats: StatItem[];
  marqueeItems: MarqueeItem[];
  ctaHeadline: string;
  ctaSubheadline: string;
  ctaSubtext: string;
  ctaButtonPrimary: string;
  ctaButtonSecondary: string;
  modalHeadline: string;
  modalBody: string;
  seo: { title: string; description: string };
  // Impact section
  impactHeadline: string;
  impactPoints: ImpactPoint[];
  // How it works
  ritualSteps: RitualStep[];
  // Trust badges
  trustBadges: TrustBadge[];
  // Fallback reviews
  fallbackReviews: FallbackReview[];
  // Extra dynamic text fields
  heroQuote: string;
  heroStatPills: string[];
  shopSectionHeadline: string;
  shopSectionSubtext: string;
  reviewsHeadline: string;
  impactSectionLabel: string;
  ritualSectionLabel: string;
  trustSectionLabel: string;
}

export const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  heroHeadline:       'Your Daily\nRitual\nStarts Here',
  heroSubtext:        'High-performance electrolytes wrapped in nostalgic Indian flavours. One stick. One ritual.',
  heroSubtext2:       'Finally, hydration that actually tastes like something you grew up with.',
  heroSubtext3:       'Zero sugar. All the flavour. This is what hydration should feel like.',
  heroLocation:       'NEW DELHI',
  heroCoords:         '28.4857° N 77.0618° E',
  heroLocationTag:    '28.4857° N 77.0618° E · GURGAON',
  rotatingQuotes:     [
    'High-performance electrolytes wrapped in nostalgic Indian flavours. One stick. One ritual.',
    'Finally, hydration that actually tastes like something you grew up with.',
    'Zero sugar. All the flavour. This is what hydration should feel like.',
  ],
  stats: [
    { number: '600mg', label: 'Ashwagandha', subtitle: 'KSM-66 adaptogen'   },
    { number: '6',     label: 'Electrolytes', subtitle: 'Full ionic spectrum' },
    { number: '8',     label: 'Vitamins',     subtitle: 'All essential'       },
    { number: '0g',    label: 'Sugar',        subtitle: 'Zero spike'          },
  ],
  marqueeItems: [
    { text: '"KALA KHATTA"',      color: '#8A307F' },
    { text: '·',                  color: '#2E5BFF' },
    { text: '"BANTA LIME SPARK"', color: '#7AB800' },
    { text: '·',                  color: '#2E5BFF' },
    { text: '"PEACH HIMALAYAN"',  color: '#E8845A' },
    { text: '·',                  color: '#2E5BFF' },
    { text: '"6 ELECTROLYTES"',   color: '#2E5BFF' },
    { text: '·',                  color: 'rgba(255,255,255,0.3)' },
    { text: '"ZERO SUGAR"',       color: 'rgba(255,255,255,0.5)' },
    { text: '·',                  color: 'rgba(255,255,255,0.3)' },
    { text: '"ALL 8 VITAMINS"',   color: '#2E5BFF' },
    { text: '·',                  color: 'rgba(255,255,255,0.3)' },
    { text: '"FREE SHIPPING"',    color: 'rgba(255,255,255,0.5)' },
    { text: '·',                  color: 'rgba(255,255,255,0.3)' },
    { text: '"ONE STICK A DAY"',  color: 'rgba(255,255,255,0.5)' },
  ],
  ctaHeadline:        'Your baseline\nstarts here.',
  ctaSubheadline:     'Hydration isn\'t a supplement — it\'s the foundation of everything you do.',
  ctaSubtext:         '',
  ctaButtonPrimary:   'Begin Your Ritual',
  ctaButtonSecondary: 'Create Account',
  modalHeadline:      'Welcome\nto\nHydration\n.Club',
  modalBody:          'High-performance hydration rituals for the modern palate.',
  seo: {
    title:       'SALTD. | Ritual Hydration',
    description: 'High-performance electrolyte sticks in nostalgic Indian flavours. Zero sugar. One ritual.',
  },
  heroQuote:            'Finally a hydration drink that actually tastes like something — not a lab experiment.',
  heroStatPills:        ['6 Electrolytes', '8 Vitamins', 'Zero Sugar', 'Ashwagandha'],
  shopSectionHeadline:  'Our Flavours.',
  shopSectionSubtext:   'Three distinctly Indian flavours. Each one carries a complete electrolyte stack, zero sugar, and a taste that feels familiar — only better.',
  reviewsHeadline:      'What people\nare saying.',
  impactSectionLabel:   'The Foundation',
  ritualSectionLabel:   '02 — "THE RITUAL"',
  trustSectionLabel:    'Made to standards that matter',
  impactHeadline: 'Most hydration drinks are built on sugar. Ours isn\'t.',
  impactPoints: [
    { n: '01', title: 'Zero Sugar, Full Spectrum', body: 'Every stick delivers a complete ionic profile — sodium, potassium, magnesium, calcium, chloride, and phosphate — without a gram of sugar.' },
    { n: '02', title: 'Nostalgia as a Vector',     body: 'We took the flavours Indian childhoods are built on — Kala Khatta, Banta, Peach — and made them the delivery mechanism for serious hydration.' },
    { n: '03', title: 'One Stick. Every Day.',     body: 'Consistency beats intensity. A daily ritual of one stick builds the kind of cellular hydration that compounds over weeks and months.' },
  ],
  ritualSteps: [
    { n: '01', title: 'Tear & Pour',   desc: 'One stick into 250–500ml of water. Tear, pour, done.' },
    { n: '02', title: 'Stir',          desc: '10 seconds. Dissolves clean — no clumping, no residue.' },
    { n: '03', title: 'Drink & Track', desc: 'Sip. Feel it work. Build your daily streak.' },
  ],
  trustBadges: [
    { icon: '🏛️', label: 'FSSAI Approved', sub: 'Food Safety & Standards Authority of India' },
    { icon: '🔬', label: 'GMP Certified',   sub: 'Good Manufacturing Practice — WHO standard' },
    { icon: '🛡️', label: 'FDA Compliant',   sub: 'Manufactured in FDA-registered facility' },
    { icon: '🧪', label: 'Lab Tested',       sub: 'Every batch third-party tested for purity' },
  ],
  fallbackReviews: [
    { name: 'Joshua Matthews',   age: 27, role: 'National Calisthenics Champion, Bangalore', rating: 5, text: "Finally a hydration drink that doesn\'t taste like a science lab. The Kala Khatta hits exactly like I remember from childhood — tangy, bold, zero guilt.",    flavor: 'Kala Khatta',      accent: '#8A307F' },
    { name: 'Jeremiah Saji',     age: 25, role: 'Project Manager, Bangalore',                rating: 5, text: "Three weeks of morning runs. Recovery is noticeably faster, and I actually look forward to it — that\'s never happened with supplements before.",             flavor: 'Banta Lime Spark', accent: '#7AB800' },
    { name: 'Amritanshu Jaiswal',age: 30, role: 'Founder, ScaleX, Bangalore',               rating: 5, text: "Switched from a sugar-heavy sports drink. The difference in how I feel mid-afternoon is real. No crash, just consistent energy. Peach Himalayan is my go-to.", flavor: 'Peach Himalayan',  accent: '#E8845A' },
    { name: 'Ritika Saxena',     age: 30, role: 'Co-founder, ScaleX, Bangalore',             rating: 5, text: "The taste of Banta took me straight back to Marine Lines. Except now it\'s doing something useful. This is exactly what India-first hydration should look like.", flavor: 'Banta Lime Spark', accent: '#7AB800' },
  ],
};

export async function fetchHomepageContent(): Promise<HomepageContent> {
  try {
    const data = await gql<{
      metaobject: { fields: Array<{ key: string; value: string }> } | null;
    }>(`
      query fetchHomepage {
        metaobject(handle: { handle: "main", type: "homepage_settings" }) {
          fields { key value }
        }
      }
    `);

    console.log('[SALTD] Homepage metaobject raw:', data.metaobject);
    if (!data.metaobject) {
      console.warn('[SALTD] metaobject is null — check handle and type match Shopify');
      return DEFAULT_HOMEPAGE_CONTENT;
    }

    const f: Record<string, string> = {};
    for (const field of data.metaobject.fields) f[field.key] = field.value;
    console.log('[SALTD] Homepage fields parsed:', f);

    const parseJSON = <T>(raw: string | undefined, fallback: T): T => {
      if (!raw || raw.length > 50_000) return fallback;
      try { return JSON.parse(raw) as T; } catch { return fallback; }
    };

    const heroCoords  = f['hero_coords']  ?? DEFAULT_HOMEPAGE_CONTENT.heroCoords;
    const heroLocation = f['hero_location'] ?? DEFAULT_HOMEPAGE_CONTENT.heroLocation;
    const s1 = f['hero_subtext']   ?? DEFAULT_HOMEPAGE_CONTENT.heroSubtext;
    const s2 = f['hero_subtext_2'] ?? DEFAULT_HOMEPAGE_CONTENT.heroSubtext2;
    const s3 = f['hero_subtext_3'] ?? DEFAULT_HOMEPAGE_CONTENT.heroSubtext3;

    // Build impact points from individual fields
    const D = DEFAULT_HOMEPAGE_CONTENT;
    const impactPoints: ImpactPoint[] = [
      { n: '01', title: f['impact_1_title'] ?? D.impactPoints[0].title, body: f['impact_1_body'] ?? D.impactPoints[0].body },
      { n: '02', title: f['impact_2_title'] ?? D.impactPoints[1].title, body: f['impact_2_body'] ?? D.impactPoints[1].body },
      { n: '03', title: f['impact_3_title'] ?? D.impactPoints[2].title, body: f['impact_3_body'] ?? D.impactPoints[2].body },
    ];
    const ritualSteps: RitualStep[] = [
      { n: '01', title: f['ritual_1_title'] ?? D.ritualSteps[0].title, desc: f['ritual_1_desc'] ?? D.ritualSteps[0].desc },
      { n: '02', title: f['ritual_2_title'] ?? D.ritualSteps[1].title, desc: f['ritual_2_desc'] ?? D.ritualSteps[1].desc },
      { n: '03', title: f['ritual_3_title'] ?? D.ritualSteps[2].title, desc: f['ritual_3_desc'] ?? D.ritualSteps[2].desc },
    ];
    const trustBadges: TrustBadge[] = [
      { icon: '🏛️', label: f['trust_1_label'] ?? D.trustBadges[0].label, sub: f['trust_1_sub'] ?? D.trustBadges[0].sub },
      { icon: '🔬', label: f['trust_2_label'] ?? D.trustBadges[1].label, sub: f['trust_2_sub'] ?? D.trustBadges[1].sub },
      { icon: '🛡️', label: f['trust_3_label'] ?? D.trustBadges[2].label, sub: f['trust_3_sub'] ?? D.trustBadges[2].sub },
      { icon: '🧪', label: f['trust_4_label'] ?? D.trustBadges[3].label, sub: f['trust_4_sub'] ?? D.trustBadges[3].sub },
    ];

    return {
      heroHeadline:       f['hero_headline']         ?? D.heroHeadline,
      heroSubtext:        s1,
      heroSubtext2:       s2,
      heroSubtext3:       s3,
      heroLocation,
      heroCoords,
      heroLocationTag:    `${heroCoords} · ${heroLocation}`,
      rotatingQuotes:     [s1, s2, s3].filter(Boolean),
      stats:              parseJSON(f['stats'],         D.stats),
      marqueeItems:       parseJSON(f['marquee_items'], D.marqueeItems),
      ctaHeadline:        f['cta_headline']         ?? D.ctaHeadline,
      ctaSubheadline:     f['cta_subheadline']      ?? D.ctaSubheadline,
      ctaSubtext:         f['cta_subtext']          ?? D.ctaSubtext,
      ctaButtonPrimary:   f['cta_button_primary']   ?? D.ctaButtonPrimary,
      ctaButtonSecondary: f['cta_button_secondary'] ?? D.ctaButtonSecondary,
      modalHeadline:      f['modal_headline']       ?? D.modalHeadline,
      modalBody:          f['modal_body']           ?? D.modalBody,
      seo: {
        title:       f['seo_title']       ?? D.seo.title,
        description: f['seo_description'] ?? D.seo.description,
      },
      heroQuote:           f['hero_quote']            ?? D.heroQuote,
      heroStatPills:       parseJSON(f['hero_stat_pills'], D.heroStatPills),
      shopSectionHeadline: f['shop_section_headline'] ?? D.shopSectionHeadline,
      shopSectionSubtext:  f['shop_section_subtext']  ?? D.shopSectionSubtext,
      reviewsHeadline:     f['reviews_headline']      ?? D.reviewsHeadline,
      impactSectionLabel:  f['impact_section_label']  ?? D.impactSectionLabel,
      ritualSectionLabel:  f['ritual_section_label']  ?? D.ritualSectionLabel,
      trustSectionLabel:   f['trust_section_label']   ?? D.trustSectionLabel,
      impactHeadline:      f['impact_headline']       ?? D.impactHeadline,
      impactPoints,
      ritualSteps,
      trustBadges,
      fallbackReviews: parseJSON(f['reviews'], D.fallbackReviews),
    };
  } catch (e) {
    console.error('[SALTD] fetchHomepageContent threw:', e);
    return DEFAULT_HOMEPAGE_CONTENT;
  }
}


// ═══════════════════════════════════════════════════════════════
// SECTION 2 — PRODUCTS (all data live from Shopify)
//
// Each product needs these metafields (Shopify Admin → Products → Metafields):
//   Namespace: saltd
//   Keys:
//     flavor_tagline  (Single line text) — e.g. "Tangy. Bold. Nostalgic."
//     flavor_color    (Single line text) — hex color, e.g. "#8A307F"
//     flavor_bg       (Single line text) — CSS gradient, e.g. "linear-gradient(135deg,#f5eef8,#ede0f5)"
//     features        (JSON)             — ["6 Electrolytes","Ashwagandha","Zero Sugar","All 8 Vitamins"]
//
// To add metafield definitions:
//   Shopify Admin → Settings → Custom data → Products → Add definition
//   → namespace: saltd, key: flavor_color, type: Single line text → Save
//   Repeat for each key above.
//
// To fill in metafield values:
//   Products → [product] → scroll down to Metafields → fill in values → Save
// ═══════════════════════════════════════════════════════════════

export interface ShopifyProductFull {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  productType: string;
  tags: string[];
  vendor: string;
  availableForSale: boolean;
  featuredImage: { url: string; altText: string | null } | null;
  images: { edges: { node: { url: string; altText: string | null } }[] };
  variants: { edges: { node: {
    id: string;
    title: string;
    availableForSale: boolean;
    quantityAvailable: number | null;
    sku: string | null;
    price: { amount: string; currencyCode: string };
    compareAtPrice: { amount: string; currencyCode: string } | null;
  }}[] };
  seo: { title: string | null; description: string | null };
  // Raw metafields array from Shopify (parsed into typed fields below)
  metafields: { namespace: string; key: string; value: string }[] | null;
  flavorColor: string | null;  // extracted from metafields in fetchAllProducts
  flavorBg:    string | null;  // extracted from metafields in fetchAllProducts
  // Computed after fetch
  flavorSubtitle: string | null;
  features: string[];
  scienceText: string;
  ingredients: { name: string; amount: string; role: string }[];
  faqs: { q: string; a: string }[];
}

// Default per-product fallback content — used when Shopify metafields aren't set yet
const PRODUCT_SCIENCE_FALLBACK: Record<string, string> = {
  'kala-khatta':      'Kala Khatta — black plum and tamarind — was never just a flavour. We loaded it with a complete electrolyte profile: sodium to drive cellular uptake, potassium for muscle function, magnesium to reduce cramping, calcium for nerve transmission, plus all 8 vitamins and 600mg of Ashwagandha KSM-66.',
  'banta-lime-spark': 'Banta — the marble-stoppered lemon-lime soda reimagined as a high-performance hydration system. Citric acid naturally enhances mineral absorption. Paired with the full ionic spectrum, Vitamin B12 for cognitive edge, and Ashwagandha for sustained energy.',
  'peach-himalayan':  'Himalayan Peach carries a warmth that makes it ideal for evening use. Elevated magnesium dose (150mg) supports sleep quality, Ashwagandha for cortisol reduction, and a full B-complex for overnight recovery.',
};
const PRODUCT_INGREDIENTS_FALLBACK: Record<string, { name: string; amount: string; role: string }[]> = {
  'kala-khatta':      [
    { name: 'Sodium',            amount: '500mg',    role: 'Primary hydration driver — moves water into cells' },
    { name: 'Potassium',         amount: '200mg',    role: 'Muscle contraction and recovery' },
    { name: 'Magnesium',         amount: '120mg',    role: 'Reduces cramping, supports sleep quality' },
    { name: 'Calcium',           amount: '80mg',     role: 'Nerve signal transmission' },
    { name: 'Ashwagandha KSM-66',amount: '600mg',    role: 'Stress adaptation and cortisol regulation' },
    { name: 'Vitamin C',         amount: '40mg',     role: 'Immune support and collagen synthesis' },
    { name: 'B-Complex',         amount: '8 vitamins', role: 'Energy metabolism and cellular repair' },
  ],
  'banta-lime-spark': [
    { name: 'Sodium',            amount: '500mg',    role: 'Cellular hydration and plasma balance' },
    { name: 'Potassium',         amount: '200mg',    role: 'Electrolyte balance and heart function' },
    { name: 'Magnesium',         amount: '120mg',    role: 'ATP energy production' },
    { name: 'Calcium',           amount: '80mg',     role: 'Muscle and bone health' },
    { name: 'Ashwagandha KSM-66',amount: '600mg',    role: 'Sustained energy without stimulants' },
    { name: 'Vitamin B12',       amount: '2.4mcg',   role: 'Cognitive function and nerve health' },
    { name: 'Citric Acid',       amount: 'Natural',  role: 'Enhances mineral bioavailability' },
  ],
  'peach-himalayan':  [
    { name: 'Sodium',            amount: '500mg',    role: 'Overnight cellular hydration' },
    { name: 'Potassium',         amount: '200mg',    role: 'Muscle relaxation during sleep' },
    { name: 'Magnesium',         amount: '150mg',    role: 'Higher dose — supports sleep quality' },
    { name: 'Calcium',           amount: '80mg',     role: 'Calms the nervous system' },
    { name: 'Ashwagandha KSM-66',amount: '600mg',    role: 'Cortisol reduction and recovery' },
    { name: 'Vitamin D3',        amount: '400IU',    role: 'Bone health and immune regulation' },
    { name: 'B-Complex',         amount: '8 vitamins', role: 'Overnight repair and recovery' },
  ],
};
const PRODUCT_FAQS_FALLBACK: Record<string, { q: string; a: string }[]> = {
  'kala-khatta':      [
    { q: 'What does Kala Khatta actually taste like?',  a: 'Like the real thing — tart, tangy, a little sweet. Not artificial. Just honest flavour that tastes like something.' },
    { q: 'Can I drink it every day?',                   a: 'Yes. It\'s designed for daily use. One stick a day builds cellular hydration that compounds over weeks.' },
    { q: 'Is there any sugar?',                         a: 'Zero. We use a small amount of natural Monk Fruit sweetener to round out the tartness — no added sugar, no fructose, no maltodextrin.' },
    { q: 'When should I drink it?',                     a: 'Morning works best — before your first coffee, before a workout, or as a ritual to start the day. It absorbs fastest on an empty stomach.' },
  ],
  'banta-lime-spark': [
    { q: 'What does Banta Lime Spark taste like?',      a: 'Sharp, citrusy, slightly effervescent on the palate — the same electric quality as the original banta, just cleaner and without the sugar crash.' },
    { q: 'Is this good for workouts?',                  a: 'Yes. The electrolyte profile is designed for active use. Drink 30 minutes before a workout or during for sustained performance.' },
    { q: 'Why does it have citric acid?',               a: 'Citric acid naturally increases the bioavailability of minerals — your body absorbs electrolytes faster in a slightly acidic environment.' },
    { q: 'Can kids drink it?',                          a: 'The formulation is designed for adults. Consult a doctor before use for children, particularly regarding the Ashwagandha content.' },
  ],
  'peach-himalayan':  [
    { q: 'What does Peach Himalayan taste like?',       a: 'Soft, ripe peach — not candy-sweet, not artificial. A warmth that makes it comforting rather than stimulating. Perfect for evenings.' },
    { q: 'Can I use this before bed?',                  a: 'Yes — it\'s designed for that. Elevated magnesium and Ashwagandha work synergistically to support sleep quality and overnight recovery.' },
    { q: 'Does it have caffeine?',                      a: 'Zero. No caffeine, no stimulants. Just clean electrolytes and adaptogens to support natural recovery.' },
    { q: 'What makes it different from the other flavours?', a: 'Higher magnesium dose (150mg vs 120mg), plus Vitamin D3 specifically added for its role in overnight immune regulation and bone health.' },
  ],
};

export async function fetchAllProducts(): Promise<ShopifyProductFull[]> {
  const data = await gql<{ products: { edges: { node: Record<string, unknown> }[] } }>(`
    query fetchAllProducts {
      products(first: 10, sortKey: TITLE) {
        edges {
          node {
            id handle title description descriptionHtml
            productType tags vendor availableForSale

            featuredImage { url altText }

            images(first: 6) {
              edges { node { url altText } }
            }

            variants(first: 10) {
              edges {
                node {
                  id title availableForSale sku
                  price { amount currencyCode }
                  compareAtPrice { amount currencyCode }
                }
              }
            }

            seo { title description }

            # ── All metafields via identifiers — works without Storefront API toggle ──
            metafields(identifiers: [
              {namespace: "custom", key: "saltd_flavor_tagline"},
              {namespace: "custom", key: "saltd_flavor_color"},
              {namespace: "custom", key: "saltd_flavor_bg"},
              {namespace: "custom", key: "saltd_features"},
              {namespace: "custom", key: "saltd_science_copy"},
              {namespace: "custom", key: "saltd_ingredients"},
              {namespace: "custom", key: "saltd_faq_1_q"},
              {namespace: "custom", key: "saltd_faq_1_a"},
              {namespace: "custom", key: "saltd_faq_2_q"},
              {namespace: "custom", key: "saltd_faq_2_a"},
              {namespace: "custom", key: "saltd_faq_3_q"},
              {namespace: "custom", key: "saltd_faq_3_a"},
              {namespace: "custom", key: "saltd_faq_4_q"},
              {namespace: "custom", key: "saltd_faq_4_a"}
            ]) { namespace key value }
          }
        }
      }
    }
  `);
  return data.products.edges.map(({ node: p }) => {
    // Parse metafields array returned by identifiers query
    const mfArray = (p['metafields'] as { namespace: string; key: string; value: string }[] | null) ?? [];
    const get = (key: string): string | null =>
      mfArray.find(m => m?.key === key)?.value ?? null;

    const parseJSON = <T>(raw: string | null, fallback: T): T => {
      if (!raw || raw.length > 50_000) return fallback;
      try { return JSON.parse(raw) as T; } catch { return fallback; }
    };

    const handle = p.handle as string;

    const features = parseJSON<string[]>(
      get('saltd_features'),
      ['6 Electrolytes', 'Infused Ashwagandha', 'All 8 Vitamins', 'Zero Sugar']
    );

    const ingredients = parseJSON<{ name: string; amount: string; role: string }[]>(
      get('saltd_ingredients'),
      PRODUCT_INGREDIENTS_FALLBACK[handle] ?? PRODUCT_INGREDIENTS_FALLBACK['kala-khatta']
    );

    // Build FAQs — from individual metafields, fall back to hardcoded
    const liveFaqs: { q: string; a: string }[] = [];
    for (let i = 1; i <= 4; i++) {
      const q = get(`saltd_faq_${i}_q`);
      const a = get(`saltd_faq_${i}_a`);
      if (q && a) liveFaqs.push({ q, a });
    }
    const faqs = liveFaqs.length > 0
      ? liveFaqs
      : (PRODUCT_FAQS_FALLBACK[handle] ?? PRODUCT_FAQS_FALLBACK['kala-khatta']);

    // flavorColor and flavorBg now come via get() from the metafields array
    const rawFlavorColor = get('saltd_flavor_color');
    const rawFlavorBg    = get('saltd_flavor_bg');

    return {
      ...(p as Omit<ShopifyProductFull, 'flavorSubtitle' | 'features' | 'scienceText' | 'ingredients' | 'faqs' | 'flavorColor' | 'flavorBg'>),
      flavorColor:   rawFlavorColor,
      flavorBg:      rawFlavorBg,
      flavorSubtitle: get('saltd_flavor_tagline'),
      features,
      scienceText: get('saltd_science_copy') ?? (PRODUCT_SCIENCE_FALLBACK[handle] ?? PRODUCT_SCIENCE_FALLBACK['kala-khatta']),
      ingredients,
      faqs,
    } as ShopifyProductFull;
  });
}


// ═══════════════════════════════════════════════════════════════
// SECTION 3 — SEO HELPERS
// ═══════════════════════════════════════════════════════════════

interface SEOMeta { title: string; description: string; ogImage?: string }

export function setSEO({ title, description, ogImage }: SEOMeta) {
  document.title = title;
  const setMeta = (name: string, content: string, prop = false) => {
    const sel = prop ? `meta[property="${name}"]` : `meta[name="${name}"]`;
    let el = document.querySelector<HTMLMetaElement>(sel);
    if (!el) { el = document.createElement('meta'); if (prop) el.setAttribute('property', name); else el.name = name; document.head.appendChild(el); }
    el.content = content;
  };
  setMeta('description', description);
  setMeta('og:title', title, true);
  setMeta('og:description', description, true);
  if (ogImage) setMeta('og:image', ogImage, true);
}

export function seoForPage(page: string, description: string): SEOMeta {
  return { title: `SALTD. — ${page}`, description };
}


// ═══════════════════════════════════════════════════════════════
// SECTION 4 — CART TYPES + FRAGMENT
// ═══════════════════════════════════════════════════════════════

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    priceV2: { amount: string; currencyCode: string };
    image: { url: string; altText: string | null } | null;
    product: { title: string; handle: string; featuredImage: { url: string } | null };
  };
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    totalAmount:    { amount: string; currencyCode: string };
    subtotalAmount: { amount: string; currencyCode: string };
  };
  lines: { edges: { node: ShopifyCartLine }[] };
}

const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id checkoutUrl totalQuantity
    cost {
      totalAmount    { amount currencyCode }
      subtotalAmount { amount currencyCode }
    }
    lines(first: 50) {
      edges {
        node {
          id quantity
          merchandise {
            ... on ProductVariant {
              id title
              priceV2 { amount currencyCode }
              image { url altText }
              product { title handle featuredImage { url } }
            }
          }
        }
      }
    }
  }
`;


// ═══════════════════════════════════════════════════════════════
// SECTION 5 — CART OPERATIONS
// ═══════════════════════════════════════════════════════════════

export async function cartCreate(): Promise<ShopifyCart> {
  const data = await gql<{ cartCreate: { cart: ShopifyCart; userErrors: { message: string }[] } }>(`
    mutation cartCreate {
      cartCreate {
        cart { ...CartFields }
        userErrors { field message }
      }
    }
    ${CART_FRAGMENT}
  `);
  if (data.cartCreate.userErrors.length) throw new Error(data.cartCreate.userErrors[0].message);
  return data.cartCreate.cart;
}

export async function cartAddLines(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
): Promise<ShopifyCart> {
  const data = await gql<{ cartLinesAdd: { cart: ShopifyCart; userErrors: { message: string }[] } }>(`
    mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { ...CartFields }
        userErrors { field message }
      }
    }
    ${CART_FRAGMENT}
  `, { cartId, lines });
  if (data.cartLinesAdd.userErrors.length) throw new Error(data.cartLinesAdd.userErrors[0].message);
  return data.cartLinesAdd.cart;
}

export async function cartUpdateLines(
  cartId: string,
  lines: { id: string; quantity: number }[]
): Promise<ShopifyCart> {
  const data = await gql<{ cartLinesUpdate: { cart: ShopifyCart; userErrors: { message: string }[] } }>(`
    mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart { ...CartFields }
        userErrors { field message }
      }
    }
    ${CART_FRAGMENT}
  `, { cartId, lines });
  if (data.cartLinesUpdate.userErrors.length) throw new Error(data.cartLinesUpdate.userErrors[0].message);
  return data.cartLinesUpdate.cart;
}

export async function cartRemoveLines(
  cartId: string,
  lineIds: string[]
): Promise<ShopifyCart> {
  const data = await gql<{ cartLinesRemove: { cart: ShopifyCart; userErrors: { message: string }[] } }>(`
    mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart { ...CartFields }
        userErrors { field message }
      }
    }
    ${CART_FRAGMENT}
  `, { cartId, lineIds });
  if (data.cartLinesRemove.userErrors.length) throw new Error(data.cartLinesRemove.userErrors[0].message);
  return data.cartLinesRemove.cart;
}

export async function cartFetch(cartId: string): Promise<ShopifyCart | null> {
  try {
    const data = await gql<{ cart: ShopifyCart | null }>(`
      query cartFetch($cartId: ID!) {
        cart(id: $cartId) { ...CartFields }
      }
      ${CART_FRAGMENT}
    `, { cartId });
    return data.cart;
  } catch { return null; }
}

export function goToCheckout(checkoutUrl: string): void {
  try {
    const url     = new URL(checkoutUrl);
    const trusted = ['.myshopify.com', 'checkout.shopify.com', 'shop.app'];
    if (!trusted.some(d => url.hostname.endsWith(d))) {
      console.error('[SALTD] Blocked redirect to untrusted host:', url.hostname);
      return;
    }
    window.location.href = checkoutUrl;
  } catch {
    console.error('[SALTD] Invalid checkout URL — redirect blocked.');
  }
}


// ═══════════════════════════════════════════════════════════════
// SECTION 6 — CUSTOMER AUTH
// ═══════════════════════════════════════════════════════════════

export interface CustomerAccessToken {
  accessToken: string;
  expiresAt: string;
}

export async function customerLogin(email: string, password: string): Promise<CustomerAccessToken> {
  const data = await gql<{
    customerAccessTokenCreate: {
      customerAccessToken: CustomerAccessToken | null;
      customerUserErrors: { code: string; field: string[]; message: string }[];
    };
  }>(`
    mutation login($email: String!, $password: String!) {
      customerAccessTokenCreate(input: { email: $email, password: $password }) {
        customerAccessToken { accessToken expiresAt }
        customerUserErrors  { code field message }
      }
    }
  `, { email, password });

  const r = data.customerAccessTokenCreate;
  // Generic message regardless of error type — prevents account enumeration
  if (r.customerUserErrors.length || !r.customerAccessToken) {
    throw new Error('Incorrect email or password. Please try again.');
  }
  return r.customerAccessToken;
}

export async function customerRegister(
  firstName: string, email: string, password: string
): Promise<CustomerAccessToken> {
  const data = await gql<{
    customerCreate: {
      customer: { id: string } | null;
      customerUserErrors: { code: string; field: string[]; message: string }[];
    };
  }>(`
    mutation register($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer { id }
        customerUserErrors { code field message }
      }
    }
  `, { input: { firstName, email, password, acceptsMarketing: true } });

  const r = data.customerCreate;
  if (r.customerUserErrors.length) throw new Error(r.customerUserErrors[0].message);
  if (!r.customer) throw new Error('Registration failed.');
  return customerLogin(email, password);
}

export async function customerLogout(accessToken: string): Promise<void> {
  await gql(`
    mutation logout($token: String!) {
      customerAccessTokenDelete(customerAccessToken: $token) {
        deletedAccessToken
        userErrors { field message }
      }
    }
  `, { token: accessToken }).catch((e: unknown) => {
    console.warn('[SALTD] Logout API call failed (token may already be expired):', e);
  });
}


// ═══════════════════════════════════════════════════════════════
// SECTION 7 — ORDERS
// ═══════════════════════════════════════════════════════════════

export interface ShopifyOrder {
  id: string;
  name: string;
  processedAt: string;
  fulfillmentStatus: string;
  financialStatus: string;
  currentTotalPrice: { amount: string; currencyCode: string };
  lineItems: {
    edges: {
      node: {
        title: string;
        quantity: number;
        variant: {
          title: string;
          priceV2: { amount: string; currencyCode: string };
          image: { url: string } | null;
        } | null;
      };
    }[];
  };
  shippingAddress: {
    firstName: string;
    address1: string;
    city: string;
    country: string;
    zip: string;
  } | null;
  successfulFulfillments: {
    trackingInfo: { number: string; url: string | null }[];
  }[];
}

export async function getCustomerOrders(customerAccessToken: string): Promise<ShopifyOrder[]> {
  const data = await gql<{
    customer: { orders: { edges: { node: ShopifyOrder }[] } } | null;
  }>(`
    query getOrders($token: String!) {
      customer(customerAccessToken: $token) {
        orders(first: 20, sortKey: PROCESSED_AT, reverse: true) {
          edges {
            node {
              id name processedAt fulfillmentStatus financialStatus
              currentTotalPrice { amount currencyCode }
              lineItems(first: 10) {
                edges {
                  node {
                    title quantity
                    variant {
                      title
                      priceV2 { amount currencyCode }
                      image { url }
                    }
                  }
                }
              }
              shippingAddress { firstName address1 city country zip }
              successfulFulfillments(first: 5) {
                trackingInfo { number url }
              }
            }
          }
        }
      }
    }
  `, { token: customerAccessToken });

  if (!data.customer) throw new Error('Invalid or expired session — please sign in again.');
  return data.customer.orders.edges.map(e => e.node);
}


// ═══════════════════════════════════════════════════════════════
// SECTION 8 — ORDER STATUS + FORMAT HELPERS
// ═══════════════════════════════════════════════════════════════

export type OrderStage = 'placed' | 'confirmed' | 'shipped' | 'out_for_delivery' | 'delivered';
export const STAGE_KEYS: OrderStage[] = ['placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered'];

export function getOrderStage(order: ShopifyOrder): OrderStage {
  const ff  = (order.fulfillmentStatus ?? '').toUpperCase();
  const fin = (order.financialStatus  ?? '').toUpperCase();
  if (ff === 'FULFILLED')        return 'delivered';
  if (ff === 'IN_TRANSIT')       return 'shipped';
  if (ff === 'OUT_FOR_DELIVERY') return 'out_for_delivery';
  if (ff === 'PARTIAL' || ff === 'UNFULFILLED') return fin === 'PAID' ? 'confirmed' : 'placed';
  return 'placed';
}

export function formatOrderDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return iso; }
}

export function formatPrice(amount: string, currency = 'INR'): string {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(parseFloat(amount));
  } catch { return `₹${amount}`; }
}

export function getSticksFromOrder(order: ShopifyOrder): number {
  return order.lineItems.edges.reduce((total, { node }) => {
    const match = (node.variant?.title ?? node.title).match(/\((\d+)\)/);
    const sticksPerBox = match ? parseInt(match[1], 10) : 10;
    return total + node.quantity * sticksPerBox;
  }, 0);
}

// Legacy alias — used by older components
export { fetchAllProducts as fetchProducts };


// ═══════════════════════════════════════════════════════════════
// SECTION 9 — GUEST ORDER LOOKUP
//
// Shopify Storefront API does not support guest order lookup by
// email — that requires the Admin API (server-side only).
// 
// For production: create a Netlify/Vercel serverless function at
// /api/lookup-order that calls:
//   GET https://{store}.myshopify.com/admin/api/2024-10/orders.json
//       ?name={orderId}&email={email}&status=any
// with your Admin API key (never expose this in frontend code).
//
// The function below handles both demo mode and the production
// serverless endpoint automatically.
// ═══════════════════════════════════════════════════════════════

export async function guestOrderLookup(
  orderId: string,
  email: string
): Promise<{ found: boolean; order: ShopifyOrder | null; error?: string }> {
  const normalized = orderId.trim().replace(/^#/, '').replace(/[^a-zA-Z0-9-]/g, '').slice(0, 20);
  const cleanEmail = email.trim().toLowerCase().slice(0, 254);
  if (!normalized) return { found: false, order: null, error: 'Please enter a valid order ID.' };
  if (!cleanEmail.includes('@') || cleanEmail.length < 5) return { found: false, order: null, error: 'Please enter a valid email address.' };

  // In production: call your serverless function
  try {
    const res = await fetch(`/api/lookup-order?orderId=${encodeURIComponent(normalized)}&email=${encodeURIComponent(cleanEmail)}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
    // Serverless function not deployed yet — fall through to demo
  } catch {
    // Serverless function not available — fall through to demo
  }

  // Demo fallback (works before serverless is deployed)
  return { found: false, order: null, error: 'DEMO_MODE' };
}

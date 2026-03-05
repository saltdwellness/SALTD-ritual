// Story.tsx — Why SALTD. page — fully dynamic via Shopify metaobject "story_settings"
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const ACCENT = '#2E5BFF';

interface StoryContent {
  heroLabel:      string;
  heroHeadline:   string;
  heroBody1:      string;
  heroBody2:      string;
  heroCTA:        string;
  missionLabel:   string;
  missionHeadline:string;
  missionBody:    string;
  point1Title:    string;
  point1Body:     string;
  point2Title:    string;
  point2Body:     string;
  point3Title:    string;
  point3Body:     string;
}

const DEFAULT: StoryContent = {
  heroLabel:       'Our Mission',
  heroHeadline:    'Hydration Without Compromise',
  heroBody1:       "Every ingredient in SALTD. has a purpose. We don't add anything that doesn't contribute to the core goal: clean, effective hydration for daily performance.",
  heroBody2:       "No sugar, no artificial sweeteners, no preservatives, no fillers. Just what your body actually needs.",
  heroCTA:         'Shop SALTD. →',
  missionLabel:    'Our Story',
  missionHeadline: 'Born in Indian Heat. Built to Perform.',
  missionBody:     'SALTD. was created because most hydration options in India were either loaded with sugar, full of artificial ingredients, or designed for the wrong climate entirely. We set out to build a clean electrolyte supplement that actually works for real Indian conditions — the heat, the long hours, the fasting, the workouts — without any compromise on ingredients.',
  point1Title:     'Zero Sugar, Full Spectrum',
  point1Body:      'Every stick delivers a complete ionic profile — sodium, potassium, magnesium, calcium, chloride, and phosphate — without a gram of sugar.',
  point2Title:     'Nostalgia as a Vector',
  point2Body:      'We took the flavours Indian childhoods are built on and made them the delivery mechanism for serious hydration science.',
  point3Title:     'One Stick. Every Day.',
  point3Body:      'Consistency beats intensity. A daily ritual of one stick builds cellular hydration that compounds over weeks and months.',
};

async function fetchStoryContent(): Promise<StoryContent> {
  // Reads from metaobject(handle:"main", type:"story_settings")
  // Falls back to defaults if not set up yet
  try {
    const DOMAIN = (import.meta as { env: Record<string,string> }).env.VITE_SHOPIFY_STORE_DOMAIN;
    const TOKEN  = (import.meta as { env: Record<string,string> }).env.VITE_SHOPIFY_STOREFRONT_TOKEN;
    if (!DOMAIN || !TOKEN) return DEFAULT;
    const res = await fetch(`https://${DOMAIN}/api/2024-10/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': TOKEN },
      body: JSON.stringify({ query: `{
        metaobject(handle:{handle:"main",type:"story_settings"}){
          fields{key value}
        }
      }` }),
    });
    const json = await res.json();
    const mo = json?.data?.metaobject;
    if (!mo) return DEFAULT;
    const f: Record<string,string> = {};
    for (const field of mo.fields) f[field.key] = field.value;
    return {
      heroLabel:       f['hero_label']        ?? DEFAULT.heroLabel,
      heroHeadline:    f['hero_headline']      ?? DEFAULT.heroHeadline,
      heroBody1:       f['hero_body_1']        ?? DEFAULT.heroBody1,
      heroBody2:       f['hero_body_2']        ?? DEFAULT.heroBody2,
      heroCTA:         f['hero_cta']           ?? DEFAULT.heroCTA,
      missionLabel:    f['mission_label']      ?? DEFAULT.missionLabel,
      missionHeadline: f['mission_headline']   ?? DEFAULT.missionHeadline,
      missionBody:     f['mission_body']       ?? DEFAULT.missionBody,
      point1Title:     f['point_1_title']      ?? DEFAULT.point1Title,
      point1Body:      f['point_1_body']       ?? DEFAULT.point1Body,
      point2Title:     f['point_2_title']      ?? DEFAULT.point2Title,
      point2Body:      f['point_2_body']       ?? DEFAULT.point2Body,
      point3Title:     f['point_3_title']      ?? DEFAULT.point3Title,
      point3Body:      f['point_3_body']       ?? DEFAULT.point3Body,
    };
  } catch { return DEFAULT; }
}

const Story: React.FC = () => {
  const [content, setContent] = useState<StoryContent>(DEFAULT);
  useEffect(() => { fetchStoryContent().then(setContent); }, []);

  const points = [
    { n: '01', title: content.point1Title, body: content.point1Body },
    { n: '02', title: content.point2Title, body: content.point2Body },
    { n: '03', title: content.point3Title, body: content.point3Body },
  ];

  return (
    <div className="bg-[#FAFAF8] min-h-screen">

      {/* ── HERO — "The Mission" moved here ── */}
      <section className="bg-white py-24 md:py-36 px-6 md:px-12">
        <div className="max-w-[900px] mx-auto">
          <p className="text-xs font-black uppercase tracking-[0.5em] mb-6" style={{ color: ACCENT }}>
            "{content.heroLabel}"
          </p>
          <h1 className="font-black text-[#0D0D10] leading-[0.97] tracking-[-0.04em] mb-8"
            style={{ fontSize: 'clamp(2.8rem, 7vw, 6rem)' }}>
            {content.heroHeadline}
          </h1>
          <div className="max-w-[640px] space-y-4 mb-12">
            <p className="text-lg text-[#1A1A1A]/60 leading-relaxed font-medium">{content.heroBody1}</p>
            <p className="text-base text-[#1A1A1A]/45 leading-relaxed font-medium">{content.heroBody2}</p>
          </div>
          <Link to="/shop"
            className="inline-block px-10 py-5 text-sm font-black uppercase tracking-[0.3em] text-white rounded-full transition-all hover:scale-105"
            style={{ background: ACCENT }}>
            {content.heroCTA}
          </Link>
        </div>
      </section>

      {/* ── ORIGIN — dark section ── */}
      <section className="relative overflow-hidden py-20 md:py-32 px-6 md:px-12"
        style={{ background: `radial-gradient(ellipse at 60% 50%, ${ACCENT}12 0%, transparent 60%), #0D0D10` }}>
        <div className="max-w-[900px] mx-auto">
          <p className="text-xs font-black uppercase tracking-[0.5em] mb-6" style={{ color: ACCENT }}>
            "{content.missionLabel}"
          </p>
          <h2 className="font-black text-white leading-[0.95] tracking-[-0.04em] mb-8"
            style={{ fontSize: 'clamp(2rem, 5vw, 4.4rem)' }}>
            {content.missionHeadline.split('.').filter(Boolean).map((line, i, arr) => (
              <span key={i}>
                {i === arr.length - 1
                  ? <span style={{ color: ACCENT }}>{line.trim()}.</span>
                  : <>{line.trim()}.<br /></>}
              </span>
            ))}
          </h2>
          <p className="text-base md:text-lg text-white/55 font-medium leading-relaxed max-w-[640px]">
            {content.missionBody}
          </p>
        </div>
      </section>

      {/* ── THREE PILLARS — Clean Hydration section, no vectors ── */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-[#FAFAF8]">
        <div className="max-w-[900px] mx-auto">
          <p className="text-xs font-black uppercase tracking-[0.5em] mb-10" style={{ color: ACCENT }}>
            "Clean Hydration"
          </p>
          <div className="space-y-8">
            {points.map(pt => (
              <div key={pt.n} className="flex gap-6 pb-8 border-b last:border-0 last:pb-0" style={{ borderColor: 'rgba(26,26,26,0.07)' }}>
                <span className="text-sm font-black uppercase tracking-[0.4em] mt-1 shrink-0 w-7 text-right" style={{ color: ACCENT }}>{pt.n}</span>
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-[#1A1A1A] mb-2">{pt.title}</h3>
                  <p className="text-base font-medium leading-relaxed" style={{ color: 'rgba(26,26,26,0.55)' }}>{pt.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Story;

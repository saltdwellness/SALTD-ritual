// IngredientsPage.tsx — "Why Our Product" brand page for SALTD.
import React from 'react';
import { Link } from 'react-router-dom';

const ACCENT = '#2E5BFF';

const IngredientsPage: React.FC = () => {
  return (
    <div className="bg-[#FAFAF8] min-h-screen">

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: `radial-gradient(ellipse at 60% 50%, ${ACCENT}12 0%, transparent 60%), #0D0D10` }}
      >
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-28 md:py-40 text-center">
          <p
            className="text-xs font-black uppercase tracking-[0.5em] mb-6"
            style={{ color: ACCENT }}
          >
            "Clean Hydration"
          </p>
          <h1
            className="font-black text-white leading-[0.95] tracking-[-0.04em] mb-8"
            style={{ fontSize: 'clamp(2.8rem, 7vw, 6rem)' }}
          >
            Zero Sugar Electrolyte
            <br />
            <span style={{ color: ACCENT }}>Drink Mix</span>
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-[560px] mx-auto leading-relaxed font-medium">
            For Energy, Focus & Daily Performance in Modern India.
          </p>
          <div className="flex items-center justify-center gap-4 mt-10">
            <Link
              to="/shop"
              className="inline-block px-8 py-4 text-sm font-black uppercase tracking-[0.3em] text-white rounded-full transition-all hover:scale-105"
              style={{ background: ACCENT }}
            >
              Shop Now →
            </Link>
          </div>
        </div>
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </section>

      {/* ── The Problem ── */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.5em] mb-4" style={{ color: ACCENT }}>"The Problem"</p>
              <h2
                className="font-black text-[#0D0D10] leading-[1.05] tracking-[-0.03em] mb-6"
                style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
              >
                Clean Hydration for
                <br />Modern India
              </h2>
              <div className="space-y-4 text-base text-[#1A1A1A]/65 leading-relaxed font-medium">
                <p>India is hot. Our days are long. And most of us are mildly dehydrated without realizing it.</p>
                <p>Brain fog at work. Fatigue during fasting. Headaches after workouts. Energy crashes by mid-afternoon.</p>
                <p className="font-bold text-[#0D0D10]/80">It's not always sleep. It's often low electrolytes.</p>
                <p>SALTD. is a zero sugar electrolyte hydration powder designed to restore sodium, potassium, and magnesium — so you feel sharper, steadier, and more energized without relying on caffeine.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { symptom: 'Brain fog', icon: '🧠' },
                { symptom: 'Muscle cramps', icon: '⚡' },
                { symptom: 'Low stamina', icon: '📉' },
                { symptom: 'Headaches', icon: '😵' },
                { symptom: 'Afternoon crashes', icon: '☕' },
                { symptom: 'Sluggish workouts', icon: '🏋️' },
              ].map(({ symptom, icon }) => (
                <div
                  key={symptom}
                  className="flex items-center gap-3 p-4 rounded-2xl border border-[#0D0D10]/[0.07] bg-[#FAFAF8]"
                >
                  <span className="text-xl">{icon}</span>
                  <span className="text-sm font-bold text-[#0D0D10]/70">{symptom}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Water Alone Isn't Enough ── */}
      <section className="py-24 md:py-32 bg-[#FAFAF8]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12 text-center">
          <p className="text-xs font-black uppercase tracking-[0.5em] mb-4" style={{ color: ACCENT }}>"The Science"</p>
          <h2
            className="font-black text-[#0D0D10] leading-[1.05] tracking-[-0.03em] mb-6"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}
          >
            Why Water Alone Is Not Enough
          </h2>
          <p className="text-base md:text-lg text-[#1A1A1A]/60 leading-relaxed max-w-[680px] mx-auto font-medium">
            When you sweat, train, commute, sit in AC, fast, or live in Indian heat — you lose essential minerals. Without replacing them, your body can't retain fluids properly. SALTD. helps your cells actually hold water — instead of just flushing it out.
          </p>
        </div>
      </section>

      {/* ── Core Electrolytes ── */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <p className="text-xs font-black uppercase tracking-[0.5em] mb-4" style={{ color: ACCENT }}>"What's Inside"</p>
            <h2
              className="font-black text-[#0D0D10] leading-[1.05] tracking-[-0.03em]"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
            >
              Each SALTD. Sachet Contains
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                mineral: 'Sodium',
                symbol: 'Na',
                subtitle: 'The Foundation of Effective Hydration',
                color: '#2E5BFF',
                supports: ['Fluid balance', 'Mental clarity', 'Muscle contraction', 'Sustained energy'],
                note: 'Essential for Indian summers and sweaty sessions.',
              },
              {
                mineral: 'Potassium',
                symbol: 'K',
                subtitle: 'Cellular Hydration & Muscle Balance',
                color: '#8A307F',
                supports: ['Prevent cramps', 'Improve stamina', 'Balance sodium levels', 'Maintain muscle performance'],
                note: 'The partner mineral that makes sodium work.',
              },
              {
                mineral: 'Magnesium',
                symbol: 'Mg',
                subtitle: 'Recovery & Nervous System Balance',
                color: '#E8845A',
                supports: ['Reduce fatigue', 'Muscle relaxation', 'Steady focus', 'Sleep quality'],
                note: 'The mineral most Indians are chronically low in.',
              },
            ].map(({ mineral, symbol, subtitle, color, supports, note }) => (
              <div
                key={mineral}
                className="rounded-3xl p-8 border border-[#0D0D10]/[0.07] bg-[#FAFAF8] hover:-translate-y-1 transition-transform"
              >
                <div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6 text-white font-black"
                  style={{ background: color, fontSize: symbol.length > 2 ? '0.95rem' : '1.1rem', letterSpacing: '-0.03em' }}
                >
                  {symbol}
                </div>
                <h3 className="text-2xl font-black text-[#0D0D10] tracking-[-0.02em] mb-1">{mineral}</h3>
                <p className="text-sm font-bold text-[#0D0D10]/50 mb-5">{subtitle}</p>
                <div className="space-y-2 mb-5">
                  {supports.map(s => (
                    <div key={s} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                      <span className="text-sm font-medium text-[#0D0D10]/65">{s}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs font-semibold text-[#0D0D10]/45 border-t border-[#0D0D10]/[0.06] pt-4">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Monk Fruit Section ── */}
      <section
        className="py-24 md:py-32 overflow-hidden"
        style={{ background: `radial-gradient(ellipse at 30% 60%, ${ACCENT}0D 0%, transparent 60%), #0D0D10` }}
      >
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.5em] mb-4" style={{ color: ACCENT }}>"Natural Sweetness"</p>
              <h2
                className="font-black text-white leading-[1.05] tracking-[-0.03em] mb-6"
                style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
              >
                Sweetened with
                <br />
                <span style={{ color: ACCENT }}>Monk Fruit</span>
              </h2>
              <p className="text-base text-white/60 leading-relaxed mb-8 font-medium">
                Most electrolyte drinks in India contain added sugar. Many "sugar-free" options use artificial sweeteners like sucralose or aspartame. SALTD. uses Monk Fruit extract instead — a plant-based sweetener that provides natural sweetness without any compromise.
              </p>
              <div className="space-y-3">
                {[
                  'Does not raise blood sugar',
                  'Does not spike insulin',
                  'No energy crashes',
                  'No chemical aftertaste',
                  'No sugar alcohol bloating',
                ].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-black" style={{ background: ACCENT }}>✓</div>
                    <span className="text-sm font-semibold text-white/70">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  label: 'Daily Hydration', desc: 'Use it every day without worry',
                  icon: <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                    <path d="M16 4 C16 4 8 14 8 20 C8 26 11.6 28 16 28 C20.4 28 24 26 24 20 C24 14 16 4 16 4Z" fill="#2E5BFF" opacity="0.25"/>
                    <path d="M16 10 C16 10 11 17 11 21 C11 24 13 26 16 26 C19 26 21 24 21 21 C21 17 16 10 16 10Z" fill="#2E5BFF" opacity="0.7"/>
                    <path d="M12 22 C12 24 13.8 25.5 16 25.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
                  </svg>
                },
                {
                  label: 'Intermittent Fasting', desc: 'Zero sugar, zero insulin spike',
                  icon: <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="12" stroke="#2E5BFF" strokeWidth="1.8" opacity="0.4"/>
                    <path d="M16 8 L16 17 L21 21" stroke="#2E5BFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="16" cy="16" r="2" fill="#2E5BFF" opacity="0.8"/>
                  </svg>
                },
                {
                  label: 'Keto / Low-Carb', desc: 'Fits any carb-restricted diet',
                  icon: <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                    <path d="M6 22 L12 14 L17 19 L22 10 L26 16" stroke="#2E5BFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
                    <circle cx="26" cy="16" r="3" fill="#2E5BFF" opacity="0.9"/>
                    <path d="M6 26 L26 26" stroke="#2E5BFF" strokeWidth="1.5" opacity="0.3"/>
                  </svg>
                },
                {
                  label: 'Caffeine-Free', desc: 'Steady energy without crashes',
                  icon: <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                    <path d="M10 8 L10 20 C10 23.3 12.7 26 16 26 C19.3 26 22 23.3 22 20 L22 8 Z" fill="#2E5BFF" opacity="0.15" stroke="#2E5BFF" strokeWidth="1.8"/>
                    <path d="M22 11 C24 11 26 12.5 26 15 C26 17.5 24 19 22 19" stroke="#2E5BFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.7"/>
                    <path d="M13 14 L19 14 M13 18 L17 18" stroke="#2E5BFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
                  </svg>
                },
              ].map(({ label, desc, icon }) => (
                <div
                  key={label}
                  className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.05]"
                >
                  <div className="mb-3 opacity-90">{icon}</div>
                  <p className="text-sm font-black text-white mb-1">{label}</p>
                  <p className="text-xs text-white/45 font-medium">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Who It's For ── */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <p className="text-xs font-black uppercase tracking-[0.5em] mb-4" style={{ color: ACCENT }}>"Built For"</p>
            <h2
              className="font-black text-[#0D0D10] leading-[1.05] tracking-[-0.03em]"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
            >
              Everyday India
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {([
              { label: 'Gym & Strength Training', icon: (
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect x="2" y="13" width="5" height="6" rx="2" fill="#2E5BFF" opacity="0.4"/>
                  <rect x="25" y="13" width="5" height="6" rx="2" fill="#2E5BFF" opacity="0.4"/>
                  <rect x="7" y="11" width="4" height="10" rx="2" fill="#2E5BFF" opacity="0.7"/>
                  <rect x="21" y="11" width="4" height="10" rx="2" fill="#2E5BFF" opacity="0.7"/>
                  <rect x="11" y="14" width="10" height="4" rx="2" fill="#2E5BFF"/>
                </svg>
              )},
              { label: 'Yoga & Hot Yoga', icon: (
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="6" r="3" fill="#2E5BFF" opacity="0.8"/>
                  <path d="M16 9 L16 19 M10 13 L16 15 L22 13 M13 19 L10 26 M19 19 L22 26" stroke="#2E5BFF" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )},
              { label: 'Long Office Hours', icon: (
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect x="4" y="6" width="24" height="16" rx="3" stroke="#2E5BFF" strokeWidth="1.8" fill="#2E5BFF" opacity="0.08"/>
                  <rect x="8" y="10" width="16" height="2" rx="1" fill="#2E5BFF" opacity="0.5"/>
                  <rect x="8" y="14" width="10" height="2" rx="1" fill="#2E5BFF" opacity="0.35"/>
                  <path d="M12 22 L12 26 L20 26 L20 22" stroke="#2E5BFF" strokeWidth="1.8" strokeLinecap="round"/>
                  <line x1="9" y1="26" x2="23" y2="26" stroke="#2E5BFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.5"/>
                </svg>
              )},
              { label: 'Students & Exam Prep', icon: (
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect x="6" y="4" width="20" height="24" rx="3" stroke="#2E5BFF" strokeWidth="1.8" fill="#2E5BFF" opacity="0.07"/>
                  <line x1="10" y1="10" x2="22" y2="10" stroke="#2E5BFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.7"/>
                  <line x1="10" y1="15" x2="22" y2="15" stroke="#2E5BFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.5"/>
                  <line x1="10" y1="20" x2="17" y2="20" stroke="#2E5BFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.35"/>
                </svg>
              )},
              { label: 'Intermittent Fasting', icon: (
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="12" stroke="#2E5BFF" strokeWidth="1.8" opacity="0.35"/>
                  <path d="M16 8 L16 17 L21 21" stroke="#2E5BFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="16" cy="16" r="2" fill="#2E5BFF"/>
                </svg>
              )},
              { label: 'Runners & Cyclists', icon: (
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <circle cx="22" cy="8" r="3" fill="#2E5BFF" opacity="0.8"/>
                  <path d="M22 11 L20 16 L14 18 M20 16 L22 22 M14 18 L10 24 M14 18 L16 24" stroke="#2E5BFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )},
              { label: 'Outdoor Workers', icon: (
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="14" r="5" fill="#2E5BFF" opacity="0.8"/>
                  <line x1="16" y1="4" x2="16" y2="7" stroke="#2E5BFF" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
                  <line x1="16" y1="21" x2="16" y2="24" stroke="#2E5BFF" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
                  <line x1="6" y1="14" x2="9" y2="14" stroke="#2E5BFF" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
                  <line x1="23" y1="14" x2="26" y2="14" stroke="#2E5BFF" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
                  <line x1="9" y1="7" x2="11" y2="9" stroke="#2E5BFF" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
                  <line x1="21" y1="19" x2="23" y2="21" stroke="#2E5BFF" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
                  <path d="M6 26 C6 26 10 20 16 20 C22 20 26 26 26 26" fill="#2E5BFF" opacity="0.12"/>
                </svg>
              )},
              { label: 'Anyone Drained by Mid-Day', icon: (
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M16 4 L19 12 L28 12 L21 18 L24 26 L16 21 L8 26 L11 18 L4 12 L13 12 Z" fill="#2E5BFF" opacity="0.2" stroke="#2E5BFF" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M16 8 L18 13 L23 13 L19 16.5 L21 22 L16 18.5 L11 22 L13 16.5 L9 13 L14 13 Z" fill="#2E5BFF" opacity="0.8"/>
                </svg>
              )},
            ] as Array<{label: string; icon: React.ReactNode}>).map(({ label, icon }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-[#0D0D10]/[0.07] bg-[#FAFAF8] text-center hover:-translate-y-1 transition-transform"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#2E5BFF14' }}>{icon}</div>
                <span className="text-sm font-bold text-[#0D0D10]/70 leading-snug">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Always Free From ── */}
      <section className="py-24 md:py-32 bg-[#FAFAF8]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12 text-center">
          <p className="text-xs font-black uppercase tracking-[0.5em] mb-4" style={{ color: ACCENT }}>"Clean Label"</p>
          <h2
            className="font-black text-[#0D0D10] leading-[1.05] tracking-[-0.03em] mb-12"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Always Free From
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'Added Sugar',
              'Artificial Sweeteners',
              'Artificial Colours',
              'Preservatives',
              'Sugar Alcohols',
              'Gums & Thickeners',
              'Ingredient Fluff',
              'Empty Calories',
            ].map(item => (
              <div
                key={item}
                className="flex items-center gap-2 p-4 rounded-2xl bg-white border border-[#0D0D10]/[0.07]"
              >
                <span className="text-red-400 font-black text-base">✕</span>
                <span className="text-sm font-bold text-[#0D0D10]/65">{item}</span>
              </div>
            ))}
          </div>
          <p className="mt-10 text-base font-semibold text-[#0D0D10]/50">Every ingredient has a purpose. Nothing doesn't.</p>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section
        className="py-28 md:py-36 text-center overflow-hidden"
        style={{ background: `radial-gradient(ellipse at 50% 50%, ${ACCENT}18 0%, transparent 65%), #0D0D10` }}
      >
        <div className="max-w-[700px] mx-auto px-6">
          <p className="text-xs font-black uppercase tracking-[0.5em] mb-6" style={{ color: ACCENT }}>"Hydration Without Compromise"</p>
          <h2
            className="font-black text-white leading-[0.95] tracking-[-0.04em] mb-6"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}
          >
            Hydration
            <br />
            That Actually Works
          </h2>
          <p className="text-lg text-white/55 mb-10 font-medium leading-relaxed">
            Not a sugary sports drink. Not a medical ORS. Not a temporary energy fix. A clean electrolyte supplement designed for daily performance.
          </p>
          <Link
            to="/shop"
            className="inline-block px-10 py-5 text-sm font-black uppercase tracking-[0.3em] text-white rounded-full transition-all hover:scale-105"
            style={{ background: ACCENT }}
          >
            Start Your Ritual →
          </Link>
        </div>
      </section>

    </div>
  );
};

export default IngredientsPage;

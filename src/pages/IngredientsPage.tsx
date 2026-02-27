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
                subtitle: 'The Foundation of Effective Hydration',
                color: '#2E5BFF',
                supports: ['Fluid balance', 'Mental clarity', 'Muscle contraction', 'Sustained energy'],
                note: 'Essential for Indian summers and sweaty sessions.',
              },
              {
                mineral: 'Potassium',
                subtitle: 'Cellular Hydration & Muscle Balance',
                color: '#8A307F',
                supports: ['Prevent cramps', 'Improve stamina', 'Balance sodium levels', 'Maintain muscle performance'],
                note: 'The partner mineral that makes sodium work.',
              },
              {
                mineral: 'Magnesium',
                subtitle: 'Recovery & Nervous System Balance',
                color: '#E8845A',
                supports: ['Reduce fatigue', 'Muscle relaxation', 'Steady focus', 'Sleep quality'],
                note: 'The mineral most Indians are chronically low in.',
              },
            ].map(({ mineral, subtitle, color, supports, note }) => (
              <div
                key={mineral}
                className="rounded-3xl p-8 border border-[#0D0D10]/[0.07] bg-[#FAFAF8] hover:-translate-y-1 transition-transform"
              >
                <div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-6 text-white text-lg font-black"
                  style={{ background: color }}
                >
                  {mineral.charAt(0)}
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
                { label: 'Daily Hydration', desc: 'Use it every day without worry' },
                { label: 'Intermittent Fasting', desc: 'Zero sugar, zero insulin spike' },
                { label: 'Keto / Low-Carb', desc: 'Fits any carb-restricted diet' },
                { label: 'Caffeine-Free Living', desc: 'Steady energy without crashes' },
              ].map(({ label, desc }) => (
                <div
                  key={label}
                  className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.05]"
                >
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
            {[
              { label: 'Gym & Strength Training', icon: '🏋️' },
              { label: 'Yoga & Hot Yoga', icon: '🧘' },
              { label: 'Long Office Hours', icon: '💻' },
              { label: 'Students & Exam Prep', icon: '📚' },
              { label: 'Intermittent Fasting', icon: '⏱️' },
              { label: 'Runners & Cyclists', icon: '🚴' },
              { label: 'Outdoor Workers', icon: '☀️' },
              { label: 'Anyone Drained by Mid-Day', icon: '⚡' },
            ].map(({ label, icon }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-[#0D0D10]/[0.07] bg-[#FAFAF8] text-center hover:-translate-y-1 transition-transform"
              >
                <span className="text-2xl">{icon}</span>
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

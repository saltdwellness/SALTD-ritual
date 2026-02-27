// Story.tsx — Brand story page (placeholder)
import React from 'react';
import { Link } from 'react-router-dom';

const ACCENT = '#2E5BFF';

const Story: React.FC = () => (
  <div className="bg-[#FAFAF8] min-h-screen">
    <section
      className="relative overflow-hidden"
      style={{ background: `radial-gradient(ellipse at 60% 50%, ${ACCENT}12 0%, transparent 60%), #0D0D10` }}
    >
      <div className="max-w-[900px] mx-auto px-6 md:px-12 py-32 md:py-48 text-center">
        <p className="text-xs font-black uppercase tracking-[0.5em] mb-6" style={{ color: ACCENT }}>"Our Story"</p>
        <h1
          className="font-black text-white leading-[0.95] tracking-[-0.04em] mb-8"
          style={{ fontSize: 'clamp(2.8rem, 7vw, 6rem)' }}
        >
          Born in Indian Heat.
          <br />
          <span style={{ color: ACCENT }}>Built to Perform.</span>
        </h1>
        <p className="text-lg text-white/55 font-medium max-w-[560px] mx-auto leading-relaxed mb-10">
          SALTD. was created because most hydration options in India were either loaded with sugar, full of artificial ingredients, or designed for the wrong climate entirely.
        </p>
        <p className="text-base text-white/40 font-medium max-w-[480px] mx-auto leading-relaxed">
          We set out to build a clean electrolyte supplement that actually works for real Indian conditions — the heat, the long hours, the fasting, the workouts — without any compromise on ingredients.
        </p>
        <div className="mt-12">
          <Link
            to="/shop"
            className="inline-block px-10 py-5 text-sm font-black uppercase tracking-[0.3em] text-white rounded-full transition-all hover:scale-105"
            style={{ background: ACCENT }}
          >
            Shop SALTD. →
          </Link>
        </div>
      </div>
    </section>

    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-[700px] mx-auto px-6 md:px-12 text-center">
        <p className="text-xs font-black uppercase tracking-[0.5em] mb-6" style={{ color: ACCENT }}>"The Mission"</p>
        <h2
          className="font-black text-[#0D0D10] leading-[1.05] tracking-[-0.03em] mb-8"
          style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
        >
          Hydration Without Compromise
        </h2>
        <p className="text-base text-[#1A1A1A]/60 leading-relaxed font-medium">
          Every ingredient in SALTD. has a purpose. We don't add anything that doesn't contribute to the core goal: clean, effective hydration for daily performance. No sugar, no artificial sweeteners, no preservatives, no fillers. Just what your body actually needs.
        </p>
      </div>
    </section>
  </div>
);

export default Story;

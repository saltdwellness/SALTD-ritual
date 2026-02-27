// FAQPage.tsx — Standalone FAQ page, also exportable as a section component
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ACCENT = '#2E5BFF';

export const FAQ_DATA = [
  {
    category: 'The Basics',
    questions: [
      {
        q: 'Why are electrolytes important for the body?',
        a: 'Electrolytes like sodium, potassium, and magnesium regulate fluid balance, nerve signaling, muscle contractions, and energy production. When you sweat, fast, train, sit long hours in AC, or live in hot climates, you lose these minerals. If they\'re not replaced, you may experience fatigue, headaches, cramps, brain fog, or low stamina. Hydration isn\'t just about water — it\'s about mineral balance.',
      },
      {
        q: 'When should I take an electrolyte drink mix?',
        a: 'SALTD. can be used in the morning for better hydration, before or after workouts, during long office hours, while fasting, during travel, in hot or humid weather, or whenever you feel low energy or dehydrated. You don\'t need to wait until you feel exhausted — electrolytes work best when used proactively.',
      },
      {
        q: 'How much water should I drink daily?',
        a: 'For most adults, 2.5–3.5 litres per day is a general guideline. However, your needs increase if you exercise regularly, live in hot or humid climates, sweat heavily, fast, or spend long hours in air conditioning. Hydration is not just about quantity — it\'s about electrolyte balance.',
      },
      {
        q: 'Can drinking too much water be harmful?',
        a: 'Yes. Drinking excessive water without electrolytes can dilute sodium levels in the body. This may cause fatigue, confusion, headaches, or cramps. Balance matters more than volume.',
      },
    ],
  },
  {
    category: 'SALTD. Product',
    questions: [
      {
        q: 'Is SALTD. safe for daily use?',
        a: 'Yes. SALTD. is formulated as a daily electrolyte supplement for hydration, workouts, fasting, and long workdays. If you have kidney issues, high blood pressure, or medical conditions requiring sodium restriction, consult your doctor before use.',
      },
      {
        q: 'How is SALTD. different from sugary electrolyte powders in India?',
        a: 'Many electrolyte drinks in India contain added sugar or artificial sweeteners. SALTD. is zero sugar, sweetened with Monk Fruit, free from artificial sweeteners, free from preservatives, and designed for daily hydration — not just sports use. Clean formulation. Functional dosing.',
      },
      {
        q: 'Can I use SALTD. during intermittent fasting?',
        a: 'Yes. SALTD. contains zero sugar and does not cause blood sugar spikes. It can support hydration and reduce fatigue during fasting periods.',
      },
      {
        q: 'Does SALTD. replace ORS?',
        a: 'No. ORS (Oral Rehydration Solution) is designed for medical dehydration, especially during diarrhoea or illness. SALTD. is formulated for daily hydration, performance, and lifestyle support — not medical treatment.',
      },
    ],
  },
  {
    category: 'Performance & Lifestyle',
    questions: [
      {
        q: 'Can I take SALTD. before workouts?',
        a: 'Yes. Taking electrolytes before or during workouts can support stamina, reduce cramping, and improve performance — especially in hot conditions.',
      },
      {
        q: 'Is SALTD. suitable for yoga and low-intensity workouts?',
        a: 'Absolutely. Even moderate sweating can lead to mineral loss. Electrolytes help maintain hydration and muscle function regardless of workout intensity.',
      },
      {
        q: 'Will this help with brain fog?',
        a: 'Mild brain fog can sometimes be linked to dehydration or low sodium levels. By restoring electrolyte balance, many people experience improved clarity and steadier energy. However, brain fog can have multiple causes, and persistent symptoms should be evaluated medically.',
      },
      {
        q: 'Can electrolytes replace coffee?',
        a: 'Electrolytes don\'t stimulate like caffeine. But if your fatigue is linked to dehydration, restoring minerals can provide steady energy without the crash that coffee sometimes causes.',
      },
      {
        q: 'Why do I feel dizzy or low energy during the day?',
        a: 'This can happen due to dehydration, low sodium intake, excess sweating, skipping meals, or fasting without mineral balance. Increasing water alone may not fix it. Restoring electrolytes often helps stabilize energy levels within hours. If symptoms persist, consult a healthcare professional.',
      },
      {
        q: 'Are sports drinks necessary?',
        a: 'Most commercial sports drinks contain added sugar, artificial flavours, and preservatives. They may provide quick energy from sugar, but they are not ideal for daily hydration. SALTD. is designed as a zero sugar electrolyte hydration powder — giving you essential minerals without glucose spikes.',
      },
    ],
  },
  {
    category: 'Nutrition',
    questions: [
      {
        q: 'Can I get electrolytes from food?',
        a: 'Yes, natural foods like fruits, leafy greens, coconut water, and mineral salts contain electrolytes. However, during intense sweating, long workouts, fasting, or Indian summer heat, food alone may not replace electrolytes quickly enough. That\'s where a balanced electrolyte supplement like SALTD. can help.',
      },
    ],
  },
];

interface FAQSectionProps {
  compact?: boolean; // If true, shows all categories in a condensed view
  maxQuestions?: number; // Limit questions shown (for product pages)
}

export const FAQSection: React.FC<FAQSectionProps> = ({ compact = false, maxQuestions }) => {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const allQuestions = FAQ_DATA.flatMap(cat =>
    cat.questions.map(q => ({ ...q, category: cat.category }))
  );

  const displayed = maxQuestions ? allQuestions.slice(0, maxQuestions) : allQuestions;

  const toggle = (key: string) => setOpenIndex(prev => (prev === key ? null : key));

  if (compact) {
    return (
      <div className="space-y-2">
        {displayed.map((item, i) => {
          const key = `faq-${i}`;
          const isOpen = openIndex === key;
          return (
            <div
              key={key}
              className="rounded-2xl border border-[#0D0D10]/[0.07] bg-white overflow-hidden"
            >
              <button
                onClick={() => toggle(key)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="text-base font-bold text-[#0D0D10]/80 leading-snug">{item.q}</span>
                <span
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-black transition-transform"
                  style={{
                    background: isOpen ? ACCENT : '#0D0D10',
                    transform: isOpen ? 'rotate(45deg)' : 'none',
                  }}
                >
                  +
                </span>
              </button>
              {isOpen && (
                <div className="px-6 pb-6">
                  <p className="text-base text-[#1A1A1A]/60 leading-relaxed font-medium">{item.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {FAQ_DATA.map(cat => (
        <div key={cat.category}>
          <p
            className="text-xs font-black uppercase tracking-[0.5em] mb-5"
            style={{ color: ACCENT }}
          >
            "{cat.category}"
          </p>
          <div className="space-y-2">
            {cat.questions.map((item, i) => {
              const key = `${cat.category}-${i}`;
              const isOpen = openIndex === key;
              return (
                <div
                  key={key}
                  className="rounded-2xl border border-[#0D0D10]/[0.07] bg-white overflow-hidden"
                >
                  <button
                    onClick={() => toggle(key)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="text-base font-bold text-[#0D0D10]/80 leading-snug">{item.q}</span>
                    <span
                      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-black transition-transform duration-200"
                      style={{
                        background: isOpen ? ACCENT : '#0D0D10',
                        transform: isOpen ? 'rotate(45deg)' : 'none',
                      }}
                    >
                      +
                    </span>
                  </button>
                  <div
                    style={{
                      maxHeight: isOpen ? '400px' : '0',
                      overflow: 'hidden',
                      transition: 'max-height 0.3s ease',
                    }}
                  >
                    <div className="px-6 pb-6">
                      <p className="text-base text-[#1A1A1A]/60 leading-relaxed font-medium">{item.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// Full standalone page
const FAQPage: React.FC = () => {
  return (
    <div className="bg-[#FAFAF8] min-h-screen">

      {/* ── Header ── */}
      <section className="py-20 md:py-28 bg-white border-b border-[#0D0D10]/[0.06]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12 text-center">
          <p className="text-xs font-black uppercase tracking-[0.5em] mb-4" style={{ color: ACCENT }}>"Answers"</p>
          <h1
            className="font-black text-[#0D0D10] leading-[1.0] tracking-[-0.04em] mb-6"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}
          >
            Hydration &
            <br />
            Electrolyte FAQs
          </h1>
          <p className="text-lg text-[#1A1A1A]/55 font-medium leading-relaxed max-w-[560px] mx-auto">
            Everything you need to know about electrolytes, SALTD., and daily hydration.
          </p>
        </div>
      </section>

      {/* ── FAQ Content ── */}
      <section className="py-16 md:py-24">
        <div className="max-w-[800px] mx-auto px-6 md:px-12">
          <FAQSection />
        </div>
      </section>

      {/* ── Still have questions CTA ── */}
      <section className="py-16 pb-24">
        <div className="max-w-[600px] mx-auto px-6 text-center">
          <div className="p-10 rounded-3xl bg-[#0D0D10] text-center">
            <p
              className="text-xs font-black uppercase tracking-[0.5em] mb-4"
              style={{ color: ACCENT }}
            >
              "Still Curious?"
            </p>
            <h3 className="text-2xl font-black text-white tracking-[-0.02em] mb-4">
              Have Another Question?
            </h3>
            <p className="text-base text-white/50 mb-8 font-medium">
              We're here. Reach out anytime — our team responds quickly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="mailto:timepassventures@gmail.com"
                className="inline-block px-8 py-4 text-sm font-black uppercase tracking-[0.3em] text-white rounded-full"
                style={{ background: ACCENT }}
              >
                Email Us →
              </a>
              <Link
                to="/shop"
                className="inline-block px-8 py-4 text-sm font-black uppercase tracking-[0.3em] text-white/60 rounded-full border border-white/20 hover:text-white hover:border-white/40 transition-colors"
              >
                Shop SALTD.
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default FAQPage;

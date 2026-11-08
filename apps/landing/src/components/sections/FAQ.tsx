'use client';

import { useState } from 'react';
import { useTranslation } from '@/i18n';

export function FAQ() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  
  return (
    <section id="faq" className="section-padding bg-white">
      <div className="container-width">
        <div className="text-center mb-16">
          <h2 className="heading-xl">
            {t.faq.title}
          </h2>
        </div>
        
        <div className="max-w-3xl mx-auto space-y-4">
          {t.faq.items.map((item, i) => (
            <div
              key={i}
              className="border border-navy-100 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-navy-50 transition-colors"
              >
                <span className="font-semibold text-navy-900 pr-4">
                  {item.question}
                </span>
                <svg
                  className={`w-5 h-5 text-navy-700 flex-shrink-0 transition-transform ${
                    openIndex === i ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              
              {openIndex === i && (
                <div className="px-6 pb-4 body-base text-navy-700">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

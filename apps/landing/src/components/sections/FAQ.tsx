'use client';

import React, { useState } from 'react';
import { FAQ } from '@/content/landing';
import { Section } from '../ui';
import { MascotWithContext } from '../Mascot';

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  
  return (
    <Section id="faq">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="heading-lg text-brand-dark mb-6">
            {FAQ.title}
          </h2>
          <div className="flex justify-center">
            <MascotWithContext context="faq" className="w-32 h-32" />
          </div>
        </div>
        
        <div className="space-y-4">
          {FAQ.items.map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <button
                className="w-full px-6 py-4 text-left flex items-center justify-between gap-4"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                aria-expanded={openIndex === i}
              >
                <span className="font-semibold text-brand-dark pr-4">
                  {item.question}
                </span>
                <svg
                  className={`flex-shrink-0 w-5 h-5 text-brand-blue transition-transform ${
                    openIndex === i ? 'transform rotate-180' : ''
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
                <div className="px-6 pb-4">
                  <p className="text-gray-600 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

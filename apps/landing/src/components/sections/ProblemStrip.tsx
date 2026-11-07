'use client';

import React from 'react';
import { PROBLEM_STRIP } from '@/content/landing';

export function ProblemStrip() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-sky-50 border-y border-blue-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-sm font-semibold text-brand-blue uppercase tracking-wide mb-2">
            {PROBLEM_STRIP.title}
          </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {PROBLEM_STRIP.items.map((item, i) => (
            <div
              key={i}
              className="text-center"
            >
              <p className="text-lg font-semibold text-brand-dark">
                {item}
              </p>
            </div>
          ))}
        </div>
        
        <p className="text-sm text-gray-600 text-center mt-8 italic">
          {PROBLEM_STRIP.note}
        </p>
      </div>
    </section>
  );
}

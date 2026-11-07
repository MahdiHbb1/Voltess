'use client';

import React from 'react';
import { HOW_IT_WORKS } from '@/content/landing';
import { Section } from '../ui';

export function HowItWorks() {
  return (
    <Section id="cara-kerja" className="bg-gradient-to-br from-blue-50 to-white">
      <div className="text-center mb-16">
        <h2 className="heading-lg text-brand-dark mb-4">
          {HOW_IT_WORKS.title}
        </h2>
        <p className="body-lg text-gray-600 max-w-3xl mx-auto">
          {HOW_IT_WORKS.subtitle}
        </p>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          {/* Connecting Line */}
          <div
            className="hidden md:block absolute top-16 left-16 right-16 h-0.5 bg-gradient-to-r from-brand-blue via-brand-sky to-brand-green"
            aria-hidden="true"
          />
          
          <div className="grid md:grid-cols-4 gap-8">
            {HOW_IT_WORKS.steps.map((step, i) => (
              <div key={i} className="relative">
                {/* Number Circle */}
                <div className="flex justify-center mb-6">
                  <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-brand-blue to-brand-sky flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-extrabold text-white">
                      {step.number}
                    </span>
                  </div>
                </div>
                
                <div className="text-center space-y-3">
                  <h3 className="heading-sm text-brand-dark">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

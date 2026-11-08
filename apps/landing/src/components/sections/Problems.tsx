'use client';

import React from 'react';
import { PROBLEMS } from '@/content/landing';
import { Card, Section } from '../ui';
import { MascotWithContext } from '../Mascot';

export function Problems() {
  return (
    <Section id="masalah">
      <div className="text-center mb-12">
        <h2 className="heading-lg text-brand-dark mb-4">
          {PROBLEMS.title}
        </h2>
        <div className="flex justify-center">
          <MascotWithContext context="problem" width={128} height={128} />
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {PROBLEMS.items.map((item, i) => (
          <Card key={i} hover>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                  !
                </div>
                <p className="text-base font-medium text-gray-700 flex-1">
                  {item.problem}
                </p>
              </div>
              <div className="pl-11">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm">
                    ✓
                  </div>
                  <p className="text-base font-semibold text-brand-blue flex-1">
                    {item.solution}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

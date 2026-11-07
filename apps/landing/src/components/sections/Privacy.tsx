'use client';

import React from 'react';
import { PRIVACY } from '@/content/landing';
import { Section, Card } from '../ui';
import { MascotWithContext } from '../Mascot';

export function Privacy() {
  return (
    <Section id="privasi">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="heading-lg text-brand-dark mb-6">
            {PRIVACY.title}
          </h2>
          <div className="flex justify-center">
            <MascotWithContext context="privacy" className="w-32 h-32" />
          </div>
        </div>
        
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <div className="space-y-4">
            {PRIVACY.points.map((point, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center">
                  <span className="text-brand-blue font-bold">🔒</span>
                </div>
                <p className="text-base text-gray-700 flex-1">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Section>
  );
}

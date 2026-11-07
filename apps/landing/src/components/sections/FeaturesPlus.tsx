'use client';

import React from 'react';
import { FEATURES_PLUS } from '@/content/landing';
import { Section, Card, Chip } from '../ui';

export function FeaturesPlus() {
  return (
    <Section id="fitur">
      <div className="text-center mb-12">
        <Chip variant="planned" className="mb-4">Plus</Chip>
        <h2 className="heading-lg text-brand-dark mb-4">
          {FEATURES_PLUS.title}
        </h2>
        <p className="body-lg text-gray-600 max-w-2xl mx-auto">
          {FEATURES_PLUS.subtitle}
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES_PLUS.items.map((item, i) => (
          <Card key={i} hover>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue to-brand-sky flex items-center justify-center">
                  <span className="text-white text-xl">
                    {getFeatureIcon(i)}
                  </span>
                </div>
                <Chip variant="planned" className="text-xs">Plus</Chip>
              </div>
              <h3 className="font-bold text-brand-dark">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function getFeatureIcon(index: number): string {
  const icons = ['⚠️', '🔋', '💰', '🤖', '📊'];
  return icons[index] || '✨';
}

import React from 'react';
import { PRICING } from '@/content/landing';
import { Section, Card, Chip, Button } from '../ui';

export function Pricing() {
  return (
    <Section id="harga" className="bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="text-center mb-12">
        <h2 className="heading-lg text-brand-dark mb-4">
          {PRICING.title}
        </h2>
        <p className="body-lg text-gray-600 max-w-2xl mx-auto mb-2">
          {PRICING.subtitle}
        </p>
        <Chip variant="example" className="text-xs">
          ⚠️ {PRICING.subtitle}
        </Chip>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-8">
        {PRICING.plans.map((plan, i) => (
          <Card
            key={i}
            hover
            className={plan.highlight ? 'ring-2 ring-brand-blue relative' : ''}
          >
            {plan.highlight && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Chip variant="confidence" className="text-xs">
                  Paling Populer
                </Chip>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-brand-dark mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-brand-blue">
                    {plan.price}
                  </span>
                  <span className="text-gray-600 text-sm">
                    {plan.period}
                  </span>
                </div>
                {plan.note && (
                  <Chip variant="example" className="text-xs mt-2">
                    {plan.note}
                  </Chip>
                )}
              </div>
              
              <ul className="space-y-3">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                    <span className="text-sm text-gray-700">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Disclaimers */}
      <div className="max-w-3xl mx-auto space-y-4">
        <p className="text-center text-base font-medium text-gray-700 bg-white rounded-2xl p-6 border border-gray-100">
          {PRICING.disclaimer}
        </p>
        <p className="text-center text-sm text-gray-600 italic">
          {PRICING.footnote}
        </p>
      </div>
      
      <div className="text-center mt-8">
        <Button onClick={() => window.location.href = '#waitlist'}>
          Gabung Daftar Tunggu
        </Button>
      </div>
    </Section>
  );
}

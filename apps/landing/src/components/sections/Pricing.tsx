'use client';

import { useTranslation } from '@/i18n';
import { Card } from '../ui';

export function Pricing() {
  const { t } = useTranslation();
  
  return (
    <section id="pricing" className="section-padding bg-white">
      <div className="container-width">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">
            {t.pricing.title}
          </h2>
          <p className="text-lg text-navy-700">
            {t.pricing.subtitle}
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
          {t.pricing.plans.map((plan, i) => (
            <div
              key={i}
              className={`rounded-2xl p-8 ${
                plan.highlight
                  ? 'bg-navy-900 text-white shadow-2xl scale-105'
                  : 'bg-white border-2 border-navy-100'
              }`}
            >
              <div className="space-y-6">
                <div>
                  <h3 className={`text-2xl font-bold mb-2 ${plan.highlight ? 'text-white' : 'text-navy-900'}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-bold ${plan.highlight ? 'text-white' : 'text-navy-900'}`}>
                      {plan.price}
                    </span>
                    <span className={plan.highlight ? 'text-navy-100' : 'text-navy-700'}>
                      {plan.period}
                    </span>
                  </div>
                  {plan.note && (
                    <div className="mt-2 text-sm">
                      <span className={`inline-block px-2 py-1 rounded ${plan.highlight ? 'bg-white/20 text-white' : 'bg-navy-50 text-navy-700'}`}>
                        {t.pricing.labelEstimate}
                      </span>
                    </div>
                  )}
                </div>
                
                <ul className="space-y-3">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm">
                      <svg
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.highlight ? 'text-accent' : 'text-navy-900'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className={plan.highlight ? 'text-navy-100' : 'text-navy-700'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                    plan.highlight
                      ? 'bg-accent text-navy-900 hover:bg-accent/90'
                      : 'bg-navy-900 text-white hover:bg-navy-800'
                  }`}
                  onClick={() => window.location.href = '#cta'}
                >
                  {plan.highlight ? t.nav.cta : 'Learn More'}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="max-w-3xl mx-auto space-y-3 text-center text-sm text-navy-600">
          <p>{t.pricing.disclaimer}</p>
          <p className="italic">{t.pricing.footnote}</p>
        </div>
      </div>
    </section>
  );
}

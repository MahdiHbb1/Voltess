'use client';

import { useTranslation } from '@/i18n';

export function HowItWorks() {
  const { t } = useTranslation();
  
  return (
    <section id="how-it-works" className="section-padding bg-white">
      <div className="container-width">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">
            {t.howItWorks.title}
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {t.howItWorks.steps.map((step, i) => (
            <div key={i} className="relative">
              {/* Step number */}
              <div className="w-12 h-12 rounded-full bg-navy-900 text-white flex items-center justify-center text-xl font-bold mb-4">
                {i + 1}
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-bold text-navy-900 mb-3">
                {step.title}
              </h3>
              <p className="text-navy-700 leading-relaxed">
                {step.description}
              </p>
              
              {/* Arrow connector (not on last item) */}
              {i < t.howItWorks.steps.length - 1 && (
                <div className="hidden lg:block absolute top-6 -right-4 text-navy-200">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';

import { useTranslation } from '@/i18n';

export function Privacy() {
  const { t } = useTranslation();
  
  return (
    <section id="privacy" className="section-padding bg-navy-50">
      <div className="container-width">
        <div className="max-w-3xl mx-auto">
          <h2 className="heading-xl text-center mb-12">
            {t.privacy.title}
          </h2>
          
          <div className="space-y-4">
            {t.privacy.points.map((point, i) => (
              <div key={i} className="flex items-start gap-4 p-6 bg-white border border-navy-100 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center mt-1">
                  <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="body-base text-navy-700 flex-1">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import { useTranslation } from '@/i18n';
import { MascotWithContext } from '../Mascot';
import { Label } from '../ui';

export function AIEngine() {
  const { t } = useTranslation();
  
  return (
    <section id="ai-engine" className="section-padding bg-white">
      <div className="container-width">
        {/* Header with Terra */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-block mb-6">
            <MascotWithContext context="aiEngine" width={100} height={100} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">
            {t.aiEngine.title}
          </h2>
          <p className="text-lg text-navy-700">
            {t.aiEngine.subtitle}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
          {t.aiEngine.points.map((point, i) => (
            <div key={i} className="bg-navy-50 rounded-xl p-6 border border-navy-100">
              <div className="w-10 h-10 rounded-lg bg-navy-900 text-white flex items-center justify-center text-lg font-bold mb-4">
                {i + 1}
              </div>
              
              <h3 className="text-lg font-bold text-navy-900 mb-2">{point.title}</h3>
              
              <p className="text-navy-700 text-sm leading-relaxed">
                {point.description}
              </p>
            </div>
          ))}
        </div>
        
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-navy-50 rounded-xl p-6 border-l-4 border-navy-900">
            <p className="text-sm text-navy-700 italic">
              {t.aiEngine.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import { useTranslation } from '@/i18n';
import { Label } from '../ui';

export function Roadmap() {
  const { t } = useTranslation();
  
  return (
    <section id="roadmap" className="section-padding bg-white">
      <div className="container-width">
        <div className="text-center mb-16">
          <h2 className="heading-xl">
            {t.roadmap.title}
          </h2>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {t.roadmap.phases.map((phase, i) => (
              <div key={i} className="relative pl-8 pb-8 border-l-2 border-navy-900 last:border-l-0 last:pb-0">
                {/* Timeline dot */}
                <div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-navy-900 transform -translate-x-[9px]" />
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold text-navy-900">{phase.phase}</span>
                    <span className="text-sm text-navy-700">{phase.period}</span>
                    <Label variant={phase.status === 'running' ? 'accent' : 'sample'}>
                      {phase.status === 'running' ? t.roadmap.statusRunning : t.roadmap.statusPlanned}
                    </Label>
                  </div>
                  
                  <h3 className="heading-md">{phase.title}</h3>
                  
                  <p className="body-base text-navy-700">
                    {phase.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

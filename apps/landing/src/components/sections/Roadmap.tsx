import React from 'react';
import { ROADMAP } from '@/content/landing';
import { Section, Chip } from '../ui';

export function Roadmap() {
  return (
    <Section id="roadmap" className="bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="text-center mb-12">
        <h2 className="heading-lg text-brand-dark mb-4">
          {ROADMAP.title}
        </h2>
        <p className="body-lg text-gray-600 max-w-2xl mx-auto">
          {ROADMAP.subtitle}
        </p>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          {/* Timeline Line */}
          <div
            className="hidden md:block absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-blue via-brand-sky to-brand-green"
            aria-hidden="true"
          />
          
          <div className="space-y-8">
            {ROADMAP.phases.map((phase, i) => (
              <div key={i} className="relative">
                <div className="flex items-start gap-6">
                  {/* Timeline Dot */}
                  <div className="hidden md:flex flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-brand-blue to-brand-sky items-center justify-center shadow-lg z-10">
                    <span className="text-2xl">
                      {phase.status === 'running' ? '▶️' : '⏸️'}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-bold text-brand-blue">
                            {phase.phase}
                          </span>
                          <Chip
                            variant={phase.status === 'running' ? 'confidence' : 'planned'}
                            className="text-xs"
                          >
                            {phase.status === 'running' ? 'Sedang Berjalan' : 'Direncanakan'}
                          </Chip>
                        </div>
                        <h3 className="text-xl font-bold text-brand-dark">
                          {phase.title}
                        </h3>
                      </div>
                      <span className="text-sm text-gray-600 whitespace-nowrap">
                        {phase.period}
                      </span>
                    </div>
                    <p className="text-base text-gray-600">
                      {phase.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

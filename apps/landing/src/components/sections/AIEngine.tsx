'use client';

import React from 'react';
import { AI_ENGINE } from '@/content/landing';
import { Section, Chip, Card } from '../ui';
import { MascotWithContext } from '../Mascot';

export function AIEngine() {
  return (
    <Section id="ai-engine" className="bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="text-center mb-12">
        <p className="text-sm font-semibold text-brand-blue uppercase tracking-wide mb-2">
          {AI_ENGINE.subtitle}
        </p>
        <h2 className="heading-lg text-brand-dark mb-6">
          {AI_ENGINE.title}
        </h2>
        <div className="flex justify-center mb-8">
          <MascotWithContext context="aiEngine" className="w-32 h-32" />
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-8">
        {AI_ENGINE.points.map((point, i) => (
          <Card key={i} hover>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue to-brand-sky flex items-center justify-center">
                <span className="text-white font-bold text-lg">{i + 1}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-brand-dark mb-2">
                  {point.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {point.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Disclaimer */}
      <div className="max-w-3xl mx-auto">
        <Chip variant="example" className="w-full justify-center py-3">
          ⚠️ {AI_ENGINE.disclaimer}
        </Chip>
      </div>
      
      {/* Flow Diagram */}
      <div className="mt-12 max-w-4xl mx-auto">
        <FlowDiagram />
      </div>
    </Section>
  );
}

function FlowDiagram() {
  const steps = [
    { icon: '📸', label: 'Foto & suara' },
    { icon: '✅', label: 'Baca & konfirmasi' },
    { icon: '🔢', label: 'Hitung estimasi' },
    { icon: '⚖️', label: 'Cocokkan dengan meter' },
    { icon: '💡', label: 'Saran + keyakinan' },
  ];
  
  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
      <h3 className="text-center font-bold text-brand-dark mb-8">
        Alur Estimasi
      </h3>
      <div className="flex flex-wrap justify-center items-center gap-4">
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 flex items-center justify-center text-2xl border-2 border-brand-blue/20">
                {step.icon}
              </div>
              <span className="text-xs font-medium text-gray-600 text-center max-w-[80px]">
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="hidden sm:block text-brand-blue text-2xl">
                →
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

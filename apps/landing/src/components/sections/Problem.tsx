'use client';

import { useTranslation } from '@/i18n';
import { MascotWithContext } from '../Mascot';

export function Problem() {
  const { t } = useTranslation();
  
  return (
    <section id="problem" className="section-padding bg-gradient-to-b from-navy-50 to-white relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl" />
      
      <div className="container-width relative">
        <div className="max-w-4xl mx-auto">
          {/* Header with Terra - animated on scroll */}
          <div className="text-center mb-12">
            <div className="inline-block mb-6 animate-bounce-slow">
              <MascotWithContext context="problem" width={100} height={100} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4 animate-fade-in">
              {t.problem.title}
            </h2>
            <p className="text-lg text-navy-700 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              {t.problem.subtitle}
            </p>
          </div>
          
          {/* Problem statement - clean card with animation */}
          <div className="bg-white rounded-2xl p-8 md:p-10 shadow-lg border border-navy-100 hover-lift animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <p className="text-xl md:text-2xl text-navy-800 leading-relaxed text-center">
              <span className="text-3xl text-navy-900">"</span>
              {t.problem.statement}
              <span className="text-3xl text-navy-900">"</span>
            </p>
          </div>
          
          {/* CTA */}
          <div className="text-center mt-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <a 
              href="#how-it-works"
              className="inline-flex items-center gap-2 text-navy-900 font-semibold hover:text-navy-700 transition-all group"
            >
              {t.problem.cta}
              <svg className="w-5 h-5 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

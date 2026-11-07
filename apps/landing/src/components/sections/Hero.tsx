import React from 'react';
import { HERO } from '@/content/landing';
import { Button, Badge, Chip } from '../ui';
import { MascotWithContext } from '../Mascot';
import { PhoneMockup } from '../PhoneMockup';

export function Hero() {
  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-sky-50 to-white -z-10" />
      <div
        className="absolute top-0 right-0 w-96 h-96 bg-brand-sky/20 rounded-full blur-3xl -z-10"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl -z-10"
        aria-hidden="true"
      />
      
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="space-y-6 animate-fade-in">
            <Badge>{HERO.badge}</Badge>
            
            <h1 className="heading-xl text-brand-dark">
              {HERO.title}
            </h1>
            
            <p className="body-lg text-gray-600 max-w-2xl">
              {HERO.subtitle}
            </p>
            
            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={() => window.location.href = '#waitlist'}
              >
                {HERO.ctaPrimary}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => window.location.href = '#cara-kerja'}
              >
                {HERO.ctaSecondary}
              </Button>
            </div>
            
            {/* Trust Signals */}
            <div className="flex flex-wrap gap-3 pt-4">
              {HERO.trustSignals.map((signal, i) => (
                <Chip key={i} className="text-xs">
                  {signal}
                </Chip>
              ))}
            </div>
          </div>
          
          {/* Right: Visual */}
          <div className="relative lg:pl-8">
            {/* Phone Mockup */}
            <div className="relative z-10 animate-slide-up">
              <PhoneMockup screen="beranda" />
            </div>
            
            {/* Mascot */}
            <div className="absolute -top-8 -right-8 lg:-right-16 w-32 h-32 lg:w-40 lg:h-40 z-20">
              <MascotWithContext context="hero" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import { useTranslation } from '@/i18n';
import { Button, Badge } from '../ui';
import { MascotWithContext } from '../Mascot';
import { PhoneMockup } from '../PhoneMockup';

export function Hero() {
  const { t } = useTranslation();
  
  return (
    <section className="relative bg-white overflow-visible border-b border-navy-100">
      {/* Background Image Layer */}
      <div className="absolute inset-0">
        {/* Background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/images/hero-bg.jpg)',
          }}
        />
        
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/50 to-white/30" />
        
        {/* Organic blur at bottom - smooth gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-white via-white/95 to-transparent" />
      </div>
      
      <div className="container-width relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center py-20 md:py-28">
          {/* Left: Content - bold text with shadows */}
          <div className="space-y-6 animate-fade-in">
            <Badge variant="accent" className="!bg-navy-900 !text-white !border-navy-900 animate-slide-in-left shadow-xl">
              {t.hero.badge}
            </Badge>
            
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-navy-900 leading-tight"
              style={{
                textShadow: '2px 2px 8px rgba(255, 255, 255, 0.9), -1px -1px 4px rgba(255, 255, 255, 0.8)'
              }}
            >
              {t.hero.title}
            </h1>
            
            <p 
              className="text-lg md:text-xl text-navy-800 leading-relaxed font-bold max-w-xl"
              style={{
                textShadow: '1px 1px 6px rgba(255, 255, 255, 0.9), -1px -1px 3px rgba(255, 255, 255, 0.8)'
              }}
            >
              {t.hero.subtitle}
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button
                size="lg"
                onClick={() => window.location.href = '#product'}
                className="shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 !bg-navy-900"
              >
                {t.hero.ctaPrimary}
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => window.location.href = '#how-it-works'}
                className="hover:-translate-y-0.5 transition-all shadow-lg !bg-white !border-2 !border-navy-900"
              >
                {t.hero.ctaSecondary}
              </Button>
            </div>
            
            {/* Trust signals - clean with text shadow */}
            <div className="pt-6 space-y-3">
              {t.hero.trustSignals.map((signal, i) => (
                <div 
                  key={i} 
                  className="flex items-start gap-3 animate-fade-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <svg className="w-6 h-6 text-accent flex-shrink-0 mt-0.5 drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span 
                    className="text-base text-navy-900 font-bold"
                    style={{
                      textShadow: '1px 1px 4px rgba(255, 255, 255, 0.9), -1px -1px 2px rgba(255, 255, 255, 0.8)'
                    }}
                  >
                    {signal}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right: Product visual with BIG Terra */}
          <div className="relative animate-slide-in-right">
            <div className="relative max-w-[420px] mx-auto lg:ml-auto">
              {/* Phone with real image support */}
              <PhoneMockup variant="dashboard" imagePath="/screenshots/dashboard-home.png" />
              
              {/* Terra - BIGGER and more prominent */}
              <div className="absolute -bottom-10 -right-2 md:-bottom-16 md:-right-6 animate-float z-20 drop-shadow-2xl">
                <MascotWithContext context="hero" width={230} height={230} />
              </div>
            </div>
            
            {/* Additional Terra - top left for balance */}
            <div className="hidden lg:block absolute -top-6 -left-4 animate-float drop-shadow-xl" style={{ animationDelay: '1s' }}>
              <MascotWithContext context="hero" width={140} height={140} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

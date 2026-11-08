'use client';

import { PhoneMockup } from '../PhoneMockup';
import { MascotWithContext } from '../Mascot';
import { Label } from '../ui';

export function Product() {
  return (
    <section id="product" className="section-padding bg-white relative overflow-hidden">
      {/* Decorative Terra in background */}
      <div className="absolute top-20 right-10 opacity-20 hidden lg:block animate-float">
        <MascotWithContext context="results" width={280} height={280} />
      </div>
      
      <div className="container-width relative z-10">
        {/* Single phone showcase with description beside */}
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
          {/* Left: Phone mockup with Terra */}
          <div className="order-2 lg:order-1 relative">
            <div className="hover-lift mx-auto max-w-[360px]">
              <PhoneMockup variant="breakdown" imagePath="/screenshots/breakdown-costs.png" />
            </div>
            
            {/* Terra beside phone */}
            <div className="absolute -bottom-8 -left-8 animate-float drop-shadow-2xl hidden md:block">
              <MascotWithContext context="results" width={140} height={140} />
            </div>
          </div>
          
          {/* Right: Description */}
          <div className="order-1 lg:order-2 space-y-6">
            <div>
              <Label variant="sample" className="mb-4">
                All estimates labeled "Sample"
              </Label>
              <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">
                Track costs by appliance
              </h2>
              <p className="text-lg text-navy-700 leading-relaxed">
                See exactly how much each washing machine, dryer, or other appliance costs to run. Every estimate comes with a confidence level (High/Medium/Low) so you know how reliable the data is.
              </p>
            </div>
            
            {/* Features list */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="font-semibold text-navy-900 mb-1">Per-appliance breakdown</h4>
                  <p className="text-sm text-navy-700">Cost in Rupiah for each machine or device</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="font-semibold text-navy-900 mb-1">Confidence levels</h4>
                  <p className="text-sm text-navy-700">Transparent High/Medium/Low ratings for each estimate</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="font-semibold text-navy-900 mb-1">Cost per unit</h4>
                  <p className="text-sm text-navy-700">Rp per kg laundry, per serving, or per batch</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="font-semibold text-navy-900 mb-1">Weekly trends</h4>
                  <p className="text-sm text-navy-700">7-day charts to spot usage patterns</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

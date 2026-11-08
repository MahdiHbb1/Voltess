'use client';

import Image from 'next/image';
import { Label } from '../ui';

export function VirtualKiosk() {
  return (
    <section id="virtual-kiosk" className="section-padding bg-navy-900 text-white">
      <div className="container-width">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left: Kiosk Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden border-2 border-navy-700 shadow-2xl">
              {/* Replace with real kiosk visualization image */}
              <Image
                src="/images/kiosk-visualization.png"
                alt="Virtual Kiosk Visualization"
                fill
                className="object-cover"
              />
            </div>
          </div>
          
          {/* Right: Content */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Your business, as a mini village you manage
            </h2>
            
            <p className="text-lg text-navy-100 leading-relaxed">
              Choose your business type, kiosk fills with common appliances. Slide usage hours and watch electricity costs change. Complete simple missions (photo appliance labels, meter photos, voice notes) to level up your kiosk, earn decorations, and unlock reports.
            </p>
            
            <ul className="space-y-3">
              {[
                'Maximum 2 minutes per day',
                'Level up from real actions, not just clicks',
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-accent flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-navy-100">{feature}</span>
                </li>
              ))}
            </ul>
            
            <div className="pt-4">
              <p className="text-navy-100 mb-2 text-sm">
                Real rewards planned: subscription credits and "Energy Efficient Business" stickers
              </p>
              <Label variant="planned">Planned</Label>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

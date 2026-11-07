import React from 'react';
import { KIOS_VIRTUAL } from '@/content/landing';
import { Section, Chip } from '../ui';

export function KiosVirtual() {
  return (
    <Section id="kios-virtual">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: Content */}
        <div className="space-y-6">
          <h2 className="heading-lg text-brand-dark">
            {KIOS_VIRTUAL.title}
          </h2>
          
          <p className="body-base text-gray-600 leading-relaxed">
            {KIOS_VIRTUAL.description}
          </p>
          
          <div className="space-y-3">
            {KIOS_VIRTUAL.features.map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold">
                  ✓
                </div>
                <p className="text-base text-gray-700">
                  {feature}
                  {feature.includes('direncanakan') && (
                    <Chip variant="planned" className="ml-2 text-xs">
                      Rencana
                    </Chip>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Right: Kios Illustration */}
        <div className="relative">
          <KiosIllustration />
        </div>
      </div>
    </Section>
  );
}

function KiosIllustration() {
  return (
    <div className="relative w-full aspect-square max-w-md mx-auto">
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Background */}
        <rect width="400" height="400" fill="url(#grad1)" />
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DBEAFE" />
            <stop offset="100%" stopColor="#E0F2FE" />
          </linearGradient>
        </defs>
        
        {/* Ground */}
        <ellipse cx="200" cy="340" rx="150" ry="30" fill="#94A3B8" opacity="0.2" />
        
        {/* Building (Kios) */}
        <rect x="120" y="180" width="160" height="140" fill="#1A2945" rx="8" />
        <rect x="130" y="190" width="140" height="50" fill="#2563EB" rx="4" />
        <text
          x="200"
          y="220"
          fontSize="14"
          fontWeight="bold"
          fill="white"
          textAnchor="middle"
        >
          LAUNDRY
        </text>
        
        {/* Window */}
        <rect x="150" y="260" width="100" height="40" fill="#38BDF8" opacity="0.5" rx="4" />
        
        {/* Appliances (simplified) */}
        {/* Mesin Cuci */}
        <g transform="translate(60, 200)">
          <rect width="40" height="50" fill="#475569" rx="4" />
          <circle cx="20" cy="20" r="12" fill="#64748B" />
          <circle cx="20" cy="20" r="8" fill="#94A3B8" />
        </g>
        
        {/* Pengering */}
        <g transform="translate(300, 210)">
          <rect width="35" height="45" fill="#475569" rx="4" />
          <rect x="5" y="5" width="25" height="25" fill="#64748B" rx="2" />
        </g>
        
        {/* Cost Bubbles */}
        <g transform="translate(70, 170)">
          <ellipse cx="0" cy="0" rx="35" ry="20" fill="white" stroke="#10B981" strokeWidth="2" />
          <text x="0" y="5" fontSize="10" fontWeight="bold" fill="#10B981" textAnchor="middle">
            Rp/jam
          </text>
        </g>
        
        <g transform="translate(320, 190)">
          <ellipse cx="0" cy="0" rx="35" ry="20" fill="white" stroke="#10B981" strokeWidth="2" />
          <text x="0" y="5" fontSize="10" fontWeight="bold" fill="#10B981" textAnchor="middle">
            Rp/jam
          </text>
        </g>
        
        {/* Small mascot indicator */}
        <circle cx="340" cy="120" r="25" fill="#1A2945" opacity="0.8" />
        <text x="340" y="130" fontSize="20" textAnchor="middle">
          👋
        </text>
      </svg>
    </div>
  );
}

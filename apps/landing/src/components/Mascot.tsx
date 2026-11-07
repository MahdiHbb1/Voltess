import React from 'react';
import { MASCOT_PATHS, type MascotExpression } from '@voltess/assets';

interface MascotProps {
  expression?: MascotExpression;
  className?: string;
  alt?: string;
  animate?: boolean;
}

export function Mascot({
  expression = 'biasa',
  className = '',
  alt = 'Maskot Terra',
  animate = true,
}: MascotProps) {
  const imagePath = MASCOT_PATHS[expression];
  
  return (
    <div
      className={`relative ${animate ? 'animate-float' : ''} ${className}`}
      style={{
        animationDelay: '0.2s',
      }}
    >
      <img
        src={imagePath}
        alt={`${alt} - ${expression}`}
        className="w-full h-full object-contain"
        loading="lazy"
      />
    </div>
  );
}

interface MascotWithContextProps {
  context: string;
  className?: string;
  alt?: string;
  animate?: boolean;
}

export function MascotWithContext({
  context,
  className = '',
  alt = 'Maskot Terra',
  animate = true,
}: MascotWithContextProps) {
  // Map context to expression
  const expressionMap: Record<string, MascotExpression> = {
    hero: 'hallo',
    problem: 'cemas',
    howItWorks: 'hallo',
    aiEngine: 'mikir',
    results: 'hore',
    features: 'hore',
    privacy: 'tidur',
    faq: 'biasa',
    cta: 'hallo',
  };
  
  const expression = expressionMap[context] || 'biasa';
  
  return (
    <Mascot
      expression={expression}
      className={className}
      alt={alt}
      animate={animate}
    />
  );
}

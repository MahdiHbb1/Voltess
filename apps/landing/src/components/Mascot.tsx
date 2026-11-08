import Image from 'next/image';
import { MASCOT_PATHS, MASCOT_CONTEXT_MAP, type MascotExpression } from '@voltess/assets';

interface MascotProps {
  expression?: MascotExpression;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
}

export function Mascot({ 
  expression = 'biasa', 
  alt = 'Terra mascot', 
  className = '',
  width = 200,
  height = 200,
}: MascotProps) {
  const imagePath = MASCOT_PATHS[expression];
  
  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <Image
        src={imagePath}
        alt={alt}
        fill
        className="object-contain"
        priority={expression === 'hallo'}
      />
    </div>
  );
}

interface MascotWithContextProps {
  context: keyof typeof MASCOT_CONTEXT_MAP;
  className?: string;
  width?: number;
  height?: number;
}

export function MascotWithContext({ context, className, width, height }: MascotWithContextProps) {
  const expression = MASCOT_CONTEXT_MAP[context] || MASCOT_CONTEXT_MAP.default;
  
  return (
    <Mascot 
      expression={expression}
      alt={`Terra - ${context}`}
      className={className}
      width={width}
      height={height}
    />
  );
}

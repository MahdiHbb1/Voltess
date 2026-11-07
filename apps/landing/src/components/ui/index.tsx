import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-brand-blue text-white hover:bg-blue-600 focus:ring-brand-blue shadow-lg shadow-blue-500/30',
    secondary: 'bg-brand-dark text-white hover:bg-opacity-90 focus:ring-brand-dark',
    outline: 'border-2 border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white focus:ring-brand-dark',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`bg-white rounded-3xl p-6 border border-gray-100 shadow-sm ${
        hover ? 'transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

interface ChipProps {
  children: React.ReactNode;
  variant?: 'default' | 'example' | 'confidence' | 'planned';
  className?: string;
}

export function Chip({ children, variant = 'default', className = '' }: ChipProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    example: 'bg-amber-50 text-amber-700 border border-amber-200',
    confidence: 'bg-green-50 text-green-700 border border-green-200',
    planned: 'bg-blue-50 text-blue-700 border border-blue-200',
  };
  
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function Badge({ children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold bg-blue-50 text-brand-blue border border-blue-100 ${className}`}
    >
      {children}
    </span>
  );
}

interface SectionProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}

export function Section({ id, children, className = '', dark = false }: SectionProps) {
  return (
    <section
      id={id}
      className={`py-16 md:py-24 px-4 sm:px-6 lg:px-8 ${
        dark ? 'bg-brand-dark text-white' : 'bg-white'
      } ${className}`}
    >
      <div className="max-w-7xl mx-auto">{children}</div>
    </section>
  );
}

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Container({ children, className = '', size = 'lg' }: ContainerProps) {
  const sizes = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-7xl',
  };
  
  return <div className={`mx-auto ${sizes[size]} ${className}`}>{children}</div>;
}

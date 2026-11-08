'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-navy-900 text-white hover:bg-navy-800 active:bg-navy-950',
    secondary: 'border-2 border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white active:bg-navy-950 active:border-navy-950',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-md',
    md: 'px-6 py-3 text-base rounded-lg',
    lg: 'px-8 py-4 text-lg rounded-lg',
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`bg-white border border-navy-100 rounded-lg p-6 ${className}`}
    >
      {children}
    </div>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-navy-50 text-navy-900 border border-navy-100',
    accent: 'bg-accent/10 text-accent border border-accent/20',
  };
  
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

interface LabelProps {
  children: React.ReactNode;
  variant?: 'sample' | 'planned' | 'coming' | 'accent';
  className?: string;
}

export function Label({ children, variant = 'sample', className = '' }: LabelProps) {
  const variants = {
    sample: 'bg-navy-50 text-navy-700',
    planned: 'bg-accent/10 text-accent',
    coming: 'bg-navy-100 text-navy-700',
    accent: 'bg-accent text-navy-900',
  };
  
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section';
}

export function Container({ children, className = '', as = 'div' }: ContainerProps) {
  const Component = as;
  
  return (
    <Component className={`container-width ${className}`}>
      {children}
    </Component>
  );
}

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
  id?: string;
}

export function Section({ children, className = '', dark = false, id }: SectionProps) {
  return (
    <section
      id={id}
      className={`section-padding ${dark ? 'bg-navy-900 text-white' : 'bg-white'} ${className}`}
    >
      {children}
    </section>
  );
}

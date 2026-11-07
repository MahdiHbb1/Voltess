'use client';

import React, { useState } from 'react';
import { LOGO_PATHS } from '@voltess/assets';
import { Button } from '../ui';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  
  const navItems = [
    { label: 'Masalah', href: '#masalah' },
    { label: 'Cara Kerja', href: '#cara-kerja' },
    { label: 'Kios Virtual', href: '#kios-virtual' },
    { label: 'Fitur', href: '#fitur' },
    { label: 'Untuk Siapa', href: '#untuk-siapa' },
    { label: 'Harga', href: '#harga' },
    { label: 'FAQ', href: '#faq' },
  ];
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <img
              src={LOGO_PATHS.logo}
              alt="Logo Voltess"
              className="h-10 w-10"
            />
            <span className="text-xl font-extrabold text-brand-dark tracking-tight">
              VOLTESS
            </span>
          </a>
          
          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-gray-700 hover:text-brand-blue transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
          
          {/* CTA Button */}
          <div className="hidden lg:block">
            <Button size="sm" onClick={() => window.location.href = '#waitlist'}>
              Coba Gratis
            </Button>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-brand-dark"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-4 space-y-3">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block py-2 text-base font-medium text-gray-700 hover:text-brand-blue"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <Button
              className="w-full"
              onClick={() => {
                setIsOpen(false);
                window.location.href = '#waitlist';
              }}
            >
              Coba Gratis
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}

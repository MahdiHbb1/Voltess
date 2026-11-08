'use client';

import React from 'react';
import { LOGO_PATHS } from '@voltess/assets';
import { useTranslation } from '@/i18n';
import { Button } from '../ui';

export function Navbar() {
  const { t, locale, setLocale } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  
  const navItems = [
    { label: t.nav.problem, href: '#problem' },
    { label: t.nav.howItWorks, href: '#how-it-works' },
    { label: t.nav.product, href: '#product' },
    { label: t.nav.pricing, href: '#pricing' },
    { label: t.nav.faq, href: '#faq' },
  ];
  
  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'id' : 'en');
    setIsOpen(false);
  };
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-navy-100">
      <div className="container-width">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3">
            <img
              src={LOGO_PATHS.logo}
              alt="Voltess"
              className="h-10 w-10"
            />
            <img
              src={LOGO_PATHS.wordmark}
              alt="Voltess"
              className="h-7"
            />
          </a>
          
          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-navy-900 hover:text-navy-700 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
          
          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={toggleLocale}
              className="text-sm font-medium text-navy-700 hover:text-navy-900 transition-colors"
              aria-label={t.nav.langLabel}
            >
              {locale === 'en' ? 'ID' : 'EN'}
            </button>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-navy-900"
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
        <div className="lg:hidden border-t border-navy-100 bg-white">
          <div className="container-width py-4 space-y-3">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block py-2 text-base font-medium text-navy-900 hover:text-navy-700"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <button
              onClick={toggleLocale}
              className="block py-2 text-base font-medium text-navy-700 hover:text-navy-900"
            >
              {locale === 'en' ? 'Bahasa Indonesia' : 'English'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

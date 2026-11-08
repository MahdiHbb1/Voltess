'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from './locales/en';
import { id } from './locales/id';
import type { Translation } from './locales/en';

type Locale = 'en' | 'id';

interface I18nContextType {
  locale: Locale;
  t: Translation;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const translations: Record<Locale, Translation> = {
  en,
  id,
};

const LOCALE_STORAGE_KEY = 'voltess_locale';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Always default to English, never auto-detect
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
    if (saved === 'en' || saved === 'id') {
      setLocaleState(saved);
    }
    // If no saved preference, stay on 'en' (already default)
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    
    // Update HTML lang attribute
    document.documentElement.lang = newLocale;
  };

  const value: I18nContextType = {
    locale,
    t: translations[locale],
    setLocale,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  return context;
}

// Number formatting utilities
export function formatCurrency(amount: number, locale: Locale): string {
  // Always Rupiah, but format differently per locale
  const formatter = new Intl.NumberFormat(locale === 'id' ? 'id-ID' : 'en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  return `Rp ${formatter.format(amount)}`;
}

export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'id' ? 'id-ID' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

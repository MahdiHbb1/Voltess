/**
 * @voltess/assets
 * 
 * Export paths untuk logo, maskot Terra, dan aset visual lainnya.
 * Dipakai oleh apps/landing dan apps/web.
 */

// Maskot Terra (6 ekspresi)
// TODO: Ganti dengan file PNG asli di packages/assets/mascot/
export const MASCOT_PATHS = {
  biasa: '/assets/mascot/terra-biasa.svg',
  cemas: '/assets/mascot/terra-cemas.svg',
  hallo: '/assets/mascot/terra-hallo.svg',
  hore: '/assets/mascot/terra-hore.svg',
  mikir: '/assets/mascot/terra-mikir.svg',
  tidur: '/assets/mascot/terra-tidur.svg',
} as const;

export type MascotExpression = keyof typeof MASCOT_PATHS;

// Logo Voltess
// TODO: Ganti dengan file PNG asli di packages/assets/logo/
export const LOGO_PATHS = {
  logo: '/assets/logo/voltess-logo.svg',
  wordmark: '/assets/logo/voltess-wordmark.svg',
} as const;

// Mapping ekspresi maskot untuk konteks landing page
export const MASCOT_CONTEXT_MAP: Record<string, MascotExpression> = {
  hero: 'hallo',
  problem: 'cemas',
  howItWorks: 'hallo',
  aiEngine: 'mikir',
  results: 'hore',
  features: 'hore',
  privacy: 'tidur',
  faq: 'biasa',
  cta: 'hallo',
  default: 'biasa',
} as const;

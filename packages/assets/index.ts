/**
 * @voltess/assets
 * 
 * Export paths untuk logo, maskot Terra, dan aset visual lainnya.
 * Dipakai oleh apps/landing dan apps/web.
 */

// Maskot Terra (6 ekspresi PNG)
export const MASCOT_PATHS = {
  biasa: '/assets/mascot/terra-biasa.png',
  cemas: '/assets/mascot/terra-cemas.png',
  hallo: '/assets/mascot/terra-hallo.png',
  hore: '/assets/mascot/terra-hore.png',
  mikir: '/assets/mascot/terra-mikir.png',
  tidur: '/assets/mascot/terra-tidur.png',
} as const;

export type MascotExpression = keyof typeof MASCOT_PATHS;

// Logo Voltess (PNG)
export const LOGO_PATHS = {
  logo: '/assets/logo/voltess-logo.png',
  wordmark: '/assets/logo/voltess-wordmarks.png',
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

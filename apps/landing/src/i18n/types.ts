/**
 * Type definitions for i18n content
 * Using flexible string types instead of literal types
 */

export interface Translation {
  meta: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
  };
  
  nav: {
    problem: string;
    howItWorks: string;
    product: string;
    pricing: string;
    faq: string;
    cta: string;
    langSwitch: string;
    langLabel: string;
  };
  
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    trustSignals: string[];
    mascotAlt: string;
  };
  
  problem: {
    title: string;
    subtitle: string;
    statement: string;
    cta: string;
  };
  
  howItWorks: {
    title: string;
    steps: Array<{
      title: string;
      description: string;
    }>;
  };
  
  product: {
    title: string;
    subtitle: string;
    mockup: {
      heading: string;
      amount: string;
      perUnit: string;
      disclaimer: string;
      label: string;
    };
    recording: {
      title: string;
      actions: string[];
    };
    breakdown: {
      title: string;
      confidence: string;
      label: string;
    };
  };
  
  virtualKiosk: {
    title: string;
    description: string;
    features: string[];
    planned: string;
  };
  
  aiEngine: {
    title: string;
    subtitle: string;
    points: Array<{
      title: string;
      description: string;
    }>;
    disclaimer: string;
  };
  
  targetUsers: {
    title: string;
    categories: Array<{
      name: string;
      unit: string;
      appliances: string[];
      status?: string;
    }>;
    statusComing: string;
    criteria: string;
  };
  
  pricing: {
    title: string;
    subtitle: string;
    plans: Array<{
      name: string;
      price: string;
      period: string;
      features: string[];
      highlight?: boolean;
      note?: string;
    }>;
    labelEstimate: string;
    disclaimer: string;
    footnote: string;
  };
  
  privacy: {
    title: string;
    points: string[];
  };
  
  faq: {
    title: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  };
  
  cta: {
    title: string;
    subtitle: string;
    benefit: string;
    form: {
      businessName: string;
      businessNamePlaceholder: string;
      businessNameRequired: string;
      businessType: string;
      businessTypePlaceholder: string;
      businessTypeRequired: string;
      whatsapp: string;
      whatsappPlaceholder: string;
      whatsappRequired: string;
      whatsappInvalid: string;
      submit: string;
      submitting: string;
      consent: string;
    };
    success: {
      title: string;
      message: string;
      actionLabel: string;
    };
    mascotAlt: string;
  };
  
  footer: {
    tagline: string;
    product: string;
    features: string;
    pricing: string;
    company: string;
    about: string;
    privacy: string;
    terms: string;
    contact: string;
    copyright: string;
  };
  
  common: {
    sample: string;
    example: string;
    estimated: string;
    planned: string;
    coming: string;
    readMore: string;
    learnMore: string;
    close: string;
  };
}

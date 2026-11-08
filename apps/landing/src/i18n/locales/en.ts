/**
 * English content for Voltess landing page
 * DEFAULT LANGUAGE - all visitors see this first
 */

import type { Translation } from '../types';

export const en: Translation = {
  meta: {
    title: 'Voltess - See Where Your Electricity Bill Goes, in Rupiah',
    description: 'AI energy assistant for Indonesian MSMEs. Track electricity costs per appliance, get savings recommendations, start with a free simulation game.',
    ogTitle: 'Voltess - See Where Your Electricity Bill Goes, in Rupiah',
    ogDescription: 'AI energy assistant for Indonesian MSMEs. Track electricity costs per appliance, get savings recommendations.',
  },
  
  nav: {
    problem: 'Problem',
    howItWorks: 'How it Works',
    product: 'Product',
    pricing: 'Pricing',
    faq: 'FAQ',
    cta: 'Try Free',
    langSwitch: 'Language',
    langLabel: 'Switch to Indonesian',
  },
  
  hero: {
    badge: 'For Indonesian MSMEs',
    title: 'See where your electricity bill goes',
    subtitle: 'Voltess helps small business owners track electricity costs per appliance in Rupiah, then provides clear savings recommendations. Start with a free simulation game. No sensors. No hassle.',
    ctaPrimary: 'Try Free',
    ctaSecondary: 'See How it Works',
    trustSignals: [
      'Free to try',
      'Just photos & voice notes, <2 min/day',
      'Pay only after proven savings',
    ],
    mascotAlt: 'Terra mascot greeting',
  },
  
  problem: {
    title: 'Your bill only shows one total number',
    subtitle: 'Based on interviews with laundry and barbershop owners in Indonesia',
    statement: 'You suspect which appliances use the most electricity, but don\'t know the Rupiah cost. You don\'t have time to track manually. You\'re hesitant to pay for an app without proof it works.',
    cta: 'See the Solution',
  },
  
  howItWorks: {
    title: 'Four steps to savings',
    steps: [
      {
        title: 'Play',
        description: 'Try Virtual Kiosk for free. Adjust usage hours, see costs change. No signup, no data entry.',
      },
      {
        title: 'Match to reality',
        description: 'Replace sample appliances with your own via photo labels. Send meter photos and voice notes for 7 days.',
      },
      {
        title: 'Get recommendations',
        description: 'Day 7: First Report shows estimated high-cost appliances and 1-3 savings tips in Rupiah.',
      },
      {
        title: 'See results',
        description: 'Day 30: Compare to baseline. Subscribe only if results are proven.',
      },
    ],
  },
  
  product: {
    title: 'Track costs by appliance',
    subtitle: 'All estimates labeled "Sample"',
    screens: {
      home: {
        title: 'Yesterday your electricity cost',
        amount: 'Rp 28,172',
        unit: 'About Rp 563 per kg laundry',
        disclaimer: 'Estimate from meter photos and voice notes, not real-time monitoring',
        label: 'Sample',
      },
      track: {
        title: 'Track today, no hassle',
        tabs: ['Meter', 'Appliance labels', 'Voice', 'Manual'],
      },
      costs: {
        title: 'Where your electricity goes',
        confidence: 'High confidence',
        label: 'Sample',
      },
    },
  },
  
  virtualKiosk: {
    title: 'Your business, as a mini village you manage',
    description: 'Choose your business type, kiosk fills with common appliances. Slide usage hours and watch electricity costs change. Complete simple missions (photo appliance labels, meter photos, voice notes) to level up your kiosk, earn decorations, and unlock reports.',
    features: [
      'Maximum 2 minutes per day',
      'Level up from real actions, not just clicks',
    ],
    planned: 'Real rewards planned: subscription credits and "Energy Efficient Business" stickers',
    labelPlanned: 'Planned',
  },
  
  aiEngine: {
    title: 'Numbers you can verify, not guesses',
    subtitle: 'Honest AI engine',
    points: [
      {
        title: 'Formula-based',
        description: 'Appliance power × usage hours, matched against meter readings.',
      },
      {
        title: 'Confidence levels',
        description: 'High / Medium / Low. If data is insufficient, Voltess says "not enough data".',
      },
      {
        title: 'Unexplained differences shown',
        description: 'What\'s unclear is displayed as-is, then Voltess asks questions.',
      },
      {
        title: 'You decide',
        description: 'No actions taken without your approval.',
      },
    ],
    disclaimer: 'Estimates, not real-time monitoring. 24-hour per-appliance tracking requires sensors and is on the roadmap.',
  },
  
  targetUsers: {
    title: 'Who it\'s for',
    categories: [
      {
        name: 'Laundry',
        unit: 'per kg',
        appliances: ['Washing machine', 'Dryer', 'Iron'],
      },
      {
        name: 'Restaurant / Food stall',
        unit: 'per serving',
        appliances: ['Fridge/freezer', 'Rice cooker', 'Electric stove', 'AC'],
      },
      {
        name: 'Bakery / Catering',
        unit: 'per batch',
        appliances: ['Oven', 'Mixer', 'Chiller'],
      },
      {
        name: 'Custom',
        unit: 'custom',
        appliances: ['Add your own'],
      },
      {
        name: 'Water / Ice depot',
        unit: 'per gallon',
        appliances: ['Pump', 'Freezer', 'Ice machine'],
        status: 'coming',
      },
      {
        name: 'Café / Beverages',
        unit: 'per cup',
        appliances: ['Espresso machine', 'Blender', 'Display fridge'],
        status: 'coming',
      },
    ],
    statusComing: 'Coming Soon',
    criteria: 'Best for: significant electricity bill, high-power appliances, uses phone/WhatsApp.',
  },
  
  pricing: {
    title: 'Pricing',
    subtitle: 'Estimates, subject to change',
    plans: [
      {
        name: 'Free',
        price: 'Rp 0',
        period: 'forever',
        features: [
          'Virtual Kiosk',
          'Cost simulation',
          'Business templates',
          'Photo label missions',
          'Kiosk decorations',
        ],
      },
      {
        name: '30-day trial',
        price: 'Rp 0',
        period: '30 days',
        features: [
          'All Plus features',
          'Starts when first real data connects',
          'No credit card required',
        ],
        highlight: true,
      },
      {
        name: 'Plus',
        price: 'Rp 15,000–25,000',
        period: '/month',
        features: [
          'Ongoing analysis',
          'Deviation alerts',
          'Token prediction',
          'ROI calculator',
          'Ask Terra',
          'Monthly reports',
        ],
        note: 'estimated',
      },
    ],
    disclaimer: 'No charges before trial ends. Cancel anytime. Game stays free after trial without subscription.',
    footnote: 'Final pricing determined after pilot and willingness-to-pay testing.',
    labelEstimate: 'Estimated',
  },
  
  privacy: {
    title: 'Privacy & Security',
    points: [
      'Explicit consent before data use',
      'View and delete data anytime (including account)',
      'Photos and voice notes not used for other purposes or model training without permission',
      'Follows Indonesia\'s Personal Data Protection Law (UU PDP) principles',
      'Data access restricted per business',
    ],
  },
  
  faq: {
    title: 'Frequently Asked Questions',
    items: [
      {
        question: 'Does Voltess monitor electricity in real-time?',
        answer: 'Not yet. Voltess analyzes after you send photos/voice notes. Per-appliance 24-hour monitoring requires sensors and is on the roadmap.',
      },
      {
        question: 'How accurate are the estimates?',
        answer: 'Always labeled as estimates with confidence levels. We test accuracy in validation and pilot phases, and display "not enough data" when needed.',
      },
      {
        question: 'Do I need to install devices?',
        answer: 'No. Just your phone.',
      },
      {
        question: 'How long to track each day?',
        answer: 'Target is less than 2 minutes.',
      },
      {
        question: 'Is it free?',
        answer: 'Game free forever, 30-day trial free, then paid Plus if you want to continue.',
      },
      {
        question: 'My business is small, bill only a few hundred thousand Rupiah. Suitable?',
        answer: 'You can still play and try the trial; savings benefits are most significant for businesses with larger bills.',
      },
      {
        question: 'Prepaid electricity works?',
        answer: 'Yes, via token receipt photo and remaining kWh screen.',
      },
      {
        question: 'How is my data treated?',
        answer: 'See Privacy section; you can delete data anytime.',
      },
      {
        question: 'What business types are supported?',
        answer: 'Initially Laundry, Restaurant/food stall, Bakery/catering, and Custom.',
      },
    ],
  },
  
  cta: {
    title: 'Ready to save with confidence?',
    subtitle: 'Join the waitlist now. We\'ll contact you when Voltess is ready to launch.',
    benefit: 'Free 30-day trial for early registrants',
    form: {
      businessName: 'Business Name',
      businessNamePlaceholder: 'e.g., Laundry Berkah',
      businessNameRequired: 'Business name is required',
      businessType: 'Business Type',
      businessTypePlaceholder: 'Select business type',
      businessTypeRequired: 'Please select business type',
      whatsapp: 'WhatsApp Number',
      whatsappPlaceholder: '08123456789',
      whatsappRequired: 'WhatsApp number is required',
      whatsappInvalid: 'Invalid WhatsApp format (example: 08123456789)',
      submit: 'Join Waitlist',
      submitting: 'Submitting...',
      consent: 'By registering, you agree your data will be used to contact you about Voltess launch.',
    },
    success: {
      title: 'Thank you!',
      message: 'We\'ll contact you at the registered WhatsApp number.',
      actionLabel: 'Register Another',
    },
    mascotAlt: 'Terra mascot inviting',
  },
  
  footer: {
    tagline: 'AI energy assistant for Indonesian MSMEs',
    product: 'Product',
    features: 'Features',
    pricing: 'Pricing',
    company: 'Company',
    about: 'About',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    contact: 'Contact',
    copyright: 'All rights reserved.',
  },
  
  common: {
    sample: 'Sample',
    example: 'Example',
    estimated: 'Estimated',
    planned: 'Planned',
    coming: 'Coming Soon',
    readMore: 'Read More',
    learnMore: 'Learn More',
    close: 'Close',
  },
} as const;

export type Translation = typeof en;

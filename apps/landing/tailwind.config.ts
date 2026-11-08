import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#111C31',
          900: '#1A2945',
          800: '#243759',
          700: '#33476E',
          100: '#E6EAF2',
          50: '#F4F6FA',
        },
        accent: {
          DEFAULT: '#10B981',
          hover: '#059669',
        },
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      maxWidth: {
        'container': '75rem', // 1200px
      },
      borderRadius: {
        'sm': '0.5rem',   // 8px
        'md': '0.75rem',  // 12px
        'lg': '1rem',     // 16px
      },
    },
  },
  plugins: [],
};

export default config;

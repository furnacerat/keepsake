import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        keepsake: {
          cream: 'rgb(var(--ks-cream) / <alpha-value>)',
          blush: 'rgb(var(--ks-blush) / <alpha-value>)',
          sageSoft: 'rgb(var(--ks-sage-soft) / <alpha-value>)',
          coolGray: 'rgb(var(--ks-cool-gray) / <alpha-value>)',
          accent: 'rgb(var(--ks-accent) / <alpha-value>)',
          accentStrong: 'rgb(var(--ks-accent-strong) / <alpha-value>)',
          rose: '#B96E6F',
          roseDeep: 'rgb(var(--ks-primary) / <alpha-value>)',
          parchment: '#F7E8D8',
          gold: 'rgb(var(--ks-gold) / <alpha-value>)',
          sage: '#80957A',
          ink: 'rgb(var(--ks-ink) / <alpha-value>)',
          muted: 'rgb(var(--ks-muted) / <alpha-value>)',
          caption: '#6B6B6B',
        },
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        keepsake: '0 18px 45px rgb(var(--ks-shadow-rgb) / 0.12)',
        soft: '0 4px 12px rgba(0, 0, 0, 0.1)',
        glow: '0 0 8px rgb(var(--ks-accent) / 0.4)',
      },
      borderRadius: {
        keepsake: '12px',
      },
      backgroundImage: {
        'keepsake-warm':
          'radial-gradient(circle at top left, rgb(var(--ks-blush) / 0.95), transparent 30rem), linear-gradient(145deg, rgb(var(--ks-cream)) 0%, rgb(var(--ks-blush)) 48%, rgb(var(--ks-sage-soft)) 100%)',
      },
      keyframes: {
        fadeInSoft: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUpCaption: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        rippleIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in-soft': 'fadeInSoft 420ms ease-out both',
        'slide-up-caption': 'slideUpCaption 520ms ease-out both',
        'ripple-in': 'rippleIn 260ms ease-out both',
      },
    },
  },
  plugins: [],
} satisfies Config;

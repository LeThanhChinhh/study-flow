/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'monospace'],
      },
      colors: {
        primary: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
      },
      animation: {
        /* ── Entrance ── */
        'fade-in':     'fadeIn    0.5s  ease-out both',
        'slide-up':    'slideUp  0.55s  ease-out both',
        'slide-up-sm': 'slideUpSm 0.4s  ease-out both',

        /* ── Ambient / decorative ── */
        'pulse-soft':  'pulseSoft 2.4s  ease-in-out infinite',
        'float':       'float     7s    ease-in-out infinite',
        'float-slow':  'float    13s    ease-in-out infinite',
        'float-alt':   'floatAlt 10s   ease-in-out infinite',
        'twinkle':     'twinkle   4.5s  ease-in-out infinite',
        'drift':       'drift     9s    ease-in-out infinite',

        /* ── UI feedback ── */
        'card-rise':   'cardRise 0.35s ease-out both',
        'shimmer':     'shimmer  2.2s  linear infinite',
        'ring-spin':   'ringSpin 60s   linear   infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(22px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUpSm: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.35' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-14px)' },
        },
        floatAlt: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '33%':      { transform: 'translateY(-10px) translateX(6px)' },
          '66%':      { transform: 'translateY(6px) translateX(-4px)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.15' },
          '50%':      { opacity: '0.55' },
        },
        drift: {
          '0%, 100%': { transform: 'translate(0px,  0px)'  },
          '33%':      { transform: 'translate(-6px, -5px)' },
          '66%':      { transform: 'translate( 5px,  6px)' },
        },
        cardRise: {
          '0%':   { opacity: '0', transform: 'translateY(12px) scale(0.99)' },
          '100%': { opacity: '1', transform: 'translateY(0)    scale(1)'    },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
        ringSpin: {
          '0%':   { transform: 'rotate(0deg)'   },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      boxShadow: {
        'card':    '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.03)',
        'card-md': '0 4px 20px 0 rgb(0 0 0 / 0.07)',
        'card-lg': '0 12px 48px 0 rgb(0 0 0 / 0.10)',
        'card-lift': '0 8px 28px 0 rgb(0 0 0 / 0.09), 0 2px 6px 0 rgb(0 0 0 / 0.04)',
        'violet-glow': '0 4px 20px 0 rgba(124, 58, 237, 0.22)',
        'violet-glow-lg': '0 8px 36px 0 rgba(124, 58, 237, 0.28)',
        'rose-glow': '0 4px 20px 0 rgba(251, 113, 133, 0.22)',
        'inner-top': 'inset 0 1px 0 0 rgba(255,255,255,0.6)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
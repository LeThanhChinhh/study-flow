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
        'fade-in':    'fadeIn    0.45s ease-out both',
        'slide-up':   'slideUp  0.5s  ease-out both',
        'pulse-soft': 'pulseSoft 2s   ease-in-out infinite',
        'float':      'float    7s    ease-in-out infinite',
        'float-slow': 'float    11s   ease-in-out infinite',
        'twinkle':    'twinkle  4.5s  ease-in-out infinite',
        'drift':      'drift    9s    ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.4' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.18' },
          '50%':      { opacity: '0.52' },
        },
        drift: {
          '0%, 100%': { transform: 'translate(0px,  0px)'  },
          '33%':      { transform: 'translate(-5px, -4px)' },
          '66%':      { transform: 'translate( 4px,  5px)' },
        },
      },
      boxShadow: {
        'card':    '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.03)',
        'card-md': '0 4px 16px 0 rgb(0 0 0 / 0.07)',
        'card-lg': '0 8px 40px 0 rgb(0 0 0 / 0.10)',
      },
    },
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#fff0f3', 100: '#ffe0e8', 200: '#ffc5d4', 300: '#ff97b1',
          400: '#ff5885', 500: '#ff2361', 600: '#f00046', 700: '#cc0040',
          800: '#a80038', 900: '#8f0034',
        },
        mama: { DEFAULT: '#E91E8C', light: '#FCE4F5', dark: '#AD1569' },
        antitabaco: { DEFAULT: '#2196F3', light: '#E3F2FD', dark: '#1565C0' },
        vph: { DEFAULT: '#9C27B0', light: '#F3E5F5', dark: '#6A1B9A' },
        piel: { DEFAULT: '#FF9800', light: '#FFF3E0', dark: '#E65100' },
        cuello: { DEFAULT: '#009688', light: '#E0F2F1', dark: '#00695C' },
        prostata: { DEFAULT: '#1565C0', light: '#E3F2FD', dark: '#0D47A1' },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.35s ease-out',
        'shake': 'shake 0.5s ease-in-out',
        'bounce-once': 'bounceOnce 0.6s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'confetti-fall': 'confettiFall 1s ease-in forwards',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideInRight: { from: { opacity: '0', transform: 'translateX(30px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        shake: { '0%,100%': { transform: 'translateX(0)' }, '20%,60%': { transform: 'translateX(-6px)' }, '40%,80%': { transform: 'translateX(6px)' } },
        bounceOnce: { '0%': { transform: 'scale(1)' }, '40%': { transform: 'scale(1.15)' }, '70%': { transform: 'scale(0.95)' }, '100%': { transform: 'scale(1)' } },
        confettiFall: { from: { transform: 'translateY(-10px) rotate(0deg)', opacity: '1' }, to: { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' } },
      },
    },
  },
  plugins: [],
};

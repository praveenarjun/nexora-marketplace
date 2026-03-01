/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f2fb',
          100: '#e1e5f7',
          200: '#c3ccf0',
          300: '#a5b2e9',
          400: '#8799e2',
          500: '#576ee0', // Stitch Primary
          600: '#4658b3',
          700: '#344286',
          800: '#232c5a',
          900: '#11162d',
        },
        dark: {
          950: '#000000',
          900: '#121420', // Stitch Dark Background
          800: '#1a1c2e',
          700: '#232640',
          600: '#2c3052',
        },
        background: {
          light: '#f6f6f8',
          dark: '#121420',
        }
      },
      fontFamily: {
        display: ['IBM Plex Sans', 'Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99,102,241,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(99,102,241,0.6)' },
        },
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dark Navy + Teal Theme (Resumake-inspired)
        primary: {
          DEFAULT: '#13141C',
          light: '#1A1B26',
          dark: '#0D0E14',
        },
        accent: {
          DEFAULT: '#4EAA93',
          light: '#5CC4A8',
          dark: '#3D8977',
          hover: '#205A4F',
        },
        secondary: {
          DEFAULT: '#353B42',
          light: '#454B52',
          dark: '#252A30',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#E5E7EB',
          muted: '#9CA3AF',
          disabled: '#6B7280',
        },
        surface: {
          main: '#13141C',
          elevated: '#1A1B26',
          input: '#252A30',
          hover: 'rgba(78, 170, 147, 0.1)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Source Sans Pro', 'system-ui', 'sans-serif'],
      },
      screens: {
        'xs': '475px',
        '3xl': '1920px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

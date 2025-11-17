/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Black & Vibrant Green Theme
        primary: {
          DEFAULT: '#000000',
          light: '#0A0A0A',
          dark: '#000000',
        },
        accent: {
          DEFAULT: '#00FF88', // Vibrant neon green
          light: '#33FFa3',
          dark: '#00CC6E',
          hover: '#00E67A',
          glow: 'rgba(0, 255, 136, 0.3)',
        },
        emerald: {
          50: '#E6FFF4',
          100: '#B3FFE0',
          200: '#80FFCC',
          300: '#4DFFB8',
          400: '#1AFFA4',
          500: '#00FF88', // Main vibrant green
          600: '#00CC6E',
          700: '#009954',
          800: '#00663A',
          900: '#003320',
        },
        secondary: {
          DEFAULT: '#1A1A1A',
          light: '#2A2A2A',
          dark: '#0F0F0F',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#E8E8E8',
          muted: '#A0A0A0',
          disabled: '#666666',
        },
        surface: {
          main: '#000000',
          elevated: '#121212',
          card: '#1A1A1A',
          input: '#1F1F1F',
          hover: 'rgba(0, 255, 136, 0.08)',
        },
        border: {
          DEFAULT: '#2A2A2A',
          light: '#333333',
          accent: '#00FF88',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        // Responsive fluid typography
        'xs': ['clamp(0.7rem, 0.5vw + 0.6rem, 0.75rem)', { lineHeight: '1.4' }],
        'sm': ['clamp(0.8rem, 0.6vw + 0.7rem, 0.875rem)', { lineHeight: '1.5' }],
        'base': ['clamp(0.9rem, 0.8vw + 0.8rem, 1rem)', { lineHeight: '1.6' }],
        'lg': ['clamp(1rem, 1vw + 0.9rem, 1.125rem)', { lineHeight: '1.7' }],
        'xl': ['clamp(1.1rem, 1.2vw + 1rem, 1.25rem)', { lineHeight: '1.75' }],
        '2xl': ['clamp(1.25rem, 1.5vw + 1.1rem, 1.5rem)', { lineHeight: '1.8' }],
        '3xl': ['clamp(1.5rem, 2vw + 1.3rem, 1.875rem)', { lineHeight: '1.9' }],
        '4xl': ['clamp(1.875rem, 2.5vw + 1.5rem, 2.25rem)', { lineHeight: '2' }],
        '5xl': ['clamp(2.25rem, 3vw + 1.8rem, 3rem)', { lineHeight: '1.1' }],
        '6xl': ['clamp(2.75rem, 4vw + 2.2rem, 3.75rem)', { lineHeight: '1' }],
        '7xl': ['clamp(3.5rem, 5vw + 2.8rem, 4.5rem)', { lineHeight: '1' }],
      },
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'xs': '0.25rem',
        'sm': '0.375rem',
        'DEFAULT': '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.5rem',
        '2xl': '2rem',
        '3xl': '3rem',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0, 255, 136, 0.3)',
        'glow-lg': '0 0 40px rgba(0, 255, 136, 0.4)',
        'glow-sm': '0 0 10px rgba(0, 255, 136, 0.2)',
        'dark': '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'glow': 'glow 2s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 255, 136, 0.5)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};

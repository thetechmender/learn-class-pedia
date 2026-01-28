/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['0.875rem', { lineHeight: '1.25rem' }],
        'lg': ['0.9rem', { lineHeight: '1.4rem' }],
        'xl': ['1rem', { lineHeight: '1.5rem' }],
        '2xl': ['1.25rem', { lineHeight: '1.5rem' }],
        '3xl': ['1.5rem', { lineHeight: '1.6rem' }],
        '4xl': ['1.8rem', { lineHeight: '1.7rem' }],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      }
    },
  },
  plugins: [],
}
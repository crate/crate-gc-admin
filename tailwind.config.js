/* @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: ['class'],
  prefix: '',
  theme: {
    extend: {
      colors: {
        'crate-blue': '#00A6D1',
        'crate-navigation-bg': '#262626',
        'crate-navigation-fg': '#e5e5e5',
        'crate-green-1': '#9BF1AD',
        'crate-body-background': '#F1F1F1',
        'crate-border-dark': '#525252', // tailwind neutral-600
        'crate-border-mid': '#A3A3A3', // tailwind neutral-400
        'crate-border-light': '#D4D4D4', // tailwind neutral-300
        'crate-form-disabled': '#f5f5f5',
        'crate-gray30': '#777',
        transparent: 'transparent',
      },
      fontFamily: {
        inter: ['Inter', 'Arial', 'sans-serif'],
        poppins: ['Poppins', 'Arial', 'sans-serif'],
        simsun: ['SimSun', 'sans-serif'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

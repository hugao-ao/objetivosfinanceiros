/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f0f5',
          100: '#cce0eb',
          200: '#99c2d6',
          300: '#66a3c2',
          400: '#3385ad',
          500: '#006699',
          600: '#00527a',
          700: '#003d5c',
          800: '#00293d',
          900: '#00141f',
        },
        secondary: {
          50: '#e6f5ec',
          100: '#ccead9',
          200: '#99d5b3',
          300: '#66c18d',
          400: '#33ac66',
          500: '#009740',
          600: '#007933',
          700: '#005b26',
          800: '#003c1a',
          900: '#001e0d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

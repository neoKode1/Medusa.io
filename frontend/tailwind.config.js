/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'runway-black': '#0A0A0A',
        'runway-gray': '#1A1A1A',
      },
    },
  },
  plugins: [],
} 
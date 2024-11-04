/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      animation: {
        'orbit1': 'orbit1 12s linear infinite',
        'orbit2': 'orbit2 18s linear infinite', 
        'orbit3': 'orbit3 24s linear infinite',
      }
    },
  },
  plugins: [],
} 
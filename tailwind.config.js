/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        neonBlue: '#00f3ff',
        neonPurple: '#c800ff',
        lightBg: '#f4f4f9',
        lightTint: '#e8eaf6'
      },
      boxShadow: {
        neonBlue: '0 0 10px #00f3ff, 0 0 20px #00f3ff, 0 0 40px #00f3ff',
        neonPurple: '0 0 10px #c800ff, 0 0 20px #c800ff, 0 0 40px #c800ff',
      }
    },
  },
  plugins: [],
}

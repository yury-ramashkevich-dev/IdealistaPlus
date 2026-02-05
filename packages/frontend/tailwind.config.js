/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'idealista-green': '#00B389',
        'idealista-dark': '#1A1A1A',
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mauve: {
          50: '#f9f5f7',
          100: '#f3e8ef',
          200: '#e7cce0',
          300: '#dbaed0',
          400: '#ce91c1',
          500: '#b377a7',
          600: '#8d5f83',
          700: '#694663',
          800: '#442f43',
          900: '#231725',
        },
      },
    },
  },
  plugins: [],
}

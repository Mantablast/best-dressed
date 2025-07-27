/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        fairy: {
          blush: '#FBEAEC',
          lavender: '#EADCF7',
          sage: '#D8E3DC',
          rose: '#F8D7DA',
          cream: '#FFF8F0',
          mauve: '#E2CCE1',
        },
      },
      fontFamily: {
        fairy: ['"Quicksand"', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
};

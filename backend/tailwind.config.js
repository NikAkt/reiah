/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['selector', '[data-mode="dark"]'],
  content: [ "./**/*.html", "./**/*.templ", "./**/*.go", "./**/*.js"],
  safelist: [],
  extend: {
    colors: {
    'text-color': '#090e0c',
    'background-color': '#f9fbfa',
    'primary-color': '#10b981',
    'secondary-color': '#bbf7d0',
    'accent-color': '#ac9d87',
    },
  },
  theme: {
    fontSize: {
      sm: '0.750rem',
      base: '1rem',
      xl: '1.333rem',
      '2xl': '1.777rem',
      '3xl': '2.369rem',
      '4xl': '3.158rem',
      '5xl': '4.210rem',
    },
    fontFamily: {
      heading: 'Noto Sans Cuneiform',
      body: 'Noto Sans Cuneiform',
    },
    fontWeight: {
      normal: '400',
      bold: '700',
    },
  }
}

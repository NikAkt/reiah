/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["selector", '[data-mode="dark"]'],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        'home-screen': "url('./src/assets/side-wave_background.svg')",
      },
      colors: {
        "text-color": "#090e0c",
        "background-color": "#f9fbfa",
        "primary-color": "#10b981",
        "secondary-color": "#bbf7d0",
        "accent-color": "#ac9d87",
        "custom-bg-color": "#F3F4F6",
      },
      animation: {
        "fade-in": "fadeIn 2s ease-in forwards",
        "slide-in": "slideIn 2s ease-in-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};

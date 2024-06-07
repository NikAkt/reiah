/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        blue: "#0145ac",
        green: "#81c7a5",
        black: "#1b212c",
      },
      animation: {
        "fade-down": "fade-down 0.2s ease-out forwards",
      },
      keyframes: {
        "fade-down": {
          "0%": { opacity: "0", transform: "translateY(0)" },
          "100%": { opacity: "1", transform: "translateY(1vh)" },
        },
      },
    },
  },
  plugins: [],
};

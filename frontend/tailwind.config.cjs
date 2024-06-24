/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    filter_title: {},
    extend: {
      colors: {
        blue: "#0145ac",
        green: "#81c7a5",
        black: "#1b212c",
        white: "#F3F4F6",
      },
      animation: {
        "fade-down": "fade-down 0.2s ease-out forwards",
        "fade-in": "fade-in 0.2s ease-out forwards",
      },
      keyframes: {
        "fade-down": {
          "0%": { opacity: "0", transform: "translateY(0)" },
          "100%": { opacity: "1", transform: "translateY(2vh)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateX(-2vw)" },
          "100%": { opacity: "1", transform: "translateX(0vw)" },
        },
        "fade-out": {
          "0%": { opacity: "0", transform: "translateX(2vw)" },
          "100%": { opacity: "1", transform: "translateX(0vw)" },
        },
      },
    },
  },
  plugins: [],
};

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
        corvu: {
          bg: "#f3f1fe",
          100: "#e6e2fd",
          200: "#d4cbfb",
          300: "#bcacf6",
          400: "#a888f1",
          text: "#180f24",
        },
      },
      animation: {
        "fade-down": "fade-down 0.2s ease-out forwards",
        "fade-in": "fade-in 0.2s ease-out forwards",
        expand: "expand 250ms cubic-bezier(0.32,0.72,0,0.75)",
        collapse: "collapse 250ms cubic-bezier(0.32,0.72,0,0.75)",
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
        expand: {
          "0%": {
            height: "0px",
          },
          "100%": {
            height: "var(--corvu-disclosure-content-height)",
          },
        },
        collapse: {
          "0%": {
            height: "var(--corvu-disclosure-content-height)",
          },
          "100%": {
            height: "0px",
          },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("tailwindcss-animate"),
    require("@corvu/tailwind"),
  ],
};

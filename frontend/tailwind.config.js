/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", '[data-mode="dark"]'],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "text-color": "#090e0c",
        "background-color": "#f9fbfa",
        "primary-color": "#10b981",
        "secondary-color": "#bbf7d0",
        "accent-color": "#ac9d87",
        blue: "#0145ac",
        green: "#81c7a5",
        black: "#1b212c",
        white: "#F3F4F6",
        grey: "#2F2F2F",
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
        "fade-out": "fade-out 0.2s ease-out backwards",
        expand: "expand 250ms cubic-bezier(0.32,0.72,0,0.75)",
        collapse: "collapse 250ms cubic-bezier(0.32,0.72,0,0.75)",
      },
      keyframes: {
        "fade-down": {
          "0%": { opacity: "0", transform: "translateY(-2vh)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateX(-2vw)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "fade-out": {
          "0%": { opacity: "1", transform: "translateX(0)" },
          "100%": { opacity: "0", transform: "translateX(2vw)" },
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
      gridTemplateColumns: {
        // Adding the custom grid column configuration
        24: "repeat(24, minmax(0, 1fr))",
      },
    },
    fontSize: {
      sm: "0.750rem",
      base: "1rem",
      xl: "1.333rem",
      "2xl": "1.777rem",
      "3xl": "2.369rem",
      "4xl": "3.158rem",
      "5xl": "4.210rem",
    },
    fontFamily: {
      heading: "Noto Sans Cuneiform",
      body: "Noto Sans Cuneiform",
    },
    fontWeight: {
      normal: "400",
      bold: "700",
    },
  },
  plugins: [require("tailwindcss-animate")],
};

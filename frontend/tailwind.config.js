/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        blue: "#0145ac",
        green: "#81c7a5",
        black: "#1b212c",
      },
    },
  },
  plugins: [],
};

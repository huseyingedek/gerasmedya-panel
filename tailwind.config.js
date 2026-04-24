/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        gold: { 300:"#E8D5A3", 400:"#D4B86A", 500:"#C9A84C", 600:"#A8893D", 700:"#8A6F2E" },
      },
    },
  },
  plugins: [],
};

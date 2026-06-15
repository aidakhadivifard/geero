/** @type {import('tailwindcss').Config} */
// Mirrors the prototype's tailwind.config exactly (colors + fonts).
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#FDFBF7",
        ink: "#3C3836",
        gold: "#D4A373",
        clay: "#E9E0D2",
        sage: "#8B9474",
        card: "#FFFFFF",
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', "Georgia", "serif"],
        sans: ["Outfit", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

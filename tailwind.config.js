/* @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@crate/crate-ui-components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "crate-blue": "#00A6D1",
        "crate-green-1": "#9BF1AD",
        "crate-body-background": "#F1F1F1",
        "crate-border-dark": "#525252", // tailwind neutral-600
        "crate-border-mid": "#A3A3A3", // tailwind neutral-400
        "crate-border-light": "#D4D4D4", // tailwind neutral-300
        "crate-form-disabled": "#f5f5f5",
        "crate-gray30": "#777",
        transparent: "transparent",
      },
      fontFamily: {
        inter: ["Inter", "Arial", "sans-serif"],
        poppins: ["Poppins", "Arial", "sans-serif"],
        simsun: ["SimSun", "sans-serif"],
      },
    },
  },
  plugins: [],
};

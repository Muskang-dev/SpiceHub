/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#e05c2a', dark: '#c04820', light: '#fdf0eb' },
        spice: { 50: '#fdf8f5', 100: '#f5e6df', 900: '#1a1a2e' },
      },
      fontFamily: {
        head: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

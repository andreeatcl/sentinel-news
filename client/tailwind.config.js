/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.jsx",
    "./main.jsx",
    "./components/**/*.{js,jsx}",
    "./hooks/**/*.{js,jsx}",
    "./utils/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        carbon: {
          950: "#080a0e",
          900: "#0d1017",
          800: "#141820",
          700: "#1c2130",
          600: "#2e3850",
          500: "#4b556f",
        },
        signal: {
          cyan: "#D80027",
          red: "#D80027",
          amber: "#f59e0b",
          green: "#22c55e",
        },
      },
      fontFamily: {
        display: ["Rajdhani", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

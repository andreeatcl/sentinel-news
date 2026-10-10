import defaultTheme from "tailwindcss/defaultTheme";

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
        // neutral dark-grey scale: 950 = app background, 900 = panels,
        // 850 = raised surfaces / inputs, 800 = hover, 700 = borders,
        // 500-300 = secondary text, 100 = primary text
        carbon: {
          50: "#f6f6f7",
          100: "#ececee",
          200: "#d4d4d8",
          300: "#acacb3",
          400: "#8a8a92",
          500: "#66666e",
          600: "#46464c",
          700: "#323237",
          750: "#2a2a2e",
          800: "#232326",
          850: "#1d1d20",
          900: "#18181a",
          950: "#111113",
        },
        // brand red: logo, selection, active states
        accent: {
          DEFAULT: "#D80027",
          hover: "#E8173C",
        },
        // status colors, tuned to be readable as text on dark surfaces
        signal: {
          red: "#F2455F",
          amber: "#F5A524",
          green: "#3DD07A",
        },
      },
      fontFamily: {
        sans: ["Geist Variable", ...defaultTheme.fontFamily.sans],
        mono: ["Geist Mono Variable", ...defaultTheme.fontFamily.mono],
      },
      fontSize: {
        "2xs": ["11px", { lineHeight: "16px" }],
      },
      boxShadow: {
        panel:
          "0 24px 64px -16px rgb(0 0 0 / 0.7), 0 0 0 1px rgb(255 255 255 / 0.03)",
        pop: "0 12px 32px -8px rgb(0 0 0 / 0.6)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "pop-in": {
          from: { opacity: "0", transform: "translateY(6px) scale(0.98)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 150ms ease-out",
        "pop-in": "pop-in 200ms cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

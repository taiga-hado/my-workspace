import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#f3f5fa",
          100: "#e4e9f3",
          200: "#c5cfe3",
          300: "#94a6c9",
          400: "#5d77a9",
          500: "#3b5789",
          600: "#2b4370",
          700: "#22345a",
          800: "#1c2a48",
          900: "#0f1b33",
          950: "#0a1224",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-noto)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Hiragino Sans",
          "sans-serif",
        ],
        serif: ["var(--font-serif)", "serif"],
      },
      letterSpacing: {
        wider2: "0.12em",
      },
    },
  },
  plugins: [],
};
export default config;

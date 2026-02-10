import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1B409C",
          light: "#2E56BC",
          dark: "#163582",
        },
        secondary: {
          DEFAULT: "#ED3269",
          light: "#F05C87",
          dark: "#D5275A",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

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
          DEFAULT: "#FF6B35",
          light: "#FF8C61",
          dark: "#E55A2B",
        },
        secondary: {
          DEFAULT: "#004E89",
          light: "#1A6FA8",
          dark: "#003D6B",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

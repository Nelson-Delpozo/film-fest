import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Michroma', 'sans-serif'], // Custom font family
      },
    },
  },
  plugins: [],
} satisfies Config;

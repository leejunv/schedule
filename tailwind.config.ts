import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 14px 40px rgba(21, 30, 45, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#6B2D5B",
          light: "#8B4D7B",
          lighter: "#F3E8F0",
        },
        secondary: {
          DEFAULT: "#F3E8F0",
        },
        accent: {
          DEFAULT: "#9B5B8B",
          hover: "#874C78",
        },
      },
    },
  },
  plugins: [],
};
export default config;

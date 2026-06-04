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
        navy:     "#0B2D52",
        cyan:     "#1A9FB4",
        charcoal: "#1E293B",
        muted:    "#94A3B8",
        success:  "#10B981",
        warning:  "#F59E0B",
        danger:   "#EF4444",
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
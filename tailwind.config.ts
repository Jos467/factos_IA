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
        navy: {
          DEFAULT: "#0B2D52",
          light: "#154173",
          dark: "#051A33",
        },
        cyan: {
          DEFAULT: "#1A9FB4",
          muted: "#E0F7F9",
        },
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
      boxShadow: {
        'premium': '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        'button': '0 4px 14px 0 rgba(11, 45, 82, 0.15)',
      },
      borderRadius: {
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
};

export default config;
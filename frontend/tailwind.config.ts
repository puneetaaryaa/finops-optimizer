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
        background: "#090D16",
        foreground: "#F8FAFC",
        panel: {
          DEFAULT: "rgba(17, 24, 39, 0.6)",
          border: "rgba(255, 255, 255, 0.08)",
        },
        brand: {
          cyan: "#00F2FE",
          purple: "#7F00FF",
          neonGreen: "#39FF14",
          neonOrange: "#FF5E00",
        }
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      boxShadow: {
        'glow-cyan': '0 0 15px rgba(0, 242, 254, 0.15)',
        'glow-purple': '0 0 15px rgba(127, 0, 255, 0.15)',
        'glow-green': '0 0 15px rgba(57, 255, 20, 0.15)',
      }
    },
  },
  plugins: [],
};
export default config;

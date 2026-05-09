import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          primary: "#0B1A2A",
          secondary: "#16283A",
          card: "#101F33",
          border: "#24384F",
        },
        wine: {
          DEFAULT: "#7A1E2C",
          deep: "#4A0F1B",
        },
        gold: {
          DEFAULT: "#F5C542",
        },
        electric: {
          DEFAULT: "#3B82F6",
        },
        cyan: {
          glow: "#38BDF8",
        },
        success: "#22C55E",
        danger: "#EF4444",
        "text-light": "#E5E7EB",
        "text-muted": "#94A3B8",
        "off-white": "#F8FAFC",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        condensed: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "slide-up": "slideUp 0.3s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(245, 197, 66, 0.2)" },
          "100%": { boxShadow: "0 0 20px rgba(245, 197, 66, 0.6)" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
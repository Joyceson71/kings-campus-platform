import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Space Grotesk", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        border: "rgba(0,255,200,0.1)",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: "rgba(255,255,255,0.04)",
        card: "rgba(13,25,41,0.95)",
        primary: "#00ffe0",
        accent: "#ff0aff",
        success: "#00ffe0",
        warning: "#ffec00",
        danger: "#ff453a",
        neon: {
          cyan: "#00ffe0",
          pink: "#ff0aff",
          yellow: "#ffec00",
          purple: "#9d00ff",
          orange: "#ff6b00",
          blue: "#0080ff",
        }
      },
      boxShadow: {
        "neon-cyan": "0 0 20px rgba(0,255,200,0.3)",
        "neon-pink": "0 0 20px rgba(255,10,255,0.3)",
        "neon-yellow": "0 0 20px rgba(255,236,0,0.3)",
        glass: "0 24px 80px rgba(0,0,0,.60)",
        inset: "inset 8px 8px 18px rgba(0,0,0,.4), inset -8px -8px 18px rgba(255,255,255,.02)",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "float": "float 4s ease-in-out infinite",
        "shimmer": "shimmer 4s ease-in-out infinite",
        "spin-slow": "spin-slow 8s linear infinite",
        "slide-up": "slide-in-up 0.4s ease forwards",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "slide-in-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { left: "-75%" },
          "50%, 100%": { left: "130%" },
        }
      }
    }
  },
  plugins: [],
};

export default config;

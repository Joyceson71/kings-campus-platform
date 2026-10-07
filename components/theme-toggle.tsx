"use client";

import { Moon, Sun, Zap } from "lucide-react";
import { useEffect, useState } from "react";

type Accent = "cyan" | "pink" | "yellow";

const accentMap: Record<Accent, { color: string; glow: string; label: string }> = {
  cyan: { color: "#00ffe0", glow: "rgba(0,255,200,0.3)", label: "Cyan" },
  pink: { color: "#ff0aff", glow: "rgba(255,10,255,0.3)", label: "Pink" },
  yellow: { color: "#ffec00", glow: "rgba(255,236,0,0.3)", label: "Yellow" },
};

export function ThemeToggle() {
  const [accent, setAccent] = useState<Accent>("cyan");

  useEffect(() => {
    const saved = (localStorage.getItem("chaos-accent") as Accent | null) ?? "cyan";
    setAccent(saved);
    document.documentElement.style.setProperty("--neon-cyan", accentMap[saved].color);
  }, []);

  function cycleAccent() {
    const order: Accent[] = ["cyan", "pink", "yellow"];
    const next = order[(order.indexOf(accent) + 1) % order.length];
    setAccent(next);
    document.documentElement.style.setProperty("--neon-cyan", accentMap[next].color);
    localStorage.setItem("chaos-accent", next);
  }

  const { color, glow, label } = accentMap[accent];

  return (
    <button
      id="theme-toggle-btn"
      aria-label={`Accent: ${label}`}
      title={`Accent mode: ${label} — click to cycle`}
      onClick={cycleAccent}
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        display: "grid",
        placeItems: "center",
        background: `${glow.replace("0.3", "0.08")}`,
        border: `1px solid ${color}40`,
        color: color,
        boxShadow: `0 0 16px ${glow}`,
        cursor: "pointer",
        transition: "all 0.2s ease",
        flexShrink: 0
      }}
    >
      <Zap size={16} />
    </button>
  );
}

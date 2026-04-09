// ═══════════════════════════════════════════════════════════════
// Shared Theme Constants — Single Source of Truth
// ═══════════════════════════════════════════════════════════════

import type { AccentColor } from "@/types/hermes";

// ── Icon Color Map ────────────────────────────────────────────
export const iconColorMap: Record<AccentColor, string> = {
  cyan: "text-neon-cyan",
  purple: "text-neon-purple",
  green: "text-neon-green",
  pink: "text-neon-pink",
  orange: "text-neon-orange",
};

// ── Border Color Map (for hover effects) ─────────────────────
export const colorBorderMap: Record<AccentColor, string> = {
  cyan: "border-cyan-500/30 hover:border-cyan-500/60 hover:shadow-[0_0_20px_rgba(0,245,255,0.1)]",
  purple: "border-purple-500/30 hover:border-purple-500/60 hover:shadow-[0_0_20px_rgba(184,41,255,0.1)]",
  green: "border-green-500/30 hover:border-green-500/60 hover:shadow-[0_0_20px_rgba(57,255,20,0.1)]",
  pink: "border-pink-500/30 hover:border-pink-500/60 hover:shadow-[0_0_20px_rgba(255,45,149,0.1)]",
  orange: "border-orange-500/30 hover:border-orange-500/60 hover:shadow-[0_0_20px_rgba(255,107,53,0.1)]",
};

// ── Focus Ring Color (for inputs/selects) ─────────────────────
export const focusColorMap: Record<AccentColor, string> = {
  cyan: "focus:border-neon-cyan/50",
  purple: "focus:border-neon-purple/50",
  green: "focus:border-neon-green/50",
  pink: "focus:border-neon-pink/50",
  orange: "focus:border-neon-orange/50",
};

// ── Glow Class Map ────────────────────────────────────────────
export const glowClassMap: Record<AccentColor, string> = {
  cyan: "glow-cyan",
  purple: "glow-purple",
  green: "glow-green",
  pink: "glow-pink",
  orange: "glow-orange",
};

// ── Badge Background Color ────────────────────────────────────
export const badgeBgMap: Record<AccentColor, string> = {
  cyan: "bg-neon-cyan/10",
  purple: "bg-neon-purple/10",
  green: "bg-neon-green/10",
  pink: "bg-neon-pink/10",
  orange: "bg-neon-orange/10",
};

// ── Badge Text Color ──────────────────────────────────────────
export const badgeTextMap: Record<AccentColor, string> = {
  cyan: "text-neon-cyan",
  purple: "text-neon-purple",
  green: "text-neon-green",
  pink: "text-neon-pink",
  orange: "text-neon-orange",
};

// ── Badge Border Color ────────────────────────────────────────
export const badgeBorderMap: Record<AccentColor, string> = {
  cyan: "border-neon-cyan/20",
  purple: "border-neon-purple/20",
  green: "border-neon-green/20",
  pink: "border-neon-pink/20",
  orange: "border-neon-orange/20",
};

// ── Combined Badge Styles ─────────────────────────────────────
export function badgeClasses(color: AccentColor): string {
  return `${badgeBgMap[color]} ${badgeTextMap[color]} ${badgeBorderMap[color]} border`;
}

// ── Base Input Styles ─────────────────────────────────────────
export const baseInputStyles =
  "w-full bg-dark-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 outline-none transition-colors font-mono";

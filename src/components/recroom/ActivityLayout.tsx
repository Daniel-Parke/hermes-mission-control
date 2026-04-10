// ═══════════════════════════════════════════════════════════════
// ActivityLayout — Shared page wrapper for all Rec Room activities
// ═══════════════════════════════════════════════════════════════

"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { ActivityMeta } from "@/types/recroom";
import { iconColorMap } from "@/lib/theme";
import type { AccentColor } from "@/types/hermes";

interface ActivityLayoutProps {
  activity: ActivityMeta;
  iconMap: Record<string, React.ComponentType<{ className?: string }>>;
  children: React.ReactNode;
}

const accentBorders: Record<AccentColor, string> = {
  cyan: "border-cyan-500/30",
  purple: "border-purple-500/30",
  green: "border-green-500/30",
  pink: "border-pink-500/30",
  orange: "border-orange-500/30",
};

const accentGlows: Record<AccentColor, string> = {
  cyan: "shadow-[0_0_20px_rgba(0,255,255,0.1)]",
  purple: "shadow-[0_0_20px_rgba(168,85,247,0.1)]",
  green: "shadow-[0_0_20px_rgba(0,255,65,0.1)]",
  pink: "shadow-[0_0_20px_rgba(236,72,153,0.1)]",
  orange: "shadow-[0_0_20px_rgba(251,146,60,0.1)]",
};

export default function ActivityLayout({ activity, iconMap, children }: ActivityLayoutProps) {
  const Icon = iconMap[activity.icon] || iconMap.Zap;
  const borderColor = accentBorders[activity.accentColor] || accentBorders.cyan;
  const glowClass = accentGlows[activity.accentColor] || accentGlows.cyan;
  const iconColor = iconColorMap[activity.accentColor] || "text-neon-cyan";

  return (
    <div className="min-h-screen bg-dark-950 grid-bg relative scanlines">
      {/* Header */}
      <div className={`border-b border-white/10 bg-dark-900/50 px-6 py-4 backdrop-blur-xl border-t-2 ${borderColor} ${glowClass}`}>
        <div className="flex items-center gap-3">
          <Link
            href="/recroom"
            className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <Icon className={`w-5 h-5 ${iconColor}`} />
          <div>
            <h1 className="text-lg font-bold text-white">{activity.name}</h1>
            <p className="text-xs text-white/40 font-mono">{activity.description}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

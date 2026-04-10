// ═══════════════════════════════════════════════════════════════
// ActivityCard — Preview card for Rec Room activities
// ═══════════════════════════════════════════════════════════════

"use client";

import { ChevronRight } from "lucide-react";
import type { ActivityMeta } from "@/types/recroom";
import type { AccentColor } from "@/types/hermes";
import { iconColorMap } from "@/lib/theme";

interface ActivityCardProps {
  activity: ActivityMeta;
  iconMap: Record<string, React.ComponentType<{ className?: string }>>;
  onClick: () => void;
}

const accentBorders: Record<AccentColor, string> = {
  cyan: "border-cyan-500/20 hover:border-cyan-500/40",
  purple: "border-purple-500/20 hover:border-purple-500/40",
  green: "border-green-500/20 hover:border-green-500/40",
  pink: "border-pink-500/20 hover:border-pink-500/40",
  orange: "border-orange-500/20 hover:border-orange-500/40",
};

const accentGlows: Record<AccentColor, string> = {
  cyan: "hover:shadow-[0_0_30px_rgba(0,255,255,0.08)]",
  purple: "hover:shadow-[0_0_30px_rgba(168,85,247,0.08)]",
  green: "hover:shadow-[0_0_30px_rgba(0,255,65,0.08)]",
  pink: "hover:shadow-[0_0_30px_rgba(236,72,153,0.08)]",
  orange: "hover:shadow-[0_0_30px_rgba(251,146,60,0.08)]",
};

export default function ActivityCard({ activity, iconMap, onClick }: ActivityCardProps) {
  const Icon = iconMap[activity.icon] || iconMap.Zap;
  const iconColor = iconColorMap[activity.accentColor] || "text-neon-cyan";
  const borderColor = accentBorders[activity.accentColor] || accentBorders.cyan;
  const glowClass = accentGlows[activity.accentColor] || accentGlows.cyan;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border bg-dark-900/50 p-5 transition-all group ${borderColor} ${glowClass}`}
    >
      <div className="flex items-center justify-between mb-3">
        <Icon className={`w-6 h-6 ${iconColor}`} />
        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
      </div>
      <h3 className="text-sm font-semibold text-white mb-1">{activity.name}</h3>
      <p className="text-xs text-white/40 leading-relaxed">{activity.description}</p>
      <div className="mt-3 text-[10px] font-mono text-white/25">
        {activity.examples.length} examples
      </div>
    </button>
  );
}

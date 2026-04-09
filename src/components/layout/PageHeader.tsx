// ═══════════════════════════════════════════════════════════════
// Page Header Component
// ═══════════════════════════════════════════════════════════════

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { AccentColor } from "@/types/hermes";
import { StatusDot } from "@/components/ui/Card";

interface PageHeaderProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  color?: AccentColor;
  backHref?: string;
  backLabel?: string;
  status?: "online" | "warning" | "error" | "idle";
  actions?: React.ReactNode;
}

const iconColorMap: Record<AccentColor, string> = {
  cyan: "text-neon-cyan",
  purple: "text-neon-purple",
  green: "text-neon-green",
  pink: "text-neon-pink",
  orange: "text-neon-orange",
};

export default function PageHeader({
  icon: Icon,
  title,
  subtitle,
  color = "cyan",
  backHref,
  backLabel = "BACK",
  status,
  actions,
}: PageHeaderProps) {
  return (
    <header className="border-b border-white/10 bg-dark-900/50 backdrop-blur-xl sticky top-0 z-30">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {backHref && (
              <>
                <Link
                  href={backHref}
                  className="flex items-center gap-2 text-white/40 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-mono">{backLabel}</span>
                </Link>
                <div className="w-px h-6 bg-white/20" />
              </>
            )}
            <div className="flex items-center gap-3">
              <Icon className={`w-5 h-5 ${iconColorMap[color]}`} />
              <div>
                <h1 className="text-lg font-bold text-white flex items-center gap-2">
                  {title}
                  {status && <StatusDot status={status} pulse />}
                </h1>
                {subtitle && (
                  <p className="text-xs text-white/40 font-mono">{subtitle}</p>
                )}
              </div>
            </div>
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      </div>
    </header>
  );
}

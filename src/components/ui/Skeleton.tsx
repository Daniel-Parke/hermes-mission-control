// ═══════════════════════════════════════════════════════════════
// Skeleton — Loading placeholder with shimmer animation
// ═══════════════════════════════════════════════════════════════

"use client";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "rect" | "circle";
  width?: string;
  height?: string;
}

export default function Skeleton({
  className = "",
  variant = "rect",
  width,
  height,
}: SkeletonProps) {
  const baseClass =
    "animate-pulse bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] skeleton-shimmer";

  const variantClass = {
    text: "rounded h-4",
    rect: "rounded-lg",
    circle: "rounded-full",
  }[variant];

  const style: React.CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div
      className={`${baseClass} ${variantClass} ${className}`}
      style={style}
    />
  );
}

// ── Compound Skeletons ─────────────────────────────────────────

export function SkeletonStatCard() {
  return (
    <div className="rounded-xl border border-white/10 bg-dark-900/50 p-4">
      <div className="flex items-center justify-between mb-2">
        <Skeleton variant="circle" width="16px" height="16px" />
        <Skeleton variant="circle" width="8px" height="8px" />
      </div>
      <Skeleton variant="text" width="60px" height="28px" className="mb-1" />
      <Skeleton variant="text" width="80px" />
    </div>
  );
}

export function SkeletonPanel() {
  return (
    <div className="rounded-xl border border-white/10 bg-dark-900/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-dark-800/50">
        <div className="flex items-center gap-2">
          <Skeleton variant="circle" width="14px" height="14px" />
          <Skeleton variant="text" width="80px" />
        </div>
        <Skeleton variant="text" width="60px" />
      </div>
      {/* Content */}
      <div className="px-4 py-3 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton variant="circle" width="8px" height="8px" />
              <Skeleton variant="text" width="80px" />
            </div>
            <Skeleton variant="text" width="60px" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-dark-900/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Skeleton variant="circle" width="24px" height="24px" />
        <Skeleton variant="text" width="120px" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton
            key={i}
            variant="text"
            width={i === lines - 1 ? "70%" : "100%"}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonNavCard() {
  return (
    <div className="rounded-xl border border-white/10 bg-dark-900/50 p-5">
      <div className="flex items-center justify-between">
        <Skeleton variant="circle" width="24px" height="24px" />
        <Skeleton variant="circle" width="16px" height="16px" />
      </div>
      <div className="mt-3">
        <Skeleton variant="text" width="80px" height="24px" />
        <Skeleton variant="text" width="140px" className="mt-1" />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Textarea Component — Consistent textarea for forms
// ═══════════════════════════════════════════════════════════════

import type { AccentColor } from "@/types/hermes";
import { focusColorMap, baseInputStyles } from "@/lib/theme";

interface TextareaProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  description?: string;
  placeholder?: string;
  rows?: number;
  accentColor?: AccentColor;
  error?: string;
  disabled?: boolean;
  resize?: "none" | "vertical" | "horizontal" | "both";
  className?: string;
}

export default function Textarea({
  value,
  onChange,
  label,
  description,
  placeholder,
  rows = 4,
  accentColor = "cyan",
  error,
  disabled = false,
  resize = "vertical",
  className = "",
}: TextareaProps) {
  const focusClass = focusColorMap[accentColor];
  const resizeClass = {
    none: "resize-none",
    vertical: "resize-y",
    horizontal: "resize-x",
    both: "resize",
  }[resize];

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-white/70">{label}</label>
      )}
      {description && (
        <p className="text-xs text-white/40">{description}</p>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={`${baseInputStyles} ${focusClass} ${resizeClass} ${
          error ? "border-red-500/50" : ""
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      />
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// AutoTextarea — Textarea that auto-scales to fit content
// ═══════════════════════════════════════════════════════════════

"use client";

import { useRef, useEffect, useCallback } from "react";

interface AutoTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  maxRows?: number;
  className?: string;
  disabled?: boolean;
}

export default function AutoTextarea({
  value,
  onChange,
  placeholder = "",
  minRows = 2,
  maxRows = 20,
  className = "",
  disabled = false,
}: AutoTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = "auto";

    // Calculate line height from computed style
    const computed = window.getComputedStyle(textarea);
    const lineHeight = parseFloat(computed.lineHeight) || 20;

    const minHeight = minRows * lineHeight + 16; // +16 for padding
    const maxHeight = maxRows * lineHeight + 16;
    const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);

    textarea.style.height = `${newHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [minRows, maxRows]);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      spellCheck={false}
      className={`w-full bg-dark-800/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-neon-cyan/50 font-mono resize-none overflow-hidden transition-none ${className}`}
      style={{ height: "auto" }}
    />
  );
}

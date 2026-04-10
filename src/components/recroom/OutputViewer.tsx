// ═══════════════════════════════════════════════════════════════
// OutputViewer — Universal output renderer for Rec Room activities
// ═══════════════════════════════════════════════════════════════

"use client";

import { useState, useRef, useEffect } from "react";
import { Pause, Play, RotateCcw, Download, Code, Copy, Check, Wand2 } from "lucide-react";
import type { AccentColor } from "@/types/hermes";
import { iconColorMap } from "@/lib/theme";

interface OutputViewerProps {
  format: "html" | "text" | "code" | "json";
  content: string;
  accentColor: AccentColor;
  isPlaying?: boolean;
  onPause?: () => void;
  onReset?: () => void;
  onExport?: (format: string) => void;
  onRefine?: (refinement: string) => void;
  showRefine?: boolean;
  refining?: boolean;
}

const accentBorders: Record<AccentColor, string> = {
  cyan: "border-cyan-500/20",
  purple: "border-purple-500/20",
  green: "border-green-500/20",
  pink: "border-pink-500/20",
  orange: "border-orange-500/20",
};

export default function OutputViewer({
  format,
  content,
  accentColor,
  isPlaying = true,
  onPause,
  onReset,
  onExport,
  onRefine,
  showRefine = false,
  refining = false,
}: OutputViewerProps) {
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [refineText, setRefineText] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const iconColor = iconColorMap[accentColor] || "text-neon-cyan";
  const borderColor = accentBorders[accentColor] || accentBorders.cyan;

  // For HTML content, create a blob URL
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (format === "html" && content) {
      const blob = new Blob([content], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    return () => {};
  }, [format, content]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportFile = () => {
    const ext = format === "html" ? "html" : format === "json" ? "json" : "txt";
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recroom-output.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRefine = () => {
    if (!refineText.trim() || !onRefine) return;
    onRefine(refineText.trim());
    setRefineText("");
  };

  if (!content) {
    return (
      <div className={`rounded-xl border ${borderColor} bg-dark-900/30 p-12 text-center`}>
        <div className="text-sm text-white/20 font-mono">
          Output will appear here
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Output area */}
      <div className={`rounded-xl border ${borderColor} bg-dark-900/50 overflow-hidden`}>
        {/* HTML/Iframe mode */}
        {format === "html" && !showCode && (
          <div className="relative">
            <iframe
              ref={iframeRef}
              srcDoc={content}
              className="w-full h-[480px] bg-black border-0"
              sandbox="allow-scripts allow-same-origin"
              title="Creative Canvas Output"
            />
          </div>
        )}

        {/* Code mode */}
        {(showCode || format !== "html") && (
          <div className="p-4">
            <pre className="text-xs font-mono text-white/70 whitespace-pre-wrap max-h-[480px] overflow-y-auto">
              {content}
            </pre>
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Animation controls (for HTML) */}
        {format === "html" && !showCode && onPause && (
          <button
            onClick={onPause}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-mono text-white/50 hover:text-white/70 hover:bg-white/5 transition-colors"
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {isPlaying ? "Pause" : "Play"}
          </button>
        )}

        {format === "html" && onReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-mono text-white/50 hover:text-white/70 hover:bg-white/5 transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        )}

        {/* Code toggle (for HTML) */}
        {format === "html" && (
          <button
            onClick={() => setShowCode(!showCode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-mono transition-colors ${
              showCode
                ? "border-white/30 bg-white/10 text-white/70"
                : "border-white/10 text-white/50 hover:text-white/70 hover:bg-white/5"
            }`}
          >
            <Code className="w-3 h-3" /> {showCode ? "Preview" : "Code"}
          </button>
        )}

        {/* Copy */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-mono text-white/50 hover:text-white/70 hover:bg-white/5 transition-colors"
        >
          {copied ? <Check className="w-3 h-3 text-neon-green" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied" : "Copy"}
        </button>

        {/* Export */}
        <button
          onClick={handleExportFile}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-mono text-white/50 hover:text-white/70 hover:bg-white/5 transition-colors"
        >
          <Download className="w-3 h-3" /> Export
        </button>

        {onExport && (
          <button
            onClick={() => onExport("png")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-mono text-white/50 hover:text-white/70 hover:bg-white/5 transition-colors"
          >
            <Download className="w-3 h-3" /> PNG
          </button>
        )}
      </div>

      {/* Refine input */}
      {showRefine && onRefine && (
        <div className="flex gap-2">
          <input
            value={refineText}
            onChange={(e) => setRefineText(e.target.value)}
            placeholder="Refine: 'make it bigger', 'change to blue', 'add stars'..."
            className="flex-1 bg-dark-800/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-white/30 font-mono"
            disabled={refining}
            onKeyDown={(e) => e.key === "Enter" && handleRefine()}
          />
          <button
            onClick={handleRefine}
            disabled={!refineText.trim() || refining}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-mono transition-colors disabled:opacity-30 ${
              accentColor === "cyan"
                ? "border-cyan-500/30 text-neon-cyan hover:bg-cyan-500/10"
                : accentColor === "green"
                ? "border-green-500/30 text-neon-green hover:bg-green-500/10"
                : "border-purple-500/30 text-neon-purple hover:bg-purple-500/10"
            }`}
          >
            <Wand2 className="w-3 h-3" />
            {refining ? "Refining..." : "Refine"}
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SaveLoadManager — Save, load, and export Rec Room outputs
// ═══════════════════════════════════════════════════════════════

"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, FolderOpen, Trash2, Download, X } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import type { SavedItem, RecRoomActivity } from "@/types/recroom";
import type { AccentColor } from "@/types/hermes";

interface SaveLoadManagerProps {
  activity: RecRoomActivity;
  accentColor: AccentColor;
  currentOutput: string;
  currentPrompt: string;
  currentEnhancedPrompt: string | null;
  outputFormat: "html" | "text" | "code" | "json";
  metadata?: Record<string, unknown>;
  onLoad: (item: SavedItem) => void;
}

export default function SaveLoadManager({
  activity,
  accentColor,
  currentOutput,
  currentPrompt,
  currentEnhancedPrompt,
  outputFormat,
  metadata,
  onLoad,
}: SaveLoadManagerProps) {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saving, setSaving] = useState(false);
  const [showSaveInput, setShowSaveInput] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/recroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list", activity }),
      });
      const d = await res.json();
      if (d.data?.items) setItems(d.data.items);
    } catch {}
  }, [activity]);

  useEffect(() => {
    if (showPanel) fetchItems();
  }, [showPanel, fetchItems]);

  const handleSave = async () => {
    if (!saveName.trim() || saving) return;
    setSaving(true);
    try {
      await fetch("/api/recroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          activity,
          name: saveName.trim(),
          prompt: currentPrompt,
          enhancedPrompt: currentEnhancedPrompt,
          context: { output: currentOutput, outputFormat, ...metadata },
        }),
      });
      setSaveName("");
      setShowSaveInput(false);
      fetchItems();
    } catch {} finally {
      setSaving(false);
    }
  };

  const handleLoad = async (id: string) => {
    try {
      const res = await fetch("/api/recroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "load", activity, id }),
      });
      const d = await res.json();
      if (d.data) {
        onLoad(d.data);
        setShowPanel(false);
      }
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this saved item?")) return;
    try {
      await fetch("/api/recroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", activity, id }),
      });
      fetchItems();
    } catch {}
  };

  const handleExport = (item: SavedItem) => {
    const ext = item.outputFormat === "html" ? "html" : item.outputFormat === "json" ? "json" : "txt";
    const blob = new Blob([item.output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${item.name}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-2">
      {/* Action buttons */}
      <div className="flex gap-2">
        {currentOutput && (
          <button
            onClick={() => setShowSaveInput(!showSaveInput)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-mono text-white/50 hover:text-white/70 hover:bg-white/5 transition-colors"
          >
            <Save className="w-3 h-3" /> Save
          </button>
        )}
        <button
          onClick={() => setShowPanel(!showPanel)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-mono text-white/50 hover:text-white/70 hover:bg-white/5 transition-colors"
        >
          <FolderOpen className="w-3 h-3" /> Load ({items.length || "..."})
        </button>
      </div>

      {/* Save input */}
      {showSaveInput && (
        <div className="flex gap-2">
          <input
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="Name this creation..."
            className="flex-1 bg-dark-800/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-white/30 font-mono"
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
          <button
            onClick={handleSave}
            disabled={!saveName.trim() || saving}
            className="px-4 py-2 rounded-lg border border-green-500/30 text-[10px] font-mono text-neon-green hover:bg-green-500/10 transition-colors disabled:opacity-30"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={() => setShowSaveInput(false)}
            className="p-2 rounded-lg text-white/30 hover:text-white/50"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Saved items panel */}
      {showPanel && (
        <div className="rounded-lg border border-white/10 bg-dark-900/50 divide-y divide-white/5 max-h-64 overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-4 text-center text-xs text-white/30 font-mono">
              No saved items yet
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-white/80 truncate">{item.name}</div>
                  <div className="text-[10px] text-white/30 font-mono">
                    {timeAgo(item.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleLoad(item.id)}
                    className="p-1 rounded text-white/30 hover:text-neon-cyan hover:bg-white/5 transition-colors"
                    title="Load"
                  >
                    <FolderOpen className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleExport(item)}
                    className="p-1 rounded text-white/30 hover:text-neon-green hover:bg-white/5 transition-colors"
                    title="Export"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 rounded text-white/30 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

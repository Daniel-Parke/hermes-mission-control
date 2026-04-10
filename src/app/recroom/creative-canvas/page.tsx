// ═══════════════════════════════════════════════════════════════
// Creative Canvas — p5.js Generative Art Activity
// ═══════════════════════════════════════════════════════════════

"use client";

import { useState, useCallback } from "react";
import { Palette } from "lucide-react";
import ActivityLayout from "@/components/recroom/ActivityLayout";
import PromptBuilder from "@/components/recroom/PromptBuilder";
import OutputViewer from "@/components/recroom/OutputViewer";
import SaveLoadManager from "@/components/recroom/SaveLoadManager";
import { REC_ROOM_ACTIVITIES, DEFAULT_CANVAS_OPTIONS } from "@/types/recroom";
import type { EnhanceResponse, EnhancementOption, SavedItem } from "@/types/recroom";
import { EXAMPLE_PROMPTS } from "@/lib/recroom/prompt-templates";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = { Palette, Zap: Palette };
const activity = REC_ROOM_ACTIVITIES.find((a) => a.id === "creative-canvas")!;

const STYLES = ["realistic", "abstract", "minimal", "cyberpunk", "organic"] as const;
const PALETTES = ["neon", "nasa", "sunset", "ocean", "monochrome", "forest"] as const;

export default function CreativeCanvasPage() {
  const [prompt, setPrompt] = useState("");
  const [enhancing, setEnhancing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [refining, setRefining] = useState(false);
  const [enhancementResult, setEnhancementResult] = useState<EnhanceResponse | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [output, setOutput] = useState("");
  const [isPlaying, setIsPlaying] = useState(true);
  const [style, setStyle] = useState<string>(DEFAULT_CANVAS_OPTIONS.style);
  const [palette, setPalette] = useState<string>(DEFAULT_CANVAS_OPTIONS.palette);
  const [speed, setSpeed] = useState(DEFAULT_CANVAS_OPTIONS.speed);
  const [complexity, setComplexity] = useState(DEFAULT_CANVAS_OPTIONS.complexity);

  const callAPI = useCallback(async (body: Record<string, unknown>) => {
    const res = await fetch("/api/recroom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await res.json();
    if (d.error) throw new Error(d.error);
    return d.data;
  }, []);

  const handleEnhance = useCallback(async (p: string) => {
    setPrompt(p);
    setEnhancing(true);
    setEnhancementResult(null);
    setOutput("");
    try {
      const data = await callAPI({
        action: "enhance",
        activity: "creative-canvas",
        prompt: p,
      });
      setEnhancementResult(data);
    } catch {
      // Fallback: generate directly
      handleGenerate(p);
    } finally {
      setEnhancing(false);
    }
  }, [callAPI]);

  const handleGenerate = useCallback(async (p: string, ctx?: Record<string, unknown>) => {
    setPrompt(p);
    setGenerating(true);
    setOutput("");
    try {
      const data = await callAPI({
        action: "generate",
        activity: "creative-canvas",
        prompt: p,
        enhancedPrompt: enhancementResult?.interpretation || p,
        context: { style, palette, speed, complexity, ...(ctx || {}) },
      });
      setOutput(data.output);
    } catch (error) {
      setOutput("<!-- Error: " + (error instanceof Error ? error.message : "Unknown") + " -->");
    } finally {
      setGenerating(false);
    }
  }, [callAPI, enhancementResult, style, palette, speed, complexity]);

  const handleSelectOption = useCallback((option: EnhancementOption, index: number) => {
    setSelectedOption(index);
  }, []);

  const handleRefine = useCallback(async (refinement: string) => {
    if (!output) return;
    setRefining(true);
    try {
      const data = await callAPI({
        action: "refine",
        activity: "creative-canvas",
        prompt: prompt,
        previousOutput: output,
        refinement,
        context: { style, palette, speed, complexity },
      });
      setOutput(data.output);
    } catch {} finally {
      setRefining(false);
    }
  }, [callAPI, output, prompt, style, palette, speed, complexity]);

  const handleLoad = useCallback((item: SavedItem) => {
    setPrompt(item.prompt);
    setOutput(item.output);
    if (item.metadata.style) setStyle(item.metadata.style as string);
    if (item.metadata.palette) setPalette(item.metadata.palette as string);
  }, []);

  return (
    <ActivityLayout activity={activity} iconMap={iconMap}>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-2 space-y-4">
          <PromptBuilder
            accentColor="cyan"
            placeholder="Describe what you want to see... (literal, complex, or abstract)"
            examples={EXAMPLE_PROMPTS["creative-canvas"]}
            onEnhance={handleEnhance}
            onGenerate={handleGenerate}
            onSelectOption={handleSelectOption}
            enhancing={enhancing}
            generating={generating}
            enhancementResult={enhancementResult}
            selectedOption={selectedOption}
          >
            {/* Advanced options */}
            <div className="space-y-3 p-3 rounded-lg bg-dark-800/30 border border-white/5">
              <div>
                <label className="text-[10px] font-mono text-white/30 uppercase tracking-wider block mb-1">
                  Style
                </label>
                <div className="flex flex-wrap gap-1">
                  {STYLES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStyle(s)}
                      className={`px-2 py-1 rounded text-[10px] font-mono border transition-colors ${
                        style === s
                          ? "border-cyan-500/30 bg-cyan-500/10 text-neon-cyan"
                          : "border-white/10 text-white/30 hover:text-white/50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-mono text-white/30 uppercase tracking-wider block mb-1">
                  Palette
                </label>
                <div className="flex flex-wrap gap-1">
                  {PALETTES.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPalette(p)}
                      className={`px-2 py-1 rounded text-[10px] font-mono border transition-colors ${
                        palette === p
                          ? "border-cyan-500/30 bg-cyan-500/10 text-neon-cyan"
                          : "border-white/10 text-white/30 hover:text-white/50"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-white/30 uppercase tracking-wider block mb-1">
                    Speed
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={speed}
                    onChange={(e) => setSpeed(parseInt(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                  <div className="text-[9px] font-mono text-white/20 text-center">{speed}/5</div>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-white/30 uppercase tracking-wider block mb-1">
                    Complexity
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={complexity}
                    onChange={(e) => setComplexity(parseInt(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                  <div className="text-[9px] font-mono text-white/20 text-center">{complexity}/5</div>
                </div>
              </div>
            </div>
          </PromptBuilder>

          {/* Save/Load */}
          <SaveLoadManager
            activity="creative-canvas"
            accentColor="cyan"
            currentOutput={output}
            currentPrompt={prompt}
            currentEnhancedPrompt={enhancementResult?.interpretation || null}
            outputFormat="html"
            metadata={{ style, palette, speed, complexity }}
            onLoad={handleLoad}
          />
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-3">
          <OutputViewer
            format="html"
            content={output}
            accentColor="cyan"
            isPlaying={isPlaying}
            onPause={() => setIsPlaying(!isPlaying)}
            onReset={() => {
              setOutput("");
              setEnhancementResult(null);
              setSelectedOption(null);
            }}
            onRefine={handleRefine}
            showRefine={!!output}
            refining={refining}
          />
        </div>
      </div>
    </ActivityLayout>
  );
}

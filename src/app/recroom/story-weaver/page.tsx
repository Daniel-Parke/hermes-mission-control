// ═══════════════════════════════════════════════════════════════
// Story Weaver — Collaborative Interactive Fiction
// ═══════════════════════════════════════════════════════════════

"use client";

import { useState, useCallback } from "react";
import { BookOpen, ChevronRight, ChevronLeft, Sparkles, Save } from "lucide-react";
import ActivityLayout from "@/components/recroom/ActivityLayout";
import SaveLoadManager from "@/components/recroom/SaveLoadManager";
import { REC_ROOM_ACTIVITIES } from "@/types/recroom";
import type {
  StoryConfig,
  StoryOutline,
  StoryPage,
  StoryCharacter,
  SavedItem,
} from "@/types/recroom";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = { BookOpen, Zap: BookOpen };
const activity = REC_ROOM_ACTIVITIES.find((a) => a.id === "story-weaver")!;

const GENRES = ["Mystery", "Sci-Fi", "Fantasy", "Horror", "Romance", "Adventure", "Noir", "Comedy"];
const ERAS = ["Ancient", "Medieval", "Modern", "Near Future", "Far Future", "Timeless"];
const MOODS = ["Tense", "Wonder", "Melancholy", "Humorous", "Dark", "Hopeful", "Suspenseful"];
const POVS = [
  { value: "first", label: "First Person" },
  { value: "third-limited", label: "Third Limited" },
  { value: "third-omniscient", label: "Third Omniscient" },
];
const LENGTHS = [
  { value: "short", label: "Short (3-4 chapters)", chapters: 4 },
  { value: "medium", label: "Medium (5-7 chapters)", chapters: 6 },
  { value: "long", label: "Long (8-12 chapters)", chapters: 10 },
];

type StoryPhase = "config" | "outline" | "reading";

export default function StoryWeaverPage() {
  const [phase, setPhase] = useState<StoryPhase>("config");
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(false);

  // Config state
  const [premise, setPremise] = useState("");
  const [genre, setGenre] = useState("Mystery");
  const [setting, setSetting] = useState("");
  const [era, setEra] = useState("Modern");
  const [moods, setMoods] = useState<string[]>(["Tense"]);
  const [pov, setPov] = useState("first");
  const [length, setLength] = useState<"short" | "medium" | "long">("medium");
  const [characters, setCharacters] = useState<StoryCharacter[]>([]);

  // Outline state
  const [outline, setOutline] = useState<StoryOutline | null>(null);

  // Reading state
  const [pages, setPages] = useState<StoryPage[]>([]);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [summary, setSummary] = useState("");
  const [steerText, setSteerText] = useState("");

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

  const getConfig = useCallback((): StoryConfig => ({
    premise, genre, setting, era, mood: moods, language: "English",
    characters, length, pacing: 3, complexity: 3,
    pov: pov as StoryConfig["pov"], arc: "rising-action",
  }), [premise, genre, setting, era, moods, characters, length, pov]);

  const handleGenerateOutline = useCallback(async () => {
    if (!premise.trim()) return;
    setGenerating(true);
    try {
      const data = await callAPI({
        action: "generate",
        activity: "story-weaver",
        prompt: premise,
        context: { step: "outline", config: getConfig() },
      });
      // Parse outline from output
      const parsed = JSON.parse(data.output.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
      setOutline(parsed);
      setPhase("outline");
    } catch {
      // Fallback outline
      setOutline({
        title: "Untitled Story",
        chapters: [{ title: "Chapter 1", summary: premise, themes: ["beginning"] }],
      });
      setPhase("outline");
    } finally {
      setGenerating(false);
    }
  }, [premise, callAPI, getConfig]);

  const handleStartReading = useCallback(async () => {
    setPhase("reading");
    setGenerating(true);
    try {
      const data = await callAPI({
        action: "generate",
        activity: "story-weaver",
        prompt: premise,
        context: {
          step: "page",
          config: getConfig(),
          outline,
          recentPages: [],
          summary: "",
          currentChapter: 1,
          currentPage: 1,
        },
      });
      const page: StoryPage = {
        chapter: 1, page: 1,
        content: data.output,
        userDirection: null, branchId: null,
        generatedAt: new Date().toISOString(),
      };
      setPages([page]);
    } catch {
      setPages([{
        chapter: 1, page: 1,
        content: "The story begins...",
        userDirection: null, branchId: null,
        generatedAt: new Date().toISOString(),
      }]);
    } finally {
      setGenerating(false);
    }
  }, [premise, callAPI, getConfig, outline]);

  const handleNextPage = useCallback(async (direction?: string) => {
    setLoading(true);
    const nextPage = currentPage + 1;
    try {
      const data = await callAPI({
        action: "generate",
        activity: "story-weaver",
        prompt: premise,
        context: {
          step: "page",
          config: getConfig(),
          outline,
          recentPages: pages.slice(-2),
          summary,
          currentChapter,
          currentPage: nextPage,
          userDirection: direction || undefined,
        },
      });
      const page: StoryPage = {
        chapter: currentChapter,
        page: nextPage,
        content: data.output,
        userDirection: direction || null,
        branchId: null,
        generatedAt: new Date().toISOString(),
      };
      setPages((prev) => [...prev, page]);
      setCurrentPage(nextPage);

      // Update summary every 3 pages
      if (nextPage % 3 === 0) {
        try {
          const summaryData = await callAPI({
            action: "generate",
            activity: "story-weaver",
            prompt: "Summarize: " + pages.map((p) => p.content).join("\n\n"),
            context: { step: "summary" },
          });
          setSummary(summaryData.output);
        } catch {}
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [currentPage, pages, summary, currentChapter, premise, callAPI, getConfig, outline]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  const handleAddCharacter = useCallback(() => {
    setCharacters((prev) => [...prev, { name: "", role: "supporting", description: "" }]);
  }, []);

  const handleLoad = useCallback((item: SavedItem) => {
    setPremise(item.prompt);
    if (item.metadata.outline) setOutline(item.metadata.outline as StoryOutline);
    if (item.metadata.pages) setPages(item.metadata.pages as StoryPage[]);
    if (item.metadata.config) {
      const cfg = item.metadata.config as Partial<StoryConfig>;
      if (cfg.genre) setGenre(cfg.genre);
      if (cfg.era) setEra(cfg.era);
      if (cfg.pov) setPov(cfg.pov);
      if (cfg.length) setLength(cfg.length);
    }
    if ((item.metadata.pages as StoryPage[])?.length) {
      setPhase("reading");
    } else if (item.metadata.outline) {
      setPhase("outline");
    }
  }, []);

  const currentPageContent = pages.find((p) => p.chapter === currentChapter && p.page === currentPage);

  return (
    <ActivityLayout activity={activity} iconMap={iconMap}>
      <div className="max-w-4xl mx-auto">
        {/* Phase: Configuration */}
        {phase === "config" && (
          <div className="space-y-6">
            <div>
              <label className="text-xs font-mono text-white/40 uppercase tracking-widest block mb-2">
                What's your story about?
              </label>
              <textarea
                value={premise}
                onChange={(e) => setPremise(e.target.value)}
                placeholder="A mystery aboard a generation ship travelling to Proxima Centauri..."
                rows={3}
                className="w-full bg-dark-800/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-purple-500/30 font-mono resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono text-white/30 uppercase tracking-wider block mb-1">Genre</label>
                <div className="flex flex-wrap gap-1">
                  {GENRES.map((g) => (
                    <button key={g} onClick={() => setGenre(g)}
                      className={`px-2 py-1 rounded text-[10px] font-mono border transition-colors ${
                        genre === g ? "border-purple-500/30 bg-purple-500/10 text-neon-purple" : "border-white/10 text-white/30 hover:text-white/50"
                      }`}>{g}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-mono text-white/30 uppercase tracking-wider block mb-1">Era</label>
                <div className="flex flex-wrap gap-1">
                  {ERAS.map((e) => (
                    <button key={e} onClick={() => setEra(e)}
                      className={`px-2 py-1 rounded text-[10px] font-mono border transition-colors ${
                        era === e ? "border-purple-500/30 bg-purple-500/10 text-neon-purple" : "border-white/10 text-white/30 hover:text-white/50"
                      }`}>{e}</button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-white/30 uppercase tracking-wider block mb-1">Setting</label>
              <input value={setting} onChange={(e) => setSetting(e.target.value)}
                placeholder="Generation ship, floating city, underwater colony..."
                className="w-full bg-dark-800/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-purple-500/30 font-mono" />
            </div>

            <div>
              <label className="text-[10px] font-mono text-white/30 uppercase tracking-wider block mb-1">Mood (select multiple)</label>
              <div className="flex flex-wrap gap-1">
                {MOODS.map((m) => (
                  <button key={m} onClick={() => setMoods((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m])}
                    className={`px-2 py-1 rounded text-[10px] font-mono border transition-colors ${
                      moods.includes(m) ? "border-purple-500/30 bg-purple-500/10 text-neon-purple" : "border-white/10 text-white/30 hover:text-white/50"
                    }`}>{m}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono text-white/30 uppercase tracking-wider block mb-1">POV</label>
                <select value={pov} onChange={(e) => setPov(e.target.value)}
                  className="w-full bg-dark-800/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-purple-500/30 font-mono">
                  {POVS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-mono text-white/30 uppercase tracking-wider block mb-1">Length</label>
                <select value={length} onChange={(e) => setLength(e.target.value as typeof length)}
                  className="w-full bg-dark-800/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-purple-500/30 font-mono">
                  {LENGTHS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
            </div>

            {/* Characters */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-mono text-white/30 uppercase tracking-wider">Characters</label>
                <button onClick={handleAddCharacter}
                  className="text-[10px] font-mono text-neon-purple hover:text-purple-400 transition-colors">
                  + Add Character
                </button>
              </div>
              {characters.map((char, i) => (
                <div key={i} className="grid grid-cols-3 gap-2 mb-2">
                  <input value={char.name}
                    onChange={(e) => setCharacters((prev) => prev.map((c, j) => j === i ? { ...c, name: e.target.value } : c))}
                    placeholder="Name"
                    className="bg-dark-800/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/20 outline-none font-mono" />
                  <select value={char.role}
                    onChange={(e) => setCharacters((prev) => prev.map((c, j) => j === i ? { ...c, role: e.target.value as StoryCharacter["role"] } : c))}
                    className="bg-dark-800/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none font-mono">
                    {["protagonist", "ally", "antagonist", "supporting", "mystery"].map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <input value={char.description}
                    onChange={(e) => setCharacters((prev) => prev.map((c, j) => j === i ? { ...c, description: e.target.value } : c))}
                    placeholder="Description"
                    className="bg-dark-800/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/20 outline-none font-mono" />
                </div>
              ))}
            </div>

            <button onClick={handleGenerateOutline} disabled={!premise.trim() || generating}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-purple-500/30 bg-purple-500/10 text-sm font-mono text-neon-purple hover:bg-purple-500/20 transition-colors disabled:opacity-30">
              <Sparkles className={`w-4 h-4 ${generating ? "animate-pulse" : ""}`} />
              {generating ? "Generating Outline..." : "Generate Story Outline"}
            </button>
          </div>
        )}

        {/* Phase: Outline Review */}
        {phase === "outline" && outline && (
          <div className="space-y-6">
            <div className="rounded-xl border border-purple-500/20 bg-dark-900/50 p-6">
              <h2 className="text-lg font-bold text-white mb-4">{outline.title}</h2>
              <div className="space-y-4">
                {outline.chapters.map((ch, i) => (
                  <div key={i} className="rounded-lg bg-dark-800/30 border border-white/5 p-4">
                    <div className="text-xs font-mono text-neon-purple mb-1">Chapter {i + 1}</div>
                    <div className="text-sm font-semibold text-white mb-1">{ch.title}</div>
                    <div className="text-xs text-white/50">{ch.summary}</div>
                    <div className="flex gap-1 mt-2">
                      {ch.themes.map((t, j) => (
                        <span key={j} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-neon-purple/60">{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setPhase("config")}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-white/10 text-sm font-mono text-white/50 hover:text-white/70 hover:bg-white/5 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Edit Config
              </button>
              <button onClick={handleStartReading} disabled={generating}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border border-purple-500/30 bg-purple-500/10 text-sm font-mono text-neon-purple hover:bg-purple-500/20 transition-colors disabled:opacity-30">
                <BookOpen className="w-4 h-4" />
                {generating ? "Writing first page..." : "Start Reading"}
              </button>
            </div>
          </div>
        )}

        {/* Phase: Reading */}
        {phase === "reading" && (
          <div className="space-y-6">
            {/* Progress bar */}
            <div className="flex items-center gap-2 text-xs font-mono text-white/30">
              <span>Ch.{currentChapter}</span>
              <div className="flex-1 h-1 rounded-full bg-white/5">
                <div className="h-full rounded-full bg-purple-500/50 transition-all"
                  style={{ width: `${(currentPage / (outline?.chapters.length || 5)) * 100}%` }} />
              </div>
              <span>Page {currentPage}</span>
            </div>

            {/* Story content */}
            <div className="rounded-xl border border-purple-500/20 bg-dark-900/50 p-8">
              {generating || loading ? (
                <div className="flex items-center justify-center py-12">
                  <Sparkles className="w-6 h-6 text-neon-purple animate-pulse" />
                  <span className="ml-2 text-sm font-mono text-white/40">
                    {generating ? "Writing the first page..." : "Writing next page..."}
                  </span>
                </div>
              ) : currentPageContent ? (
                <div className="prose prose-invert max-w-none">
                  <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap font-serif">
                    {currentPageContent.content}
                  </p>
                </div>
              ) : (
                <div className="text-center text-sm text-white/30 py-12">No content yet</div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button onClick={handlePrevPage} disabled={currentPage <= 1 || loading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/10 text-sm font-mono text-white/50 hover:text-white/70 hover:bg-white/5 transition-colors disabled:opacity-30">
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <button onClick={() => handleNextPage()} disabled={loading || generating}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-purple-500/30 text-sm font-mono text-neon-purple hover:bg-purple-500/10 transition-colors disabled:opacity-30">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Steer input */}
            <div className="rounded-xl border border-white/5 bg-dark-900/30 p-4">
              <label className="text-[10px] font-mono text-white/30 uppercase tracking-wider block mb-2">
                Steer the story
              </label>
              <div className="flex gap-2">
                <input value={steerText} onChange={(e) => setSteerText(e.target.value)}
                  placeholder="Make the captain discover something shocking..."
                  className="flex-1 bg-dark-800/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-purple-500/30 font-mono"
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && steerText.trim()) {
                      handleNextPage(steerText.trim());
                      setSteerText("");
                    }
                  }} />
                <button onClick={() => { if (steerText.trim()) { handleNextPage(steerText.trim()); setSteerText(""); } }}
                  disabled={!steerText.trim() || loading}
                  className="px-4 py-2 rounded-lg border border-purple-500/30 text-xs font-mono text-neon-purple hover:bg-purple-500/10 transition-colors disabled:opacity-30">
                  Apply & Continue
                </button>
              </div>
            </div>

            {/* Save/Load */}
            <SaveLoadManager
              activity="story-weaver"
              accentColor="purple"
              currentOutput={currentPageContent?.content || ""}
              currentPrompt={premise}
              currentEnhancedPrompt={outline?.title || null}
              outputFormat="text"
              metadata={{ config: getConfig(), outline, pages, summary, currentChapter, currentPage }}
              onLoad={handleLoad}
            />
          </div>
        )}
      </div>
    </ActivityLayout>
  );
}

// ═══════════════════════════════════════════════════════════════
// Story Weaver — Collaborative Interactive Fiction (v2)
// ═══════════════════════════════════════════════════════════════
// Features:
// - 8 story templates covering major novel categories
// - Tag-based genre/era/mood/setting with custom [+] tags
// - Full first chapter generation on start
// - Book-like reading UI with page-turning animation
// - Steering input for narrative direction
// - Save/load system

"use client";

import { useState, useCallback } from "react";
import { BookOpen, ChevronRight, ChevronLeft, Sparkles, Plus, X } from "lucide-react";
import ActivityLayout from "@/components/recroom/ActivityLayout";
import SaveLoadManager from "@/components/recroom/SaveLoadManager";
import { REC_ROOM_ACTIVITIES, STORY_TEMPLATES } from "@/types/recroom";
import type { StoryTemplate, StoryConfig, StoryOutline, StoryPage, StoryCharacter, SavedItem } from "@/types/recroom";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = { BookOpen, Zap: BookOpen };
const activityMeta = REC_ROOM_ACTIVITIES.find((a) => a.id === "story-weaver")!;

const DEFAULT_GENRES = ["Sci-Fi", "Mystery", "Fantasy", "Romance", "Crime", "Horror", "Adventure", "Historical"];
const DEFAULT_ERAS = ["Ancient", "Medieval", "Modern", "Near Future", "Far Future", "Timeless"];
const DEFAULT_MOODS = ["Tense", "Wonder", "Humorous", "Dark", "Hopeful", "Melancholy", "Suspenseful", "Whimsical"];
const DEFAULT_SETTINGS = ["Space Station", "Medieval Castle", "Modern City", "Underwater", "Forest", "Desert", "Island", "Train"];
const POVS = [
  { value: "first", label: "First Person (I)" },
  { value: "third-limited", label: "Third Person Limited (he/she)" },
  { value: "third-omniscient", label: "Third Person Omniscient (all-knowing)" },
];

type StoryPhase = "config" | "outline" | "reading";

// ── Tag Selector Component ───────────────────────────────────

function TagSelector({
  label,
  options,
  selected,
  onToggle,
  onAdd,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (tag: string) => void;
  onAdd: (tag: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newTag, setNewTag] = useState("");

  const handleAdd = () => {
    if (newTag.trim() && !options.includes(newTag.trim())) {
      onAdd(newTag.trim());
    }
    setNewTag("");
    setAdding(false);
  };

  return (
    <div>
      <label className="text-[10px] font-mono text-white/30 uppercase tracking-wider block mb-1.5">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((tag) => (
          <button
            key={tag}
            onClick={() => onToggle(tag)}
            className={`px-2.5 py-1 rounded-md text-[10px] font-mono border transition-all ${
              selected.includes(tag)
                ? "border-purple-500/40 bg-purple-500/15 text-neon-purple shadow-[0_0_8px_rgba(168,85,247,0.15)]"
                : "border-white/8 text-white/30 hover:text-white/50 hover:border-white/15"
            }`}
          >
            {tag}
          </button>
        ))}
        {adding ? (
          <div className="flex items-center gap-1">
            <input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setAdding(false); }}
              className="w-24 bg-dark-800/50 border border-purple-500/30 rounded px-2 py-1 text-[10px] font-mono text-white outline-none"
              autoFocus
              placeholder="New tag..."
            />
            <button onClick={handleAdd} className="p-0.5 rounded text-neon-purple hover:bg-purple-500/10">
              <Plus className="w-3 h-3" />
            </button>
            <button onClick={() => setAdding(false)} className="p-0.5 rounded text-white/30 hover:text-white/50">
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="px-2 py-1 rounded-md text-[10px] font-mono border border-dashed border-white/10 text-white/20 hover:text-white/40 hover:border-white/20 transition-colors"
          >
            + Add
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Page Component ──────────────────────────────────────

export default function StoryWeaverPage() {
  const [phase, setPhase] = useState<StoryPhase>("config");
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(false);

  // Config state with defaults
  const [selectedTemplate, setSelectedTemplate] = useState<string>("cosmic-voyager");
  const [premise, setPremise] = useState(STORY_TEMPLATES[0].premise);
  const [genres, setGenres] = useState<string[]>([...STORY_TEMPLATES[0].genre]);
  const [era, setEra] = useState(STORY_TEMPLATES[0].era);
  const [moods, setMoods] = useState<string[]>([...STORY_TEMPLATES[0].moods]);
  const [setting, setSetting] = useState(STORY_TEMPLATES[0].setting);
  const [pov, setPov] = useState(STORY_TEMPLATES[0].pov);
  const [length, setLength] = useState<"short" | "medium" | "long">(STORY_TEMPLATES[0].length);
  const [characters, setCharacters] = useState<StoryCharacter[]>([...STORY_TEMPLATES[0].characters]);

  // Custom tag options (extend defaults)
  const [genreOptions, setGenreOptions] = useState<string[]>([...DEFAULT_GENRES]);
  const [eraOptions, setEraOptions] = useState<string[]>([...DEFAULT_ERAS]);
  const [moodOptions, setMoodOptions] = useState<string[]>([...DEFAULT_MOODS]);
  const [settingOptions, setSettingOptions] = useState<string[]>([...DEFAULT_SETTINGS]);

  // Outline state
  const [outline, setOutline] = useState<StoryOutline | null>(null);

  // Reading state
  const [pages, setPages] = useState<StoryPage[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
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
    premise, genre: genres.join(", "), setting, era, mood: moods, language: "English",
    characters, length, pacing: 3, complexity: 3,
    pov: pov as StoryConfig["pov"], arc: "rising-action",
  }), [premise, genres, setting, era, moods, characters, length, pov]);

  // Apply template
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const t = STORY_TEMPLATES.find((tmpl) => tmpl.id === templateId);
    if (!t) return;
    setPremise(t.premise);
    setGenres([...t.genre]);
    setEra(t.era);
    setMoods([...t.moods]);
    setSetting(t.setting);
    setPov(t.pov);
    setLength(t.length);
    setCharacters([...t.characters]);
  };

  // Tag CRUD
  const toggleTag = (list: string[], setList: (v: string[]) => void, tag: string) => {
    setList(list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag]);
  };
  const addTag = (options: string[], setOptions: (v: string[]) => void, tag: string) => {
    if (!options.includes(tag)) setOptions([...options, tag]);
  };

  // Character CRUD
  const addCharacter = () => setCharacters((prev) => [...prev, { name: "", role: "supporting", description: "" }]);
  const removeCharacter = (i: number) => setCharacters((prev) => prev.filter((_, j) => j !== i));
  const updateCharacter = (i: number, field: keyof StoryCharacter, value: string) => {
    setCharacters((prev) => prev.map((c, j) => j === i ? { ...c, [field]: value } : c));
  };

  // Generate outline
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
      const cleaned = data.output.replace(/```json\s*/i, "").replace(/```\s*/g, "").trim();
      const parsed = JSON.parse(cleaned);
      setOutline(parsed);
      setPhase("outline");
    } catch {
      setOutline({
        title: "Untitled Story",
        chapters: [{ title: "Chapter 1", summary: premise, themes: ["beginning"] }],
      });
      setPhase("outline");
    } finally {
      setGenerating(false);
    }
  }, [premise, callAPI, getConfig]);

  // Start reading — generate full first chapter
  const handleStartReading = useCallback(async () => {
    setPhase("reading");
    setGenerating(true);
    setPages([]);
    try {
      // Generate 3 pages for chapter 1
      const newPages: StoryPage[] = [];
      for (let p = 1; p <= 3; p++) {
        const data = await callAPI({
          action: "generate",
          activity: "story-weaver",
          prompt: premise,
          context: {
            step: "page",
            config: getConfig(),
            outline,
            recentPages: newPages.slice(-2),
            summary: "",
            currentChapter: 1,
            currentPage: p,
            isFirstChapter: p === 1,
          },
        });
        newPages.push({
          chapter: 1, page: p,
          content: data.output,
          userDirection: null, branchId: null,
          generatedAt: new Date().toISOString(),
        });
      }
      setPages(newPages);
    } catch {
      setPages([{
        chapter: 1, page: 1,
        content: "The story begins...\n\n[Generation failed — try again or steer the narrative]",
        userDirection: null, branchId: null,
        generatedAt: new Date().toISOString(),
      }]);
    } finally {
      setGenerating(false);
    }
  }, [premise, callAPI, getConfig, outline]);

  // Navigate pages
  const handleNextPage = useCallback(async (direction?: string) => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
      return;
    }
    // Generate next page
    setLoading(true);
    const nextPageNum = pages.length + 1;
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
          currentChapter: 1,
          currentPage: nextPageNum,
          userDirection: direction || undefined,
        },
      });
      const newPage: StoryPage = {
        chapter: 1, page: nextPageNum,
        content: data.output,
        userDirection: direction || null, branchId: null,
        generatedAt: new Date().toISOString(),
      };
      setPages((prev) => [...prev, newPage]);
      setCurrentPageIndex(nextPageNum - 1);

      // Update summary every 3 pages
      if (nextPageNum % 3 === 0) {
        try {
          const sumData = await callAPI({
            action: "generate",
            activity: "story-weaver",
            prompt: "Summarize in 2-3 sentences: " + pages.map((p) => p.content).join("\n\n"),
            context: { step: "summary" },
          });
          setSummary(sumData.output);
        } catch {}
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [currentPageIndex, pages, summary, premise, callAPI, getConfig, outline]);

  const handlePrevPage = () => {
    if (currentPageIndex > 0) setCurrentPageIndex(currentPageIndex - 1);
  };

  const handleSteer = () => {
    if (steerText.trim()) {
      handleNextPage(steerText.trim());
      setSteerText("");
    }
  };

  // Load saved story
  const handleLoad = useCallback((item: SavedItem) => {
    setPremise(item.prompt);
    if (item.metadata.outline) setOutline(item.metadata.outline as StoryOutline);
    if (item.metadata.pages) setPages(item.metadata.pages as StoryPage[]);
    if ((item.metadata.pages as StoryPage[])?.length) setPhase("reading");
    else if (item.metadata.outline) setPhase("outline");
  }, []);

  const currentPage = pages[currentPageIndex];

  return (
    <ActivityLayout activity={activityMeta} iconMap={iconMap}>
      {/* ═══ Phase: Configuration ═══ */}
      {phase === "config" && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Template Selector */}
          <div className="rounded-xl border border-purple-500/20 bg-dark-900/50 p-5">
            <label className="text-xs font-mono text-white/40 uppercase tracking-widest block mb-3">
              📚 Quick Start — Choose a Template
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {STORY_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTemplateSelect(t.id)}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    selectedTemplate === t.id
                      ? "border-purple-500/40 bg-purple-500/10 shadow-[0_0_12px_rgba(168,85,247,0.1)]"
                      : "border-white/5 bg-white/[0.02] hover:border-white/15"
                  }`}
                >
                  <div className="text-xs font-semibold text-white/80 mb-0.5">{t.name}</div>
                  <div className="text-[9px] font-mono text-white/30">{t.genre.join(", ")}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Premise */}
          <div className="rounded-xl border border-white/8 bg-dark-900/50 p-5">
            <label className="text-xs font-mono text-white/40 uppercase tracking-widest block mb-2">
              What's your story about?
            </label>
            <textarea
              value={premise}
              onChange={(e) => setPremise(e.target.value)}
              rows={4}
              className="w-full bg-dark-800/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-purple-500/30 font-mono resize-none leading-relaxed"
              placeholder="Describe your story concept..."
            />
          </div>

          {/* Tags Section */}
          <div className="rounded-xl border border-white/8 bg-dark-900/50 p-5 space-y-4">
            <TagSelector label="Genre (select multiple)" options={genreOptions} selected={genres}
              onToggle={(tag) => toggleTag(genres, setGenres, tag)}
              onAdd={(tag) => addTag(genreOptions, setGenreOptions, tag)} />
            <TagSelector label="Era" options={eraOptions} selected={[era]}
              onToggle={(tag) => setEra(tag === era ? "" : tag)}
              onAdd={(tag) => addTag(eraOptions, setEraOptions, tag)} />
            <TagSelector label="Mood (select multiple)" options={moodOptions} selected={moods}
              onToggle={(tag) => toggleTag(moods, setMoods, tag)}
              onAdd={(tag) => addTag(moodOptions, setMoodOptions, tag)} />
            <TagSelector label="Setting" options={settingOptions} selected={[setting]}
              onToggle={(tag) => setSetting(tag === setting ? "" : tag)}
              onAdd={(tag) => addTag(settingOptions, setSettingOptions, tag)} />
          </div>

          {/* Characters */}
          <div className="rounded-xl border border-white/8 bg-dark-900/50 p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-mono text-white/40 uppercase tracking-widest">Characters</label>
              <button onClick={addCharacter} className="text-[10px] font-mono text-neon-purple hover:text-purple-400 transition-colors flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Character
              </button>
            </div>
            <div className="space-y-2">
              {characters.map((char, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <input value={char.name} onChange={(e) => updateCharacter(i, "name", e.target.value)}
                    placeholder="Name" className="flex-1 bg-dark-800/50 border border-white/8 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 outline-none font-mono" />
                  <select value={char.role} onChange={(e) => updateCharacter(i, "role", e.target.value)}
                    className="bg-dark-800/50 border border-white/8 rounded-lg px-2 py-2 text-xs text-white outline-none font-mono w-28">
                    {["protagonist", "ally", "antagonist", "supporting", "mystery"].map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <input value={char.description} onChange={(e) => updateCharacter(i, "description", e.target.value)}
                    placeholder="Description" className="flex-[2] bg-dark-800/50 border border-white/8 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 outline-none font-mono" />
                  <button onClick={() => removeCharacter(i)} className="p-2 rounded-lg text-white/20 hover:text-red-400 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* POV + Length */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/8 bg-dark-900/50 p-4">
              <label className="text-[10px] font-mono text-white/30 uppercase tracking-wider block mb-2">Point of View</label>
              <select value={pov} onChange={(e) => setPov(e.target.value as typeof pov)}
                className="w-full bg-dark-800/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none font-mono">
                {POVS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div className="rounded-xl border border-white/8 bg-dark-900/50 p-4">
              <label className="text-[10px] font-mono text-white/30 uppercase tracking-wider block mb-2">Length</label>
              <select value={length} onChange={(e) => setLength(e.target.value as typeof length)}
                className="w-full bg-dark-800/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none font-mono">
                <option value="short">Short (3-4 chapters)</option>
                <option value="medium">Medium (5-7 chapters)</option>
                <option value="long">Long (8-12 chapters)</option>
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <button onClick={handleGenerateOutline} disabled={!premise.trim() || generating}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-purple-500/30 bg-purple-500/10 text-base font-mono text-neon-purple hover:bg-purple-500/20 transition-all disabled:opacity-30 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
            <Sparkles className={`w-5 h-5 ${generating ? "animate-pulse" : ""}`} />
            {generating ? "Generating Outline..." : "Generate Story Outline"}
          </button>
        </div>
      )}

      {/* ═══ Phase: Outline Review ═══ */}
      {phase === "outline" && outline && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="rounded-xl border border-purple-500/20 bg-dark-900/50 p-6">
            <h2 className="text-xl font-bold text-white mb-1">{outline.title}</h2>
            <p className="text-xs text-white/30 font-mono mb-4">{outline.chapters.length} chapters</p>
            <div className="space-y-3">
              {outline.chapters.map((ch, i) => (
                <div key={i} className="rounded-lg bg-dark-800/40 border border-white/5 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-neon-purple">Ch.{i + 1}</span>
                    <span className="text-sm font-semibold text-white/90">{ch.title}</span>
                  </div>
                  <p className="text-xs text-white/40 leading-relaxed">{ch.summary}</p>
                  <div className="flex gap-1 mt-2">
                    {ch.themes.map((t, j) => (
                      <span key={j} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/8 text-neon-purple/50">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setPhase("config")}
              className="flex items-center gap-1.5 px-5 py-3 rounded-xl border border-white/10 text-sm font-mono text-white/50 hover:text-white/70 hover:bg-white/5 transition-colors">
              <ChevronLeft className="w-4 h-4" /> Edit
            </button>
            <button onClick={handleStartReading} disabled={generating}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-purple-500/30 bg-purple-500/10 text-base font-mono text-neon-purple hover:bg-purple-500/20 transition-all disabled:opacity-30">
              <BookOpen className="w-5 h-5" />
              {generating ? "Writing Chapter 1..." : "Start Reading"}
            </button>
          </div>
        </div>
      )}

      {/* ═══ Phase: Reading (Book UI) ═══ */}
      {phase === "reading" && (
        <div className="max-w-5xl mx-auto space-y-4">
          {/* Chapter Header */}
          <div className="flex items-center justify-between px-2">
            <button onClick={() => setPhase("outline")} className="text-xs font-mono text-white/30 hover:text-white/50 flex items-center gap-1">
              <ChevronLeft className="w-3 h-3" /> Outline
            </button>
            <div className="text-xs font-mono text-white/30">
              {outline?.title || "Story"} — Chapter 1
            </div>
            <div className="text-xs font-mono text-white/20">
              Page {currentPageIndex + 1} of {pages.length}
            </div>
          </div>

          {/* Book */}
          <div className="rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]" style={{ background: "#1a1816" }}>
            {generating && pages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24" style={{ background: "#0f0d0b" }}>
                <Sparkles className="w-8 h-8 text-neon-purple animate-pulse mb-4" />
                <p className="text-sm font-serif" style={{ color: "#e8dcc8" }}>Writing Chapter 1...</p>
                <p className="text-xs mt-2" style={{ color: "#8a7e6d" }}>This may take a moment</p>
              </div>
            ) : currentPage ? (
              <div className="grid grid-cols-1 md:grid-cols-2 min-h-[500px]" style={{ background: "#0f0d0b" }}>
                {/* Left Page */}
                <div className="p-8 md:p-10 md:border-r" style={{ borderColor: "#2a2520" }}>
                  <p className="font-serif leading-[1.9] text-justify" style={{ color: "#e8dcc8", fontSize: "15px" }}>
                    {currentPage.content.slice(0, Math.ceil(currentPage.content.length / 2))}
                  </p>
                </div>
                {/* Right Page */}
                <div className="p-8 md:p-10">
                  <p className="font-serif leading-[1.9] text-justify" style={{ color: "#e8dcc8", fontSize: "15px" }}>
                    {currentPage.content.slice(Math.ceil(currentPage.content.length / 2))}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-24" style={{ background: "#0f0d0b" }}>
                <p className="text-sm" style={{ color: "#8a7e6d" }}>No content yet</p>
              </div>
            )}

            {/* Page Navigation */}
            <div className="flex items-center justify-between px-6 py-3 border-t" style={{ borderColor: "#2a2520", background: "#141210" }}>
              <button onClick={handlePrevPage} disabled={currentPageIndex === 0 || loading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono transition-colors disabled:opacity-20"
                style={{ color: "#8a7e6d" }}>
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <div className="flex gap-1.5">
                {pages.map((_, i) => (
                  <button key={i} onClick={() => setCurrentPageIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === currentPageIndex ? "scale-125" : "opacity-40 hover:opacity-70"}`}
                    style={{ background: i === currentPageIndex ? "#a855f7" : "#4a3f35" }} />
                ))}
              </div>
              <button onClick={() => handleNextPage()} disabled={loading || generating}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono transition-colors disabled:opacity-20"
                style={{ color: "#e8dcc8" }}>
                {loading ? "Writing..." : "Next"} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Steer Input */}
          <div className="rounded-xl border border-white/5 p-4" style={{ background: "#141210" }}>
            <label className="text-[10px] font-mono text-white/25 uppercase tracking-wider block mb-2">
              Steer the story — what happens next?
            </label>
            <div className="flex gap-2">
              <input value={steerText} onChange={(e) => setSteerText(e.target.value)}
                placeholder="The captain discovers something shocking about the AI..."
                className="flex-1 bg-dark-800/50 border border-white/8 rounded-lg px-3 py-2.5 text-xs text-white placeholder-white/15 outline-none focus:border-purple-500/30 font-mono"
                disabled={loading}
                onKeyDown={(e) => { if (e.key === "Enter") handleSteer(); }} />
              <button onClick={handleSteer} disabled={!steerText.trim() || loading}
                className="px-5 py-2.5 rounded-lg border border-purple-500/30 text-xs font-mono text-neon-purple hover:bg-purple-500/10 transition-colors disabled:opacity-30">
                Apply & Continue
              </button>
            </div>
          </div>

          {/* Save/Load */}
          <SaveLoadManager
            activity="story-weaver"
            accentColor="purple"
            currentOutput={currentPage?.content || ""}
            currentPrompt={premise}
            currentEnhancedPrompt={outline?.title || null}
            outputFormat="text"
            metadata={{ config: getConfig(), outline, pages, summary }}
            onLoad={handleLoad}
          />
        </div>
      )}
    </ActivityLayout>
  );
}

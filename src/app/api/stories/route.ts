import { NextResponse } from "next/server";
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, unlinkSync } from "fs";
import { HERMES_HOME } from "@/lib/hermes";
import { logApiError } from "@/lib/api-logger";
import { getStoryPrompt } from "@/lib/story-weaver/prompts";
import type { StoryBible, ChapterOutline } from "@/types/recroom";

// ═══════════════════════════════════════════════════════════════
// Stories API — Story Bible Pipeline
// ═══════════════════════════════════════════════════════════════

const SAVE_DIR = HERMES_HOME + "/mission-control/data/stories";
const GATEWAY_API = "http://127.0.0.1:8642/v1/chat/completions";

function ensureDir() {
  if (!existsSync(SAVE_DIR)) mkdirSync(SAVE_DIR, { recursive: true });
}

function getPath(id: string): string {
  return SAVE_DIR + "/" + id + ".json";
}

// ── LLM Call ─────────────────────────────────────────────────

async function callLLM(system: string, user: string): Promise<string> {
  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 180_000);
    try {
      const resp = await fetch(GATEWAY_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "hermes",
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          temperature: 0.85,
          max_tokens: 4096,
        }),
        signal: controller.signal,
      });
      if (resp.status === 429) {
        if (attempt < maxRetries) { await new Promise(r => setTimeout(r, 30_000 * attempt)); continue; }
        throw new Error("Rate limit reached. Please wait a minute and try again.");
      }
      if (!resp.ok) throw new Error("Gateway API error: " + resp.status);
      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content || "";
      if (!content.trim()) {
        if (attempt < maxRetries) { await new Promise(r => setTimeout(r, 5_000 * attempt)); continue; }
        throw new Error("Empty response from model. Please try again.");
      }
      return content;
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") throw new Error("Request timed out (180s). Please try again.");
      if (attempt === maxRetries) throw err;
      await new Promise(r => setTimeout(r, 3_000 * attempt));
    } finally { clearTimeout(timeout); }
  }
  throw new Error("LLM call failed after retries");
}

// ── Response Validation ──────────────────────────────────────

function validateChapterOutput(raw: string): string {
  let content = raw.trim();

  // Strip common meta-commentary prefixes
  const metaPrefixes = [
    /^here(?:'s| is) (?:your |the )?(?:chapter|prose|story)/i,
    /^(?:sure|certainly|of course|okay|alright)[.!]?\s*/i,
    /^i'll (?:now |go ahead and )?write/i,
    /^let me (?:write|craft|create)/i,
    /^chapter \d+[.:]\s*/i,
  ];
  for (const prefix of metaPrefixes) {
    content = content.replace(prefix, "");
  }

  // Strip trailing meta-commentary
  const metaSuffixes = [
    /\s*(?:i hope|let me know|i trust|this should|feel free)[^.!?]*[.!?]\s*$/i,
    /\s*---+\s*(?:end of chapter|chapter \d+ ends?)[^.]*$/i,
  ];
  for (const suffix of metaSuffixes) {
    content = content.replace(suffix, "");
  }

  // Remove prompt artifacts
  content = content.replace(/===CHAPTER \d+===/gi, "");
  content = content.replace(/===PLAN===/gi, "");
  content = content.replace(/CONSISTENCY CHECKLIST[:\s]*/gi, "");
  content = content.replace(/WRITING QUALITY STANDARDS[:\s]*/gi, "");

  return content.trim();
}

// ── Build Master Prompt ──────────────────────────────────────

function buildMasterPrompt(config: Record<string, unknown>): string {
  const wordRanges: Record<string, string> = {
    short: "800-1200", medium: "1200-1800", standard: "1800-2500",
    long: "2500-3500", epic: "3500-5000", marathon: "5000+",
  };
  const wcRange = wordRanges[(config.wordCountRange as string) || "standard"] || "1800-2500";

  const characters = (config.characters as Array<Record<string, string>>) || [];
  const charProfiles = characters.map(c =>
    `- ${c.name} (${c.role}): ${c.description}`
  ).join("\n");

  return [
    `STORY CONFIGURATION:`,
    `Title: ${(config.title as string) || "Untitled"}`,
    `Premise: ${config.premise as string}`,
    `Genre: ${(config.genre as string) || "General"}`,
    `Era: ${(config.era as string) || "Modern"}`,
    `Setting: ${(config.setting as string) || ""}`,
    `Mood: ${((config.mood as string[]) || []).join(", ")}`,
    `POV: ${(config.pov as string) || "first"}`,
    `Length: ${(config.length as string) || "medium"}`,
    `Chapter Length: ${wcRange} words per chapter`,
    ``,
    `CHARACTERS:`,
    charProfiles || "(none specified)",
    ``,
    `STYLE REQUIREMENTS:`,
    `- POV must remain consistent throughout`,
    `- Character names must be spelled exactly as specified`,
    `- Tone and mood must match the genre and mood tags`,
    `- Show, don't tell. Emotion through action, dialogue, and sensory detail`,
    `- Each character must have a distinct voice`,
    `- Balance action, dialogue, description, and introspection`,
  ].join("\n");
}

// ── POST Handler ─────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;
    switch (action) {
      case "create": return handleCreate(body);
      case "list": return handleList();
      case "load": return handleLoad(body);
      case "generate-chapter": return handleGenerateChapter(body);
      case "rewrite-chapter": return handleRewriteChapter(body);
      case "extend": return handleExtend(body);
      case "update": return handleUpdate(body);
      case "delete": return handleDelete(body);
      default: return NextResponse.json({ error: "Unknown action: " + action }, { status: 400 });
    }
  } catch (err) {
    logApiError("POST /api/stories", "request", err);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}

// ── Create: Bible + Chapter 1 + Summary ──────────────────────

async function handleCreate(body: Record<string, unknown>): Promise<NextResponse> {
  ensureDir();
  const { title, config } = body;
  if (!config || !(config as Record<string, unknown>)?.premise) {
    return NextResponse.json({ error: "Missing premise" }, { status: 400 });
  }

  const cfg = config as Record<string, unknown>;
  const masterPrompt = buildMasterPrompt({ ...cfg, title });

  try {
    // ── Step 1: Generate Story Bible ──
    const bibleSystem = getStoryPrompt("bible");
    const bibleUser = `Story configuration:\n${masterPrompt}\n\nNumber of chapters: ${getChapterCount(cfg.length as string)}\n\nGenerate the story bible now. Output ONLY valid JSON.`;

    const bibleRaw = await callLLM(bibleSystem, bibleUser);

    // Parse bible JSON — try multiple extraction strategies
    let bible: StoryBible | null = null;

    // Strategy 1: direct JSON parse
    try { bible = JSON.parse(bibleRaw); } catch {}

    // Strategy 2: extract JSON from markdown code blocks
    if (!bible) {
      const codeMatch = bibleRaw.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeMatch) {
        try { bible = JSON.parse(codeMatch[1].trim()); } catch {}
      }
    }

    // Strategy 3: find JSON object in text
    if (!bible) {
      const jsonMatch = bibleRaw.match(/\{[\s\S]*"storyArc"[\s\S]*"chapterOutlines"[\s\S]*\}/);
      if (jsonMatch) {
        try { bible = JSON.parse(jsonMatch[0]); } catch {}
      }
    }

    // Fallback: create minimal bible
    if (!bible) {
      const chapterCount = getChapterCount(cfg.length as string);
      bible = {
        storyArc: `A ${cfg.genre || "general"} story. Beginning: setup and introduction. Middle: complications and growth. End: resolution.`,
        fixedPlotPoints: Array.from({ length: chapterCount }, (_, i) => ({
          chapter: i + 1,
          event: `Chapter ${i + 1} advances the main plot`,
        })),
        characterArcs: ((cfg.characters as Array<Record<string, string>>) || []).map(c => ({
          name: c.name,
          startingState: c.description || "Unknown",
          journey: "Grows through the challenges of the story",
          endingState: "Transformed by their experiences",
        })),
        worldRules: [cfg.setting ? `Setting: ${cfg.setting}` : "The world as described in the premise"],
        themes: [cfg.genre ? `Explores themes of ${cfg.genre}` : "Human nature"],
        chapterOutlines: Array.from({ length: chapterCount }, (_, i) => ({
          number: i + 1,
          title: `Chapter ${i + 1}`,
          purpose: i === 0 ? "Introduce the world and protagonist" : i === chapterCount - 1 ? "Resolve the central conflict" : "Advance the plot",
          keyBeats: [`Key event for chapter ${i + 1}`],
          emotionalTone: i === 0 ? "Intriguing" : i === chapterCount - 1 ? "Satisfying" : "Engaging",
        })),
      };
    }

    // ── Step 2: Generate Chapter 1 ──
    const chapter1Outline = bible.chapterOutlines?.[0] || {
      number: 1, title: "Chapter 1", purpose: "Begin the story",
      keyBeats: ["Opening scene"], emotionalTone: "Intriguing",
    };

    const chapterSystem = getStoryPrompt("chapter");
    const chapterUser = buildChapterPrompt(masterPrompt, bible, null, null, chapter1Outline);

    const chapter1Raw = await callLLM(chapterSystem, chapterUser);
    const chapter1 = validateChapterOutput(chapter1Raw);

    // ── Step 3: Generate Initial Summary ──
    const summarySystem = getStoryPrompt("summary");
    const summaryUser = `PREVIOUS SUMMARY: Story has not started yet.\n\nNEW CHAPTER (Chapter 1):\n${chapter1}\n\nCreate the initial rolling summary.`;
    const rollingSummary = await callLLM(summarySystem, summaryUser);

    // ── Build Story Object ──
    const storyId = "story_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 6);
    const storyTitle = (title as string) || bible.chapterOutlines?.[0]?.title ? (title as string) || "Untitled Story" : "Untitled Story";

    const story = {
      id: storyId,
      title: storyTitle,
      masterPrompt,
      storyBible: bible,
      rollingSummary,
      chapters: bible.chapterOutlines.map((ch: ChapterOutline, i: number) => ({
        number: i + 1,
        title: ch.title,
        status: i === 0 ? "complete" : "pending",
        wordCount: i === 0 ? chapter1.split(/\s+/).length : 0,
        generatedAt: i === 0 ? new Date().toISOString() : null,
      })),
      chapterContents: chapter1 ? { "1": chapter1 } : {},
      config: cfg,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    writeFileSync(getPath(storyId), JSON.stringify(story, null, 2));
    return NextResponse.json({ data: story });
  } catch (err) {
    logApiError("POST /api/stories", "create", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Creation failed" }, { status: 500 });
  }
}

// ── Build Chapter Prompt ─────────────────────────────────────

function buildChapterPrompt(
  masterPrompt: string,
  bible: StoryBible,
  rollingSummary: string | null,
  previousChapter: string | null,
  outline: ChapterOutline
): string {
  const parts: string[] = [];

  // Master prompt (always first)
  parts.push("===MASTER PROMPT===\n" + masterPrompt);

  // Story bible (always included)
  parts.push("\n===STORY BIBLE===\n" + JSON.stringify(bible, null, 2));

  // Rolling summary (if available)
  if (rollingSummary) {
    parts.push("\n===NARRATIVE SO FAR===\n" + rollingSummary);
  }

  // Previous chapter for style continuity
  if (previousChapter) {
    parts.push("\n===PREVIOUS CHAPTER===\n" + previousChapter);
  }

  // This chapter's outline
  parts.push("\n===CHAPTER OUTLINE===" +
    `\nTitle: ${outline.title}` +
    `\nPurpose: ${outline.purpose}` +
    `\nKey Beats: ${outline.keyBeats.join("; ")}` +
    `\nEmotional Tone: ${outline.emotionalTone}` +
    (outline.setupForNext ? `\nSetup for Next: ${outline.setupForNext}` : "")
  );

  parts.push(`\nWrite Chapter ${outline.number} now. Return ONLY prose.`);

  return parts.join("\n");
}

// ── Generate Next Chapter ────────────────────────────────────

async function handleGenerateChapter(body: Record<string, unknown>): Promise<NextResponse> {
  const { storyId } = body;
  if (!storyId) return NextResponse.json({ error: "Missing storyId" }, { status: 400 });

  const path = getPath(storyId as string);
  if (!existsSync(path)) return NextResponse.json({ error: "Story not found" }, { status: 404 });

  const story = JSON.parse(readFileSync(path, "utf-8"));

  // Find first pending chapter
  const nextIdx = story.chapters.findIndex((c: Record<string, unknown>) => c.status === "pending");
  if (nextIdx === -1) return NextResponse.json({ error: "All chapters complete" }, { status: 400 });

  const nextNum = nextIdx + 1;

  // ── Server-side lock: reject if any chapter is already writing ──
  const anyWriting = story.chapters.some((c: Record<string, unknown>) => c.status === "writing");
  if (anyWriting) {
    return NextResponse.json({ error: "A chapter is already being generated. Please wait." }, { status: 409 });
  }

  // Mark as writing
  story.chapters[nextIdx].status = "writing";
  writeFileSync(path, JSON.stringify(story, null, 2));

  try {
    const bible: StoryBible = story.storyBible;
    const chapterOutline = bible.chapterOutlines?.[nextIdx] || {
      number: nextNum,
      title: `Chapter ${nextNum}`,
      purpose: "Continue the story",
      keyBeats: [`Key event for chapter ${nextNum}`],
      emotionalTone: "Engaging",
    };

    // Previous chapter for style continuity
    const prevChapter = nextNum > 1 ? story.chapterContents[String(nextNum - 1)] || null : null;

    const system = getStoryPrompt("chapter");
    const userMessage = buildChapterPrompt(
      story.masterPrompt,
      bible,
      story.rollingSummary || null,
      prevChapter,
      chapterOutline
    );

    const raw = await callLLM(system, userMessage);
    const content = validateChapterOutput(raw);

    // Store chapter
    story.chapterContents[nextNum] = content;
    story.chapters[nextIdx].status = "complete";
    story.chapters[nextIdx].wordCount = content.split(/\s+/).length;
    story.chapters[nextIdx].generatedAt = new Date().toISOString();
    story.updatedAt = new Date().toISOString();

    // Update rolling summary
    try {
      const summarySystem = getStoryPrompt("summary");
      const summaryUser = `PREVIOUS SUMMARY:\n${story.rollingSummary || "Story has not started yet."}\n\nNEW CHAPTER (Chapter ${nextNum}):\n${content}\n\nUpdate the rolling summary to include this chapter.`;
      story.rollingSummary = await callLLM(summarySystem, summaryUser);
    } catch {
      // Summary update failed — continue without it
    }

    // Check if all complete
    if (story.chapters.every((c: Record<string, unknown>) => c.status === "complete")) {
      story.status = "complete";
    }

    writeFileSync(path, JSON.stringify(story, null, 2));
    return NextResponse.json({ data: { chapter: nextNum, content, story } });
  } catch (err) {
    story.chapters[nextIdx].status = "failed";
    writeFileSync(path, JSON.stringify(story, null, 2));
    logApiError("POST /api/stories", "generate-chapter", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Generation failed" }, { status: 500 });
  }
}

// ── Rewrite Chapter (forward-invalidation) ───────────────────

async function handleRewriteChapter(body: Record<string, unknown>): Promise<NextResponse> {
  const { storyId, chapterNumber } = body;
  if (!storyId || !chapterNumber) {
    return NextResponse.json({ error: "Missing storyId or chapterNumber" }, { status: 400 });
  }

  const path = getPath(storyId as string);
  if (!existsSync(path)) return NextResponse.json({ error: "Story not found" }, { status: 404 });

  const story = JSON.parse(readFileSync(path, "utf-8"));
  const chNum = chapterNumber as number;

  if (chNum < 1 || chNum > story.chapters.length) {
    return NextResponse.json({ error: "Invalid chapter number" }, { status: 400 });
  }

  // Invalidate chapter N and all subsequent chapters
  for (let i = chNum - 1; i < story.chapters.length; i++) {
    story.chapters[i].status = i === chNum - 1 ? "writing" : "pending";
    story.chapters[i].wordCount = 0;
    story.chapters[i].generatedAt = null;
    delete story.chapterContents[String(i + 1)];
  }

  // Truncate rolling summary to chapters before N
  if (chNum > 1) {
    try {
      const summarySystem = getStoryPrompt("summary");
      const chaptersBeforeN = Object.entries(story.chapterContents as Record<string, string>)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([num, text]) => `Chapter ${num}:\n${text}`)
        .join("\n\n");
      const summaryUser = `Create a rolling summary of these chapters only. These are the chapters that remain unchanged.\n\n${chaptersBeforeN}`;
      story.rollingSummary = await callLLM(summarySystem, summaryUser);
    } catch {
      story.rollingSummary = "";
    }
  } else {
    story.rollingSummary = "";
  }

  writeFileSync(path, JSON.stringify(story, null, 2));

  // Now generate the rewritten chapter
  return handleGenerateChapter({ storyId });
}

// ── Extend Story ─────────────────────────────────────────────

async function handleExtend(body: Record<string, unknown>): Promise<NextResponse> {
  const { storyId, additionalChapters } = body;
  if (!storyId || !additionalChapters) {
    return NextResponse.json({ error: "Missing storyId or additionalChapters" }, { status: 400 });
  }

  const path = getPath(storyId as string);
  if (!existsSync(path)) return NextResponse.json({ error: "Story not found" }, { status: 404 });

  const story = JSON.parse(readFileSync(path, "utf-8"));
  const addCount = additionalChapters as number;
  const startNum = story.chapters.length + 1;

  // Generate additional chapter outlines
  const newOutlines: ChapterOutline[] = [];
  for (let i = 0; i < addCount; i++) {
    const num = startNum + i;
    newOutlines.push({
      number: num,
      title: `Chapter ${num}`,
      purpose: "Continue and extend the story",
      keyBeats: [`New key event for chapter ${num}`],
      emotionalTone: "Engaging",
    });
  }

  // Add to bible
  story.storyBible.chapterOutlines.push(...newOutlines);

  // Add chapter entries
  for (const outline of newOutlines) {
    story.chapters.push({
      number: outline.number,
      title: outline.title,
      status: "pending",
      wordCount: 0,
      generatedAt: null,
    });
  }

  story.status = "active";
  story.updatedAt = new Date().toISOString();

  writeFileSync(path, JSON.stringify(story, null, 2));
  return NextResponse.json({ data: story });
}

// ── Helpers ──────────────────────────────────────────────────

function getChapterCount(length: string): number {
  switch (length) {
    case "short": return 3;
    case "medium": return 6;
    case "long": return 10;
    default: return 6;
  }
}

// ── List ─────────────────────────────────────────────────────

async function handleList(): Promise<NextResponse> {
  ensureDir();
  try {
    const files = readdirSync(SAVE_DIR).filter(f => f.endsWith(".json"));
    const stories = files.map(f => {
      try {
        const s = JSON.parse(readFileSync(SAVE_DIR + "/" + f, "utf-8"));
        return {
          id: s.id, title: s.title, status: s.status,
          chapters: s.chapters?.map((c: Record<string, unknown>) => ({
            number: c.number, title: c.title, status: c.status, wordCount: c.wordCount
          })),
          config: s.config,
          createdAt: s.createdAt, updatedAt: s.updatedAt,
        };
      } catch { return null; }
    }).filter(Boolean) as Array<Record<string, unknown>>;
    stories.sort((a, b) =>
      new Date(b.updatedAt as string).getTime() - new Date(a.updatedAt as string).getTime()
    );
    return NextResponse.json({ data: { stories } });
  } catch { return NextResponse.json({ data: { stories: [] } }); }
}

// ── Load ─────────────────────────────────────────────────────

async function handleLoad(body: Record<string, unknown>): Promise<NextResponse> {
  const { storyId } = body;
  if (!storyId) return NextResponse.json({ error: "Missing storyId" }, { status: 400 });
  const path = getPath(storyId as string);
  if (!existsSync(path)) return NextResponse.json({ error: "Story not found" }, { status: 404 });
  return NextResponse.json({ data: JSON.parse(readFileSync(path, "utf-8")) });
}

// ── Update ───────────────────────────────────────────────────

async function handleUpdate(body: Record<string, unknown>): Promise<NextResponse> {
  const { storyId, ...fields } = body;
  if (!storyId) return NextResponse.json({ error: "Missing storyId" }, { status: 400 });
  const path = getPath(storyId as string);
  if (!existsSync(path)) return NextResponse.json({ error: "Story not found" }, { status: 404 });
  const story = JSON.parse(readFileSync(path, "utf-8"));
  const f = fields as Record<string, unknown>;
  if (f.title) story.title = f.title;
  if (f.chapters) story.chapters = f.chapters;
  if (f.rollingSummary) story.rollingSummary = f.rollingSummary;
  story.updatedAt = new Date().toISOString();
  writeFileSync(path, JSON.stringify(story, null, 2));
  return NextResponse.json({ data: story });
}

// ── Delete ───────────────────────────────────────────────────

async function handleDelete(body: Record<string, unknown>): Promise<NextResponse> {
  const { storyId } = body;
  if (!storyId) return NextResponse.json({ error: "Missing storyId" }, { status: 400 });
  const path = getPath(storyId as string);
  if (!existsSync(path)) return NextResponse.json({ error: "Story not found" }, { status: 404 });
  unlinkSync(path);
  return NextResponse.json({ data: { deleted: true } });
}

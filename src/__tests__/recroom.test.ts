import { getStoryPrompt, STORY_BIBLE_PROMPT, CHAPTER_PROMPT, SUMMARY_PROMPT, LOADING_MESSAGES, CHAPTER_STATUSES } from "@/lib/story-weaver/prompts";

describe("Story Weaver — Story Bible Prompts", () => {
  describe("getStoryPrompt", () => {
    it("should return bible prompt for 'bible' phase", () => {
      expect(getStoryPrompt("bible")).toBe(STORY_BIBLE_PROMPT);
    });

    it("should return chapter prompt for 'chapter' phase", () => {
      expect(getStoryPrompt("chapter")).toBe(CHAPTER_PROMPT);
    });

    it("should return summary prompt for 'summary' phase", () => {
      expect(getStoryPrompt("summary")).toBe(SUMMARY_PROMPT);
    });

    it("should fallback to chapter prompt for unknown phase", () => {
      expect(getStoryPrompt("unknown" as any)).toBe(CHAPTER_PROMPT);
    });
  });

  describe("Story Bible Prompt", () => {
    it("should include JSON structure instructions", () => {
      expect(STORY_BIBLE_PROMPT).toContain("storyArc");
      expect(STORY_BIBLE_PROMPT).toContain("fixedPlotPoints");
      expect(STORY_BIBLE_PROMPT).toContain("characterArcs");
      expect(STORY_BIBLE_PROMPT).toContain("worldRules");
      expect(STORY_BIBLE_PROMPT).toContain("chapterOutlines");
    });

    it("should emphasize specificity", () => {
      expect(STORY_BIBLE_PROMPT).toContain("SPECIFIC");
      expect(STORY_BIBLE_PROMPT).toContain("fixed plot point");
    });

    it("should require valid JSON output", () => {
      expect(STORY_BIBLE_PROMPT).toContain("VALID JSON");
    });
  });

  describe("Chapter Prompt", () => {
    it("should reference fixed plot points", () => {
      expect(CHAPTER_PROMPT).toContain("FIXED PLOT POINTS");
      expect(CHAPTER_PROMPT).toContain("contract");
    });

    it("should include quality standards", () => {
      expect(CHAPTER_PROMPT).toContain("Vary sentence length");
      expect(CHAPTER_PROMPT).toContain("Show, don't tell");
      expect(CHAPTER_PROMPT).toContain("CONSISTENCY CHECKLIST");
    });

    it("should specify prose-only output", () => {
      expect(CHAPTER_PROMPT).toContain("ONLY the chapter text");
      expect(CHAPTER_PROMPT).toContain("Pure prose");
    });
  });

  describe("Summary Prompt", () => {
    it("should allow flexible length", () => {
      expect(SUMMARY_PROMPT).toContain("thorough");
      expect(SUMMARY_PROMPT).toContain("5-10 lines");
      expect(SUMMARY_PROMPT).toContain("20-30+");
    });

    it("should list what to preserve", () => {
      expect(SUMMARY_PROMPT).toContain("ALL key plot events");
      expect(SUMMARY_PROMPT).toContain("Character development");
      expect(SUMMARY_PROMPT).toContain("world-building");
    });

    it("should specify flowing prose format", () => {
      expect(SUMMARY_PROMPT).toContain("flowing narrative prose");
    });
  });
});

describe("Story Weaver — Status Messages", () => {
  it("should have status messages for all states", () => {
    expect(CHAPTER_STATUSES.pending).toBeTruthy();
    expect(CHAPTER_STATUSES.writing).toBeTruthy();
    expect(CHAPTER_STATUSES.complete).toBeTruthy();
    expect(CHAPTER_STATUSES.failed).toBeTruthy();
  });

  it("should have 25+ loading messages", () => {
    expect(LOADING_MESSAGES.length).toBeGreaterThanOrEqual(25);
    for (const msg of LOADING_MESSAGES) {
      expect(msg.length).toBeGreaterThan(5);
    }
  });

  it("should include bible-specific messages", () => {
    expect(LOADING_MESSAGES.some(m => m.includes("bible") || m.includes("Architecting") || m.includes("Plot points"))).toBe(true);
  });
});

describe("Story Weaver — Removed Functions", () => {
  it("should not export getStoryPrompt with 'plan' phase", () => {
    // Old 'plan' phase replaced by 'bible'
    const planPrompt = getStoryPrompt("plan" as any);
    // Should fallback to chapter prompt (not old PLAN_AND_CHAPTER_PROMPT)
    expect(planPrompt).toBe(CHAPTER_PROMPT);
  });

  it("should not export getStoryPrompt with 'format' phase", () => {
    // Old 'format' phase removed
    const formatPrompt = getStoryPrompt("format" as any);
    // Should fallback to chapter prompt (not old FORMATTING_REVIEW_PROMPT)
    expect(formatPrompt).toBe(CHAPTER_PROMPT);
  });
});

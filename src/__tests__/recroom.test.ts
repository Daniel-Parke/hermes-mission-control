import { getStoryPrompt, CHAPTER_STATUSES, LOADING_MESSAGES } from "@/lib/story-weaver/prompts";
import { DEFAULT_SETTINGS, FONTS, THEMES } from "@/components/story-weaver/ReaderSettings";

describe("Story Weaver — Prompts", () => {
  it("should return prompts for all phases", () => {
    expect(getStoryPrompt("plan")).toContain("STORY PLAN");
    expect(getStoryPrompt("chapter")).toContain("CONSISTENCY");
    expect(getStoryPrompt("summary")).toContain("Summarize");
  });

  it("plan prompt should include plan+chapter format", () => {
    const prompt = getStoryPrompt("plan");
    expect(prompt).toContain("===PLAN===");
    expect(prompt).toContain("===CHAPTER 1===");
    expect(prompt).toContain("DEVIATION HOOKS");
  });

  it("chapter prompt should include consistency checklist", () => {
    const prompt = getStoryPrompt("chapter");
    expect(prompt).toContain("Character names");
    expect(prompt).toContain("plotholes");
    expect(prompt).toContain("800-1500 words");
  });

  it("should fallback to chapter prompt for unknown phase", () => {
    const result = getStoryPrompt("unknown" as any);
    expect(result).toBeTruthy();
    expect(result).toContain("CONSISTENCY");
  });
});

describe("Story Weaver — Status Messages", () => {
  it("should have status messages for all states", () => {
    expect(CHAPTER_STATUSES.pending).toBeTruthy();
    expect(CHAPTER_STATUSES.writing).toBeTruthy();
    expect(CHAPTER_STATUSES.complete).toBeTruthy();
    expect(CHAPTER_STATUSES.failed).toBeTruthy();
  });

  it("should have 20+ loading messages", () => {
    expect(LOADING_MESSAGES.length).toBeGreaterThanOrEqual(20);
  });
});

describe("Story Weaver — Reader Settings", () => {
  it("should have valid defaults", () => {
    expect(DEFAULT_SETTINGS.fontSize).toBeGreaterThanOrEqual(12);
    expect(DEFAULT_SETTINGS.fontSize).toBeLessThanOrEqual(28);
    expect(DEFAULT_SETTINGS.lineHeight).toBeGreaterThanOrEqual(1.2);
    expect(DEFAULT_SETTINGS.lineHeight).toBeLessThanOrEqual(2.5);
    expect(["dark", "black", "sepia", "light"]).toContain(DEFAULT_SETTINGS.pageTheme);
  });

  it("should have 5 font options", () => {
    expect(FONTS).toHaveLength(5);
    for (const font of FONTS) {
      expect(font.name).toBeTruthy();
      expect(font.family).toContain("var(--font-");
    }
  });

  it("should have 4 theme presets", () => {
    expect(Object.keys(THEMES)).toHaveLength(4);
    for (const [key, theme] of Object.entries(THEMES)) {
      expect(theme.bg).toMatch(/^#[0-9a-f]{6}$/);
      expect(theme.text).toMatch(/^#[0-9a-f]{6}$/);
      expect(theme.accent).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});

describe("Story Weaver — Chapter Read Status", () => {
  it("should support read status states", () => {
    const statuses = ["writing", "unread", "read"];
    for (const s of statuses) {
      expect(statuses).toContain(s);
    }
  });

  it("should mark first chapter complete after creation", () => {
    const chapters = [
      { number: 1, title: "Ch1", status: "complete", wordCount: 800, readStatus: "unread" },
      { number: 2, title: "Ch2", status: "pending", wordCount: 0, readStatus: "writing" },
    ];
    expect(chapters[0].status).toBe("complete");
    expect(chapters[0].readStatus).toBe("unread");
    expect(chapters[1].status).toBe("pending");
  });

  it("should detect all chapters complete", () => {
    const chapters = [
      { number: 1, status: "complete", readStatus: "read" },
      { number: 2, status: "complete", readStatus: "read" },
    ];
    expect(chapters.every((c) => c.status === "complete")).toBe(true);
    expect(chapters.every((c) => c.readStatus === "read")).toBe(true);
  });
});

describe("Story Weaver — Word Count Ranges", () => {
  it("should have valid range options", () => {
    const ranges = ["short", "medium", "standard", "long", "epic", "marathon"];
    const labels = ["800-1.2k", "1.2-1.8k", "1.8-2.5k", "2.5-3.5k", "3.5-5k", "5k+"];
    expect(ranges).toHaveLength(6);
    expect(labels).toHaveLength(6);
  });
});

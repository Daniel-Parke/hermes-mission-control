// ═══════════════════════════════════════════════════════════════
// Rec Room — TypeScript Interfaces
// ═══════════════════════════════════════════════════════════════

import type { AccentColor } from "@/types/hermes";

// ── Activity Types ───────────────────────────────────────────

export type RecRoomActivity =
  | "creative-canvas"
  | "ascii-studio"
  | "story-weaver";

export interface ActivityMeta {
  id: RecRoomActivity;
  name: string;
  description: string;
  icon: string;
  accentColor: AccentColor;
  longDescription: string;
  examples: string[];
}

// ── API Actions ──────────────────────────────────────────────

export type RecRoomAction =
  | "enhance"
  | "generate"
  | "refine"
  | "convert"
  | "save"
  | "load"
  | "list"
  | "delete";

export interface RecRoomRequest {
  action: RecRoomAction;
  activity: RecRoomActivity;
  prompt?: string;
  context?: Record<string, unknown>;
  enhancedPrompt?: string;
  previousOutput?: string;
  refinement?: string;
  imageData?: string;
  name?: string;
  id?: string;
}

// ── Enhancement Response ─────────────────────────────────────

export interface EnhanceResponse {
  interpretation: string;
  techniques: string[];
  options: EnhancementOption[];
}

export interface EnhancementOption {
  label: string;
  description: string;
  params: Record<string, unknown>;
}

// ── Generation Response ──────────────────────────────────────

export interface GenerateResponse {
  output: string;
  format: "html" | "text" | "code" | "json";
  metadata?: Record<string, unknown>;
}

// ── Creative Canvas ──────────────────────────────────────────

export interface CanvasOptions {
  style: "realistic" | "abstract" | "minimal" | "cyberpunk" | "organic";
  palette: string;
  speed: number;       // 1-5
  complexity: number;  // 1-5
  interactivity: ("mouse" | "keyboard" | "auto")[];
}

export const DEFAULT_CANVAS_OPTIONS: CanvasOptions = {
  style: "abstract",
  palette: "neon",
  speed: 3,
  complexity: 3,
  interactivity: ["mouse"],
};

// ── ASCII Studio ─────────────────────────────────────────────

export type ASCIIMode = "text-banner" | "describe" | "upload";

export interface ASCIIOptions {
  mode: ASCIIMode;
  font: string;
  width: number;
  style: "classic" | "dense" | "sparse" | "braille" | "block";
  colorEnabled: boolean;
}

export const DEFAULT_ASCII_OPTIONS: ASCIIOptions = {
  mode: "describe",
  font: "slant",
  width: 80,
  style: "dense",
  colorEnabled: false,
};

export interface AnimationOptions {
  effect: "bounce" | "fade" | "wave" | "scroll" | "matrix" | "dissolve" | "pulse";
  speed: number;    // 1-5
  frames: number;
  loop: boolean;
}

// ── Story Weaver ─────────────────────────────────────────────

export interface StoryConfig {
  premise: string;
  genre: string;
  setting: string;
  era: string;
  mood: string[];
  language: string;
  characters: StoryCharacter[];
  length: "short" | "medium" | "long";
  pacing: number;       // 1-5
  complexity: number;   // 1-5
  pov: "first" | "third-limited" | "third-omniscient";
  arc: string;
}

export interface StoryCharacter {
  name: string;
  role: "protagonist" | "ally" | "antagonist" | "supporting" | "mystery";
  description: string;
}

export interface StoryChapter {
  title: string;
  summary: string;
  themes: string[];
}

export interface StoryOutline {
  title: string;
  chapters: StoryChapter[];
}

export interface StoryPage {
  chapter: number;
  page: number;
  content: string;
  userDirection: string | null;
  branchId: string | null;
  generatedAt: string;
}

export interface StoryBranch {
  id: string;
  fromPage: { chapter: number; page: number };
  name: string;
  pages: StoryPage[];
}

export interface StoryContext {
  config: StoryConfig;
  outline: StoryOutline;
  recentPages: StoryPage[];
  summary: string;
  currentChapter: number;
  currentPage: number;
  userDirection?: string;
}

// ── Saved Items ──────────────────────────────────────────────

export interface SavedItem {
  id: string;
  activity: RecRoomActivity;
  name: string;
  prompt: string;
  enhancedPrompt: string | null;
  output: string;
  outputFormat: "html" | "text" | "code" | "json";
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}

// ── Prompt Builder State ─────────────────────────────────────

export interface PromptBuilderState {
  prompt: string;
  isEnhancing: boolean;
  isGenerating: boolean;
  enhancedPrompt: string | null;
  enhancementResult: EnhanceResponse | null;
  selectedOption: number | null;
  showAdvanced: boolean;
}

// ── Component Props ──────────────────────────────────────────

export interface PromptBuilderProps {
  activity: RecRoomActivity;
  accentColor: AccentColor;
  placeholder: string;
  examples: string[];
  options?: React.ReactNode;
  onEnhance: (prompt: string) => void;
  onGenerate: (prompt: string, context?: Record<string, unknown>) => void;
  enhancing: boolean;
  generating: boolean;
  enhancementResult: EnhanceResponse | null;
  onSelectOption: (index: number) => void;
}

export interface OutputViewerProps {
  format: "html" | "text" | "code" | "json";
  content: string;
  accentColor: AccentColor;
  allowPause?: boolean;
  allowExport?: boolean;
  allowCodeView?: boolean;
  isPlaying?: boolean;
  onPause?: () => void;
  onReset?: () => void;
  onExport?: (format: string) => void;
  onRefine?: (refinement: string) => void;
}

export interface ActivityCardProps {
  activity: ActivityMeta;
  onClick: () => void;
}

export interface ActivityLayoutProps {
  activity: ActivityMeta;
  children: React.ReactNode;
}

export interface SavedItemCardProps {
  item: SavedItem;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onExport: (id: string, format: string) => void;
}

// ── Activity Registry ────────────────────────────────────────

export const REC_ROOM_ACTIVITIES: ActivityMeta[] = [
  {
    id: "creative-canvas",
    name: "Creative Canvas",
    description: "Generative visual art powered by p5.js",
    icon: "Palette",
    accentColor: "cyan",
    longDescription:
      "Create stunning interactive animations and generative art. From literal depictions to abstract concepts — describe what you want to see and watch it come to life.",
    examples: [
      "Animate our solar system with realistic orbits",
      "Show me what pain looks like",
      "Create a particle system that reacts to mouse movement",
      "Generate a flowing landscape of neon mountains",
    ],
  },
  {
    id: "ascii-studio",
    name: "ASCII Studio",
    description: "ASCII art, images, and animation",
    icon: "Terminal",
    accentColor: "green",
    longDescription:
      "The full ASCII art pipeline. Generate from text, convert images, create text banners with 571 fonts, and animate your creations with visual effects.",
    examples: [
      "Make me an ASCII art cat wearing a top hat",
      "Convert my photo to ASCII art",
      "Create a Matrix-style rain animation",
      "Generate a large banner saying HELLO WORLD",
    ],
  },
  {
    id: "story-weaver",
    name: "Story Weaver",
    description: "Collaborative interactive fiction",
    icon: "BookOpen",
    accentColor: "purple",
    longDescription:
      "Build stories collaboratively with AI. Define your world, characters, and themes — then navigate page-by-page, steering the narrative in any direction you choose.",
    examples: [
      "Write me a mystery set aboard a generation ship",
      "Create a fantasy adventure in a floating city",
      "A noir detective story set in 1940s Tokyo",
      "A children's story about a brave little robot",
    ],
  },
];

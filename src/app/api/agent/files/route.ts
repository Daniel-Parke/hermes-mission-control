// ═══════════════════════════════════════════════════════════════
// Agent Files API — List all behavior markdown files
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { readFileSync, existsSync, statSync } from "fs";

import { HERMES_HOME, PATHS } from "@/lib/hermes";

// Static behavior files — each defines a different aspect of agent personality
const BEHAVIOR_FILES: Record<
  string,
  { name: string; path: string; description: string; category: string }
> = {
  soul: {
    name: "SOUL.md",
    path: PATHS.soul,
    description: "Agent persona — defines personality, tone, and behavior",
    category: "identity",
  },
  hermes: {
    name: "HERMES.md",
    path: PATHS.hermes,
    description: "Priority project instructions (loaded every message)",
    category: "identity",
  },
  user: {
    name: "USER.md",
    path: PATHS.userMd,
    description: "User priorities, preferences, and personal context",
    category: "user",
  },
  memory_md: {
    name: "MEMORY.md",
    path: PATHS.memoryMd,
    description: "Agent memory and persistent knowledge (loaded every message)",
    category: "user",
  },
  persona: {
    name: "AGENT.md",
    path: PATHS.agent,
    description: "Agent instructions and behavior guidelines",
    category: "identity",
  },

};

export async function GET() {
  try {
    const files = Object.entries(BEHAVIOR_FILES).map(([key, config]) => {
      const exists = existsSync(config.path);
      let size = 0;
      let lastModified: string | null = null;
      let content = "";

      if (exists) {
        try {
          const stats = statSync(config.path);
          size = stats.size;
          lastModified = stats.mtime.toISOString();
          content = readFileSync(config.path, "utf-8");
        } catch {}
      }

      return {
        key,
        name: config.name,
        description: config.description,
        category: config.category,
        path: config.path,
        exists,
        size,
        lastModified,
        content,
      };
    });

    return NextResponse.json({ files, total: files.length });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to list behavior files" },
      { status: 500 }
    );
  }
}

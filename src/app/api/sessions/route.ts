import { NextResponse } from "next/server";
import { readFileSync, readdirSync, existsSync, statSync } from "fs";

import { HERMES_HOME, PATHS } from "@/lib/hermes";

export async function GET() {
  const sessionsPath = PATHS.sessions;

  if (!existsSync(sessionsPath)) {
    return NextResponse.json({ sessions: [], total: 0 });
  }

  try {
    const files = readdirSync(sessionsPath);
    const sessionFiles = files.filter(
      (f) => f.endsWith(".json") || f.endsWith(".jsonl")
    );

    const sessions = sessionFiles.map((file) => {
      const fullPath = sessionsPath + "/" + file;
      const stats = statSync(fullPath);

      // Try to read session metadata
      let title = "";
      let messageCount = 0;
      let model = "";
      let source = "";

      try {
        if (file.endsWith(".json")) {
          const content = readFileSync(fullPath, "utf-8");
          const data = JSON.parse(content);
          title = data.title || data.name || "";
          messageCount = data.messages?.length || 0;
          model = data.model || "";
          source = data.source || "";
        }
      } catch {}

      return {
        id: file.replace(/\.(json|jsonl)$/, ""),
        filename: file,
        title: title || file.replace(/_/g, " ").replace(/\.(json|jsonl)$/, ""),
        size: stats.size,
        created: stats.birthtime.toISOString(),
        modified: stats.mtime.toISOString(),
        messageCount,
        model,
        source,
      };
    });

    // Sort by modified date descending
    sessions.sort(
      (a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime()
    );

    return NextResponse.json({
      sessions,
      total: sessions.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read sessions" },
      { status: 500 }
    );
  }
}
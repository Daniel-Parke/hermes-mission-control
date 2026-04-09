import { NextResponse } from "next/server";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";

import { HERMES_HOME, PATHS } from "@/lib/hermes";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const logName = searchParams.get("name") || "agent";
    const maxLines = Math.min(parseInt(searchParams.get("lines") || "200"), 1000);

    const logsDir = PATHS.logs;
    if (!existsSync(logsDir)) {
      return NextResponse.json({ error: "No logs directory found" }, { status: 404 });
    }

    // List available log files
    let availableLogs: Array<{ name: string; size: number; modified: string }> = [];
    try {
      const files = readdirSync(logsDir);
      for (const file of files) {
        if (file.endsWith(".log")) {
          const filePath = logsDir + "/" + file;
          const stats = statSync(filePath);
          availableLogs.push({
            name: file.replace(".log", ""),
            size: stats.size,
            modified: stats.mtime.toISOString(),
          });
        }
      }
    } catch {}

    // Read requested log file
    const safeName = logName.replace(/[^a-zA-Z_-]/g, "");
    const logPath = logsDir + "/" + safeName + ".log";

    if (!existsSync(logPath)) {
      return NextResponse.json({
        availableLogs,
        lines: [],
        error: `Log file '${safeName}.log' not found`,
      });
    }

    const stats = statSync(logPath);
    const content = readFileSync(logPath, "utf-8");
    const allLines = content.split("\n").filter((line) => line.length > 0);
    // Newest first — take last N lines then reverse
    const lines = allLines.slice(-maxLines).reverse();

    return NextResponse.json({
      name: safeName,
      totalLines: allLines.length,
      showingLines: lines.length,
      size: stats.size,
      modified: stats.mtime.toISOString(),
      lines,
      availableLogs,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read logs" },
      { status: 500 }
    );
  }
}

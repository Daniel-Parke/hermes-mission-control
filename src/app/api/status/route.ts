import { NextResponse } from "next/server";
import { existsSync, statSync, readdirSync } from "fs";

import { HERMES_HOME, PATHS } from "@/lib/hermes";

export async function GET() {
  try {
    // Check SOUL.md
    const soulPath = PATHS.soul;
    const soulFile = existsSync(soulPath);

    // Check config.yaml
    const configPath = PATHS.config;
    const configFile = existsSync(configPath);

    // Count skills
    let skillsCount = 0;
    const skillsPath = PATHS.skills;
    if (existsSync(skillsPath)) {
      const countSkills = (dir: string): number => {
        let count = 0;
        try {
          const items = readdirSync(dir, { withFileTypes: true });
          for (const item of items) {
            if (item.isDirectory()) {
              count += countSkills(dir + "/" + item.name);
            } else if (item.name === "SKILL.md") {
              count++;
            }
          }
        } catch {}
        return count;
      };
      skillsCount = countSkills(skillsPath);
    }

    // Count sessions
    let sessionsCount = 0;
    const sessionsPath = PATHS.sessions;
    if (existsSync(sessionsPath)) {
      try {
        const files = readdirSync(sessionsPath);
        sessionsCount = files.filter((f) => f.endsWith(".json") || f.endsWith(".jsonl")).length;
      } catch {}
    }

    // Memory DB size
    let memorySize = "N/A";
    const memoryPath = PATHS.memoryDb;
    if (existsSync(memoryPath)) {
      try {
        const stats = statSync(memoryPath);
        const sizeKB = Math.round(stats.size / 1024);
        memorySize = sizeKB > 1024 ? (sizeKB / 1024).toFixed(1) + " MB" : sizeKB + " KB";
      } catch {}
    }

    return NextResponse.json({
      soulFile,
      configFile,
      skillsCount,
      sessionsCount,
      memorySize,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read system status" },
      { status: 500 }
    );
  }
}
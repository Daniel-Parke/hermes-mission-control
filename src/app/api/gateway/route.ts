import { NextResponse } from "next/server";
import { existsSync, readFileSync } from "fs";

import { HERMES_HOME, PATHS } from "@/lib/hermes";

export async function GET() {
  try {
    // Read config for gateway settings
    const configPath = PATHS.config;
    let gatewayConfig: Record<string, unknown> = {};

    if (existsSync(configPath)) {
      try {
        const content = readFileSync(configPath, "utf-8");
        // Simple parsing for gateway-related settings
        const lines = content.split("\n");
        let inGateway = false;
        for (const line of lines) {
          if (line.startsWith("gateway:") || line.startsWith("platform_toolsets:")) {
            inGateway = true;
            continue;
          }
          if (inGateway && !line.startsWith(" ") && !line.startsWith("\t") && line.trim()) {
            inGateway = false;
          }
        }
      } catch {}
    }

    // Check for gateway log
    const logPath = PATHS.logs + "/gateway.log";
    let lastLogLines: string[] = [];
    if (existsSync(logPath)) {
      try {
        const content = readFileSync(logPath, "utf-8");
        const lines = content.split("\n").filter((l) => l.trim());
        lastLogLines = lines.slice(-20);
      } catch {}
    }

    // Check platform status from .env
    const envPath = PATHS.env;
    const platforms: Record<string, boolean> = {};
    if (existsSync(envPath)) {
      try {
        const content = readFileSync(envPath, "utf-8");
        const envVars: Record<string, string> = {};
        for (const line of content.split("\n")) {
          const eqIdx = line.indexOf("=");
          if (eqIdx > 0 && !line.startsWith("#")) {
            const key = line.slice(0, eqIdx).trim();
            const val = line.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
            if (val && val !== "changeme") {
              envVars[key] = val;
            }
          }
        }
        platforms.telegram = !!envVars.TELEGRAM_BOT_TOKEN;
        platforms.discord = !!envVars.DISCORD_BOT_TOKEN;
        platforms.slack = !!envVars.SLACK_BOT_TOKEN;
        platforms.whatsapp = !!envVars.WHATSAPP_API_KEY || !!envVars.WHATSAPP_PHONE_ID;
      } catch {}
    }

    return NextResponse.json({
      platforms,
      recentLogs: lastLogLines,
      logAvailable: existsSync(logPath),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to read gateway status" },
      { status: 500 }
    );
  }
}

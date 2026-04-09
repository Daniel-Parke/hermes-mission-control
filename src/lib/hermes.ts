// ═══════════════════════════════════════════════════════════════
// Shared Hermes Configuration — centralised paths and constants
// ═══════════════════════════════════════════════════════════════
// All API routes should import from here instead of constructing
// paths independently. This ensures consistency and portability.

export const HOME = process.env.HOME || "";
export const HERMES_HOME = process.env.HERMES_HOME || (HOME + "/.hermes");
export const MC_DATA_DIR = HERMES_HOME + "/mission-control/data";

// Standard file paths
export const PATHS = {
  config: HERMES_HOME + "/config.yaml",
  env: HERMES_HOME + "/.env",
  soul: HERMES_HOME + "/SOUL.md",
  hermes: HERMES_HOME + "/HERMES.md",
  agent: HERMES_HOME + "/AGENT.md",
  userMd: HERMES_HOME + "/memories/USER.md",
  memoryMd: HERMES_HOME + "/memories/MEMORY.md",
  cronJobs: HERMES_HOME + "/cron/jobs.json",
  sessions: HERMES_HOME + "/sessions",
  skills: HERMES_HOME + "/skills",
  logs: HERMES_HOME + "/logs",
  backups: HERMES_HOME + "/backups",
  memoryDb: HERMES_HOME + "/memory_store.db",
  missions: MC_DATA_DIR + "/missions",
  templates: MC_DATA_DIR + "/templates",
} as const;

// Read a config value from config.yaml (simple key lookup)
export function getConfigValue(content: string, dottedKey: string): string {
  const keys = dottedKey.split(".");
  const lines = content.split("\n");
  let currentPath: string[] = [];

  for (const line of lines) {
    const trimmed = line.trimEnd();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const indent = line.search(/\S/);
    const depth = indent / 2; // Assumes 2-space indentation
    const match = trimmed.trimStart().match(/^(\w+):\s*(.*)/);
    if (!match) continue;

    const key = match[1];
    const value = match[2].trim();

    // Build path based on indent depth
    currentPath = currentPath.slice(0, depth);
    currentPath.push(key);

    // Check if current path matches our target
    if (currentPath.join(".") === dottedKey) {
      return value.replace(/^['"]|['"]$/g, "");
    }
  }
  return "";
}

// Read Discord home channel from env or config
export function getDiscordHomeChannel(envContent: string): string {
  // Check .env for DISCORD_HOME_CHANNEL
  const match = envContent.match(/^DISCORD_HOME_CHANNEL=(.+)$/m);
  if (match) return match[1].trim().replace(/^['"]|['"]$/g, "");
  return "";
}

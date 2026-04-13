/**
 * Deployment profile for future hosted / central features (reserved).
 */
export type DeploymentMode = "local" | "hosted";

export type McEdition = "simple" | "commercial";

function firstNonEmptyEnv(
  env: NodeJS.ProcessEnv,
  keys: readonly string[]
): string | undefined {
  for (const k of keys) {
    const v = env[k];
    if (v !== undefined && String(v).trim() !== "") {
      return String(v).trim();
    }
  }
  return undefined;
}

/**
 * Read edition from server-side environment.
 * Canonical: `CH_EDITION` / `NEXT_PUBLIC_CH_EDITION`. Legacy: `MC_*` (still supported).
 */
export function getMcEditionFromEnv(
  env: NodeJS.ProcessEnv = process.env
): McEdition {
  const v = (
    firstNonEmptyEnv(env, [
      "CH_EDITION",
      "MC_EDITION",
      "NEXT_PUBLIC_CH_EDITION",
      "NEXT_PUBLIC_MC_EDITION",
    ]) || "simple"
  ).toLowerCase();
  return v === "commercial" ? "commercial" : "simple";
}

/**
 * Client-safe edition when bundled with NEXT_PUBLIC_* at build time.
 */
export function getPublicMcEdition(): McEdition {
  if (
    typeof process !== "undefined" &&
    process.env?.NEXT_PUBLIC_CH_EDITION !== undefined
  ) {
    return process.env.NEXT_PUBLIC_CH_EDITION === "commercial"
      ? "commercial"
      : "simple";
  }
  if (
    typeof process !== "undefined" &&
    process.env?.NEXT_PUBLIC_MC_EDITION !== undefined
  ) {
    return process.env.NEXT_PUBLIC_MC_EDITION === "commercial"
      ? "commercial"
      : "simple";
  }
  if (typeof window !== "undefined") {
    const w = window as unknown as {
      __CH_EDITION__?: string;
      __MC_EDITION__?: string;
    };
    if (w.__CH_EDITION__ === "commercial") return "commercial";
    if (w.__MC_EDITION__ === "commercial") return "commercial";
  }
  return "simple";
}

export function getDeploymentMode(env: NodeJS.ProcessEnv = process.env): DeploymentMode {
  const v = (env.AC_DEPLOYMENT_MODE || "local").toLowerCase();
  return v === "hosted" ? "hosted" : "local";
}

export interface McEnvSummary {
  hermesHome: string | undefined;
  mcDataDir: string | undefined;
  mcApiKeySet: boolean;
  acLicenseKeySet: boolean;
  edition: McEdition;
  deploymentMode: DeploymentMode;
}

/**
 * Non-secret summary for diagnostics (never log raw secrets).
 */
/**
 * API key for mutating routes (header `X-CH-API-Key` or legacy `X-MC-API-Key`).
 */
export function getMcApiKeyFromEnv(env: NodeJS.ProcessEnv = process.env): string {
  return (firstNonEmptyEnv(env, ["CH_API_KEY", "MC_API_KEY"]) || "").trim();
}

export function summarizeMcEnv(env: NodeJS.ProcessEnv = process.env): McEnvSummary {
  const apiKey = getMcApiKeyFromEnv(env);
  return {
    hermesHome: env.HERMES_HOME,
    mcDataDir: firstNonEmptyEnv(env, ["CH_DATA_DIR", "MC_DATA_DIR"]),
    mcApiKeySet: Boolean(apiKey.length > 0),
    acLicenseKeySet: Boolean(env.AC_LICENSE_KEY && env.AC_LICENSE_KEY.length > 0),
    edition: getMcEditionFromEnv(env),
    deploymentMode: getDeploymentMode(env),
  };
}

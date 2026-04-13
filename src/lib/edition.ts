import { getMcEditionFromEnv, type McEdition } from "@agent-control-hub/config";

export type Edition = McEdition;

/**
 * Server-side edition (Hermes OSS Simple vs commercial).
 * Reads `CH_EDITION` / `NEXT_PUBLIC_CH_EDITION` with legacy `MC_*` fallback (see `@agent-control-hub/config`).
 */
export function getEdition(): Edition {
  return getMcEditionFromEnv();
}

export function isCommercialEdition(): boolean {
  return getEdition() === "commercial";
}

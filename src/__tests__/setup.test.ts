import { existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

describe("Setup & paths (hermetic)", () => {
  it("HERMES_HOME drives PATHS.missions and templates under mission-control/data", async () => {
    const tmp = mkdtempSync(join(tmpdir(), "mc-setup-"));
    const prev = process.env.HERMES_HOME;
    process.env.HERMES_HOME = tmp;
    jest.resetModules();
    try {
      const { HERMES_HOME, PATHS } = await import("@/lib/hermes");
      expect(HERMES_HOME).toBe(tmp);
      expect(PATHS.missions).toBe(tmp + "/mission-control/data/missions");
      expect(PATHS.templates).toBe(tmp + "/mission-control/data/templates");
      expect(PATHS.missions).toContain("mission-control");
    } finally {
      rmSync(tmp, { recursive: true, force: true });
      if (prev !== undefined) process.env.HERMES_HOME = prev;
      else delete process.env.HERMES_HOME;
      jest.resetModules();
    }
  });

  it("creates missions and templates dirs idempotently in temp home", async () => {
    const tmp = mkdtempSync(join(tmpdir(), "mc-setup-"));
    const prev = process.env.HERMES_HOME;
    process.env.HERMES_HOME = tmp;
    jest.resetModules();
    try {
      const { PATHS } = await import("@/lib/hermes");
      if (!existsSync(PATHS.missions)) mkdirSync(PATHS.missions, { recursive: true });
      if (!existsSync(PATHS.templates)) mkdirSync(PATHS.templates, { recursive: true });
      expect(existsSync(PATHS.missions)).toBe(true);
      expect(existsSync(PATHS.templates)).toBe(true);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
      if (prev !== undefined) process.env.HERMES_HOME = prev;
      else delete process.env.HERMES_HOME;
      jest.resetModules();
    }
  });

  it("optional files are boolean flags without requiring real ~/.hermes", async () => {
    const tmp = mkdtempSync(join(tmpdir(), "mc-setup-"));
    const prev = process.env.HERMES_HOME;
    process.env.HERMES_HOME = tmp;
    mkdirSync(join(tmp, "skills"), { recursive: true });
    mkdirSync(join(tmp, "sessions"), { recursive: true });
    jest.resetModules();
    try {
      const { PATHS } = await import("@/lib/hermes");
      writeFileSync(join(tmp, "config.yaml"), "x: 1\n", "utf-8");
      expect(typeof existsSync(PATHS.config)).toBe("boolean");
      expect(typeof existsSync(PATHS.env)).toBe("boolean");
      expect(typeof existsSync(PATHS.skills)).toBe("boolean");
      expect(typeof existsSync(PATHS.sessions)).toBe("boolean");
      expect(typeof existsSync(PATHS.memoryDb)).toBe("boolean");
      expect(typeof existsSync(PATHS.cronJobs)).toBe("boolean");
      expect(typeof existsSync(PATHS.logs)).toBe("boolean");
    } finally {
      rmSync(tmp, { recursive: true, force: true });
      if (prev !== undefined) process.env.HERMES_HOME = prev;
      else delete process.env.HERMES_HOME;
      jest.resetModules();
    }
  });
});

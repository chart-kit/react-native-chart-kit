import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { requiredScripts } from "./release-gate-config.mjs";

const repoRoot = process.cwd();

const readPackageScripts = async () => {
  const source = await readFile(path.join(repoRoot, "package.json"), "utf8");
  return JSON.parse(source).scripts ?? {};
};

const requiredCkv2Scripts = [
  "lint",
  "typecheck",
  "test",
  "test:unit",
  "test:visual",
  "test:compat",
  "test:e2e",
  "benchmark",
  "example:ios",
  "example:android",
  "example:expo",
  "docs:build"
];

describe("package scripts", () => {
  it("keeps the CKV2 command surface available", async () => {
    const scripts = await readPackageScripts();
    const missingScripts = requiredCkv2Scripts.filter(
      (scriptName) => typeof scripts[scriptName] !== "string"
    );

    expect(missingScripts).toEqual([]);
  });

  it("keeps every release-gate-required command available", async () => {
    const scripts = await readPackageScripts();
    const missingScripts = requiredScripts.filter(
      (scriptName) => typeof scripts[scriptName] !== "string"
    );

    expect(missingScripts).toEqual([]);
  });

  it("keeps preview and stable release gates separate", async () => {
    const scripts = await readPackageScripts();

    expect(scripts["release:preview:gate"]).toContain("--preview --strict");
    expect(scripts["release:gate"]).toContain("--strict");
    expect(scripts["release:gate"]).not.toContain("--preview");
  });
});

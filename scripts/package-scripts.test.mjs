import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

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
  "test:compat",
  "benchmark",
  "pack:check",
  "surface:check",
  "example:rn-cli:typecheck",
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

  it("does not expose obsolete release automation commands", async () => {
    const scripts = await readPackageScripts();
    const releaseScripts = Object.keys(scripts).filter((scriptName) =>
      scriptName.startsWith("release:")
    );

    expect(releaseScripts).toEqual([]);
  });
});

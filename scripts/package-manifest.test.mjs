import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const manifestPath = path.join(
  repoRoot,
  "docs/release/evidence/package-manifest.json"
);

const readPackageManifest = async () =>
  JSON.parse(await readFile(manifestPath, "utf8"));

describe("release package manifest", () => {
  it("uses Developer Preview publish terminology", async () => {
    const manifest = await readPackageManifest();

    for (const packageInfo of manifest.packages ?? []) {
      expect(packageInfo).not.toHaveProperty("publishInBeta");
      expect(typeof packageInfo.publishInDeveloperPreview).toBe("boolean");
    }
  });

  it("lists only Developer Preview publishable packages for CI publishing", () => {
    const output = execFileSync(
      process.execPath,
      ["scripts/list-release-packages.mjs", "--publishable", "--names"],
      { cwd: repoRoot, encoding: "utf8" }
    ).trim();

    expect(output.split(/\s+/)).toEqual([
      "@chart-kit/core",
      "@chart-kit/svg-renderer",
      "@chart-kit/react-native",
      "react-native-chart-kit"
    ]);
  });
});

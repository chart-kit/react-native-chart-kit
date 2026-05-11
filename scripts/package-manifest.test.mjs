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

  it("keeps scoped dependencies before the root compatibility package", async () => {
    const manifest = await readPackageManifest();
    const publishableNames = (manifest.packages ?? [])
      .filter((packageInfo) => packageInfo.publishInDeveloperPreview)
      .map((packageInfo) => packageInfo.name);

    expect(publishableNames).toEqual([
      "@chart-kit/core",
      "@chart-kit/svg-renderer",
      "@chart-kit/react-native",
      "react-native-chart-kit"
    ]);
  });

  it("keeps Pro and Skia out of Developer Preview publishing", async () => {
    const manifest = await readPackageManifest();
    const previewOnlyPackages = (manifest.packages ?? [])
      .filter((packageInfo) =>
        ["@chart-kit/pro", "@chart-kit/skia-renderer"].includes(
          packageInfo.name
        )
      )
      .map((packageInfo) => [
        packageInfo.name,
        packageInfo.publishInDeveloperPreview
      ]);

    expect(previewOnlyPackages).toEqual([
      ["@chart-kit/skia-renderer", false],
      ["@chart-kit/pro", false]
    ]);
  });
});

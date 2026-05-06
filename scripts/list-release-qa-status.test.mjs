import { execFileSync } from "node:child_process";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { buildReleaseQaStatus } from "./list-release-qa-status.mjs";

const repoRoot = process.cwd();

describe("release QA status", () => {
  it("summarizes open rows across every evidence matrix", async () => {
    const sections = await buildReleaseQaStatus();

    expect(sections.map((section) => section.matrix)).toEqual([
      "accessibility",
      "performance",
      "runtime",
      "skia"
    ]);
    expect(sections.every((section) => section.openRows.length > 0)).toBe(true);
  });

  it("filters by matrix and row status", async () => {
    const [section] = await buildReleaseQaStatus({
      matrixName: "skia",
      status: "pending"
    });

    expect(section.matrix).toBe("skia");
    expect(section.openRows.map((row) => row.id)).toEqual([
      "ios-skia-performance-comparison",
      "android-skia-performance-comparison"
    ]);
    expect(section.openRows[0].command).toContain(
      "npm run release:qa:record --"
    );
  });

  it("includes launch URLs for performance story rows", async () => {
    const [section] = await buildReleaseQaStatus({
      matrixName: "performance",
      status: "partial"
    });
    const row = section.openRows.find(
      (item) => item.id === "android-svg-standard-line-scrub"
    );

    expect(row?.launchUrl).toBe(
      "chartkitshowcase://showcase?view=charts&story=v2-perf-line-1000-scrub"
    );
  });

  it("honors CLI matrix and status filters", () => {
    const output = execFileSync(
      process.execPath,
      [
        path.join(repoRoot, "scripts/list-release-qa-status.mjs"),
        "--matrix",
        "skia",
        "--status",
        "pending"
      ],
      { cwd: repoRoot, encoding: "utf8" }
    );

    expect(output).toContain("Skia Renderer (skia): partial");
    expect(output).toContain("ios-skia-performance-comparison");
    expect(output).not.toContain("Runtime QA (runtime)");
  });
});

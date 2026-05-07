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
    expect(
      sections
        .filter((section) => section.matrix !== "skia")
        .every((section) => section.openRows.length > 0)
    ).toBe(true);
    expect(sections.find((section) => section.matrix === "skia")).toMatchObject(
      {
        openRows: [],
        status: "complete"
      }
    );
  });

  it("filters by matrix and row status", async () => {
    const [section] = await buildReleaseQaStatus({
      matrixName: "skia",
      status: "pass"
    });

    expect(section.matrix).toBe("skia");
    expect(section.openRows.map((row) => row.id)).toContain(
      "android-skia-performance-comparison"
    );
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
      "chartkitshowcase://showcase?story=v2-perf-line-1000-scrub&visual=1"
    );
    expect(row?.captureCommand).toBe(
      "npm run release:qa:capture -- --matrix performance --row android-svg-standard-line-scrub --platform android --output docs/release/artifacts/android-svg-standard-line-scrub.png --android-log-output docs/release/artifacts/android-svg-standard-line-scrub.log"
    );
  });

  it("adds capture commands for iOS runtime rows", async () => {
    const [section] = await buildReleaseQaStatus({
      matrixName: "runtime",
      status: "partial"
    });
    const row = section.openRows.find((item) => item.id === "ios-line-charts");

    expect(row?.captureCommand).toBe(
      "npm run release:qa:capture -- --matrix runtime --row ios-line-charts --platform ios --output docs/release/artifacts/ios-line-charts.png --ios-log-output docs/release/artifacts/ios-line-charts.log"
    );
  });

  it("adds UI hierarchy capture for Android accessibility rows", async () => {
    const [section] = await buildReleaseQaStatus({
      matrixName: "accessibility",
      status: "partial"
    });
    const row = section.openRows.find(
      (item) => item.id === "android-talkback-line-charts"
    );

    expect(row?.captureCommand).toBe(
      "npm run release:qa:capture -- --matrix accessibility --row android-talkback-line-charts --platform android --output docs/release/artifacts/android-talkback-line-charts.png --android-log-output docs/release/artifacts/android-talkback-line-charts.log --android-ui-output docs/release/artifacts/android-talkback-line-charts.xml"
    );
  });

  it("adds capture commands for Skia multi-target rows", async () => {
    const [section] = await buildReleaseQaStatus({
      matrixName: "skia",
      status: "pass"
    });
    const row = section.openRows.find(
      (item) => item.id === "android-skia-performance-comparison"
    );

    expect(row?.captureCommands).toHaveLength(6);
    expect(row?.captureCommand).toBe(
      'npm run release:qa:capture -- --matrix skia --row android-skia-performance-comparison --platform android --output docs/release/artifacts/android-skia-performance-comparison-1-dense-line.png --launch-url "chartkitshowcase://showcase?story=v2-perf-line-10000-overview&visual=1" --android-log-output docs/release/artifacts/android-skia-performance-comparison-1-dense-line.log'
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
        "pass"
      ],
      { cwd: repoRoot, encoding: "utf8" }
    );

    expect(output).toContain("Skia Renderer (skia): complete");
    expect(output).toContain("android-skia-performance-comparison");
    expect(output).toContain("--launch-url");
    expect(output).toContain("v2-perf-candlestick-1000");
    expect(output).not.toContain("Runtime QA (runtime)");
  });

  it("prints capture commands from the CLI for launchable rows", () => {
    const output = execFileSync(
      process.execPath,
      [
        path.join(repoRoot, "scripts/list-release-qa-status.mjs"),
        "--matrix",
        "runtime",
        "--status",
        "partial"
      ],
      { cwd: repoRoot, encoding: "utf8" }
    );

    expect(output).toContain("capture: npm run release:qa:capture --");
    expect(output).toContain("--row ios-line-charts --platform ios");
  });
});

import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { validatePerformanceMatrixArtifacts } from "./release-performance-artifacts.mjs";

const repoRoot = process.cwd();
const readRepoText = (relativePath) =>
  readFile(path.join(repoRoot, relativePath), "utf8");

const scenario = {
  expectedStoryMetrics: {
    chartType: "line",
    seriesCount: 1,
    totalPoints: 1000,
    visiblePoints: 1000
  },
  id: "standard-line-scrub",
  label: "Standard line scrub",
  showcaseStoryId: "v2-perf-line-1000-scrub"
};

const buildMatrix = ({
  artifact,
  platform = "android",
  status = "partial"
}) => ({
  scenarios: [scenario],
  rows: [
    {
      evidence: [artifact],
      id: `${platform}-svg-standard-line-scrub`,
      platform,
      renderer: "svg",
      scenarioId: scenario.id,
      status
    }
  ]
});

const androidArtifact = `# android-svg-standard-line-scrub Android Performance Sample

Date: 2026-05-06
Commit: \`abc1234\`
Package version: \`7.0.0-next.0\`
Platform: Android emulator
Build: release APK, \`io.chartkit.showcase\`
Renderer: svg through React Native SVG
Scenario: Android / Standard line scrub
Showcase story: \`v2-perf-line-1000-scrub\`
Deep link: \`chartkitshowcase://showcase?view=charts&story=v2-perf-line-1000-scrub\`

Expected fixture:
- Chart type: line
- Total points: 1,000
- Visible points: 1,000
- Series count: 1

Device:
- Model: sdk

Commands used:
\`\`\`sh
adb shell am start -W
adb shell dumpsys gfxinfo io.chartkit.showcase
adb shell dumpsys meminfo io.chartkit.showcase
\`\`\`

Launch timing:
Frame timing:
Janky frames
Memory:
Artifact:
- Screenshot: [android-svg-standard-line-scrub-performance.png](android-svg-standard-line-scrub-performance.png)

Notes:
- This does not replace physical-device QA.
`;

describe("performance artifact validation", () => {
  it("accepts checked-in native performance sample artifacts", async () => {
    const matrix = JSON.parse(
      await readRepoText("docs/release/evidence/native-performance-matrix.json")
    );

    await expect(validatePerformanceMatrixArtifacts(matrix)).resolves.toEqual(
      []
    );
  });

  it("requires benchmark metadata and platform-specific fields", async () => {
    const errors = await validatePerformanceMatrixArtifacts(
      buildMatrix({ artifact: "perf.md" }),
      {
        exists: async () => true,
        readText: async () =>
          androidArtifact
            .replace("Commit: `abc1234`\n", "")
            .replace("Frame timing:\n", "")
            .replace("Janky frames\n", "")
      }
    );

    expect(errors.join("; ")).toContain("Commit:");
    expect(errors.join("; ")).toContain("Frame timing:");
    expect(errors.join("; ")).toContain("Janky frames");
  });

  it("requires a screenshot link and partial evidence caveat", async () => {
    const errors = await validatePerformanceMatrixArtifacts(
      buildMatrix({ artifact: "perf.md", platform: "ios" }),
      {
        exists: async () => true,
        readText: async () =>
          androidArtifact
            .replaceAll("android", "ios")
            .replace("Platform: Android emulator", "Platform: iOS simulator")
            .replace("adb shell am start -W", "xcrun simctl openurl")
            .replace(
              "adb shell dumpsys gfxinfo io.chartkit.showcase",
              "xcrun simctl io"
            )
            .replace("adb shell dumpsys meminfo io.chartkit.showcase", "")
            .replace("Janky frames\n", "simctl openurl command elapsed\n")
            .replace("Memory:\n", "Memory:\nRSS\n")
            .replace(
              "- Screenshot: [ios-svg-standard-line-scrub-performance.png](ios-svg-standard-line-scrub-performance.png)\n",
              ""
            )
            .replace("physical-device QA", "simulator QA")
            .concat("does not replace Instruments\n")
      }
    );

    expect(errors.join("; ")).toContain("must link a PNG screenshot");
    expect(errors.join("; ")).toContain("must state the device caveat");
  });
});

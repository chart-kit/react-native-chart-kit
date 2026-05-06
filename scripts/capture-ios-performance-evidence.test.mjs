import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";

import {
  captureIosPerformanceEvidence,
  createIosPerformancePlan
} from "./capture-ios-performance-evidence.mjs";
import { parseIosProcessInfo } from "./ios-performance-evidence-format.mjs";

const repoRoot = process.cwd();

const createTempRepo = async () => {
  const tempRepo = await mkdtemp(join(tmpdir(), "chartkit-ios-perf-"));
  const evidenceDir = join(tempRepo, "docs/release/evidence");

  await mkdir(evidenceDir, { recursive: true });
  await writeFile(
    join(tempRepo, "package.json"),
    `${JSON.stringify({ version: "7.0.0-test.0" }, null, 2)}\n`,
    "utf8"
  );
  await writeFile(
    join(evidenceDir, "native-performance-matrix.json"),
    `${JSON.stringify(
      {
        metrics: ["initial render time", "memory before and after scenario"],
        platforms: [{ id: "ios", label: "iOS" }],
        scenarios: [
          {
            expectedStoryMetrics: {
              chartType: "line",
              seriesCount: 1,
              totalPoints: 100,
              visiblePoints: 100
            },
            id: "small-line-initial-render",
            label: "Small line initial render",
            showcaseStoryId: "v2-perf-line-100"
          }
        ],
        rows: [
          {
            id: "ios-svg-small-line-initial-render",
            platform: "ios",
            renderer: "svg",
            scenarioId: "small-line-initial-render",
            status: "pending"
          }
        ]
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  return tempRepo;
};

describe("iOS performance evidence capture", () => {
  it("builds a simctl performance plan from an iOS matrix row", async () => {
    const plan = await createIosPerformancePlan({
      device: "A706C6A5-26A2-499F-B24A-A9FB574888B0",
      output: "docs/release/artifacts/ios-scrub.md",
      repoRoot,
      rowId: "ios-svg-standard-line-scrub"
    });

    expect(plan.outputPath).toBe("docs/release/artifacts/ios-scrub.md");
    expect(plan.screenshotPath).toBe("docs/release/artifacts/ios-scrub.png");
    expect(plan.row).toMatchObject({
      id: "ios-svg-standard-line-scrub",
      launchUrl:
        "chartkitshowcase://showcase?view=charts&story=v2-perf-line-1000-scrub",
      showcaseStoryId: "v2-perf-line-1000-scrub"
    });
    expect(plan.commands.slice(0, 4)).toEqual([
      {
        allowFailure: true,
        args: [
          "simctl",
          "terminate",
          "A706C6A5-26A2-499F-B24A-A9FB574888B0",
          "io.chartkit.showcase"
        ],
        command: "xcrun"
      },
      {
        args: [
          "simctl",
          "openurl",
          "A706C6A5-26A2-499F-B24A-A9FB574888B0",
          "chartkitshowcase://showcase?view=charts&story=v2-perf-line-1000-scrub"
        ],
        command: "xcrun"
      },
      {
        args: [
          "simctl",
          "spawn",
          "A706C6A5-26A2-499F-B24A-A9FB574888B0",
          "/bin/ps",
          "-axo",
          "pid,rss,comm"
        ],
        command: "xcrun"
      },
      {
        args: [
          "simctl",
          "spawn",
          "A706C6A5-26A2-499F-B24A-A9FB574888B0",
          "/bin/ps",
          "-axo",
          "pid,rss,comm"
        ],
        command: "xcrun"
      }
    ]);
  });

  it("extracts simulator app process memory from ps output", () => {
    expect(
      parseIosProcessInfo({
        executableName: "ChartKitShowcase",
        psOutput: [
          "PID RSS COMM",
          "120 128 /usr/libexec/logd",
          "9313 412240 /tmp/ChartKitShowcase.app/ChartKitShowcase"
        ].join("\n")
      })
    ).toEqual({
      command: "/tmp/ChartKitShowcase.app/ChartKitShowcase",
      pid: 9313,
      rssKb: 412240
    });
  });

  it("captures markdown evidence with an injected command runner", async () => {
    const tempRepo = await createTempRepo();
    const calls = [];
    const result = await captureIosPerformanceEvidence({
      bundleId: "io.test.showcase",
      device: "ios-device",
      output: "docs/release/artifacts/ios-small.md",
      repoRoot: tempRepo,
      rowId: "ios-svg-small-line-initial-render",
      runner: (command) => {
        calls.push(command);

        if (command.command === "git") return "abc1234\n";
        if (command.args.includes("spawn")) {
          return "PID RSS COMM\n9313 412240 /tmp/ChartKitShowcase.app/ChartKitShowcase\n";
        }
        if (command.args.includes("devices")) {
          return "== Devices ==\n-- iOS 26.0 --\n iPhone 17 (ios-device) (Booted)\n";
        }

        return "";
      },
      waitMs: 0
    });
    const markdown = await readFile(join(tempRepo, result.outputPath), "utf8");

    expect(markdown).toContain("Commit: `abc1234`");
    expect(markdown).toContain("Package version: `7.0.0-test.0`");
    expect(markdown).toContain("Build: release app, `io.test.showcase`");
    expect(markdown).toContain("| RSS | 412,240 KB | 412,240 KB |");
    expect(markdown).toContain("It does not replace Instruments frame timing");
    expect(calls).toContainEqual({
      args: [
        "simctl",
        "io",
        "ios-device",
        "screenshot",
        result.absoluteScreenshotPath
      ],
      command: "xcrun"
    });
  });
});

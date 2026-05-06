import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";

import {
  captureAndroidPerformanceEvidence,
  createAndroidPerformancePlan
} from "./capture-android-performance-evidence.mjs";

const repoRoot = process.cwd();

const createTempRepo = async () => {
  const tempRepo = await mkdtemp(join(tmpdir(), "chartkit-android-perf-"));
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
        platforms: [{ id: "android", label: "Android" }],
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
            id: "android-svg-small-line-initial-render",
            platform: "android",
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

describe("Android performance evidence capture", () => {
  it("builds an adb performance plan from an Android matrix row", async () => {
    const plan = await createAndroidPerformancePlan({
      device: "emulator-5554",
      output: "docs/release/artifacts/android-scrub.md",
      repoRoot,
      rowId: "android-svg-standard-line-scrub"
    });

    expect(plan.outputPath).toBe("docs/release/artifacts/android-scrub.md");
    expect(plan.screenshotPath).toBe(
      "docs/release/artifacts/android-scrub.png"
    );
    expect(plan.row).toMatchObject({
      id: "android-svg-standard-line-scrub",
      launchUrl:
        "chartkitshowcase://showcase?story=v2-perf-line-1000-scrub&visual=1",
      showcaseStoryId: "v2-perf-line-1000-scrub"
    });
    expect(plan.commands.slice(0, 5)).toEqual([
      {
        args: [
          "-s",
          "emulator-5554",
          "shell",
          "am",
          "force-stop",
          "io.chartkit.showcase"
        ],
        command: "adb"
      },
      {
        args: [
          "-s",
          "emulator-5554",
          "shell",
          "dumpsys",
          "gfxinfo",
          "io.chartkit.showcase",
          "reset"
        ],
        command: "adb"
      },
      {
        args: [
          "-s",
          "emulator-5554",
          "shell",
          "am",
          "start",
          "-W",
          "-a",
          "android.intent.action.VIEW",
          "-d",
          "'chartkitshowcase://showcase?story=v2-perf-line-1000-scrub&visual=1'",
          "io.chartkit.showcase"
        ],
        command: "adb"
      },
      {
        args: [
          "-s",
          "emulator-5554",
          "shell",
          "dumpsys",
          "meminfo",
          "io.chartkit.showcase"
        ],
        command: "adb"
      },
      {
        args: [
          "-s",
          "emulator-5554",
          "shell",
          "dumpsys",
          "gfxinfo",
          "io.chartkit.showcase",
          "reset"
        ],
        command: "adb"
      }
    ]);
    expect(plan.commands).toContainEqual({
      args: [
        "-s",
        "emulator-5554",
        "shell",
        "input",
        "swipe",
        "900",
        "1180",
        "180",
        "1180",
        "1200"
      ],
      command: "adb"
    });
  });

  it("captures markdown and screenshot artifacts with an injected runner", async () => {
    const tempRepo = await createTempRepo();
    const calls = [];
    const result = await captureAndroidPerformanceEvidence({
      androidPackage: "io.test.showcase",
      device: "emulator-5554",
      output: "docs/release/artifacts/android-small.md",
      repoRoot: tempRepo,
      rowId: "android-svg-small-line-initial-render",
      runner: (command) => {
        calls.push(command);

        if (command.command === "git") return "abc1234\n";
        if (command.encoding === "buffer") return Buffer.from("png-bytes");
        if (command.args.includes("ro.build.version.release")) return "36\n";
        if (command.args.includes("ro.product.model")) return "Pixel Test\n";
        if (command.args.includes("wm")) return "Physical size: 1080x2400\n";
        if (command.args.includes("meminfo")) {
          return "Native Heap     12,345\nTOTAL PSS: 123,456\nTOTAL RSS: 234,567\n";
        }
        if (
          command.args.includes("gfxinfo") &&
          !command.args.includes("reset")
        ) {
          return [
            "Total frames rendered: 120",
            "Janky frames: 4 (3%)",
            "50th percentile: 8ms",
            "90th percentile: 14ms",
            "95th percentile: 18ms",
            "99th percentile: 25ms",
            "Frame deadline missed: 2"
          ].join("\n");
        }
        if (command.args.includes("start")) {
          return "Starting: Intent\nTotalTime: 812\nWaitTime: 835\n";
        }

        return "";
      },
      waitMs: 0
    });
    const markdown = await readFile(join(tempRepo, result.outputPath), "utf8");
    const screenshot = await readFile(
      join(tempRepo, result.screenshotPath),
      "utf8"
    );

    expect(screenshot).toBe("png-bytes");
    expect(markdown).toContain("Commit: `abc1234`");
    expect(markdown).toContain("Package version: `7.0.0-test.0`");
    expect(markdown).toContain("Build: release APK, `io.test.showcase`");
    expect(markdown).toContain("| TotalTime | 812 ms |");
    expect(markdown).toContain("| p95 frame time | 18 ms |");
    expect(markdown).toContain("| Total PSS | 123,456 KB | 123,456 KB |");
    expect(calls).toContainEqual({
      args: ["-s", "emulator-5554", "shell", "getprop", "ro.product.model"],
      command: "adb"
    });
  });
});

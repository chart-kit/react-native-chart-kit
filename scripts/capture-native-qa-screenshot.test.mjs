import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";

import {
  captureNativeQaScreenshot,
  createNativeQaScreenshotPlan
} from "./capture-native-qa-screenshot.mjs";

const repoRoot = process.cwd();

const createTempRepo = async () => {
  const tempRepo = await mkdtemp(join(tmpdir(), "chartkit-native-capture-"));
  const evidenceDir = join(tempRepo, "docs/release/evidence");
  await mkdir(evidenceDir, { recursive: true });
  await writeFile(
    join(evidenceDir, "native-runtime-matrix.json"),
    `${JSON.stringify(
      {
        pages: [
          {
            id: "line",
            showcasePageId: "line-area",
            title: "Line Charts"
          }
        ],
        platforms: [{ id: "android", label: "Android" }],
        rows: [
          {
            id: "android-line-charts",
            pageId: "line",
            platform: "android",
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

describe("native QA screenshot capture", () => {
  it("builds an iOS simulator screenshot plan from a runtime QA row", async () => {
    const plan = await createNativeQaScreenshotPlan({
      device: "A706C6A5-26A2-499F-B24A-A9FB574888B0",
      matrixName: "runtime",
      output: "docs/release/artifacts/ios-bar-row.png",
      platform: "ios",
      repoRoot,
      rowId: "ios-bar-charts"
    });

    expect(plan.launchUrl).toBe(
      "chartkitshowcase://showcase?view=charts&page=bar"
    );
    expect(plan.outputPath).toBe("docs/release/artifacts/ios-bar-row.png");
    expect(plan.commands).toEqual([
      {
        args: [
          "simctl",
          "openurl",
          "A706C6A5-26A2-499F-B24A-A9FB574888B0",
          "chartkitshowcase://showcase?view=charts&page=bar"
        ],
        command: "xcrun"
      },
      {
        args: [
          "simctl",
          "io",
          "A706C6A5-26A2-499F-B24A-A9FB574888B0",
          "screenshot",
          resolve(repoRoot, "docs/release/artifacts/ios-bar-row.png")
        ],
        command: "xcrun"
      }
    ]);
    expect(plan.recordCommand).toBe(
      "npm run release:qa:record -- --matrix runtime --row ios-bar-charts --status partial --evidence docs/release/artifacts/ios-bar-row.png"
    );
  });

  it("can capture an Android screenshot with an injected command runner", async () => {
    const tempRepo = await createTempRepo();
    const calls = [];
    const result = await captureNativeQaScreenshot({
      androidPackage: "io.chartkit.showcase",
      matrixName: "runtime",
      output: "docs/release/artifacts/android-line.png",
      platform: "android",
      repoRoot: tempRepo,
      rowId: "android-line-charts",
      runner: (command) => {
        calls.push(command);
        return command.encoding === "buffer" ? Buffer.from("png-bytes") : "";
      },
      waitMs: 0
    });
    const screenshot = await readFile(
      join(tempRepo, "docs/release/artifacts/android-line.png"),
      "utf8"
    );

    expect(result.launchUrl).toBe(
      "chartkitshowcase://showcase?view=charts&page=line-area"
    );
    expect(calls).toEqual([
      {
        args: [
          "shell",
          "am",
          "start",
          "-W",
          "-a",
          "android.intent.action.VIEW",
          "-d",
          "chartkitshowcase://showcase?view=charts&page=line-area",
          "io.chartkit.showcase"
        ],
        command: "adb"
      },
      {
        args: ["exec-out", "screencap", "-p"],
        command: "adb",
        encoding: "buffer"
      }
    ]);
    expect(screenshot).toBe("png-bytes");
  });

  it("can skip launching and capture the current Android screen", async () => {
    const plan = await createNativeQaScreenshotPlan({
      launch: false,
      matrixName: "runtime",
      platform: "android",
      repoRoot,
      rowId: "android-bar-charts"
    });

    expect(plan.commands).toEqual([
      {
        args: ["exec-out", "screencap", "-p"],
        command: "adb",
        writesStdoutToFile: true
      }
    ]);
  });

  it("rejects matrix rows without a showcase deep link", async () => {
    await expect(
      createNativeQaScreenshotPlan({
        matrixName: "skia",
        platform: "ios",
        repoRoot,
        rowId: "ios-skia-native-install"
      })
    ).rejects.toThrow("does not have a showcase deep link");
  });
});

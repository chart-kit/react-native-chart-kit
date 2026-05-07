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

  it("can include iOS simulator logs in the screenshot plan", async () => {
    const plan = await createNativeQaScreenshotPlan({
      iosLogLast: "3m",
      iosLogOutput: "docs/release/artifacts/ios-bar-row.log",
      matrixName: "runtime",
      output: "docs/release/artifacts/ios-bar-row.png",
      platform: "ios",
      repoRoot,
      rowId: "ios-bar-charts"
    });

    expect(plan.commands).toEqual([
      {
        args: [
          "simctl",
          "openurl",
          "booted",
          "chartkitshowcase://showcase?view=charts&page=bar"
        ],
        command: "xcrun"
      },
      {
        args: [
          "simctl",
          "io",
          "booted",
          "screenshot",
          resolve(repoRoot, "docs/release/artifacts/ios-bar-row.png")
        ],
        command: "xcrun"
      },
      {
        args: [
          "simctl",
          "spawn",
          "booted",
          "log",
          "show",
          "--style",
          "compact",
          "--last",
          "3m",
          "--predicate",
          'process == "ChartKitShowcase"'
        ],
        command: "xcrun",
        encoding: "utf8",
        outputPath: resolve(repoRoot, "docs/release/artifacts/ios-bar-row.log"),
        writesStdoutToFile: true
      }
    ]);
    expect(plan.recordCommand).toBe(
      "npm run release:qa:record -- --matrix runtime --row ios-bar-charts --status partial --evidence docs/release/artifacts/ios-bar-row.png --evidence docs/release/artifacts/ios-bar-row.log"
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
          "'chartkitshowcase://showcase?view=charts&page=line-area'",
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

  it("can capture Android screenshot and logcat evidence together", async () => {
    const tempRepo = await createTempRepo();
    const calls = [];
    const result = await captureNativeQaScreenshot({
      androidLogLines: 250,
      androidLogOutput: "docs/release/artifacts/android-line.log",
      matrixName: "runtime",
      output: "docs/release/artifacts/android-line.png",
      platform: "android",
      repoRoot: tempRepo,
      rowId: "android-line-charts",
      runner: (command) => {
        calls.push(command);

        return command.encoding === "buffer"
          ? Buffer.from("png-bytes")
          : "logcat lines";
      },
      waitMs: 0
    });
    const screenshot = await readFile(
      join(tempRepo, "docs/release/artifacts/android-line.png"),
      "utf8"
    );
    const logcat = await readFile(
      join(tempRepo, "docs/release/artifacts/android-line.log"),
      "utf8"
    );

    expect(result.recordCommand).toBe(
      "npm run release:qa:record -- --matrix runtime --row android-line-charts --status partial --evidence docs/release/artifacts/android-line.png --evidence docs/release/artifacts/android-line.log"
    );
    expect(calls.map((call) => call.args)).toEqual([
      ["shell", "logcat", "-c"],
      [
        "shell",
        "am",
        "start",
        "-W",
        "-a",
        "android.intent.action.VIEW",
        "-d",
        "'chartkitshowcase://showcase?view=charts&page=line-area'",
        "io.chartkit.showcase"
      ],
      ["exec-out", "screencap", "-p"],
      ["logcat", "-d", "-t", "250"]
    ]);
    expect(screenshot).toBe("png-bytes");
    expect(logcat).toBe("logcat lines");
  });

  it("can capture Android UI hierarchy evidence with the screenshot", async () => {
    const tempRepo = await createTempRepo();
    const calls = [];
    const result = await captureNativeQaScreenshot({
      androidUiOutput: "docs/release/artifacts/android-line-ui.xml",
      matrixName: "runtime",
      output: "docs/release/artifacts/android-line.png",
      platform: "android",
      repoRoot: tempRepo,
      rowId: "android-line-charts",
      runner: (command) => {
        calls.push(command);

        return command.encoding === "buffer"
          ? Buffer.from("png-bytes")
          : "<hierarchy />";
      },
      waitMs: 0
    });
    const uiHierarchy = await readFile(
      join(tempRepo, "docs/release/artifacts/android-line-ui.xml"),
      "utf8"
    );

    expect(result.recordCommand).toBe(
      "npm run release:qa:record -- --matrix runtime --row android-line-charts --status partial --evidence docs/release/artifacts/android-line.png --evidence docs/release/artifacts/android-line-ui.xml"
    );
    expect(calls.map((call) => call.args)).toEqual([
      [
        "shell",
        "am",
        "start",
        "-W",
        "-a",
        "android.intent.action.VIEW",
        "-d",
        "'chartkitshowcase://showcase?view=charts&page=line-area'",
        "io.chartkit.showcase"
      ],
      ["exec-out", "screencap", "-p"],
      ["shell", "uiautomator", "dump", "/sdcard/chartkit-native-qa-window.xml"],
      ["exec-out", "cat", "/sdcard/chartkit-native-qa-window.xml"]
    ]);
    expect(uiHierarchy).toBe("<hierarchy />");
  });

  it("can combine Android screenshot, UI hierarchy, and logcat evidence", async () => {
    const plan = await createNativeQaScreenshotPlan({
      androidLogOutput: "docs/release/artifacts/android-line.log",
      androidUiOutput: "docs/release/artifacts/android-line-ui.xml",
      matrixName: "runtime",
      output: "docs/release/artifacts/android-line.png",
      platform: "android",
      repoRoot,
      rowId: "android-line-charts"
    });

    expect(plan.recordCommand).toBe(
      "npm run release:qa:record -- --matrix runtime --row android-line-charts --status partial --evidence docs/release/artifacts/android-line.png --evidence docs/release/artifacts/android-line.log --evidence docs/release/artifacts/android-line-ui.xml"
    );
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

  it("rejects Android log output for iOS captures", async () => {
    await expect(
      captureNativeQaScreenshot({
        androidLogOutput: "docs/release/artifacts/ios-line.log",
        dryRun: true,
        matrixName: "runtime",
        platform: "ios",
        repoRoot,
        rowId: "ios-line-charts"
      })
    ).rejects.toThrow("--android-log-output can only be used with Android");
  });

  it("rejects iOS log output for Android captures", async () => {
    await expect(
      captureNativeQaScreenshot({
        dryRun: true,
        iosLogOutput: "docs/release/artifacts/android-line.log",
        matrixName: "runtime",
        platform: "android",
        repoRoot,
        rowId: "android-line-charts"
      })
    ).rejects.toThrow("--ios-log-output can only be used with iOS");
  });

  it("rejects Android UI output for iOS captures", async () => {
    await expect(
      captureNativeQaScreenshot({
        androidUiOutput: "docs/release/artifacts/ios-line.xml",
        dryRun: true,
        matrixName: "runtime",
        platform: "ios",
        repoRoot,
        rowId: "ios-line-charts"
      })
    ).rejects.toThrow("--android-ui-output can only be used with Android");
  });
});

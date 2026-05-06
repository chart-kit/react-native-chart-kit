import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { listNativeQaRows } from "./record-native-qa-evidence.mjs";

const defaultAndroidPackage = "io.chartkit.showcase";
const defaultRepoRoot = process.cwd();

const usage = `Usage:
  node scripts/capture-android-performance-evidence.mjs --row <android-performance-row-id> [options]

Options:
  --device <serial>      Android adb serial. Defaults to the single attached device.
  --dry-run              Print commands without executing them.
  --output <path>        Markdown artifact path. Defaults to docs/release/artifacts/<row-id>.md.
  --package <id>         Android package id. Defaults to io.chartkit.showcase.
  --wait-ms <number>     Delay after launch before measurement. Defaults to 1800.
  --help                 Show this help.
`;

const parseArgs = (argv) => {
  const options = {
    androidPackage: defaultAndroidPackage,
    waitMs: 1800
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const readValue = () => {
      const value = argv[index + 1];

      if (!value || value.startsWith("--")) {
        throw new Error(`${arg} requires a value`);
      }

      index += 1;
      return value;
    };

    if (arg === "--device") {
      options.device = readValue();
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--output") {
      options.output = readValue();
    } else if (arg === "--package") {
      options.androidPackage = readValue();
    } else if (arg === "--row") {
      options.rowId = readValue();
    } else if (arg === "--wait-ms") {
      options.waitMs = Number(readValue());
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (options.help) return options;

  if (!options.rowId) {
    throw new Error("--row is required");
  }

  if (!Number.isFinite(options.waitMs) || options.waitMs < 0) {
    throw new Error("--wait-ms must be a non-negative number");
  }

  return options;
};

const androidShellQuote = (value) =>
  `'${String(value).replaceAll("'", "'\\''")}'`;

const shellQuote = (value) => {
  const text = String(value);

  if (text.startsWith("'") && text.endsWith("'")) return text;

  return /^[A-Za-z0-9_./:@?=&%+-]+$/.test(text)
    ? text
    : `'${text.replaceAll("'", "'\\''")}'`;
};

const commandText = (command, args) =>
  [command, ...args.map(shellQuote)].join(" ");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const defaultOutputForRow = (rowId) =>
  `docs/release/artifacts/${rowId}-performance.md`;

const runCommand = ({ args, command, encoding = "utf8" }) => {
  const result = spawnSync(command, args, {
    encoding,
    maxBuffer: 1024 * 1024 * 20,
    stdio: encoding === "buffer" ? ["ignore", "pipe", "pipe"] : "pipe"
  });

  if (result.error) throw result.error;

  if (result.status !== 0) {
    const stderr =
      encoding === "buffer" ? result.stderr?.toString("utf8") : result.stderr;
    const stdout =
      encoding === "buffer" ? result.stdout?.toString("utf8") : result.stdout;
    const detail = (stderr || stdout || "").trim();
    const suffix = detail ? `\n\n${detail}` : "";

    throw new Error(
      `${commandText(command, args)} failed with exit code ${
        result.status ?? 1
      }${suffix}`
    );
  }

  return result.stdout;
};

const adbArgs = (device, args) => [...(device ? ["-s", device] : []), ...args];

const isLaunchOnlyScenario = (rowId) =>
  rowId.includes("initial-render") || rowId.includes("overview");

const getInteractionCommands = ({ device, rowId }) => {
  const command = (args) => ({ args: adbArgs(device, args), command: "adb" });

  if (isLaunchOnlyScenario(rowId)) {
    return [];
  }

  if (rowId.includes("combined") || rowId.includes("candlestick")) {
    return [command(["shell", "input", "tap", "540", "1180"])];
  }

  if (rowId.includes("bar")) {
    return [
      command(["shell", "input", "swipe", "850", "1450", "240", "1450", "900"])
    ];
  }

  return [
    command(["shell", "input", "swipe", "900", "1180", "180", "1180", "1200"])
  ];
};

const findRow = async ({ repoRoot, rowId }) => {
  const rows = await listNativeQaRows({
    includeDetails: true,
    matrixName: "performance",
    repoRoot
  });
  const row = rows.find((item) => item.id === rowId);

  if (!row) {
    throw new Error(`Unknown performance row: ${rowId}`);
  }

  if (!row.id.startsWith("android-")) {
    throw new Error(`${rowId} is not an Android performance row.`);
  }

  return row;
};

const parseFirstNumber = (text, pattern) => {
  const match = text.match(pattern);
  return match ? Number(match[1].replaceAll(",", "")) : undefined;
};

const parseGfxinfo = (text) => ({
  frameDeadlineMissed: parseFirstNumber(
    text,
    /Frame deadline missed:\s+([\d,]+)/
  ),
  jankyFrames: parseFirstNumber(text, /Janky frames:\s+([\d,]+)/),
  p50Ms: parseFirstNumber(text, /50th percentile:\s+([\d.]+)ms/),
  p90Ms: parseFirstNumber(text, /90th percentile:\s+([\d.]+)ms/),
  p95Ms: parseFirstNumber(text, /95th percentile:\s+([\d.]+)ms/),
  p99Ms: parseFirstNumber(text, /99th percentile:\s+([\d.]+)ms/),
  totalFrames: parseFirstNumber(text, /Total frames rendered:\s+([\d,]+)/)
});

const parseMeminfo = (text) => ({
  nativeHeapPssKb: parseFirstNumber(text, /Native Heap\s+([\d,]+)/),
  totalPssKb: parseFirstNumber(text, /TOTAL PSS:\s+([\d,]+)/),
  totalRssKb: parseFirstNumber(text, /TOTAL RSS:\s+([\d,]+)/)
});

const parseLaunchOutput = (text) => ({
  totalTimeMs: parseFirstNumber(text, /TotalTime:\s+([\d,]+)/),
  waitTimeMs: parseFirstNumber(text, /WaitTime:\s+([\d,]+)/)
});

const formatMetric = (value, suffix = "") =>
  Number.isFinite(value) ? `${value.toLocaleString("en-US")}${suffix}` : "n/a";

const createMarkdown = ({
  commands,
  deviceInfo,
  gfxinfoSummary,
  launchSummary,
  launchOutput,
  meminfoBeforeSummary,
  meminfoSummary,
  row,
  screenshotPath,
  androidPackage
}) =>
  [
    `# ${row.id} Android Performance Sample`,
    "",
    `Date: ${new Date().toISOString().slice(0, 10)}`,
    `Platform: Android emulator`,
    `Build: release APK, \`${androidPackage}\``,
    `Renderer: ${row.renderer ?? "svg"} through React Native SVG`,
    `Scenario: ${row.target}`,
    `Showcase story: \`${row.showcaseStoryId}\``,
    `Deep link: \`${row.launchUrl}\``,
    "",
    "Expected fixture:",
    "",
    `- Chart type: ${row.expectedStoryMetrics?.chartType ?? "n/a"}`,
    `- Total points: ${formatMetric(row.expectedStoryMetrics?.totalPoints)}`,
    `- Visible points: ${formatMetric(row.expectedStoryMetrics?.visiblePoints)}`,
    `- Series count: ${formatMetric(row.expectedStoryMetrics?.seriesCount)}`,
    "",
    "Device:",
    "",
    `- Model: ${deviceInfo.model || "n/a"}`,
    `- Android: ${deviceInfo.androidVersion || "n/a"}`,
    `- Screen: ${deviceInfo.screenSize || "n/a"}`,
    "",
    "Commands used:",
    "",
    "```sh",
    ...commands.map((item) => commandText(item.command, item.args)),
    "```",
    "",
    "Launch output:",
    "",
    "```text",
    launchOutput.trim() || "n/a",
    "```",
    "",
    "Launch timing:",
    "",
    "| Metric | Result |",
    "| --- | ---: |",
    `| TotalTime | ${formatMetric(launchSummary.totalTimeMs, " ms")} |`,
    `| WaitTime | ${formatMetric(launchSummary.waitTimeMs, " ms")} |`,
    "",
    "Frame timing:",
    "",
    "| Metric | Result |",
    "| --- | ---: |",
    `| Total frames rendered | ${formatMetric(gfxinfoSummary.totalFrames)} |`,
    `| Janky frames | ${formatMetric(gfxinfoSummary.jankyFrames)} |`,
    `| p50 frame time | ${formatMetric(gfxinfoSummary.p50Ms, " ms")} |`,
    `| p90 frame time | ${formatMetric(gfxinfoSummary.p90Ms, " ms")} |`,
    `| p95 frame time | ${formatMetric(gfxinfoSummary.p95Ms, " ms")} |`,
    `| p99 frame time | ${formatMetric(gfxinfoSummary.p99Ms, " ms")} |`,
    `| Frame deadline missed | ${formatMetric(gfxinfoSummary.frameDeadlineMissed)} |`,
    "",
    "Memory:",
    "",
    "| Metric | Before scenario | After scenario |",
    "| --- | ---: | ---: |",
    `| Total PSS | ${formatMetric(
      meminfoBeforeSummary.totalPssKb,
      " KB"
    )} | ${formatMetric(meminfoSummary.totalPssKb, " KB")} |`,
    `| Total RSS | ${formatMetric(
      meminfoBeforeSummary.totalRssKb,
      " KB"
    )} | ${formatMetric(meminfoSummary.totalRssKb, " KB")} |`,
    `| Native heap PSS | ${formatMetric(
      meminfoBeforeSummary.nativeHeapPssKb,
      " KB"
    )} | ${formatMetric(meminfoSummary.nativeHeapPssKb, " KB")} |`,
    "",
    "Artifact:",
    "",
    `- Screenshot: [${path.basename(screenshotPath)}](${path.basename(screenshotPath)})`,
    "",
    "Notes:",
    "",
    "- This is Android release-emulator evidence for one native performance matrix row.",
    "- It does not replace physical-device performance, iOS performance, Skia parity, or manual visible-correctness review.",
    ""
  ].join("\n");

export const createAndroidPerformancePlan = async ({
  androidPackage = defaultAndroidPackage,
  device,
  output,
  repoRoot = defaultRepoRoot,
  rowId
}) => {
  const row = await findRow({ repoRoot, rowId });
  const outputPath = output ?? defaultOutputForRow(rowId);
  const absoluteOutputPath = path.resolve(repoRoot, outputPath);
  const screenshotPath = outputPath.replace(/\.md$/, ".png");
  const absoluteScreenshotPath = path.resolve(repoRoot, screenshotPath);
  const forceStopCommand = {
    args: adbArgs(device, ["shell", "am", "force-stop", androidPackage]),
    command: "adb"
  };
  const preLaunchResetCommand = {
    args: adbArgs(device, [
      "shell",
      "dumpsys",
      "gfxinfo",
      androidPackage,
      "reset"
    ]),
    command: "adb"
  };
  const launchCommand = {
    args: adbArgs(device, [
      "shell",
      "am",
      "start",
      "-W",
      "-a",
      "android.intent.action.VIEW",
      "-d",
      androidShellQuote(row.launchUrl),
      androidPackage
    ]),
    command: "adb"
  };
  const preInteractionMemoryCommand = {
    args: adbArgs(device, ["shell", "dumpsys", "meminfo", androidPackage]),
    command: "adb"
  };
  const interactionResetCommand = {
    args: adbArgs(device, [
      "shell",
      "dumpsys",
      "gfxinfo",
      androidPackage,
      "reset"
    ]),
    command: "adb"
  };
  const interactionCommands = getInteractionCommands({ device, rowId });
  const gfxCommand = {
    args: adbArgs(device, ["shell", "dumpsys", "gfxinfo", androidPackage]),
    command: "adb"
  };
  const memCommand = {
    args: adbArgs(device, ["shell", "dumpsys", "meminfo", androidPackage]),
    command: "adb"
  };
  const screenshotCommand = {
    args: adbArgs(device, ["exec-out", "screencap", "-p"]),
    command: "adb"
  };

  return {
    androidPackage,
    absoluteOutputPath,
    absoluteScreenshotPath,
    commands: [
      forceStopCommand,
      preLaunchResetCommand,
      launchCommand,
      preInteractionMemoryCommand,
      ...(interactionCommands.length > 0 ? [interactionResetCommand] : []),
      ...interactionCommands,
      gfxCommand,
      memCommand,
      screenshotCommand
    ],
    outputPath,
    row,
    screenshotPath
  };
};

export const captureAndroidPerformanceEvidence = async ({
  dryRun = false,
  runner = runCommand,
  waitMs = 1800,
  ...options
}) => {
  const plan = await createAndroidPerformancePlan(options);

  if (dryRun) return { ...plan, dryRun };

  await mkdir(path.dirname(plan.absoluteOutputPath), { recursive: true });

  const [
    forceStopCommand,
    preLaunchResetCommand,
    launchCommand,
    preInteractionMemoryCommand,
    ...restCommands
  ] = plan.commands;
  runner(forceStopCommand);
  runner(preLaunchResetCommand);
  const launchOutput = runner(launchCommand);
  await sleep(waitMs);
  const meminfoBefore = runner(preInteractionMemoryCommand);

  for (const command of restCommands.slice(0, -3)) {
    runner(command);
    await sleep(300);
  }

  const [gfxCommand, memCommand, screenshotCommand] = restCommands.slice(-3);
  const gfxinfo = runner(gfxCommand);
  const meminfo = runner(memCommand);
  const screenshot = runner({ ...screenshotCommand, encoding: "buffer" });
  const deviceInfo = {
    androidVersion: runner({
      args: adbArgs(options.device, [
        "shell",
        "getprop",
        "ro.build.version.release"
      ]),
      command: "adb"
    }).trim(),
    model: runner({
      args: adbArgs(options.device, ["shell", "getprop", "ro.product.model"]),
      command: "adb"
    }).trim(),
    screenSize: runner({
      args: adbArgs(options.device, ["shell", "wm", "size"]),
      command: "adb"
    })
      .trim()
      .replace(/^Physical size:\s*/, "")
  };

  await writeFile(plan.absoluteScreenshotPath, screenshot);
  await writeFile(
    plan.absoluteOutputPath,
    createMarkdown({
      commands: plan.commands,
      deviceInfo,
      gfxinfoSummary: parseGfxinfo(gfxinfo),
      launchSummary: parseLaunchOutput(launchOutput),
      launchOutput,
      meminfoBeforeSummary: parseMeminfo(meminfoBefore),
      meminfoSummary: parseMeminfo(meminfo),
      row: plan.row,
      screenshotPath: plan.screenshotPath,
      androidPackage: plan.androidPackage
    }),
    "utf8"
  );

  return { ...plan, dryRun };
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    console.log(usage.trim());
    return;
  }

  const result = await captureAndroidPerformanceEvidence(options);

  for (const command of result.commands) {
    console.log(`$ ${commandText(command.command, command.args)}`);
  }

  if (result.dryRun) {
    console.log(`Would write ${result.outputPath}`);
  } else {
    console.log(`Wrote ${result.outputPath}`);
    console.log(`Wrote ${result.screenshotPath}`);
  }

  console.log(
    `Record evidence with: npm run release:qa:record -- --matrix performance --row ${result.row.id} --status partial --evidence ${result.outputPath}`
  );
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    await main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

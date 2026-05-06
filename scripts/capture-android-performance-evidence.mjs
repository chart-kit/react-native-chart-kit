import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  createAndroidPerformanceMarkdown,
  parseGfxinfo,
  parseLaunchOutput,
  parseMeminfo
} from "./android-performance-evidence-format.mjs";
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

const getGitCommit = (runner) => {
  try {
    return runner({
      args: ["rev-parse", "--short", "HEAD"],
      command: "git"
    }).trim();
  } catch {
    return "n/a";
  }
};

const readPackageVersion = async (repoRoot) => {
  try {
    const packageJson = JSON.parse(
      await readFile(path.join(repoRoot, "package.json"), "utf8")
    );

    return packageJson.version ?? "n/a";
  } catch {
    return "n/a";
  }
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
  const repoRoot = options.repoRoot ?? defaultRepoRoot;
  const commit = getGitCommit(runner);
  const packageVersion = await readPackageVersion(repoRoot);
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
    createAndroidPerformanceMarkdown({
      androidPackage: plan.androidPackage,
      commandText,
      commands: plan.commands,
      commit,
      deviceInfo,
      gfxinfoSummary: parseGfxinfo(gfxinfo),
      launchSummary: parseLaunchOutput(launchOutput),
      launchOutput,
      meminfoBeforeSummary: parseMeminfo(meminfoBefore),
      meminfoSummary: parseMeminfo(meminfo),
      packageVersion,
      row: plan.row,
      screenshotPath: plan.screenshotPath
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

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { listNativeQaRows } from "./record-native-qa-evidence.mjs";

const defaultRepoRoot = process.cwd();
const defaultAndroidPackage = "io.chartkit.showcase";
const validPlatforms = new Set(["android", "ios"]);

const usage = `Usage:
  node scripts/capture-native-qa-screenshot.mjs --matrix <runtime|accessibility|performance> --row <row-id> --platform <ios|android> [options]

Options:
  --device <id>             iOS simulator UDID or Android adb serial. Defaults to booted/default device.
  --dry-run                 Print launch and screenshot commands without executing them.
  --no-launch               Capture current screen without opening the row deep link first.
  --output <path>           Repo-relative screenshot path. Defaults to docs/release/artifacts/<row-id>-screenshot.png.
  --package <id>            Android package id. Defaults to io.chartkit.showcase.
  --wait-ms <number>        Delay between launch and capture. Defaults to 1500.
  --help                    Show this help.
`;

const parseArgs = (argv) => {
  const options = {
    androidPackage: defaultAndroidPackage,
    launch: true,
    waitMs: 1500
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
    } else if (arg === "--matrix") {
      options.matrixName = readValue();
    } else if (arg === "--no-launch") {
      options.launch = false;
    } else if (arg === "--output") {
      options.output = readValue();
    } else if (arg === "--package") {
      options.androidPackage = readValue();
    } else if (arg === "--platform") {
      options.platform = readValue();
    } else if (arg === "--row") {
      options.rowId = readValue();
    } else if (arg === "--wait-ms") {
      options.waitMs = Number(readValue());
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (options.help) {
    return options;
  }

  if (!options.matrixName) {
    throw new Error("--matrix is required");
  }

  if (!options.rowId) {
    throw new Error("--row is required");
  }

  if (!validPlatforms.has(options.platform)) {
    throw new Error("--platform must be ios or android");
  }

  if (!Number.isFinite(options.waitMs) || options.waitMs < 0) {
    throw new Error("--wait-ms must be a non-negative number");
  }

  return options;
};

const shellQuote = (value) => {
  const text = String(value);

  return /^[A-Za-z0-9_./:@?=&%+-]+$/.test(text)
    ? text
    : `'${text.replaceAll("'", "'\\''")}'`;
};

const commandText = (command, args) =>
  [command, ...args.map(shellQuote)].join(" ");

const defaultOutputForRow = (rowId) =>
  `docs/release/artifacts/${rowId}-screenshot.png`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const runCommand = ({ args, command, encoding = "utf8" }) => {
  const result = spawnSync(command, args, {
    encoding,
    maxBuffer: 1024 * 1024 * 20,
    stdio: encoding === "buffer" ? ["ignore", "pipe", "pipe"] : "pipe"
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const stderr =
      encoding === "buffer"
        ? result.stderr?.toString("utf8")
        : result.stderr;
    const stdout =
      encoding === "buffer"
        ? result.stdout?.toString("utf8")
        : result.stdout;
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

const getIosDeviceTarget = (device) => device ?? "booted";

const buildIosCommands = ({ device, launch, launchUrl, outputPath }) => {
  const target = getIosDeviceTarget(device);
  const commands = [];

  if (launch) {
    commands.push({
      args: ["simctl", "openurl", target, launchUrl],
      command: "xcrun"
    });
  }

  commands.push({
    args: ["simctl", "io", target, "screenshot", outputPath],
    command: "xcrun"
  });

  return commands;
};

const buildAndroidLaunchArgs = ({ androidPackage, device, launchUrl }) => [
  ...(device ? ["-s", device] : []),
  "shell",
  "am",
  "start",
  "-W",
  "-a",
  "android.intent.action.VIEW",
  "-d",
  launchUrl,
  androidPackage
];

const buildAndroidCommands = ({
  androidPackage,
  device,
  launch,
  launchUrl
}) => {
  const commands = [];

  if (launch) {
    commands.push({
      args: buildAndroidLaunchArgs({ androidPackage, device, launchUrl }),
      command: "adb"
    });
  }

  commands.push({
    args: [...(device ? ["-s", device] : []), "exec-out", "screencap", "-p"],
    command: "adb",
    writesStdoutToFile: true
  });

  return commands;
};

const findRow = async ({ matrixName, repoRoot, rowId }) => {
  const rows = await listNativeQaRows({
    includeDetails: false,
    matrixName,
    repoRoot
  });
  const row = rows.find((item) => item.id === rowId);

  if (!row) {
    throw new Error(`Unknown ${matrixName} QA row: ${rowId}`);
  }

  if (!row.launchUrl) {
    throw new Error(
      `${rowId} does not have a showcase deep link. Use manual evidence for this row.`
    );
  }

  return row;
};

export const createNativeQaScreenshotPlan = async ({
  androidPackage = defaultAndroidPackage,
  device,
  launch = true,
  matrixName,
  output,
  platform,
  repoRoot = defaultRepoRoot,
  rowId,
  waitMs = 1500
}) => {
  const row = await findRow({ matrixName, repoRoot, rowId });
  const outputPath = output ?? defaultOutputForRow(rowId);
  const absoluteOutputPath = path.resolve(repoRoot, outputPath);
  const commandOptions = {
    androidPackage,
    device,
    launch,
    launchUrl: row.launchUrl,
    outputPath: absoluteOutputPath
  };
  const commands =
    platform === "ios"
      ? buildIosCommands(commandOptions)
      : buildAndroidCommands(commandOptions);

  return {
    absoluteOutputPath,
    commands,
    launchUrl: row.launchUrl,
    outputPath,
    recordCommand: `npm run release:qa:record -- --matrix ${matrixName} --row ${rowId} --status partial --evidence ${outputPath}`,
    row,
    waitMs
  };
};

export const captureNativeQaScreenshot = async ({
  dryRun = false,
  runner = runCommand,
  ...options
}) => {
  const plan = await createNativeQaScreenshotPlan(options);

  if (dryRun) {
    return { ...plan, dryRun };
  }

  await mkdir(path.dirname(plan.absoluteOutputPath), { recursive: true });

  for (const [index, command] of plan.commands.entries()) {
    const isLastCommand = index === plan.commands.length - 1;

    if (isLastCommand && command.writesStdoutToFile) {
      const screenshot = runner({
        args: command.args,
        command: command.command,
        encoding: "buffer"
      });
      await writeFile(plan.absoluteOutputPath, screenshot);
    } else {
      runner(command);
    }

    if (!isLastCommand && plan.waitMs > 0) {
      await sleep(plan.waitMs);
    }
  }

  return { ...plan, dryRun };
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    console.log(usage.trim());
    return;
  }

  const result = await captureNativeQaScreenshot(options);

  for (const command of result.commands) {
    const suffix = command.writesStdoutToFile
      ? ` > ${shellQuote(result.outputPath)}`
      : "";
    console.log(`$ ${commandText(command.command, command.args)}${suffix}`);
  }

  if (result.dryRun) {
    console.log(`Would capture ${result.outputPath}`);
  } else {
    console.log(`Captured ${result.outputPath}`);
  }

  console.log(`Record evidence with: ${result.recordCommand}`);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    await main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

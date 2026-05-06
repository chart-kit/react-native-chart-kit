import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  createIosPerformanceMarkdown,
  parseIosProcessInfo
} from "./ios-performance-evidence-format.mjs";
import { listNativeQaRows } from "./record-native-qa-evidence.mjs";

const defaultBundleId = "io.chartkit.showcase";
const defaultExecutableName = "ChartKitShowcase";
const defaultRepoRoot = process.cwd();

const usage = `Usage:
  node scripts/capture-ios-performance-evidence.mjs --row <ios-performance-row-id> [options]

Options:
  --bundle <id>          iOS bundle identifier. Defaults to io.chartkit.showcase.
  --device <id>          iOS simulator UDID. Defaults to booted.
  --dry-run              Print commands without executing them.
  --executable <name>    App executable name. Defaults to ChartKitShowcase.
  --output <path>        Markdown artifact path. Defaults to docs/release/artifacts/<row-id>.md.
  --wait-ms <number>     Delay after launch before measurement. Defaults to 1800.
  --help                 Show this help.
`;

const parseArgs = (argv) => {
  const options = {
    bundleId: defaultBundleId,
    executableName: defaultExecutableName,
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

    if (arg === "--bundle") {
      options.bundleId = readValue();
    } else if (arg === "--device") {
      options.device = readValue();
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--executable") {
      options.executableName = readValue();
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--output") {
      options.output = readValue();
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

const shellQuote = (value) => {
  const text = String(value);

  return /^[A-Za-z0-9_./:@?=&%+-]+$/.test(text)
    ? text
    : `'${text.replaceAll("'", "'\\''")}'`;
};

const commandText = (command, args) =>
  [command, ...args.map(shellQuote)].join(" ");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const defaultOutputForRow = (rowId) =>
  `docs/release/artifacts/${rowId}-performance.md`;

const runCommand = ({
  allowFailure = false,
  args,
  command,
  encoding = "utf8"
}) => {
  const result = spawnSync(command, args, {
    encoding,
    maxBuffer: 1024 * 1024 * 20,
    stdio: encoding === "buffer" ? ["ignore", "pipe", "pipe"] : "pipe"
  });

  if (result.error) throw result.error;

  if (!allowFailure && result.status !== 0) {
    const detail = (result.stderr || result.stdout || "").trim();
    const suffix = detail ? `\n\n${detail}` : "";

    throw new Error(
      `${commandText(command, args)} failed with exit code ${
        result.status ?? 1
      }${suffix}`
    );
  }

  return result.stdout;
};

const timedRunner = (runner, command) => {
  const start = Date.now();
  const output = runner(command);

  return {
    elapsedMs: Date.now() - start,
    output
  };
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

const getTarget = (device) => device ?? "booted";

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

  if (!row.id.startsWith("ios-")) {
    throw new Error(`${rowId} is not an iOS performance row.`);
  }

  return row;
};

export const createIosPerformancePlan = async ({
  bundleId = defaultBundleId,
  device,
  output,
  repoRoot = defaultRepoRoot,
  rowId
}) => {
  const row = await findRow({ repoRoot, rowId });
  const target = getTarget(device);
  const outputPath = output ?? defaultOutputForRow(rowId);
  const absoluteOutputPath = path.resolve(repoRoot, outputPath);
  const screenshotPath = outputPath.replace(/\.md$/, ".png");
  const absoluteScreenshotPath = path.resolve(repoRoot, screenshotPath);
  const terminateCommand = {
    allowFailure: true,
    args: ["simctl", "terminate", target, bundleId],
    command: "xcrun"
  };
  const launchCommand = {
    args: ["simctl", "openurl", target, row.launchUrl],
    command: "xcrun"
  };
  const processCommand = {
    args: ["simctl", "spawn", target, "/bin/ps", "-axo", "pid,rss,comm"],
    command: "xcrun"
  };
  const screenshotCommand = {
    args: ["simctl", "io", target, "screenshot", absoluteScreenshotPath],
    command: "xcrun"
  };
  const bootedDevicesCommand = {
    args: ["simctl", "list", "devices", "booted"],
    command: "xcrun"
  };

  return {
    absoluteOutputPath,
    absoluteScreenshotPath,
    bundleId,
    commands: [
      terminateCommand,
      launchCommand,
      processCommand,
      processCommand,
      screenshotCommand,
      bootedDevicesCommand
    ],
    outputPath,
    row,
    screenshotPath,
    target
  };
};

export const captureIosPerformanceEvidence = async ({
  dryRun = false,
  executableName = defaultExecutableName,
  runner = runCommand,
  waitMs = 1800,
  ...options
}) => {
  const plan = await createIosPerformancePlan(options);

  if (dryRun) return { ...plan, dryRun };

  await mkdir(path.dirname(plan.absoluteOutputPath), { recursive: true });

  const [
    terminateCommand,
    launchCommand,
    processAfterLaunchCommand,
    processAfterScenarioCommand,
    screenshotCommand,
    bootedDevicesCommand
  ] = plan.commands;

  runner(terminateCommand);
  const launchResult = timedRunner(runner, launchCommand);
  await sleep(waitMs);
  const psAfterLaunch = runner(processAfterLaunchCommand);
  await sleep(300);
  const psAfterScenario = runner(processAfterScenarioCommand);
  runner(screenshotCommand);

  const commit = getGitCommit(runner);
  const packageVersion = await readPackageVersion(
    options.repoRoot ?? defaultRepoRoot
  );
  const bootedDevices = runner(bootedDevicesCommand)
    .trim()
    .replace(/\s+/g, " ");
  const processAfterLaunch = parseIosProcessInfo({
    executableName,
    psOutput: psAfterLaunch
  });
  const processAfterScenario = parseIosProcessInfo({
    executableName,
    psOutput: psAfterScenario
  });

  await writeFile(
    plan.absoluteOutputPath,
    createIosPerformanceMarkdown({
      bundleId: plan.bundleId,
      commandText,
      commands: plan.commands,
      commit,
      deviceInfo: {
        bootedDevices,
        target: plan.target
      },
      executableName,
      launchElapsedMs: launchResult.elapsedMs,
      packageVersion,
      processAfterLaunch,
      processAfterScenario,
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

  const result = await captureIosPerformanceEvidence(options);

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

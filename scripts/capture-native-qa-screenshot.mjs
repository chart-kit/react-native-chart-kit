import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  captureNativeQaUsage,
  defaultAndroidPackage,
  parseCaptureNativeQaArgs
} from "./capture-native-qa-options.mjs";
import { listNativeQaRows } from "./record-native-qa-evidence.mjs";

const defaultRepoRoot = process.cwd();

const shellQuote = (value) => {
  const text = String(value);

  if (text.startsWith("'") && text.endsWith("'")) {
    return text;
  }

  return /^[A-Za-z0-9_./:@?=&%+-]+$/.test(text)
    ? text
    : `'${text.replaceAll("'", "'\\''")}'`;
};

const androidShellQuote = (value) =>
  `'${String(value).replaceAll("'", "'\\''")}'`;

const commandText = (command, args) =>
  [command, ...args.map(shellQuote)].join(" ");

const defaultOutputForRow = (rowId) =>
  `docs/release/artifacts/${rowId}-screenshot.png`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const shouldWaitAfterCommand = ({ args, command }) =>
  (command === "xcrun" && args[1] === "openurl") ||
  (command === "adb" && args.includes("start"));

const validateCaptureOptions = ({
  androidLogLines,
  androidLogOutput,
  androidUiOutput,
  iosLogLast,
  iosLogOutput,
  iosLogPredicate,
  platform
}) => {
  if (platform !== "android" && platform !== "ios") {
    throw new Error("--platform must be ios or android");
  }

  if (androidLogOutput && platform !== "android") {
    throw new Error("--android-log-output can only be used with Android");
  }

  if (androidUiOutput && platform !== "android") {
    throw new Error("--android-ui-output can only be used with Android");
  }

  if (iosLogOutput && platform !== "ios") {
    throw new Error("--ios-log-output can only be used with iOS");
  }

  if (!Number.isInteger(androidLogLines) || androidLogLines <= 0) {
    throw new Error("--android-log-lines must be a positive integer");
  }

  if (iosLogOutput && !iosLogLast) {
    throw new Error("--ios-log-last must be a non-empty duration");
  }

  if (iosLogOutput && !iosLogPredicate) {
    throw new Error("--ios-log-predicate must be non-empty");
  }
};

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

const getIosDeviceTarget = (device) => device ?? "booted";

const buildIosCommands = ({
  device,
  iosLogLast,
  iosLogOutputPath,
  iosLogPredicate,
  launch,
  launchUrl,
  outputPath
}) => {
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

  if (iosLogOutputPath) {
    commands.push({
      args: [
        "simctl",
        "spawn",
        target,
        "log",
        "show",
        "--style",
        "compact",
        "--last",
        iosLogLast,
        "--predicate",
        iosLogPredicate
      ],
      command: "xcrun",
      encoding: "utf8",
      outputPath: iosLogOutputPath,
      writesStdoutToFile: true
    });
  }

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
  androidShellQuote(launchUrl),
  androidPackage
];

const buildAndroidCommands = ({
  androidLogLines,
  androidLogOutputPath,
  androidPackage,
  androidUiOutputPath,
  device,
  launch,
  launchUrl
}) => {
  const commands = [];
  const uiDumpPath = "/sdcard/chartkit-native-qa-window.xml";

  if (androidLogOutputPath) {
    commands.push({
      args: [...(device ? ["-s", device] : []), "shell", "logcat", "-c"],
      command: "adb"
    });
  }

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

  if (androidUiOutputPath) {
    commands.push({
      args: [
        ...(device ? ["-s", device] : []),
        "shell",
        "uiautomator",
        "dump",
        uiDumpPath
      ],
      command: "adb"
    });
    commands.push({
      args: [...(device ? ["-s", device] : []), "exec-out", "cat", uiDumpPath],
      command: "adb",
      encoding: "utf8",
      outputPath: androidUiOutputPath,
      writesStdoutToFile: true
    });
  }

  if (androidLogOutputPath) {
    commands.push({
      args: [
        ...(device ? ["-s", device] : []),
        "logcat",
        "-d",
        "-t",
        String(androidLogLines)
      ],
      command: "adb",
      encoding: "utf8",
      outputPath: androidLogOutputPath,
      writesStdoutToFile: true
    });
  }

  return commands;
};

const findRow = async ({ launchUrl, matrixName, repoRoot, rowId }) => {
  const rows = await listNativeQaRows({
    includeDetails: false,
    matrixName,
    repoRoot
  });
  const row = rows.find((item) => item.id === rowId);

  if (!row) {
    throw new Error(`Unknown ${matrixName} QA row: ${rowId}`);
  }

  if (!row.launchUrl && !launchUrl) {
    throw new Error(
      `${rowId} does not have a showcase deep link. Use manual evidence for this row.`
    );
  }

  return { ...row, launchUrl: launchUrl ?? row.launchUrl };
};

export const createNativeQaScreenshotPlan = async ({
  androidLogLines = 400,
  androidLogOutput,
  androidPackage = defaultAndroidPackage,
  androidUiOutput,
  device,
  iosLogLast = "2m",
  iosLogOutput,
  iosLogPredicate = 'process == "ChartKitShowcase"',
  launch = true,
  launchUrl,
  matrixName,
  output,
  platform,
  repoRoot = defaultRepoRoot,
  rowId,
  waitMs = 1500
}) => {
  validateCaptureOptions({
    androidLogLines,
    androidLogOutput,
    androidUiOutput,
    iosLogLast,
    iosLogOutput,
    iosLogPredicate,
    platform
  });

  const row = await findRow({ launchUrl, matrixName, repoRoot, rowId });
  const outputPath = output ?? defaultOutputForRow(rowId);
  const absoluteOutputPath = path.resolve(repoRoot, outputPath);
  const absoluteAndroidLogOutputPath = androidLogOutput
    ? path.resolve(repoRoot, androidLogOutput)
    : undefined;
  const absoluteAndroidUiOutputPath = androidUiOutput
    ? path.resolve(repoRoot, androidUiOutput)
    : undefined;
  const absoluteIosLogOutputPath = iosLogOutput
    ? path.resolve(repoRoot, iosLogOutput)
    : undefined;
  const commandOptions = {
    androidLogLines,
    androidLogOutputPath: absoluteAndroidLogOutputPath,
    androidPackage,
    androidUiOutputPath: absoluteAndroidUiOutputPath,
    device,
    iosLogLast,
    iosLogOutputPath: absoluteIosLogOutputPath,
    iosLogPredicate,
    launch,
    launchUrl: row.launchUrl,
    outputPath: absoluteOutputPath
  };
  const commands =
    platform === "ios"
      ? buildIosCommands(commandOptions)
      : buildAndroidCommands(commandOptions);

  return {
    absoluteAndroidLogOutputPath,
    absoluteAndroidUiOutputPath,
    absoluteIosLogOutputPath,
    absoluteOutputPath,
    androidLogOutput,
    androidUiOutput,
    commands,
    iosLogOutput,
    launchUrl: row.launchUrl,
    outputPath,
    recordCommand: [
      `npm run release:qa:record -- --matrix ${matrixName} --row ${rowId}`,
      "--status partial",
      `--evidence ${outputPath}`,
      androidLogOutput ? `--evidence ${androidLogOutput}` : "",
      androidUiOutput ? `--evidence ${androidUiOutput}` : "",
      iosLogOutput ? `--evidence ${iosLogOutput}` : ""
    ]
      .filter(Boolean)
      .join(" "),
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
  if (plan.absoluteAndroidLogOutputPath) {
    await mkdir(path.dirname(plan.absoluteAndroidLogOutputPath), {
      recursive: true
    });
  }
  if (plan.absoluteAndroidUiOutputPath) {
    await mkdir(path.dirname(plan.absoluteAndroidUiOutputPath), {
      recursive: true
    });
  }
  if (plan.absoluteIosLogOutputPath) {
    await mkdir(path.dirname(plan.absoluteIosLogOutputPath), {
      recursive: true
    });
  }

  for (const command of plan.commands) {
    if (command.writesStdoutToFile) {
      const commandOutput = runner({
        args: command.args,
        command: command.command,
        encoding: command.encoding ?? "buffer"
      });
      await writeFile(
        command.outputPath ?? plan.absoluteOutputPath,
        commandOutput
      );
    } else {
      runner(command);
    }

    if (shouldWaitAfterCommand(command) && plan.waitMs > 0) {
      await sleep(plan.waitMs);
    }
  }

  return { ...plan, dryRun };
};

const main = async () => {
  const options = parseCaptureNativeQaArgs(process.argv.slice(2));

  if (options.help) {
    console.log(captureNativeQaUsage.trim());
    return;
  }

  const result = await captureNativeQaScreenshot(options);

  for (const command of result.commands) {
    const suffix = command.writesStdoutToFile
      ? ` > ${shellQuote(
          command.outputPath
            ? path.relative(defaultRepoRoot, command.outputPath)
            : result.outputPath
        )}`
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

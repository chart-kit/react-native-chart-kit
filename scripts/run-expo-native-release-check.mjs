import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import process from "node:process";

const repoRoot = process.cwd();

const usage = `Usage:
  node scripts/run-expo-native-release-check.mjs --platform <ios|android|all> [options]

Options:
  --app-dir <path>       Expo app directory. Defaults to apps/expo-showcase.
  --dry-run              Print commands without executing them.
  --skip-prebuild        Build existing native folders without running expo prebuild.
  --ios-scheme <name>    iOS scheme to build. Defaults to discovery from xcodebuild.
  --help                 Show this help.
`;

const parseArgs = (argv) => {
  const options = {
    appDir: "apps/expo-showcase",
    dryRun: false,
    iosScheme: undefined,
    platform: undefined,
    skipPrebuild: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case "--app-dir":
        options.appDir = argv[index + 1];
        index += 1;
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--help":
      case "-h":
        options.help = true;
        break;
      case "--ios-scheme":
        options.iosScheme = argv[index + 1];
        index += 1;
        break;
      case "--platform":
        options.platform = argv[index + 1];
        index += 1;
        break;
      case "--skip-prebuild":
        options.skipPrebuild = true;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (options.help) {
    return options;
  }

  if (!["ios", "android", "all"].includes(options.platform)) {
    throw new Error("--platform must be one of ios, android, or all.");
  }

  if (!options.appDir) {
    throw new Error("--app-dir requires a path.");
  }

  if (options.iosScheme === "") {
    throw new Error("--ios-scheme requires a non-empty name.");
  }

  return options;
};

const commandText = (command, args) =>
  [command, ...args.map((arg) => (arg.includes(" ") ? `"${arg}"` : arg))].join(
    " "
  );

const run = ({ args, command, cwd, dryRun }) => {
  const relativeCwd = path.relative(repoRoot, cwd) || ".";
  process.stdout.write(
    `$ cd ${relativeCwd} && ${commandText(command, args)}\n`
  );

  if (dryRun) {
    return "";
  }

  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: ["inherit", "pipe", "pipe"]
  });

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }

  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  if (result.status !== 0) {
    throw new Error(
      `${commandText(command, args)} failed with exit code ${result.status ?? 1}`
    );
  }

  return result.stdout ?? "";
};

const runExpoPrebuild = ({ appDir, dryRun, platform }) => {
  run({
    args: [
      "exec",
      "expo",
      "--",
      "prebuild",
      ".",
      "--platform",
      platform,
      "--clean",
      "--no-install"
    ],
    command: "npm",
    cwd: appDir,
    dryRun
  });
};

const requireDirectory = (directory, hint) => {
  if (!existsSync(directory)) {
    throw new Error(`${hint}: ${directory}`);
  }
};

const findFirstFileWithExtension = (directory, extension) => {
  const entries = readdirSync(directory, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile() || entry.isDirectory()) {
      const fullPath = path.join(directory, entry.name);

      if (entry.name.endsWith(extension)) {
        return fullPath;
      }
    }
  }

  return undefined;
};

const resolveIosSchemeFromAppConfig = (appDir) => {
  try {
    const appConfig = JSON.parse(
      readFileSync(path.join(appDir, "app.json"), "utf8")
    );
    const name = appConfig.expo?.name;

    return typeof name === "string" ? name.replace(/[^A-Za-z0-9_]/g, "") : "";
  } catch {
    return "";
  }
};

const discoverIosScheme = ({ appDir, dryRun, iosDir, workspacePath }) => {
  const configuredScheme = process.env.CK_IOS_SCHEME;

  if (configuredScheme) {
    return configuredScheme;
  }

  if (dryRun) {
    return resolveIosSchemeFromAppConfig(appDir) || "ChartKitShowcase";
  }

  const output = run({
    args: ["-list", "-json", "-workspace", path.basename(workspacePath)],
    command: "xcodebuild",
    cwd: iosDir,
    dryRun: false
  });
  const parsed = JSON.parse(output);
  const schemes = parsed.workspace?.schemes ?? [];
  const firstScheme = schemes.find(
    (scheme) => typeof scheme === "string" && !scheme.includes("Pods")
  );

  if (!firstScheme) {
    throw new Error("Could not discover an iOS app scheme from xcodebuild.");
  }

  return firstScheme;
};

const runAndroidReleaseBuild = ({ appDir, dryRun }) => {
  const androidDir = path.join(appDir, "android");

  const gradlew = process.platform === "win32" ? "gradlew.bat" : "./gradlew";

  if (!dryRun) {
    requireDirectory(
      androidDir,
      "Android project is missing; run prebuild first"
    );
  }

  run({
    args: ["assembleRelease"],
    command: gradlew,
    cwd: androidDir,
    dryRun
  });
};

const runIosReleaseBuild = ({ appDir, dryRun, iosScheme }) => {
  const iosDir = path.join(appDir, "ios");

  if (!dryRun) {
    requireDirectory(iosDir, "iOS project is missing; run prebuild first");
  }

  const workspacePath = dryRun
    ? path.join(iosDir, `${resolveIosSchemeFromAppConfig(appDir)}.xcworkspace`)
    : findFirstFileWithExtension(iosDir, ".xcworkspace");

  if (!workspacePath) {
    throw new Error(`No .xcworkspace found in ${iosDir}`);
  }

  if (dryRun || existsSync(path.join(iosDir, "Podfile"))) {
    run({
      args: ["install"],
      command: "pod",
      cwd: iosDir,
      dryRun
    });
  }

  const scheme =
    iosScheme ??
    discoverIosScheme({
      appDir,
      dryRun,
      iosDir,
      workspacePath
    });

  run({
    args: [
      "-workspace",
      path.basename(workspacePath),
      "-scheme",
      scheme,
      "-configuration",
      "Release",
      "-destination",
      "generic/platform=iOS",
      "CODE_SIGNING_ALLOWED=NO",
      "build"
    ],
    command: "xcodebuild",
    cwd: iosDir,
    dryRun
  });
};

const options = parseArgs(process.argv.slice(2));

if (options.help) {
  process.stdout.write(usage);
  process.exit(0);
}

const appDir = path.resolve(repoRoot, options.appDir);
requireDirectory(appDir, "Expo app directory is missing");

const platforms =
  options.platform === "all" ? ["android", "ios"] : [options.platform];

for (const platform of platforms) {
  if (!options.skipPrebuild) {
    runExpoPrebuild({ appDir, dryRun: options.dryRun, platform });
  }

  if (platform === "android") {
    runAndroidReleaseBuild({ appDir, dryRun: options.dryRun });
  } else {
    runIosReleaseBuild({
      appDir,
      dryRun: options.dryRun,
      iosScheme: options.iosScheme
    });
  }
}

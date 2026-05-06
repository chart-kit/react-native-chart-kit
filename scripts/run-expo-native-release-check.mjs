import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
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

const assertCommandAvailable = ({ args, command, hint }) => {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });

  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || "").trim();
    const suffix = detail ? `\n\n${detail}` : "";

    throw new Error(`${hint}${suffix}`);
  }
};

const candidateJavaHomes = [
  process.env.JAVA_HOME,
  "/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home",
  "/usr/local/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home",
  "/opt/homebrew/opt/openjdk/libexec/openjdk.jdk/Contents/Home",
  "/usr/local/opt/openjdk/libexec/openjdk.jdk/Contents/Home"
].filter(Boolean);

const withPathPrefix = (directory) =>
  [directory, process.env.PATH].filter(Boolean).join(path.delimiter);

const assertJavaAvailable = () => {
  const pathResult = spawnSync("java", ["-version"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });

  if (pathResult.status === 0) {
    return;
  }

  for (const javaHome of candidateJavaHomes) {
    const javaCommand = path.join(javaHome, "bin", "java");

    if (!existsSync(javaCommand)) {
      continue;
    }

    const homeResult = spawnSync(javaCommand, ["-version"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });

    if (homeResult.status === 0) {
      process.env.JAVA_HOME = javaHome;
      process.env.PATH = withPathPrefix(path.dirname(javaCommand));
      return;
    }
  }

  const detail = (pathResult.stderr || pathResult.stdout || "").trim();
  const suffix = detail ? `\n\n${detail}` : "";

  throw new Error(
    `Android release checks require a Java runtime. Install JDK 17 or run the Native Release Checks GitHub workflow.${suffix}`
  );
};

const candidateAndroidSdkPaths = [
  process.env.ANDROID_HOME,
  process.env.ANDROID_SDK_ROOT,
  path.join(process.env.HOME ?? "", "Library", "Android", "sdk"),
  "/opt/homebrew/share/android-commandlinetools",
  "/usr/local/share/android-commandlinetools"
].filter(Boolean);

const assertAndroidSdkAvailable = () => {
  const sdkPath = candidateAndroidSdkPaths.find((candidate) =>
    existsSync(candidate)
  );

  if (sdkPath) {
    process.env.ANDROID_HOME = process.env.ANDROID_HOME ?? sdkPath;
    process.env.ANDROID_SDK_ROOT = process.env.ANDROID_SDK_ROOT ?? sdkPath;
    return;
  }

  throw new Error(
    "Android release checks require an Android SDK. Set ANDROID_HOME or ANDROID_SDK_ROOT, install the Android SDK, or run the Native Release Checks GitHub workflow."
  );
};

const assertAndroidToolchain = ({ dryRun }) => {
  if (dryRun) {
    return;
  }

  assertJavaAvailable();
  assertAndroidSdkAvailable();
};

const assertIosToolchain = ({ dryRun }) => {
  if (dryRun) {
    return;
  }

  assertCommandAvailable({
    args: ["-version"],
    command: "xcodebuild",
    hint: "iOS release checks require Xcode command line tools."
  });
  assertCommandAvailable({
    args: ["--version"],
    command: "pod",
    hint: "iOS release checks require CocoaPods."
  });
};

const run = ({ args, captureOutput = false, command, cwd, dryRun }) => {
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
    maxBuffer: captureOutput ? 1024 * 1024 * 20 : undefined,
    stdio: captureOutput ? ["inherit", "pipe", "pipe"] : "inherit"
  });

  if (captureOutput && result.stdout) {
    process.stdout.write(result.stdout);
  }

  if (captureOutput && result.stderr) {
    process.stderr.write(result.stderr);
  }

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      `${commandText(command, args)} failed with exit code ${result.status ?? 1}`
    );
  }

  return captureOutput ? (result.stdout ?? "") : "";
};

const runExpoPrebuild = ({ appDir, dryRun, platform }) => {
  const manifestSnapshot = snapshotAppManifests(appDir);

  try {
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
  } finally {
    if (!dryRun) {
      restoreAppManifests(manifestSnapshot);
    }
  }
};

const snapshotAppManifests = (appDir) =>
  ["app.json", "package.json"].map((fileName) => {
    const filePath = path.join(appDir, fileName);

    return {
      contents: existsSync(filePath)
        ? readFileSync(filePath, "utf8")
        : undefined,
      filePath
    };
  });

const restoreAppManifests = (snapshot) => {
  for (const file of snapshot) {
    if (file.contents !== undefined) {
      writeFileSync(file.filePath, file.contents);
    }
  }
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

const resolveXcodeBuildTarget = (iosDir) => {
  const workspacePath = findFirstFileWithExtension(iosDir, ".xcworkspace");

  if (workspacePath) {
    return {
      args: ["-workspace", path.basename(workspacePath)],
      path: workspacePath
    };
  }

  const projectPath = findFirstFileWithExtension(iosDir, ".xcodeproj");

  if (projectPath) {
    return {
      args: ["-project", path.basename(projectPath)],
      path: projectPath
    };
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

const discoverIosScheme = ({ appDir, dryRun, iosDir, xcodeTargetArgs }) => {
  const configuredScheme = process.env.CK_IOS_SCHEME;

  if (configuredScheme) {
    return configuredScheme;
  }

  if (dryRun) {
    return resolveIosSchemeFromAppConfig(appDir) || "ChartKitShowcase";
  }

  const output = run({
    args: ["-list", "-json", ...xcodeTargetArgs],
    captureOutput: true,
    command: "xcodebuild",
    cwd: iosDir,
    dryRun: false
  });
  const parsed = JSON.parse(output);
  const schemes = parsed.workspace?.schemes ?? parsed.project?.schemes ?? [];
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
  const dryRunWorkspacePath = path.join(
    iosDir,
    `${resolveIosSchemeFromAppConfig(appDir)}.xcworkspace`
  );
  if (!dryRun) {
    requireDirectory(iosDir, "iOS project is missing; run prebuild first");
  }

  if (dryRun || existsSync(path.join(iosDir, "Podfile"))) {
    run({
      args: ["install"],
      command: "pod",
      cwd: iosDir,
      dryRun
    });
  }

  const xcodeTarget = dryRun
    ? {
        args: ["-workspace", path.basename(dryRunWorkspacePath)],
        path: dryRunWorkspacePath
      }
    : resolveXcodeBuildTarget(iosDir);

  if (!xcodeTarget) {
    throw new Error(`No .xcworkspace or .xcodeproj found in ${iosDir}`);
  }

  const scheme =
    iosScheme ??
    discoverIosScheme({
      appDir,
      dryRun,
      iosDir,
      xcodeTargetArgs: xcodeTarget.args
    });

  run({
    args: [
      ...xcodeTarget.args,
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
  if (platform === "android") {
    assertAndroidToolchain({ dryRun: options.dryRun });
  } else {
    assertIosToolchain({ dryRun: options.dryRun });
  }

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

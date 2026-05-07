import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync
} from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import process from "node:process";

const repoRoot = process.cwd();
const defaultWorkDir = path.join(
  process.env.TMPDIR ?? "/tmp",
  "chartkit-rn-cli-native-check"
);
const defaultProjectName = "ChartKitRnCliNative";

const usage = `Usage:
  node scripts/run-rn-cli-native-check.mjs --platform <ios|android|all> [options]

Options:
  --dry-run                Print commands without executing them.
  --work-dir <path>        Temporary generated RN CLI app path. Defaults to TMPDIR.
  --project-name <name>    Generated native project name. Defaults to ChartKitRnCliNative.
  --rn-version <version>   React Native template version. Defaults to installed RN.
  --skip-init              Use the existing work dir instead of regenerating it.
  --skip-install           Skip npm install in the generated app.
  --skip-package-build     Skip building local Chart Kit packages before install.
  --ios-scheme <name>      iOS scheme to build. Defaults to project name.
  --log-file <path>        Write command output to a release evidence log.
  --help                   Show this help.
`;

let activeLogFile;

const writeLog = (value) => {
  if (activeLogFile) appendFileSync(activeLogFile, value, "utf8");
};

const emit = (value) => {
  process.stdout.write(value);
  writeLog(value);
};

const emitError = (value) => {
  process.stderr.write(value);
  writeLog(value);
};

const parseArgs = (argv) => {
  const options = {
    dryRun: false,
    iosScheme: undefined,
    logFile: undefined,
    platform: undefined,
    projectName: defaultProjectName,
    rnVersion: undefined,
    skipInit: false,
    skipInstall: false,
    skipPackageBuild: false,
    workDir: defaultWorkDir
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

    if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg === "--ios-scheme") options.iosScheme = readValue();
    else if (arg === "--log-file") options.logFile = readValue();
    else if (arg === "--platform") options.platform = readValue();
    else if (arg === "--project-name") options.projectName = readValue();
    else if (arg === "--rn-version") options.rnVersion = readValue();
    else if (arg === "--skip-init") options.skipInit = true;
    else if (arg === "--skip-install") options.skipInstall = true;
    else if (arg === "--skip-package-build") options.skipPackageBuild = true;
    else if (arg === "--work-dir") options.workDir = readValue();
    else throw new Error(`Unknown argument: ${arg}`);
  }

  if (options.help) return options;

  if (!["ios", "android", "all"].includes(options.platform)) {
    throw new Error("--platform must be one of ios, android, or all.");
  }

  return options;
};

const commandText = (command, args) =>
  [command, ...args.map((arg) => (arg.includes(" ") ? `"${arg}"` : arg))].join(
    " "
  );

const run = ({ args, command, cwd, dryRun }) => {
  const relativeCwd = path.relative(repoRoot, cwd) || ".";
  emit(`$ cd ${relativeCwd} && ${commandText(command, args)}\n`);

  if (dryRun) return;

  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    maxBuffer: activeLogFile ? 1024 * 1024 * 50 : undefined,
    stdio: activeLogFile ? ["inherit", "pipe", "pipe"] : "inherit"
  });

  if (activeLogFile && result.stdout) emit(result.stdout);
  if (activeLogFile && result.stderr) emitError(result.stderr);

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `${commandText(command, args)} failed with exit code ${result.status ?? 1}`
    );
  }
};

const readJson = (filePath) => JSON.parse(readFileSync(filePath, "utf8"));

const writeJson = (filePath, value) => {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
};

const packageVersion = (packageName) =>
  readJson(path.join(repoRoot, "node_modules", packageName, "package.json"))
    .version;

const assertPath = (filePath, hint) => {
  if (!existsSync(filePath)) throw new Error(`${hint}: ${filePath}`);
};

const cliCommand = () => {
  const binaryName = process.platform === "win32" ? "rnc-cli.cmd" : "rnc-cli";
  return path.join(repoRoot, "node_modules", ".bin", binaryName);
};

const initializeProject = ({ dryRun, projectName, rnVersion, workDir }) => {
  run({
    args: [
      "init",
      projectName,
      "--directory",
      workDir,
      "--version",
      rnVersion,
      "--pm",
      "npm",
      "--skip-install",
      "--install-pods",
      "false",
      "--skip-git-init",
      "--replace-directory",
      "true",
      "--package-name",
      "io.chartkit.rnclibasic",
      "--title",
      "Chart Kit RN CLI Basic"
    ],
    command: cliCommand(),
    cwd: repoRoot,
    dryRun
  });
};

const writeMetroConfig = (workDir) => {
  const source = `/* eslint-disable @typescript-eslint/no-require-imports */

const path = require("path");

const repoRoot = ${JSON.stringify(repoRoot)};

module.exports = {
  projectRoot: __dirname,
  watchFolders: [repoRoot],
  resolver: {
    disableHierarchicalLookup: true,
    extraNodeModules: {
      "@chart-kit/core": path.resolve(repoRoot, "packages/core/src/index.ts"),
      "@chart-kit/react-native": path.resolve(repoRoot, "packages/react-native/src/index.ts"),
      "@chart-kit/svg-renderer": path.resolve(repoRoot, "packages/svg-renderer/src/index.ts")
    },
    nodeModulesPaths: [
      path.resolve(__dirname, "node_modules"),
      path.resolve(repoRoot, "node_modules")
    ]
  },
  transformer: {
    babelTransformerPath: require.resolve("metro-babel-transformer")
  }
};
`;

  writeFileSync(path.join(workDir, "metro.config.js"), source, "utf8");
};

const overlayExampleSource = ({ dryRun, workDir }) => {
  const exampleDir = path.join(repoRoot, "examples/rn-cli-basic");

  for (const fileName of ["App.tsx", "index.js", "babel.config.js"]) {
    const sourcePath = path.join(exampleDir, fileName);
    const targetPath = path.join(workDir, fileName);

    emit(
      `copy ${path.relative(repoRoot, sourcePath)} -> ${path.relative(repoRoot, targetPath)}\n`
    );

    if (!dryRun) {
      writeFileSync(targetPath, readFileSync(sourcePath, "utf8"), "utf8");
    }
  }

  if (!dryRun) writeMetroConfig(workDir);
};

const updatePackageJson = ({ dryRun, projectName, workDir }) => {
  emit(
    `write ${path.relative(repoRoot, path.join(workDir, "package.json"))}\n`
  );
  if (dryRun) return;

  const generatedPackage = readJson(path.join(workDir, "package.json"));

  writeJson(path.join(workDir, "package.json"), {
    ...generatedPackage,
    name: projectName,
    private: true,
    scripts: {
      android: "react-native run-android",
      ios: "react-native run-ios",
      start: "react-native start"
    },
    dependencies: {
      "@chart-kit/core": `file:${path.join(repoRoot, "packages/core")}`,
      "@chart-kit/react-native": `file:${path.join(repoRoot, "packages/react-native")}`,
      "@chart-kit/svg-renderer": `file:${path.join(repoRoot, "packages/svg-renderer")}`,
      react: "^19.2.0",
      "react-native": "^0.83.9",
      "react-native-gesture-handler": "~2.28.0",
      "react-native-svg": "^15.15.4"
    },
    devDependencies: {
      "@react-native-community/cli": "^20.1.3",
      typescript: "^5.9.3"
    }
  });
};

const prepareProject = (options) => {
  const rnVersion = options.rnVersion ?? packageVersion("react-native");

  assertPath(cliCommand(), "React Native community CLI binary is missing");

  if (!options.skipPackageBuild) {
    run({
      args: ["run", "build"],
      command: "npm",
      cwd: repoRoot,
      dryRun: options.dryRun
    });
  }

  if (!options.skipInit) {
    initializeProject({ ...options, rnVersion });
  }

  overlayExampleSource(options);
  updatePackageJson(options);

  if (!options.skipInstall) {
    run({
      args: ["install"],
      command: "npm",
      cwd: options.workDir,
      dryRun: options.dryRun
    });
  }
};

const runAndroidReleaseBuild = ({ dryRun, workDir }) => {
  const androidDir = path.join(workDir, "android");
  const gradlew = process.platform === "win32" ? "gradlew.bat" : "./gradlew";

  if (!dryRun) assertPath(androidDir, "Android native project is missing");

  run({
    args: ["assembleRelease"],
    command: gradlew,
    cwd: androidDir,
    dryRun
  });
};

const runIosReleaseBuild = ({ dryRun, iosScheme, projectName, workDir }) => {
  const iosDir = path.join(workDir, "ios");

  if (!dryRun) assertPath(iosDir, "iOS native project is missing");

  run({ args: ["install"], command: "pod", cwd: iosDir, dryRun });
  run({
    args: [
      "-workspace",
      `${projectName}.xcworkspace`,
      "-scheme",
      iosScheme ?? projectName,
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

const main = () => {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    process.stdout.write(usage);
    return;
  }

  options.workDir = path.resolve(repoRoot, options.workDir);
  if (options.logFile) {
    activeLogFile = path.resolve(repoRoot, options.logFile);
    mkdirSync(path.dirname(activeLogFile), { recursive: true });
    writeFileSync(
      activeLogFile,
      [
        "# RN CLI Native Check Log",
        `Date: ${new Date().toISOString()}`,
        `Repo: ${repoRoot}`,
        ""
      ].join("\n"),
      "utf8"
    );
  }

  const platforms =
    options.platform === "all" ? ["android", "ios"] : [options.platform];

  prepareProject(options);

  for (const platform of platforms) {
    if (platform === "android") {
      runAndroidReleaseBuild(options);
    } else {
      runIosReleaseBuild(options);
    }
  }
};

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}

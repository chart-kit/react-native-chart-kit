import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import process from "node:process";
import { pathToFileURL } from "node:url";

const repoRoot = process.cwd();
const defaultSkiaPackage = "@shopify/react-native-skia";

const usage = `Usage:
  node scripts/run-skia-native-release-check.mjs --platform <ios|android|all> [options]

Options:
  --artifact <path>        Write a markdown evidence artifact in this repo after a successful run.
  --dry-run                Print the temporary-workspace commands without executing them.
  --keep-temp              Keep the temporary workspace for inspection.
  --skia-package <spec>    Skia package spec to install. Defaults to @shopify/react-native-skia.
  --temp-dir <path>        Use a specific temporary workspace parent directory.
  --help                   Show this help.
`;

export const parseSkiaNativeArgs = (argv) => {
  const options = {
    dryRun: false,
    keepTemp: false,
    platform: undefined,
    skiaPackage: defaultSkiaPackage,
    tempDir: os.tmpdir()
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

    if (arg === "--artifact") {
      options.artifact = readValue();
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--keep-temp") {
      options.keepTemp = true;
    } else if (arg === "--platform") {
      options.platform = readValue();
    } else if (arg === "--skia-package") {
      options.skiaPackage = readValue();
    } else if (arg === "--temp-dir") {
      options.tempDir = readValue();
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (options.help) return options;

  if (!["ios", "android", "all"].includes(options.platform)) {
    throw new Error("--platform must be one of ios, android, or all.");
  }

  if (!options.skiaPackage) {
    throw new Error("--skia-package requires a package spec.");
  }

  return options;
};

export const getPackageNameFromSpec = (packageSpec) => {
  if (packageSpec.startsWith("@")) {
    return packageSpec.split("@").slice(0, 2).join("@");
  }

  return packageSpec.split("@")[0];
};

const commandText = (command, args) =>
  [command, ...args.map((arg) => (arg.includes(" ") ? `"${arg}"` : arg))].join(
    " "
  );

const run = ({ args, captureOutput = true, command, cwd, dryRun }) => {
  const relativeCwd = path.relative(repoRoot, cwd) || ".";
  const printable = `$ cd ${relativeCwd} && ${commandText(command, args)}`;
  process.stdout.write(`${printable}\n`);

  if (dryRun) {
    return { command: printable, output: "", status: 0 };
  }

  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 40,
    stdio: captureOutput ? ["ignore", "pipe", "pipe"] : "inherit"
  });

  const output = [result.stdout, result.stderr].filter(Boolean).join("");

  if (captureOutput && output) {
    process.stdout.write(output);
  }

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      `${commandText(command, args)} failed with exit code ${result.status ?? 1}`
    );
  }

  return { command: printable, output, status: result.status ?? 0 };
};

export const buildSkiaNativeCommandPlan = ({
  archivePath,
  platform,
  skiaPackage,
  workspaceDir
}) => {
  const packageName = getPackageNameFromSpec(skiaPackage);
  const showcaseDir = path.join(workspaceDir, "apps/expo-showcase");

  return [
    {
      args: ["archive", "--format=tar", `--output=${archivePath}`, "HEAD"],
      command: "git",
      cwd: repoRoot
    },
    {
      args: ["-xf", archivePath, "-C", workspaceDir],
      command: "tar",
      cwd: repoRoot
    },
    {
      args: ["ci"],
      command: "npm",
      cwd: workspaceDir
    },
    {
      args: ["install", skiaPackage, "--workspaces=false"],
      command: "npm",
      cwd: showcaseDir
    },
    {
      args: ["ls", packageName, "--depth=0", "--workspaces=false"],
      command: "npm",
      cwd: showcaseDir
    },
    {
      args: [
        "scripts/run-expo-native-release-check.mjs",
        "--platform",
        platform,
        "--app-dir",
        "apps/expo-showcase"
      ],
      command: "node",
      cwd: workspaceDir
    }
  ];
};

export const buildVerifiedOutput = ({ output, platform, skiaPackage }) => {
  const installedVersion =
    output.match(/@shopify\/react-native-skia@[^\s]+/)?.[0] ??
    getPackageNameFromSpec(skiaPackage);
  const isIos = platform === "ios";
  const integrationLabel = isIos
    ? "Skia CocoaPods target autolinked"
    : "Skia Gradle project configured";
  const integrationVerified = isIos
    ? output.includes("react-native-skia") &&
      output.includes("Auto-linking React Native modules")
    : output.includes("Configure project :shopify_react-native-skia");
  const buildSucceeded = isIos
    ? output.includes("** BUILD SUCCEEDED **")
    : output.includes("BUILD SUCCESSFUL");

  return [
    `- Installed package: \`${installedVersion}\``,
    `- ${integrationLabel}: ${integrationVerified ? "yes" : "no"}`,
    `- Release build successful: ${buildSucceeded ? "yes" : "no"}`
  ].join("\n");
};

const createArtifact = ({
  artifactPath,
  commands,
  platform,
  skiaPackage,
  workspaceDir
}) => {
  const relativeArtifact = path.relative(repoRoot, artifactPath);
  const output = commands.map((item) => item.output).join("\n");
  const verifiedOutput = buildVerifiedOutput({
    output,
    platform,
    skiaPackage
  });
  const body = `# Skia Native Install Evidence

Date: ${new Date().toISOString().slice(0, 10)}
Commit: \`${readGitShortSha()}\`
Build surface: temporary native QA workspace
Platform target: ${platform}
Skia package: \`${skiaPackage}\`
Temporary workspace: \`${workspaceDir}\`

This artifact records a native optional-Skia install check. It should only be
used for Skia matrix rows after the command succeeds and the resulting native
app is reviewed according to \`docs/release/skia-renderer-qa.md\`.

## Commands

\`\`\`sh
${commands.map((item) => item.command).join("\n")}
\`\`\`

## Result

- Temporary workspace created from the current committed repository state.
- \`${skiaPackage}\` installed only in the temporary showcase workspace.
- \`${getPackageNameFromSpec(skiaPackage)}\` verified with \`npm ls\`.
- Existing native release check completed for \`${platform}\`.

## Verified Output

${verifiedOutput}

## Caveats

- This install evidence does not by itself prove renderer parity screenshots.
- Performance comparison rows still require SVG-vs-Skia timing and memory data.
- Review metadata must still be recorded with \`npm run release:qa:record\`.
`;

  return writeFile(artifactPath, body, "utf8").then(() => relativeArtifact);
};

const readGitShortSha = () => {
  const result = spawnSync("git", ["rev-parse", "--short", "HEAD"], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });

  return result.status === 0 ? result.stdout.trim() : "unknown";
};

export const runSkiaNativeReleaseCheck = async ({
  artifact,
  dryRun,
  keepTemp,
  platform,
  skiaPackage,
  tempDir
}) => {
  const workspaceDir = dryRun
    ? path.join(path.resolve(tempDir), "chartkit-skia-native-qa")
    : await mkdtemp(path.join(path.resolve(tempDir), "chartkit-skia-native-qa-"));
  const archivePath = `${workspaceDir}.tar`;
  const plan = buildSkiaNativeCommandPlan({
    archivePath,
    platform,
    skiaPackage,
    workspaceDir
  });
  const executed = [];

  try {
    for (const step of plan) {
      executed.push(run({ ...step, dryRun }));
    }

    if (artifact && !dryRun) {
      const artifactPath = path.resolve(repoRoot, artifact);
      const relativeArtifact = await createArtifact({
        artifactPath,
        commands: executed,
        platform,
        skiaPackage,
        workspaceDir
      });
      process.stdout.write(`Wrote ${relativeArtifact}\n`);
    }

    return { archivePath, commands: executed, workspaceDir };
  } finally {
    if (!dryRun && !keepTemp) {
      await rm(workspaceDir, { force: true, recursive: true });
      await rm(archivePath, { force: true });
    }
  }
};

const main = async () => {
  const options = parseSkiaNativeArgs(process.argv.slice(2));

  if (options.help) {
    process.stdout.write(usage);
    return;
  }

  await runSkiaNativeReleaseCheck(options);
};

const isCli = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false;

if (isCli) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  });
}

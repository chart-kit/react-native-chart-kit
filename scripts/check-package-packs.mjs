import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const npmCache = path.join(repoRoot, ".tmp", "npm-pack-cache");

const packageChecks = [
  {
    dir: ".",
    requiredFiles: [
      "LICENSE",
      "README.md",
      "dist/index.d.ts",
      "dist/index.js",
      "package.json",
      "scripts/chartkit-codemod.mjs"
    ]
  },
  {
    dir: "packages/core",
    requiredFiles: [
      "README.md",
      "dist/index.d.ts",
      "dist/index.js",
      "package.json"
    ]
  },
  {
    dir: "packages/svg-renderer",
    requiredFiles: [
      "README.md",
      "dist/index.d.ts",
      "dist/index.js",
      "package.json"
    ]
  },
  {
    dir: "packages/react-native",
    requiredFiles: [
      "README.md",
      "dist/index.d.ts",
      "dist/index.js",
      "dist/proPreview.d.ts",
      "dist/proPreview.js",
      "package.json"
    ]
  },
  {
    dir: "packages/skia-renderer",
    requiredFiles: [
      "README.md",
      "dist/index.d.ts",
      "dist/index.js",
      "package.json"
    ]
  },
  {
    dir: "packages/pro",
    requiredFiles: [
      "README.md",
      "dist/index.d.ts",
      "dist/index.js",
      "package.json"
    ]
  }
];

const parsePackJson = (stdout) => {
  const trimmed = stdout.trim();
  const jsonStart = trimmed.indexOf("[");

  if (jsonStart < 0) {
    throw new Error(`npm pack did not return JSON:\n${stdout}`);
  }

  return JSON.parse(trimmed.slice(jsonStart));
};

const failures = [];

for (const packageCheck of packageChecks) {
  const result = spawnSync(
    "npm",
    ["pack", "--dry-run", "--json", "--ignore-scripts", "--cache", npmCache],
    {
      cwd: path.join(repoRoot, packageCheck.dir),
      encoding: "utf8"
    }
  );

  if (result.status !== 0) {
    failures.push(
      `${packageCheck.dir}: npm pack failed\n${result.stdout}\n${result.stderr}`
    );
    continue;
  }

  let packResult;

  try {
    [packResult] = parsePackJson(result.stdout);
  } catch (error) {
    failures.push(
      `${packageCheck.dir}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    continue;
  }

  const packedFiles = new Set(
    (packResult?.files ?? []).map((file) => file.path)
  );
  const missingFiles = packageCheck.requiredFiles.filter(
    (file) => !packedFiles.has(file)
  );

  if (missingFiles.length > 0) {
    failures.push(
      `${packageCheck.dir}: missing packed files ${missingFiles.join(", ")}`
    );
  }

  if ((packResult?.entryCount ?? 0) <= 0) {
    failures.push(`${packageCheck.dir}: package tarball has no entries`);
  }
}

if (failures.length > 0) {
  console.error("Package pack check failed.");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Package pack check passed.");
console.log(`Checked ${packageChecks.length} package dry-runs.`);

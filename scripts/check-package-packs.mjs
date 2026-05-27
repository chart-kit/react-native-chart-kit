import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const npmCache = path.join(repoRoot, ".tmp", "npm-pack-cache");
const rootPackage = JSON.parse(
  await readFile(path.join(repoRoot, "package.json"), "utf8")
);
const packageChecks = [
  {
    dir: ".",
    name: rootPackage.name,
    requiredFiles: [
      "package.json",
      "dist/index.js",
      "dist/index.d.ts",
      "dist/v2/index.js",
      "dist/v2/index.d.ts"
    ]
  }
];

if (!Array.isArray(packageChecks) || packageChecks.length === 0) {
  throw new Error("Package manifest must define at least one package.");
}

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
  if (!packageCheck.dir || !packageCheck.name) {
    failures.push("Package manifest entries must include dir and name.");
    continue;
  }

  if (
    !Array.isArray(packageCheck.requiredFiles) ||
    packageCheck.requiredFiles.length === 0
  ) {
    failures.push(
      `${packageCheck.dir}: package manifest entry must include requiredFiles.`
    );
    continue;
  }

  const packageDir = path.join(repoRoot, packageCheck.dir);
  const packageJson = JSON.parse(
    await readFile(path.join(packageDir, "package.json"), "utf8")
  );

  if (packageJson.name !== packageCheck.name) {
    failures.push(
      `${packageCheck.dir}: manifest name ${packageCheck.name} does not match package.json name ${packageJson.name}`
    );
  }

  const result = spawnSync(
    "npm",
    ["pack", "--dry-run", "--json", "--ignore-scripts", "--cache", npmCache],
    {
      cwd: packageDir,
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

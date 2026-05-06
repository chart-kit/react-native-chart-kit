import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const args = new Set(process.argv.slice(2));
const manifest = JSON.parse(
  await readFile(
    path.join(repoRoot, "docs/release/evidence/package-manifest.json"),
    "utf8"
  )
);

const packages = manifest.packages ?? [];

if (!Array.isArray(packages) || packages.length === 0) {
  throw new Error("Package manifest must define at least one package.");
}

const publishableOnly = args.has("--publish") || args.has("--publishable");
const filteredPackages = publishableOnly
  ? packages.filter((packageInfo) => packageInfo.publishInBeta === true)
  : packages;
const field = args.has("--names") ? "name" : "dir";

if (publishableOnly && filteredPackages.length === 0) {
  throw new Error("Package manifest has no publishable packages.");
}

console.log(
  filteredPackages.map((packageInfo) => packageInfo[field]).join(" ")
);

import { spawnSync } from "node:child_process";
import { mkdir, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const defaultProRepo = "/Users/berman/Documents/chart-kit-pro";
const proRepo = process.env.CHART_KIT_PRO_REPO ?? defaultProRepo;
const npmCache = process.env.CHART_KIT_NPM_CACHE ?? "/tmp/chart-kit-npm-cache";
const packDestination =
  process.env.CHART_KIT_PRO_PACK_DESTINATION ?? os.tmpdir();
const targetDir = path.join(repoRoot, "node_modules", "@chart-kit", "pro");
const skipBuild = process.argv.includes("--skip-build");

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? repoRoot,
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit"
  });

  if (result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join("\n");

    throw new Error(
      `${command} ${args.join(" ")} failed${output ? `\n${output}` : ""}`
    );
  }

  return result;
};

const assertProPackage = async () => {
  const packageJson = JSON.parse(
    await readFile(path.join(proRepo, "package.json"), "utf8")
  );

  if (packageJson.name !== "@chart-kit/pro") {
    throw new Error(
      `Expected ${proRepo} to contain @chart-kit/pro, found ${packageJson.name}.`
    );
  }
};

const getPackedTarball = (stdout) => {
  const lines = stdout
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const filename = lines.at(-1);

  if (!filename?.endsWith(".tgz")) {
    throw new Error(`Unable to read npm pack tarball name from:\n${stdout}`);
  }

  return path.isAbsolute(filename)
    ? filename
    : path.join(packDestination, filename);
};

await assertProPackage();

if (!skipBuild) {
  run("npm", ["run", "build"], { cwd: proRepo });
}

const packResult = run(
  "npm",
  ["--cache", npmCache, "pack", "--pack-destination", packDestination, proRepo],
  { capture: true }
);
const tarball = getPackedTarball(packResult.stdout);

await rm(targetDir, { force: true, recursive: true });
await mkdir(targetDir, { recursive: true });
run("tar", ["-xzf", tarball, "-C", targetDir, "--strip-components=1"]);

console.log(`Synced ${tarball} into ${targetDir}`);
console.log(
  "Restart the docs dev server with npm run site if it is already running."
);

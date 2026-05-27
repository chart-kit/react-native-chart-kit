import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();

const compileCoreForBenchmark = () => {
  const tempRoot = mkdtempSync(path.join(tmpdir(), "chart-kit-benchmark-"));
  const outDir = path.join(tempRoot, "dist");
  const tsconfigPath = path.join(tempRoot, "tsconfig.json");
  const tscBin = path.join(
    repoRoot,
    "node_modules",
    "typescript",
    "bin",
    "tsc"
  );

  if (!existsSync(tscBin)) {
    throw new Error("TypeScript is not installed. Run npm install first.");
  }

  writeFileSync(
    tsconfigPath,
    JSON.stringify(
      {
        extends: path.join(repoRoot, "packages/core/tsconfig.json"),
        compilerOptions: {
          declaration: false,
          declarationMap: false,
          module: "CommonJS",
          outDir,
          rootDir: path.join(repoRoot, "packages/core/src"),
          sourceMap: false,
          tsBuildInfoFile: path.join(tempRoot, "core.tsbuildinfo")
        },
        include: [path.join(repoRoot, "packages/core/src/**/*")]
      },
      null,
      2
    )
  );

  execFileSync(process.execPath, [tscBin, "-p", tsconfigPath], {
    stdio: "pipe"
  });

  return {
    cleanup: () => rmSync(tempRoot, { recursive: true, force: true }),
    entry: path.join(outDir, "index.js")
  };
};

export const loadCoreBenchmarkBuild = () => {
  const build = compileCoreForBenchmark();
  const requireBenchmarkBuild = createRequire(import.meta.url);
  let cleaned = false;
  const cleanup = () => {
    if (!cleaned) {
      build.cleanup();
      cleaned = true;
    }
  };

  return {
    cleanup,
    modules: requireBenchmarkBuild(build.entry)
  };
};

export const formatBenchmarkNumber = (value, digits = 2) =>
  Number.isFinite(value) ? value.toFixed(digits) : "n/a";

export const percentile = (values, percentage) => {
  if (values.length === 0) {
    return Number.NaN;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(
    sorted.length - 1,
    Math.floor((percentage / 100) * sorted.length)
  );

  return sorted[index];
};

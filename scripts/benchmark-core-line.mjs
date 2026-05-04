import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { performance } from "node:perf_hooks";
import process from "node:process";

const defaultIterations = 40;
const warmupIterations = 5;
const plotWidth = 360;
const plotHeight = 220;
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

const benchmarkBuild = compileCoreForBenchmark();
let benchmarkBuildCleaned = false;
const cleanupBenchmarkBuild = () => {
  if (!benchmarkBuildCleaned) {
    benchmarkBuild.cleanup();
    benchmarkBuildCleaned = true;
  }
};

process.once("exit", cleanupBenchmarkBuild);

const requireBenchmarkBuild = createRequire(import.meta.url);
const { buildLineSeriesGeometry, createLinearScale, normalizeCartesianData } =
  requireBenchmarkBuild(benchmarkBuild.entry);

const iterations = Math.max(
  1,
  Math.floor(Number(process.env.CK_BENCH_ITERATIONS ?? defaultIterations))
);

const formatNumber = (value, digits = 2) =>
  Number.isFinite(value) ? value.toFixed(digits) : "n/a";

const percentile = (values, percentage) => {
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

const generateRows = ({ points, series }) =>
  Array.from({ length: points }, (_, index) => {
    const row = { x: index };

    for (let seriesIndex = 0; seriesIndex < series; seriesIndex++) {
      const wave = Math.sin(index / (8 + seriesIndex * 2)) * 20;
      const trend = index * (0.01 + seriesIndex * 0.002);
      const noise = Math.cos(index / (3 + seriesIndex)) * 4;
      row[`y${seriesIndex}`] = 80 + wave + trend + noise + seriesIndex * 12;
    }

    return row;
  });

const getYValues = (rows, seriesKeys) =>
  rows.flatMap((row) =>
    seriesKeys.map((key) => row[key]).filter((value) => Number.isFinite(value))
  );

const runGeometryBuild = ({ rows, seriesKeys, pathDecimation }) => {
  const normalized = normalizeCartesianData({
    data: rows,
    xKey: "x",
    yKeys: seriesKeys
  });
  const yScale = createLinearScale({
    values: getYValues(rows, seriesKeys),
    range: [plotHeight, 0]
  });
  const xMax = Math.max(1, rows.length - 1);

  return normalized.series.map((series) =>
    buildLineSeriesGeometry({
      series,
      xScale: (value) =>
        typeof value === "number" ? (value / xMax) * plotWidth : undefined,
      yScale: (value) => yScale.scale(value),
      curve: "linear",
      pathDecimation
    })
  );
};

const summarizeGeometry = (geometries) => {
  const pathPoints = geometries.reduce(
    (sum, geometry) =>
      sum +
      geometry.line.segments.reduce(
        (segmentSum, segment) => segmentSum + segment.points.length,
        0
      ),
    0
  );
  const sourcePoints = geometries.reduce(
    (sum, geometry) => sum + geometry.points.length,
    0
  );
  const pathChars = geometries.reduce(
    (sum, geometry) => sum + geometry.line.path.length,
    0
  );

  return { pathChars, pathPoints, sourcePoints };
};

const runScenario = (scenario) => {
  const rows = generateRows({
    points: scenario.points,
    series: scenario.series
  });
  const seriesKeys = Array.from(
    { length: scenario.series },
    (_, index) => `y${index}`
  );
  const times = [];
  let summary = { pathChars: 0, pathPoints: 0, sourcePoints: 0 };

  for (let index = 0; index < warmupIterations + iterations; index++) {
    const start = performance.now();
    const geometries = runGeometryBuild({
      rows,
      seriesKeys,
      pathDecimation: scenario.pathDecimation
    });
    const elapsed = performance.now() - start;

    summary = summarizeGeometry(geometries);

    if (index >= warmupIterations) {
      times.push(elapsed);
    }
  }

  return {
    ...scenario,
    ...summary,
    medianMs: percentile(times, 50),
    p95Ms: percentile(times, 95)
  };
};

const scenarios = [
  { name: "line-100", points: 100, series: 1 },
  { name: "line-1000", points: 1000, series: 1 },
  {
    name: "line-10000-decimated",
    points: 10000,
    series: 1,
    pathDecimation: { maxPoints: 700 }
  },
  {
    name: "multi-line-5x1000-decimated",
    points: 1000,
    series: 5,
    pathDecimation: { maxPoints: 700 }
  }
];

const results = scenarios.map(runScenario);
const memory = process.memoryUsage();

console.log("Chart Kit benchmark: core line geometry");
console.log(`Node: ${process.version}`);
console.log(`Platform: ${process.platform} ${process.arch}`);
console.log(`Iterations: ${iterations}`);
console.log(`Renderer: core geometry only`);
console.log("");
console.log(
  [
    "scenario",
    "series",
    "source points",
    "path points",
    "path chars",
    "median ms",
    "p95 ms"
  ].join("\t")
);

results.forEach((result) => {
  console.log(
    [
      result.name,
      result.series,
      result.sourcePoints,
      result.pathPoints,
      result.pathChars,
      formatNumber(result.medianMs),
      formatNumber(result.p95Ms)
    ].join("\t")
  );
});

console.log("");
console.log(`Memory RSS: ${formatNumber(memory.rss / 1024 / 1024)} MB`);
console.log(`Heap used: ${formatNumber(memory.heapUsed / 1024 / 1024)} MB`);

cleanupBenchmarkBuild();

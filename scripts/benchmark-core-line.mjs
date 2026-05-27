import { performance } from "node:perf_hooks";
import process from "node:process";

import {
  formatBenchmarkNumber,
  loadCoreBenchmarkBuild,
  percentile
} from "./benchmark-utils.mjs";

const defaultIterations = 40;
const warmupIterations = 5;
const plotWidth = 360;
const plotHeight = 220;

const benchmarkBuild = loadCoreBenchmarkBuild();
process.once("exit", benchmarkBuild.cleanup);

const {
  buildBarGeometry,
  buildLineSeriesGeometry,
  createBandScale,
  createLinearScale,
  normalizeCartesianData,
  resolveChartViewportWindow,
  resolveChartViewportWindowFromHandlePosition,
  resolveChartViewportWindowFromPosition,
  sliceChartViewportData
} = benchmarkBuild.modules;

const iterations = Math.max(
  1,
  Math.floor(Number(process.env.CK_BENCH_ITERATIONS ?? defaultIterations))
);

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

const runLineGeometryBuild = ({ rows, seriesKeys, pathDecimation }) => {
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

const runBarGeometryBuild = ({ mode, rows, seriesKeys }) => {
  const normalized = normalizeCartesianData({
    data: rows,
    xKey: "x",
    yKeys: seriesKeys
  });
  const yScale = createLinearScale({
    values: getYValues(rows, seriesKeys),
    range: [plotHeight, 0]
  });
  const contentWidth = Math.max(plotWidth, rows.length * 36);
  const xScale = createBandScale({
    domain: rows.map((row) => row.x),
    range: [0, contentWidth],
    paddingInner: 0.12,
    paddingOuter: 0.08
  });

  return buildBarGeometry({
    series: normalized.series,
    mode,
    xBand: (value) => {
      const x = xScale.scale(value);

      return x === undefined ? undefined : { x, width: xScale.bandwidth };
    },
    yScale: (value) => yScale.scale(value)
  });
};

const runViewportLineGeometryBuild = ({
  rows,
  seriesKeys,
  visiblePoints,
  windowStart
}) => {
  const viewportWindow = resolveChartViewportWindow({
    itemCount: rows.length,
    startIndex: windowStart,
    endIndex: windowStart + visiblePoints
  });
  const visibleRows = sliceChartViewportData(rows, viewportWindow);

  return {
    geometries: runLineGeometryBuild({
      rows: visibleRows,
      seriesKeys,
      pathDecimation: false
    }),
    viewportWindow
  };
};

const runRangeSelectorOverviewBuild = ({
  iteration,
  rows,
  seriesKeys,
  visiblePoints,
  pathDecimation
}) => {
  const locationRatio = (iteration % 25) / 24;
  const locationX = 32 + plotWidth * locationRatio;
  const movedWindow = resolveChartViewportWindowFromPosition({
    itemCount: rows.length,
    locationX,
    plotWidth,
    plotX: 32,
    visibleCount: visiblePoints
  });
  const resizedWindow = resolveChartViewportWindowFromHandlePosition({
    currentWindow: movedWindow,
    handle: iteration % 2 === 0 ? "start" : "end",
    itemCount: rows.length,
    locationX: 32 + plotWidth * (1 - locationRatio),
    minVisibleCount: Math.max(12, Math.floor(visiblePoints / 8)),
    plotWidth,
    plotX: 32
  });

  return {
    geometries: runLineGeometryBuild({
      rows,
      seriesKeys,
      pathDecimation
    }),
    viewportWindow: resizedWindow
  };
};

const summarizeLineGeometry = (geometries) => {
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

const summarizeBarGeometry = (geometry, rows, seriesKeys) => ({
  bars: geometry.bars.length,
  pathChars: 0,
  pathPoints: 0,
  sourcePoints: rows.length * seriesKeys.length
});

const buildSeriesKeys = (series) =>
  Array.from({ length: series }, (_, index) => `y${index}`);

const runTimedScenario = ({ build, scenario, summarize }) => {
  const rows = generateRows({
    points: scenario.points,
    series: scenario.series
  });
  const seriesKeys = buildSeriesKeys(scenario.series);
  const times = [];
  let metadata = {};
  let summary = { pathChars: 0, pathPoints: 0, sourcePoints: 0, bars: 0 };

  for (let index = 0; index < warmupIterations + iterations; index++) {
    const start = performance.now();
    const result = build({ iteration: index, rows, seriesKeys });
    const elapsed = performance.now() - start;

    summary = summarize({ result, rows, seriesKeys });
    metadata = result.metadata ?? {};

    if (index >= warmupIterations) {
      times.push(elapsed);
    }
  }

  return {
    kind: "line",
    ...scenario,
    geometryPoints: summary.sourcePoints,
    ...metadata,
    ...summary,
    medianMs: percentile(times, 50),
    p95Ms: percentile(times, 95)
  };
};

const runLineScenario = (scenario) =>
  runTimedScenario({
    scenario,
    build: ({ rows, seriesKeys }) => ({
      geometries: runLineGeometryBuild({
        rows,
        seriesKeys,
        pathDecimation: scenario.pathDecimation
      })
    }),
    summarize: ({ result }) => summarizeLineGeometry(result.geometries)
  });

const runBarScenario = (scenario) =>
  runTimedScenario({
    scenario: { kind: "bar", ...scenario },
    build: ({ rows, seriesKeys }) => ({
      geometry: runBarGeometryBuild({
        mode: scenario.mode,
        rows,
        seriesKeys
      })
    }),
    summarize: ({ result, rows, seriesKeys }) =>
      summarizeBarGeometry(result.geometry, rows, seriesKeys)
  });

const runViewportLineScenario = (scenario) => {
  const windowStart = Math.max(
    0,
    Math.min(
      scenario.windowStart ?? scenario.points - scenario.visiblePoints,
      scenario.points - scenario.visiblePoints
    )
  );

  return runTimedScenario({
    scenario,
    build: ({ rows, seriesKeys }) => {
      const result = runViewportLineGeometryBuild({
        rows,
        seriesKeys,
        visiblePoints: scenario.visiblePoints,
        windowStart
      });

      return {
        ...result,
        metadata: { viewportVisibleCount: result.viewportWindow.visibleCount }
      };
    },
    summarize: ({ result }) => summarizeLineGeometry(result.geometries)
  });
};

const runRangeSelectorScenario = (scenario) =>
  runTimedScenario({
    scenario,
    build: ({ iteration, rows, seriesKeys }) => {
      const result = runRangeSelectorOverviewBuild({
        iteration,
        rows,
        seriesKeys,
        visiblePoints: scenario.visiblePoints,
        pathDecimation: scenario.pathDecimation
      });

      return {
        ...result,
        metadata: { viewportVisibleCount: result.viewportWindow.visibleCount }
      };
    },
    summarize: ({ result }) => summarizeLineGeometry(result.geometries)
  });

const lineScenarios = [
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

const viewportLineScenarios = [
  {
    name: "line-10000-window-2000",
    points: 10000,
    series: 1,
    visiblePoints: 2000,
    windowStart: 7000
  }
];

const rangeSelectorScenarios = [
  {
    name: "range-selector-2x10000-overview",
    points: 10000,
    series: 2,
    visiblePoints: 90,
    pathDecimation: { maxPoints: 900 }
  }
];

const barScenarios = [
  {
    name: "bar-500-scrollable-grouped",
    points: 500,
    series: 2,
    mode: "grouped"
  },
  {
    name: "bar-500-scrollable-stacked",
    points: 500,
    series: 3,
    mode: "stacked"
  }
];

const results = [
  ...lineScenarios.map(runLineScenario),
  ...viewportLineScenarios.map(runViewportLineScenario),
  ...rangeSelectorScenarios.map(runRangeSelectorScenario),
  ...barScenarios.map(runBarScenario)
];
const memory = process.memoryUsage();

console.log("Chart Kit benchmark: core geometry");
console.log(`Node: ${process.version}`);
console.log(`Platform: ${process.platform} ${process.arch}`);
console.log(`Iterations: ${iterations}`);
console.log(`Renderer: core geometry only`);
console.log("");
console.log(
  [
    "kind",
    "scenario",
    "series",
    "total points",
    "geometry points",
    "visible",
    "bars",
    "path points",
    "path chars",
    "median ms",
    "p95 ms"
  ].join("\t")
);

results.forEach((result) => {
  console.log(
    [
      result.kind,
      result.name,
      result.series,
      result.points * result.series,
      result.geometryPoints,
      result.viewportVisibleCount ?? result.visiblePoints ?? "",
      result.bars ?? 0,
      result.pathPoints,
      result.pathChars,
      formatBenchmarkNumber(result.medianMs),
      formatBenchmarkNumber(result.p95Ms)
    ].join("\t")
  );
});

console.log("");
console.log(
  `Memory RSS: ${formatBenchmarkNumber(memory.rss / 1024 / 1024)} MB`
);
console.log(
  `Heap used: ${formatBenchmarkNumber(memory.heapUsed / 1024 / 1024)} MB`
);

benchmarkBuild.cleanup();

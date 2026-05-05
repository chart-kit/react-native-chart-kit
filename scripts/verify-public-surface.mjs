import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();

const expectedRootExports = [
  "AbstractChart",
  "BarChart",
  "ContributionGraph",
  "LineChart",
  "PieChart",
  "ProgressChart",
  "StackedBarChart"
];

const expectedV2ValueExports = [
  "AreaChart",
  "BarChart",
  "CalendarHeatmap",
  "CandlestickChart",
  "ChartKitProvider",
  "CombinedChart",
  "ContributionGraph",
  "DonutChart",
  "LineChart",
  "PieChart",
  "ProgressChart",
  "ProgressRing",
  "StackedBarChart",
  "builtInCartesianChartPresets",
  "createChartPreset",
  "resolveCartesianChartThemeConfig",
  "useChartKitTheme"
];

const expectedV2TypeExports = [
  "BarChartProps",
  "CandlestickChartProps",
  "ChartKitProviderProps",
  "CombinedChartProps",
  "ContributionGraphProps",
  "LineChartProps",
  "PieChartProps",
  "ProgressChartProps",
  "StackedBarChartProps"
];

const readRepoFile = (relativePath) =>
  readFile(path.join(repoRoot, relativePath), "utf8");

const extractRootExports = (source) => {
  const exportBlock = source.match(/export\s*\{(?<body>[\s\S]*?)\};?/);
  const body = exportBlock?.groups?.body ?? "";

  return body
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const extractNamedExports = (source, exportKind = "value") => {
  const exports = new Set();
  const keyword = exportKind === "type" ? "export type" : "export";
  const exportBlockPattern = new RegExp(
    `${keyword}\\s*\\{(?<body>[\\s\\S]*?)\\}\\s*from`,
    "g"
  );
  let match;

  while ((match = exportBlockPattern.exec(source)) !== null) {
    const body = match.groups?.body ?? "";

    body
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .forEach((item) => exports.add(item.split(/\s+as\s+/)[0] ?? item));
  }

  return exports;
};

const assertMissing = ({ actual, expected, label }) => {
  const missing = expected.filter((name) => !actual.has(name));

  if (missing.length > 0) {
    throw new Error(`${label} missing exports: ${missing.join(", ")}`);
  }
};

const packageJson = JSON.parse(await readRepoFile("package.json"));
const rootSource = await readRepoFile("src/index.ts");
const v2Source = await readRepoFile("packages/react-native/src/index.ts");

if (packageJson.name !== "@chart-kit/react-native") {
  throw new Error(`Unexpected package name: ${packageJson.name}`);
}

if (packageJson.main !== "./dist/index.js") {
  throw new Error(`Unexpected package main: ${packageJson.main}`);
}

if (packageJson.types !== "./dist/index.d.ts") {
  throw new Error(`Unexpected package types: ${packageJson.types}`);
}

assertMissing({
  actual: new Set(extractRootExports(rootSource)),
  expected: expectedRootExports,
  label: "Root compatibility surface"
});

assertMissing({
  actual: extractNamedExports(v2Source),
  expected: expectedV2ValueExports,
  label: "V2 preview value surface"
});

assertMissing({
  actual: extractNamedExports(v2Source, "type"),
  expected: expectedV2TypeExports,
  label: "V2 preview type surface"
});

console.log("Public surface check passed.");
console.log(`Root compatibility exports: ${expectedRootExports.length}`);
console.log(`V2 preview value exports: ${expectedV2ValueExports.length}`);
console.log(`V2 preview type exports: ${expectedV2TypeExports.length}`);

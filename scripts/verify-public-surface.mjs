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
  "ChartKitProvider",
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
  "ChartKitProviderProps",
  "ContributionGraphProps",
  "LineChartProps",
  "PieChartProps",
  "ProgressChartProps",
  "StackedBarChartProps"
];

const expectedProCandidateSurfaceExports = [
  "CandlestickChart",
  "CombinedChart",
  "ChartSelectionProvider",
  "useChartSelection",
  "useDismissChartSelection"
];

const expectedProCandidateCapabilityExports = [
  "LineChart",
  "BarChart",
  "CombinedChart",
  "CandlestickChart",
  "DonutChart"
];

const expectedReactNativeProPreviewValueExports = [
  "BarChart",
  "CandlestickChart",
  "ChartSelectionProvider",
  "CombinedChart",
  "DonutChart",
  "LineChart",
  "getCandlestickChartAccessibilitySummary",
  "getCandlestickChartDataTable",
  "getCandlestickChartFinancialNarrative",
  "getCandlestickEmergencyClosureSessions",
  "getCombinedChartAccessibilitySummary",
  "getCombinedChartDataTable",
  "useChartSelection",
  "useDismissChartSelection"
];

const expectedReactNativeProPreviewTypeExports = [
  "BarChartInteractionConfig",
  "BarChartProps",
  "BarChartSelectionAnimationConfig",
  "BarChartTooltipConfig",
  "CandlestickChartProps",
  "CandlestickChartRangeSelectorConfig",
  "CandlestickChartTooltipConfig",
  "CandlestickChartViewportConfig",
  "ChartSelectionProviderProps",
  "CombinedChartInteractionConfig",
  "CombinedChartProps",
  "CombinedChartTooltipConfig",
  "LineChartCrosshairConfig",
  "LineChartInteractionConfig",
  "LineChartRangeSelectorConfig",
  "LineChartTooltipConfig",
  "LineChartViewportConfig",
  "PieChartActiveSliceConfig"
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

const assertSourceContains = ({ expected, label, source }) => {
  const missing = expected.filter((name) => !source.includes(`"${name}"`));

  if (missing.length > 0) {
    throw new Error(`${label} missing metadata: ${missing.join(", ")}`);
  }
};

const packageJson = JSON.parse(await readRepoFile("package.json"));
const corePackageJson = JSON.parse(
  await readRepoFile("packages/core/package.json")
);
const svgPackageJson = JSON.parse(
  await readRepoFile("packages/svg-renderer/package.json")
);
const skiaPackageJson = JSON.parse(
  await readRepoFile("packages/skia-renderer/package.json")
);
const proPackageJson = JSON.parse(
  await readRepoFile("packages/pro/package.json")
);
const v2PackageJson = JSON.parse(
  await readRepoFile("packages/react-native/package.json")
);
const rootSource = await readRepoFile("src/index.ts");
const v2Source = await readRepoFile("packages/react-native/src/index.ts");
const v2ProPreviewSource = await readRepoFile(
  "packages/react-native/src/proPreview.ts"
);
const proBoundarySource = await readRepoFile(
  "packages/pro/src/surfaceBoundary.ts"
);

if (packageJson.name !== "react-native-chart-kit") {
  throw new Error(`Unexpected package name: ${packageJson.name}`);
}

if (v2PackageJson.name !== "@chart-kit/react-native") {
  throw new Error(`Unexpected v2 package name: ${v2PackageJson.name}`);
}

if (v2PackageJson.private === true) {
  throw new Error("@chart-kit/react-native must not be private");
}

if (!v2PackageJson.exports?.["./pro-preview"]) {
  throw new Error("@chart-kit/react-native must expose ./pro-preview");
}

for (const workspacePackageJson of [
  corePackageJson,
  svgPackageJson,
  skiaPackageJson,
  proPackageJson,
  v2PackageJson
]) {
  if (
    !workspacePackageJson.exports?.["."] ||
    !workspacePackageJson.exports?.["./package.json"]
  ) {
    throw new Error(
      `${workspacePackageJson.name} must expose explicit public package paths`
    );
  }
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
  label: "Modern v2 value surface"
});

assertMissing({
  actual: extractNamedExports(v2Source, "type"),
  expected: expectedV2TypeExports,
  label: "Modern v2 type surface"
});

assertMissing({
  actual: extractNamedExports(v2ProPreviewSource),
  expected: expectedReactNativeProPreviewValueExports,
  label: "React Native Pro preview value surface"
});

assertMissing({
  actual: extractNamedExports(v2ProPreviewSource, "type"),
  expected: expectedReactNativeProPreviewTypeExports,
  label: "React Native Pro preview type surface"
});

assertSourceContains({
  expected: expectedProCandidateSurfaceExports,
  label: "Pro candidate surface boundary",
  source: proBoundarySource
});

assertSourceContains({
  expected: expectedProCandidateCapabilityExports,
  label: "Pro candidate capability boundary",
  source: proBoundarySource
});

console.log("Public surface check passed.");
console.log(`Root compatibility exports: ${expectedRootExports.length}`);
console.log(`Modern v2 value exports: ${expectedV2ValueExports.length}`);
console.log(`Modern v2 type exports: ${expectedV2TypeExports.length}`);
console.log(
  `Pro candidate surface exports: ${expectedProCandidateSurfaceExports.length}`
);
console.log(
  `Pro candidate capability exports: ${expectedProCandidateCapabilityExports.length}`
);
console.log(
  `React Native Pro preview value exports: ${expectedReactNativeProPreviewValueExports.length}`
);
console.log(
  `React Native Pro preview type exports: ${expectedReactNativeProPreviewTypeExports.length}`
);

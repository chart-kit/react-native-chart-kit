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
  "getBarChartAccessibilitySummary",
  "getBarChartDataTable",
  "getContributionGraphAccessibilitySummary",
  "getContributionGraphDataTable",
  "getLineChartAccessibilitySummary",
  "getLineChartDataTable",
  "getPieChartAccessibilitySummary",
  "getPieChartDataTable",
  "getProgressChartAccessibilitySummary",
  "getProgressChartDataTable",
  "resolveCartesianChartThemeConfig",
  "useChartKitTheme"
];

const expectedV2TypeExports = [
  "BarChartProps",
  "ChartKitProviderProps",
  "ContributionGraphProps",
  "LineChartProps",
  "LineChartViewportConfig",
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
const corePackageJson = JSON.parse(
  await readRepoFile("packages/core/package.json")
);
const svgPackageJson = JSON.parse(
  await readRepoFile("packages/svg-renderer/package.json")
);
const v2PackageJson = JSON.parse(
  await readRepoFile("packages/react-native/package.json")
);
const rootSource = await readRepoFile("src/index.ts");
const v2Source = await readRepoFile("packages/react-native/src/index.ts");

if (packageJson.name !== "react-native-chart-kit") {
  throw new Error(`Unexpected package name: ${packageJson.name}`);
}

if (!packageJson.exports?.["./v2"]) {
  throw new Error("react-native-chart-kit must expose ./v2");
}

if (packageJson.exports["./v2"].default !== "./v2/index.js") {
  throw new Error("react-native-chart-kit ./v2 must expose the physical v2 shim");
}

const rootExportPaths = Object.keys(packageJson.exports ?? {}).sort();
const expectedRootExportPaths = [".", "./package.json", "./v2"];
if (
  JSON.stringify(rootExportPaths) !== JSON.stringify(expectedRootExportPaths)
) {
  throw new Error(
    `react-native-chart-kit public exports must be ${expectedRootExportPaths.join(
      ", "
    )}; got ${rootExportPaths.join(", ")}`
  );
}

if (v2PackageJson.name !== "@chart-kit/react-native") {
  throw new Error(`Unexpected v2 package name: ${v2PackageJson.name}`);
}

for (const workspacePackageJson of [corePackageJson, svgPackageJson, v2PackageJson]) {
  if (workspacePackageJson.private !== true) {
    throw new Error(`${workspacePackageJson.name} must remain private`);
  }

  if (workspacePackageJson.publishConfig) {
    throw new Error(
      `${workspacePackageJson.name} must not define publishConfig`
    );
  }

  if (
    !workspacePackageJson.exports?.["."] ||
    !workspacePackageJson.exports?.["./package.json"]
  ) {
    throw new Error(
      `${workspacePackageJson.name} must expose explicit workspace package paths`
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

console.log("Public surface check passed.");
console.log(`Root compatibility exports: ${expectedRootExports.length}`);
console.log(`Modern v2 value exports: ${expectedV2ValueExports.length}`);
console.log(`Modern v2 type exports: ${expectedV2TypeExports.length}`);

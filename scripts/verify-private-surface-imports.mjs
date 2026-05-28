import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const sourceExtensions = new Set([".md", ".ts", ".tsx"]);
const scannedEntries = [
  "docs/charts",
  "docs/recipes",
  "packages/react-native/README.md",
  "packages/react-native/test/docs-examples.typecheck.tsx"
];
const rootPackageName = "react-native-chart-kit/v2";
const importPattern =
  /import\s+(?:type\s+)?\{(?<body>[^}]*)\}\s+from\s+["']react-native-chart-kit\/v2["']/g;
const removedPublicSubpathPattern =
  /from\s+["']react-native-chart-kit\/v2\/svg-renderer["']/;

const privateReactNativeSurfaceNames = new Set([
  "CandlestickChart",
  "CombinedChart",
  "getCandlestickChartAccessibilitySummary",
  "getCandlestickChartDataTable",
  "getCandlestickChartFinancialNarrative",
  "getCandlestickEmergencyClosureSessions",
  "getCombinedChartAccessibilitySummary",
  "getCombinedChartDataTable"
]);

const privateReactNativeSurfacePrefixes = [
  "CandlestickChart",
  "CombinedChart"
];

const pathExists = async (filePath) => {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
};

const collectFiles = async (entry) => {
  const absolutePath = path.join(repoRoot, entry);

  if (!(await pathExists(absolutePath))) {
    return [];
  }

  const entryStat = await stat(absolutePath);

  if (entryStat.isFile()) {
    return sourceExtensions.has(path.extname(entry))
      ? [path.relative(repoRoot, absolutePath)]
      : [];
  }

  const children = await readdir(absolutePath, { withFileTypes: true });
  const nested = await Promise.all(
    children.map((child) => collectFiles(path.join(entry, child.name)))
  );

  return nested.flat();
};

const parseImportNames = (body) =>
  body
    .split(",")
    .map((item) =>
      item
        .trim()
        .replace(/^type\s+/, "")
        .split(/\s+as\s+/)[0]
        ?.trim()
    )
    .filter(Boolean);

const shouldUsePrivateReactNativeSurface = (name) =>
  privateReactNativeSurfaceNames.has(name) ||
  privateReactNativeSurfacePrefixes.some((prefix) => name.startsWith(prefix));

const violations = [];
const files = [
  ...new Set((await Promise.all(scannedEntries.map(collectFiles))).flat())
].sort();

for (const file of files) {
  const source = await readFile(path.join(repoRoot, file), "utf8");
  let match;

  if (removedPublicSubpathPattern.test(source)) {
    violations.push({
      file,
      names: ["removed public subpath"]
    });
  }

  while ((match = importPattern.exec(source)) !== null) {
    const names = parseImportNames(match.groups?.body ?? "");
    const privateSurfaceNames = names.filter(shouldUsePrivateReactNativeSurface);

    if (privateSurfaceNames.length > 0) {
      violations.push({
        file,
        names: privateSurfaceNames
      });
    }
  }
}

if (violations.length > 0) {
  console.error("Private surface import boundary check failed.");

  for (const violation of violations) {
    console.error(
      `- ${violation.file} imports ${violation.names.join(
        ", "
      )} from ${rootPackageName}; keep Pro and renderer internals private.`
    );
  }

  process.exit(1);
}

console.log("Private surface import boundary check passed.");
console.log(
  `Scanned ${files.length} public docs and docs-example files.`
);

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const sourceExtensions = new Set([".md", ".ts", ".tsx"]);
const scannedEntries = [
  "apps/expo-showcase/src",
  "docs/charts",
  "docs/recipes",
  "packages/react-native/README.md",
  "packages/react-native/test/docs-examples.typecheck.tsx"
];
const rootPackageName = "@chart-kit/react-native";
const proPreviewPackageName = "@chart-kit/react-native/pro-preview";
const importPattern =
  /import\s+(?:type\s+)?\{(?<body>[^}]*)\}\s+from\s+["']@chart-kit\/react-native["']/g;

const explicitProPreviewNames = new Set([
  "CandlestickChart",
  "ChartSelectionProvider",
  "CombinedChart",
  "getCandlestickChartAccessibilitySummary",
  "getCandlestickChartDataTable",
  "getCandlestickChartFinancialNarrative",
  "getCandlestickEmergencyClosureSessions",
  "getCombinedChartAccessibilitySummary",
  "getCombinedChartDataTable",
  "useChartSelection",
  "useDismissChartSelection"
]);

const proPreviewPrefixes = [
  "CandlestickChart",
  "ChartSelection",
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

const shouldUseProPreview = (name) =>
  explicitProPreviewNames.has(name) ||
  proPreviewPrefixes.some((prefix) => name.startsWith(prefix));

const violations = [];
const files = [
  ...new Set((await Promise.all(scannedEntries.map(collectFiles))).flat())
].sort();

for (const file of files) {
  const source = await readFile(path.join(repoRoot, file), "utf8");
  let match;

  while ((match = importPattern.exec(source)) !== null) {
    const names = parseImportNames(match.groups?.body ?? "");
    const proPreviewNames = names.filter(shouldUseProPreview);

    if (proPreviewNames.length > 0) {
      violations.push({
        file,
        names: proPreviewNames
      });
    }
  }
}

if (violations.length > 0) {
  console.error("Pro preview import boundary check failed.");

  for (const violation of violations) {
    console.error(
      `- ${violation.file} imports ${violation.names.join(
        ", "
      )} from ${rootPackageName}; use ${proPreviewPackageName}.`
    );
  }

  process.exit(1);
}

console.log("Pro preview import boundary check passed.");
console.log(
  `Scanned ${files.length} public docs, showcase, and docs-example files.`
);

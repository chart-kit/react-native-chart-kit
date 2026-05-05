#!/usr/bin/env node
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

export const legacyChartComponents = [
  "LineChart",
  "BarChart",
  "StackedBarChart",
  "PieChart",
  "ProgressChart",
  "ContributionGraph"
];

const sourceExtensions = new Set([".js", ".jsx", ".ts", ".tsx"]);
const ignoredDirectoryNames = new Set([
  ".git",
  ".tmp",
  "build",
  "dist",
  "node_modules"
]);
const unsupportedLegacyProps = [
  "decorator",
  "getDotProps",
  "renderDotContent",
  "tooltipDataAttrs"
];

export const importsReactNativeChartKit = (source) =>
  /from\s+["']react-native-chart-kit["']/.test(source) ||
  /require\(\s*["']react-native-chart-kit["']\s*\)/.test(source);

const getImportedLegacyComponents = (source) => {
  const imported = new Set();
  const namedImportPattern =
    /import\s+\{(?<names>[^}]+)\}\s+from\s+["']react-native-chart-kit["']/g;
  let match;

  while ((match = namedImportPattern.exec(source)) !== null) {
    const names = match.groups?.names ?? "";

    for (const name of names.split(",")) {
      const localName = name
        .trim()
        .split(/\s+as\s+/i)
        .at(-1)
        ?.trim();

      if (localName && legacyChartComponents.includes(localName)) {
        imported.add(localName);
      }
    }
  }

  const requirePattern =
    /(?:const|let|var)\s+\{(?<names>[^}]+)\}\s*=\s*require\(\s*["']react-native-chart-kit["']\s*\)/g;

  while ((match = requirePattern.exec(source)) !== null) {
    const names = match.groups?.names ?? "";

    for (const name of names.split(",")) {
      const localName = name
        .trim()
        .split(/\s*:\s*/)
        .at(-1)
        ?.trim();

      if (localName && legacyChartComponents.includes(localName)) {
        imported.add(localName);
      }
    }
  }

  return imported;
};

const getLineNumber = (source, index) =>
  source.slice(0, index).split("\n").length;

const collectWarnings = ({ filePath, source }) => {
  const warnings = [];

  for (const prop of unsupportedLegacyProps) {
    const pattern = new RegExp(`\\b${prop}\\s*=`, "g");
    let match;

    while ((match = pattern.exec(source)) !== null) {
      warnings.push({
        filePath,
        line: getLineNumber(source, match.index),
        message: `${prop} is preserved, but should be manually reviewed for the modern composable API.`
      });
    }
  }

  if (
    /import\s+\*\s+as\s+\w+\s+from\s+["']react-native-chart-kit["']/.test(
      source
    )
  ) {
    warnings.push({
      filePath,
      line: 1,
      message:
        "Namespace imports are detected but not rewritten; review ChartKit.LineChart-style usages manually."
    });
  }

  return warnings;
};

export const transformV1ToV2Source = (source) => {
  if (!importsReactNativeChartKit(source)) {
    return {
      changed: false,
      source
    };
  }

  const importedComponents = getImportedLegacyComponents(source);

  if (importedComponents.size === 0) {
    return {
      changed: false,
      source
    };
  }

  const componentAlternation = [...importedComponents].join("|");
  const openingTagPattern = new RegExp(
    `<(?<name>${componentAlternation})(?<attrs>\\s[^<>]*?)?(?<closing>\\/?)>`,
    "g"
  );
  const nextSource = source.replace(
    openingTagPattern,
    (fullMatch, name, attrs = "", closing) => {
      if (/\bcompatibility\s*=/.test(attrs)) {
        return fullMatch;
      }

      return `<${name} compatibility="v1"${attrs}${closing}>`;
    }
  );

  return {
    changed: nextSource !== source,
    source: nextSource
  };
};

const collectSourceFiles = async (entry) => {
  const absolutePath = path.resolve(entry);
  const entryStat = await stat(absolutePath);

  if (entryStat.isFile()) {
    return sourceExtensions.has(path.extname(absolutePath))
      ? [absolutePath]
      : [];
  }

  if (!entryStat.isDirectory()) {
    return [];
  }

  const children = await readdir(absolutePath, { withFileTypes: true });
  const nested = await Promise.all(
    children.map((child) => {
      if (child.isDirectory() && ignoredDirectoryNames.has(child.name)) {
        return [];
      }

      return collectSourceFiles(path.join(absolutePath, child.name));
    })
  );

  return nested.flat();
};

const runV1ToV2 = async ({ check, entries }) => {
  const files = (await Promise.all(entries.map(collectSourceFiles))).flat();
  const changedFiles = [];
  const warnings = [];

  for (const filePath of files) {
    const source = await readFile(filePath, "utf8");
    const result = transformV1ToV2Source(source);

    warnings.push(...collectWarnings({ filePath, source }));

    if (!result.changed) {
      continue;
    }

    changedFiles.push(filePath);

    if (!check) {
      await writeFile(filePath, result.source, "utf8");
    }
  }

  return {
    changedFiles,
    checkedFiles: files.length,
    warnings
  };
};

const printUsage = () => {
  console.log(`Usage:
  chartkit-codemod v1-to-v2 <path...> [--check]

Examples:
  npx chartkit-codemod v1-to-v2 ./src
  npx chartkit-codemod v1-to-v2 ./src --check`);
};

export const runCli = async (argv) => {
  const [, , command, ...rest] = argv;
  const check = rest.includes("--check");
  const entries = rest.filter((item) => item !== "--check");

  if (command !== "v1-to-v2" || entries.length === 0) {
    printUsage();
    return 1;
  }

  const result = await runV1ToV2({ check, entries });

  for (const warning of result.warnings) {
    console.warn(
      `${path.relative(process.cwd(), warning.filePath)}:${warning.line}: ${warning.message}`
    );
  }

  const action = check ? "would update" : "updated";
  console.log(
    `chartkit-codemod v1-to-v2 checked ${result.checkedFiles} files; ${action} ${result.changedFiles.length}.`
  );

  for (const filePath of result.changedFiles) {
    console.log(`- ${path.relative(process.cwd(), filePath)}`);
  }

  return check && result.changedFiles.length > 0 ? 1 : 0;
};

const invokedUrl = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : "";

if (import.meta.url === invokedUrl) {
  const exitCode = await runCli(process.argv);
  process.exit(exitCode);
}

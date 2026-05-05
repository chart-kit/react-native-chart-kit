import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  stat,
  writeFile
} from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import ts from "typescript";

const repoRoot = process.cwd();
const publicMarkdownRoots = [
  "README.md",
  "docs/charts",
  "docs/getting-started",
  "docs/migration",
  "docs/recipes",
  "docs/troubleshooting.md",
  "packages/react-native/README.md"
];
const checkedFenceLanguages = new Set(["ts", "tsx"]);
const chartKitNames = [
  "BarChart",
  "CandlestickChart",
  "ChartKitProvider",
  "ChartSelectionProvider",
  "CombinedChart",
  "ContributionGraph",
  "DonutChart",
  "LineChart",
  "LineChartViewportConfig",
  "PieChart",
  "ProgressChart",
  "ProgressRing",
  "StackedBarChart",
  "createChartPreset",
  "getLineChartAccessibilitySummary",
  "getLineChartDataTable",
  "useDismissChartSelection"
];
const reactNames = ["useMemo", "useState"];
const reactNativeNames = ["Pressable", "Text", "View"];
const ambientComponents = ["App", "Dashboard", "PortfolioHeader", "Root"];
const svgNames = ["SvgGroup", "SvgLine", "SvgRect", "SvgText"];
const ambientArrays = [
  "acquisitionShare",
  "benchmarkData",
  "candles",
  "data",
  "largeData",
  "monthlyRevenue",
  "plans",
  "platformShare",
  "portfolioData",
  "portfolioHistory",
  "profit",
  "revenueMix",
  "retentionSegments",
  "rows",
  "segments",
  "supportVolume",
  "usageDays",
  "values",
  "weeklyAcquisition",
  "weeklySpend",
  "weeklySpending"
];
const ambientHandlers = [
  "setHeaderValue",
  "setRange",
  "setSelectedChannel",
  "setSelectedDay",
  "setViewport"
];
const ambientObjects = ["chartConfig", "viewport"];

const pathExists = async (filePath) => {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
};

const collectMarkdownFiles = async (entry) => {
  const fullPath = path.join(repoRoot, entry);

  if (!(await pathExists(fullPath))) {
    return [];
  }

  if (entry.endsWith(".md")) {
    return [fullPath];
  }

  const children = await readdir(fullPath, { withFileTypes: true });
  const nested = await Promise.all(
    children.map((child) => {
      const childEntry = path.join(entry, child.name);

      if (child.isDirectory()) {
        return collectMarkdownFiles(childEntry);
      }

      return child.name.endsWith(".md")
        ? [path.join(repoRoot, childEntry)]
        : [];
    })
  );

  return nested.flat();
};

const getLineNumber = (content, index) =>
  content.slice(0, index).split("\n").length;

const extractCodeFences = (content) => {
  const fences = [];
  const fencePattern = /^```([^\s`]*)[^\n]*\n([\s\S]*?)^```/gm;
  let match;

  while ((match = fencePattern.exec(content)) !== null) {
    const language = match[1]?.trim().toLowerCase() ?? "";

    if (checkedFenceLanguages.has(language)) {
      fences.push({
        code: match[2] ?? "",
        language,
        line: getLineNumber(content, match.index)
      });
    }
  }

  return fences;
};

const getImportedNames = (code) => {
  const names = new Set();
  const source = ts.createSourceFile(
    "doc-example.tsx",
    code,
    ts.ScriptTarget.ES2020,
    true,
    ts.ScriptKind.TSX
  );

  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement)) {
      continue;
    }

    const clause = statement.importClause;

    if (clause?.name) {
      names.add(clause.name.text);
    }

    const bindings = clause?.namedBindings;

    if (bindings && ts.isNamedImports(bindings)) {
      for (const element of bindings.elements) {
        names.add(element.name.text);
      }
    }
  }

  return names;
};

const declaresName = (code, name) => {
  const pattern = new RegExp(
    [
      `\\b(?:function|type|interface|class)\\s+${name}\\b`,
      `\\b(?:const|let|var)\\s+${name}\\b`,
      `\\b(?:const|let|var)\\s+\\[[^\\]]*\\b${name}\\b[^\\]]*\\]`,
      `\\b(?:const|let|var)\\s+\\{[^}]*\\b${name}\\b[^}]*\\}`
    ].join("|")
  );

  return pattern.test(code);
};

const usesName = (code, name) => new RegExp(`\\b${name}\\b`).test(code);

const getMissingImports = (code, importedNames, candidates) =>
  candidates.filter((name) => usesName(code, name) && !importedNames.has(name));

const buildImportLine = (source, names) =>
  names.length > 0 ? `import { ${names.join(", ")} } from "${source}";` : "";

const buildAmbientDeclarations = (code) => {
  const declarations = [];

  for (const name of ambientArrays) {
    if (usesName(code, name) && !declaresName(code, name)) {
      declarations.push(`declare const ${name}: Array<Record<string, any>>;`);
    }
  }

  for (const name of ambientHandlers) {
    if (usesName(code, name) && !declaresName(code, name)) {
      declarations.push(`declare const ${name}: (value: any) => void;`);
    }
  }

  for (const name of ambientObjects) {
    if (usesName(code, name) && !declaresName(code, name)) {
      declarations.push(`declare const ${name}: any;`);
    }
  }

  for (const name of ambientComponents) {
    if (usesName(code, name) && !declaresName(code, name)) {
      declarations.push(
        `declare const ${name}: () => import("react").ReactElement;`
      );
    }
  }

  return declarations;
};

const buildExampleSource = ({ code, relativePath, line }) => {
  const importedNames = getImportedNames(code);
  const imports = [
    buildImportLine(
      "@chart-kit/react-native",
      getMissingImports(code, importedNames, chartKitNames)
    ),
    buildImportLine(
      "react",
      getMissingImports(code, importedNames, reactNames)
    ),
    buildImportLine(
      "react-native",
      getMissingImports(code, importedNames, reactNativeNames)
    ),
    buildImportLine(
      "@chart-kit/svg-renderer",
      getMissingImports(code, importedNames, svgNames)
    )
  ].filter(Boolean);
  const declarations = buildAmbientDeclarations(code);

  return [
    `// Generated from ${relativePath}:${line}. Do not edit.`,
    ...imports,
    ...declarations,
    "export {};",
    code
  ].join("\n\n");
};

const formatDiagnosticMessage = (message) =>
  ts.flattenDiagnosticMessageText(message, "\n");

const parseTsConfig = () => {
  const configPath = path.join(repoRoot, "apps/expo-showcase/tsconfig.json");
  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);

  if (configFile.error) {
    throw new Error(formatDiagnosticMessage(configFile.error.messageText));
  }

  const parsed = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(configPath)
  );

  return {
    ...parsed.options,
    allowJs: false,
    checkJs: false,
    noEmit: true,
    skipLibCheck: true,
    strict: false
  };
};

const formatDiagnostic = (diagnostic) => {
  const message = formatDiagnosticMessage(diagnostic.messageText);

  if (!diagnostic.file || diagnostic.start === undefined) {
    return message;
  }

  const position = diagnostic.file.getLineAndCharacterOfPosition(
    diagnostic.start
  );
  const source = diagnostic.file.fileName;
  const basename = path.basename(source);
  const sourceComment = diagnostic.file.text.match(
    /^\/\/ Generated from (?<source>.+)\. Do not edit\./
  );
  const location = sourceComment?.groups?.source ?? basename;

  return `${location}:${position.line + 1}:${position.character + 1}: ${message}`;
};

const markdownFiles = (
  await Promise.all(publicMarkdownRoots.map(collectMarkdownFiles))
).flat();
const uniqueMarkdownFiles = [...new Set(markdownFiles)].sort();
const tempRoot = path.join(repoRoot, ".tmp");
await mkdir(tempRoot, { recursive: true });
const tempDir = await mkdtemp(path.join(tempRoot, "chartkit-docs-"));

try {
  const rootNames = [];
  let checkedFenceCount = 0;

  for (const filePath of uniqueMarkdownFiles) {
    const content = await readFile(filePath, "utf8");
    const relativePath = path.relative(repoRoot, filePath);
    const fences = extractCodeFences(content);

    for (const [index, fence] of fences.entries()) {
      const extension = fence.language === "ts" ? "ts" : "tsx";
      const generatedPath = path.join(
        tempDir,
        `${relativePath.replace(/[^a-z0-9]+/gi, "-")}-${index}.${extension}`
      );

      await writeFile(
        generatedPath,
        buildExampleSource({ ...fence, relativePath }),
        "utf8"
      );
      rootNames.push(generatedPath);
      checkedFenceCount += 1;
    }
  }

  const program = ts.createProgram(rootNames, parseTsConfig());
  const diagnostics = ts
    .getPreEmitDiagnostics(program)
    .filter(
      (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error
    );

  if (diagnostics.length > 0) {
    console.error("Docs example typecheck failed:");
    diagnostics.forEach((diagnostic) =>
      console.error(`- ${formatDiagnostic(diagnostic)}`)
    );
    process.exitCode = 1;
  } else {
    console.log(
      `Docs example typecheck passed: ${checkedFenceCount} public TS/TSX fences.`
    );
  }
} finally {
  await rm(tempDir, { force: true, recursive: true });
}

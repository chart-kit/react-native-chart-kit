import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const defaultRepoRoot = process.cwd();
const defaultMaxLines = 900;
const scanRoots = ["apps", "examples", "packages", "scripts"];
const sourceExtensions = new Set([".js", ".jsx", ".mjs", ".ts", ".tsx"]);
const ignoredFiles = new Set(["apps/site/src/previews/reactNativeWebStub.tsx"]);
const ignoredDirectories = new Set([
  ".expo",
  ".next",
  "android",
  "build",
  "coverage",
  "dist",
  "ios",
  "node_modules"
]);

const parseMaxLines = (argv) => {
  const maxArg = argv.find((arg) => arg.startsWith("--max-lines="));
  const rawValue = maxArg?.split("=")[1];
  const maxLines = rawValue ? Number(rawValue) : defaultMaxLines;

  if (!Number.isInteger(maxLines) || maxLines < 1) {
    throw new Error("--max-lines must be a positive integer");
  }

  return maxLines;
};

const collectSourceFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        files.push(...(await collectSourceFiles(absolutePath)));
      }
    } else if (sourceExtensions.has(path.extname(entry.name))) {
      files.push(absolutePath);
    }
  }

  return files;
};

const countLines = async (filePath) => {
  const source = await readFile(filePath, "utf8");
  const normalizedSource = source.endsWith("\n") ? source.slice(0, -1) : source;

  return normalizedSource === "" ? 0 : normalizedSource.split("\n").length;
};

const toRepoPath = (repoRoot, filePath) =>
  path.relative(repoRoot, filePath).split(path.sep).join("/");

export const checkFileSizes = async ({
  maxLines = defaultMaxLines,
  repoRoot = defaultRepoRoot
} = {}) => {
  const existingRoots = [];

  for (const root of scanRoots) {
    const absoluteRoot = path.join(repoRoot, root);

    try {
      if ((await stat(absoluteRoot)).isDirectory()) {
        existingRoots.push(absoluteRoot);
      }
    } catch {
      // Optional scan roots may not exist in fixture repos.
    }
  }

  const files = (await Promise.all(existingRoots.map(collectSourceFiles)))
    .flat()
    .filter((filePath) => !ignoredFiles.has(toRepoPath(repoRoot, filePath)))
    .sort();
  const results = await Promise.all(
    files.map(async (filePath) => ({
      lines: await countLines(filePath),
      path: toRepoPath(repoRoot, filePath)
    }))
  );
  const oversized = results
    .filter((result) => result.lines > maxLines)
    .sort((a, b) => b.lines - a.lines || a.path.localeCompare(b.path));

  return { checked: results.length, maxLines, oversized };
};

export const formatFileSizeReport = ({ checked, maxLines, oversized }) => {
  if (oversized.length === 0) {
    return `File size check passed: ${checked} source files are <= ${maxLines} lines.`;
  }

  return [
    `File size check failed: ${oversized.length} source files exceed ${maxLines} lines.`,
    ...oversized.map((item) => `- ${item.path}: ${item.lines} lines`)
  ].join("\n");
};

const main = async () => {
  const result = await checkFileSizes({
    maxLines: parseMaxLines(process.argv.slice(2))
  });

  console.log(formatFileSizeReport(result));

  if (result.oversized.length > 0) {
    process.exitCode = 1;
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    await main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

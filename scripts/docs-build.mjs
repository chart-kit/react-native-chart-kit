import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import ts from "typescript";

const repoRoot = process.cwd();
const markdownRoots = [
  "README.md",
  "contributing.md",
  "docs",
  "packages/core/README.md",
  "packages/react-native/README.md",
  "packages/svg-renderer/README.md",
  "apps/expo-showcase/README.md"
];
const ignoredLinkPrefixes = [
  "#",
  "http://",
  "https://",
  "mailto:",
  "tel:",
  "exp://"
];
const checkedFenceLanguages = new Set(["js", "jsx", "ts", "tsx"]);
const fenceLanguageExtensions = {
  js: "js",
  jsx: "jsx",
  ts: "ts",
  tsx: "tsx"
};

const pathExists = async (filePath) => {
  try {
    await access(filePath);
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

const isExternalLink = (href) =>
  ignoredLinkPrefixes.some((prefix) => href.startsWith(prefix));

const stripAnchor = (href) => href.split("#")[0] ?? href;

const normalizeLinkTarget = (href) => {
  const withoutTitle = href.trim().replace(/\s+"[^"]*"$/, "");
  const target = stripAnchor(withoutTitle);

  return target.length > 0 ? decodeURI(target) : "";
};

const extractMarkdownLinks = (content) => {
  const links = [];
  const linkPattern = /(?<!!)\[[^\]]*\]\(([^)]+)\)/g;
  let match;

  while ((match = linkPattern.exec(content)) !== null) {
    const href = match[1]?.trim();

    if (href && !isExternalLink(href)) {
      links.push(href);
    }
  }

  return links;
};

const countFenceMarkers = (content) => {
  const matches = content.match(/^```/gm);

  return matches?.length ?? 0;
};

const extractCodeFences = (content) => {
  const fences = [];
  const fencePattern = /^```([^\s`]*)[^\n]*\n([\s\S]*?)^```/gm;
  let match;

  while ((match = fencePattern.exec(content)) !== null) {
    const language = match[1]?.trim().toLowerCase() ?? "";
    const code = match[2] ?? "";

    if (checkedFenceLanguages.has(language)) {
      fences.push({
        code,
        language,
        line: getLineNumber(content, match.index)
      });
    }
  }

  return fences;
};

const getLineNumber = (content, index) =>
  content.slice(0, index).split("\n").length;

const formatDiagnosticMessage = (message) =>
  ts.flattenDiagnosticMessageText(message, "\n");

const getParsableFenceCode = (code) =>
  code.trimStart().startsWith("{") ? `(${code})` : code;

const validateCodeFence = ({ code, language, line, relativePath }) => {
  const extension = fenceLanguageExtensions[language] ?? "tsx";
  const parsableCode = getParsableFenceCode(code);
  const result = ts.transpileModule(parsableCode, {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2020
    },
    fileName: `${relativePath}:${line}.${extension}`,
    reportDiagnostics: true
  });
  const diagnostics =
    result.diagnostics?.filter(
      (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error
    ) ?? [];

  return diagnostics.map((diagnostic) => {
    const position =
      diagnostic.start !== undefined
        ? ts.getLineAndCharacterOfPosition(
            ts.createSourceFile(
              `${relativePath}:${line}.${extension}`,
              parsableCode,
              ts.ScriptTarget.ES2020,
              false,
              extension === "tsx" || extension === "jsx"
                ? ts.ScriptKind.TSX
                : extension === "ts"
                  ? ts.ScriptKind.TS
                  : ts.ScriptKind.JS
            ),
            diagnostic.start
          )
        : undefined;
    const localLine =
      position !== undefined ? `:${line + position.line}` : `:${line}`;

    return `${relativePath}${localLine}: ${formatDiagnosticMessage(
      diagnostic.messageText
    )}`;
  });
};

const validateMarkdownFile = async (filePath) => {
  const content = await readFile(filePath, "utf8");
  const relativePath = path.relative(repoRoot, filePath);
  const errors = [];
  const fenceMarkers = countFenceMarkers(content);
  const codeFences = extractCodeFences(content);

  if (fenceMarkers % 2 !== 0) {
    errors.push(`${relativePath}: unbalanced fenced code block markers`);
  }

  for (const fence of codeFences) {
    errors.push(...validateCodeFence({ ...fence, relativePath }));
  }

  for (const href of extractMarkdownLinks(content)) {
    const target = normalizeLinkTarget(href);

    if (!target) {
      continue;
    }

    const absoluteTarget = path.resolve(path.dirname(filePath), target);

    if (!(await pathExists(absoluteTarget))) {
      errors.push(`${relativePath}: broken local link "${href}"`);
    }
  }

  return {
    checkedCodeFenceCount: codeFences.length,
    errors
  };
};

const markdownFiles = (
  await Promise.all(markdownRoots.map(collectMarkdownFiles))
).flat();
const uniqueMarkdownFiles = [...new Set(markdownFiles)].sort();
const validationResults = await Promise.all(
  uniqueMarkdownFiles.map(validateMarkdownFile)
);
const allErrors = validationResults.flatMap((result) => result.errors);
const checkedCodeFenceCount = validationResults.reduce(
  (sum, result) => sum + result.checkedCodeFenceCount,
  0
);

if (allErrors.length > 0) {
  console.error("Docs build failed:");
  allErrors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(
  `Docs build passed: validated ${uniqueMarkdownFiles.length} markdown files and ${checkedCodeFenceCount} JS/TS code fences.`
);

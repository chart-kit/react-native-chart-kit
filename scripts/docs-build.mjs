import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const markdownRoots = [
  "README.md",
  "CONTRIBUTING.md",
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

const validateMarkdownFile = async (filePath) => {
  const content = await readFile(filePath, "utf8");
  const relativePath = path.relative(repoRoot, filePath);
  const errors = [];
  const fenceMarkers = countFenceMarkers(content);

  if (fenceMarkers % 2 !== 0) {
    errors.push(`${relativePath}: unbalanced fenced code block markers`);
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

  return errors;
};

const markdownFiles = (
  await Promise.all(markdownRoots.map(collectMarkdownFiles))
).flat();
const uniqueMarkdownFiles = [...new Set(markdownFiles)].sort();
const allErrors = (
  await Promise.all(uniqueMarkdownFiles.map(validateMarkdownFile))
).flat();

if (allErrors.length > 0) {
  console.error("Docs build failed:");
  allErrors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(
  `Docs build passed: validated ${uniqueMarkdownFiles.length} markdown files.`
);

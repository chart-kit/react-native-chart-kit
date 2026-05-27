import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const rootDist = path.join(repoRoot, "dist");
const v2Dist = path.join(rootDist, "v2");

const packageCopies = [
  {
    from: "packages/core/dist",
    to: "core"
  },
  {
    from: "packages/svg-renderer/dist",
    to: "svg-renderer"
  },
  {
    from: "packages/react-native/dist",
    to: "react-native"
  }
];

const privateV2Paths = [
  "react-native/charts/candlestick",
  "react-native/charts/combined"
];

const shouldRewriteImports = (filePath) =>
  filePath.endsWith(".js") || filePath.endsWith(".d.ts");

const toImportSpecifier = (fromFile, targetFile) => {
  const relativePath = path
    .relative(path.dirname(fromFile), targetFile)
    .replaceAll(path.sep, "/");

  return relativePath.startsWith(".") ? relativePath : `./${relativePath}`;
};

const rewriteWorkspaceImports = async (filePath) => {
  if (!shouldRewriteImports(filePath)) {
    return;
  }

  const coreImport = toImportSpecifier(
    filePath,
    path.join(v2Dist, "core", "index")
  );
  const svgImport = toImportSpecifier(
    filePath,
    path.join(v2Dist, "svg-renderer", "index")
  );
  const source = await readFile(filePath, "utf8");
  const rewritten = source
    .replaceAll('"@chart-kit/core"', `"${coreImport}"`)
    .replaceAll("'@chart-kit/core'", `'${coreImport}'`)
    .replaceAll('"@chart-kit/svg-renderer"', `"${svgImport}"`)
    .replaceAll("'@chart-kit/svg-renderer'", `'${svgImport}'`);

  if (rewritten !== source) {
    await writeFile(filePath, rewritten, "utf8");
  }
};

const walkFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walkFiles(fullPath)));
    } else {
      files.push(fullPath);
    }
  }

  return files;
};

await rm(v2Dist, { force: true, recursive: true });
await mkdir(v2Dist, { recursive: true });

for (const copyInfo of packageCopies) {
  await cp(path.join(repoRoot, copyInfo.from), path.join(v2Dist, copyInfo.to), {
    recursive: true
  });
}

await Promise.all(
  privateV2Paths.map((privatePath) =>
    rm(path.join(v2Dist, privatePath), { force: true, recursive: true })
  )
);

const reactNativeFiles = await walkFiles(path.join(v2Dist, "react-native"));
await Promise.all(reactNativeFiles.map(rewriteWorkspaceImports));

await writeFile(
  path.join(v2Dist, "index.js"),
  'export * from "./react-native/index";\n',
  "utf8"
);
await writeFile(
  path.join(v2Dist, "index.d.ts"),
  'export * from "./react-native/index";\n',
  "utf8"
);

console.log("Assembled react-native-chart-kit v2 package surface.");

import { rm } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const distDirs = [
  "dist",
  "packages/core/dist",
  "packages/svg-renderer/dist",
  "packages/skia-renderer/dist",
  "packages/react-native/dist"
];

await Promise.all(
  distDirs.map((distDir) =>
    rm(path.join(repoRoot, distDir), { force: true, recursive: true })
  )
);

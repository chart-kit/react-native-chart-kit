import { readdir, readFile } from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const coreRoot = path.resolve(testDir, "..");
const sourceRoot = path.join(coreRoot, "src");
const forbiddenImports = ["react", "react-native", "react-native-svg"];

const listSourceFiles = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return listSourceFiles(entryPath);
      }

      if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
        return [entryPath];
      }

      return [];
    })
  );

  return files.flat();
};

describe("@chart-kit/core package boundary", () => {
  it("does not import React Native or renderer packages", async () => {
    const sourceFiles = await listSourceFiles(sourceRoot);

    expect(sourceFiles.length).toBeGreaterThan(0);

    const violations: string[] = [];

    await Promise.all(
      sourceFiles.map(async (sourceFile) => {
        const source = await readFile(sourceFile, "utf8");

        for (const importName of forbiddenImports) {
          const importPattern = new RegExp(
            `from\\s+["']${importName}["']|import\\s*\\(\\s*["']${importName}["']\\s*\\)`
          );

          if (importPattern.test(source)) {
            violations.push(path.relative(coreRoot, sourceFile));
          }
        }
      })
    );

    expect(violations).toEqual([]);
  });
});

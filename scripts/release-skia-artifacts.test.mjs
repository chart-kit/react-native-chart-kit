import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { validateSkiaMatrixArtifacts } from "./release-skia-artifacts.mjs";

const repoRoot = process.cwd();
const readRepoText = (relativePath) =>
  readFile(path.join(repoRoot, relativePath), "utf8");

const matrixWithBaseline = ({ status = "partial" } = {}) => ({
  rows: [
    {
      evidence: ["docs/release/artifacts/skia-local-baseline-2026-05-06.md"],
      id: "ios-skia-native-install",
      platform: "ios",
      scenarioId: "native-install",
      status
    }
  ]
});

const baselineArtifact = `# Skia Local Baseline Evidence

Date: 2026-05-06
Commit: \`abc1234\`
Build surface: local repository checks only

## Commands

npm run skia:typecheck
npm run skia:parity
npm run boundaries:check
npm run pack:check

## Results

- Vitest reported renderer-contract coverage.
- package boundary and optional peer checks passed.

## Scope

Not covered by this local baseline:
- iOS or Android install
- native release-build rendering
- native SVG-vs-Skia performance comparison
`;

describe("Skia artifact validation", () => {
  it("accepts checked-in Skia baseline artifacts", async () => {
    const matrix = JSON.parse(
      await readRepoText("docs/release/evidence/skia-renderer-matrix.json")
    );

    await expect(validateSkiaMatrixArtifacts(matrix)).resolves.toEqual([]);
  });

  it("requires local baseline commands and caveats", async () => {
    const errors = await validateSkiaMatrixArtifacts(matrixWithBaseline(), {
      exists: async () => true,
      readText: async () =>
        baselineArtifact
          .replace("npm run skia:parity\n", "")
          .replace("native release-build rendering\n", "")
    });

    expect(errors.join("; ")).toContain("npm run skia:parity");
    expect(errors.join("; ")).toContain("native release-build rendering");
  });

  it("does not allow the local baseline as final Skia evidence", async () => {
    const errors = await validateSkiaMatrixArtifacts(
      matrixWithBaseline({ status: "pass" }),
      {
        exists: async () => true,
        readText: async () => baselineArtifact
      }
    );

    expect(errors.join("; ")).toContain(
      "must not use the local Skia baseline as final evidence"
    );
  });
});

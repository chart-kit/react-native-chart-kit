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

const iosInstallArtifact = `# Skia Native Install Evidence

Date: 2026-05-06
Commit: \`abc1234\`
Build surface: temporary native release workspace
Platform target: ios

## Verified Output

- Installed package: \`@shopify/react-native-skia@2.6.2\`
- Skia CocoaPods target autolinked: yes
- Release build successful: yes

## Caveats

- This install evidence does not by itself prove renderer parity screenshots.
- SVG-vs-Skia timing and memory data remain separate performance evidence.
`;

const androidRendererBuildArtifact = `# Skia Native Install Evidence

Date: 2026-05-06
Commit: \`abc1234\`
Build surface: temporary native release workspace
Platform target: android
Showcase renderer mode: skia

## Commands

node scripts/prepare-skia-showcase-renderer-preview.mjs --app-dir apps/expo-showcase
npm --workspace @chart-kit/expo-showcase run typecheck

## Result

- Showcase renderer mode stayed \`skia\`.

## Verified Output

- Installed package: \`@shopify/react-native-skia@2.6.2\`
- Showcase renderer mode: skia
- Skia Gradle project configured: yes
- Release build successful: yes
- Showcase Skia renderer injected: yes

## Caveats

- This install evidence does not by itself prove renderer parity screenshots.
- SVG-vs-Skia timing and memory data remain separate performance evidence.
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

  it("requires platform-specific native install proof", async () => {
    const matrix = {
      rows: [
        {
          evidence: ["docs/release/artifacts/ios-skia-native-install.md"],
          id: "ios-skia-native-install",
          platform: "ios",
          scenarioId: "native-install",
          status: "partial"
        }
      ]
    };
    const errors = await validateSkiaMatrixArtifacts(matrix, {
      exists: async () => true,
      readText: async () =>
        iosInstallArtifact.replace("Skia CocoaPods target autolinked: yes", "")
    });

    expect(errors.join("; ")).toContain(
      "Skia CocoaPods target autolinked: yes"
    );
  });

  it("requires renderer-injected build proof for Skia renderer build artifacts", async () => {
    const matrix = {
      rows: [
        {
          evidence: ["docs/release/artifacts/android-skia-renderer-build.md"],
          id: "android-skia-free-chart-parity",
          platform: "android",
          scenarioId: "free-chart-parity",
          status: "partial"
        }
      ]
    };
    const errors = await validateSkiaMatrixArtifacts(matrix, {
      exists: async () => true,
      readText: async () =>
        androidRendererBuildArtifact.replace(
          "Showcase Skia renderer injected: yes",
          ""
        )
    });

    expect(errors.join("; ")).toContain(
      "Showcase Skia renderer injected: yes"
    );
  });

  it("does not allow renderer-injected build proof as final Skia parity evidence", async () => {
    const matrix = {
      rows: [
        {
          evidence: ["docs/release/artifacts/android-skia-renderer-build.md"],
          id: "android-skia-free-chart-parity",
          platform: "android",
          scenarioId: "free-chart-parity",
          status: "pass"
        }
      ]
    };
    const errors = await validateSkiaMatrixArtifacts(matrix, {
      exists: async () => true,
      readText: async () => androidRendererBuildArtifact
    });

    expect(errors.join("; ")).toContain(
      "must not use Skia renderer-build evidence as final parity or performance evidence"
    );
  });
});

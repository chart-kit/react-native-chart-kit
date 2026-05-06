import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import {
  chartKitFreeBaselineSurface,
  chartKitProCandidateCapabilities,
  chartKitProCandidateSurface,
  chartKitProReactNativePreviewExports
} from "../src";

const collectNamedValueExports = (source: string) => {
  const exports = new Set<string>();
  const exportBlockPattern = /export\s+\{(?<body>[\s\S]*?)\}\s+from/g;
  let match: RegExpExecArray | null;

  while ((match = exportBlockPattern.exec(source)) !== null) {
    const body = match.groups?.body ?? "";

    for (const item of body.split(",")) {
      const exportName = item
        .trim()
        .split(/\s+as\s+/)[0]
        ?.trim();

      if (exportName) {
        exports.add(exportName);
      }
    }
  }

  return [...exports].sort();
};

const readSource = async (relativePath: string) =>
  readFile(new URL(relativePath, import.meta.url), "utf8");

describe("Chart Kit Pro package surface boundary", () => {
  it("keeps the modern React Native barrel aligned with the free baseline registry", async () => {
    const rootExports = collectNamedValueExports(
      await readSource("../../react-native/src/index.ts")
    );
    const freeBaselineExports = chartKitFreeBaselineSurface
      .map((surface) => surface.exportName)
      .sort();

    expect(rootExports).toEqual(freeBaselineExports);
  });

  it("keeps Pro-candidate-only exports out of the modern free barrel", async () => {
    const rootExports = new Set(
      collectNamedValueExports(
        await readSource("../../react-native/src/index.ts")
      )
    );
    const leakedExports = chartKitProCandidateSurface
      .map((surface) => surface.exportName)
      .filter((exportName) => rootExports.has(exportName));

    expect(leakedExports).toEqual([]);
  });

  it("keeps the pro-preview barrel aligned with the injected preview registry", async () => {
    const proPreviewExports = collectNamedValueExports(
      await readSource("../../react-native/src/proPreview.ts")
    );

    expect(proPreviewExports).toEqual(
      [...chartKitProReactNativePreviewExports].sort()
    );
  });

  it("keeps all Pro-candidate surfaces and capability carriers injectable", () => {
    const proPreviewExports = new Set<string>(
      chartKitProReactNativePreviewExports
    );

    for (const surface of chartKitProCandidateSurface) {
      expect(proPreviewExports.has(surface.exportName)).toBe(true);
    }

    for (const capability of chartKitProCandidateCapabilities) {
      expect(proPreviewExports.has(capability.exportName)).toBe(true);
    }
  });
});

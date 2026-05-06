import { describe, expect, it } from "vitest";

import {
  buildSkiaRendererPreviewSource,
  injectSkiaRendererIntoAppSource,
  injectSkiaRendererIntoMetroSource,
  parseSkiaShowcasePreviewArgs
} from "./prepare-skia-showcase-renderer-preview.mjs";

describe("Skia showcase renderer preview preparer", () => {
  it("parses safe defaults and custom app directories", () => {
    expect(parseSkiaShowcasePreviewArgs([])).toEqual({
      appDir: "apps/expo-showcase"
    });
    expect(
      parseSkiaShowcasePreviewArgs(["--app-dir", "tmp/showcase"])
    ).toEqual({
      appDir: "tmp/showcase"
    });
  });

  it("rejects missing values and unknown arguments", () => {
    expect(() => parseSkiaShowcasePreviewArgs(["--app-dir"])).toThrow(
      "--app-dir requires a value"
    );
    expect(() => parseSkiaShowcasePreviewArgs(["--bad"])).toThrow(
      "Unknown argument: --bad"
    );
  });

  it("generates a temp-only renderer using real Skia primitives", () => {
    const source = buildSkiaRendererPreviewSource();

    expect(source).toContain("@shopify/react-native-skia");
    expect(source).toContain("@chart-kit/skia-renderer");
    expect(source).toContain("matchFont");
    expect(source).toContain("RoundedRect");
    expect(source).toContain("createSkiaRenderer");
  });

  it("injects the Skia renderer into every showcase provider", () => {
    const source = [
      'import { styles } from "./src/appStyles";',
      "",
      "<ChartKitProvider",
      "            mode={themeMode}",
      "            preset={chartPreset}",
      ">",
      "</ChartKitProvider>",
      "<ChartKitProvider",
      "            mode={themeMode}",
      "            preset={chartPreset}",
      ">",
      "</ChartKitProvider>"
    ].join("\n");
    const injected = injectSkiaRendererIntoAppSource(source);

    expect(injected).toContain(
      'import { skiaPreviewRenderer } from "./src/skiaPreviewRenderer";'
    );
    expect(
      injected.match(/renderer=\{skiaPreviewRenderer\}/g) ?? []
    ).toHaveLength(2);
    expect(injectSkiaRendererIntoAppSource(injected)).toBe(injected);
  });

  it("adds the Skia renderer source alias to Metro", () => {
    const source = [
      "config.resolver.extraNodeModules = {",
      '  "@chart-kit/react-native/pro-preview": path.resolve(',
      "    repoRoot,",
      '    "packages/react-native/src/proPreview.ts"',
      "  ),",
      '  "react-native-chart-kit": path.resolve(repoRoot, "src/index.ts")',
      "};"
    ].join("\n");
    const injected = injectSkiaRendererIntoMetroSource(source);

    expect(injected).toContain('"@chart-kit/skia-renderer"');
    expect(injectSkiaRendererIntoMetroSource(injected)).toBe(injected);
  });
});

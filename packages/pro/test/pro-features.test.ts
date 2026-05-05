import { describe, expect, it } from "vitest";

import {
  chartKitFreeBaselineSurface,
  chartKitProCandidateCapabilities,
  chartKitProCandidateSurface,
  chartKitProReactNativePreviewExports,
  chartKitProPreviewFeatures,
  createChartKitProReactNativePreview,
  createChartKitProFeatureRegistry,
  getChartKitProCandidateCapabilities,
  getChartKitSurfaceExport,
  getChartKitProFeature
} from "../src";

describe("Chart Kit Pro preview boundary", () => {
  it("exposes planned and preview features without license gating", () => {
    expect(createChartKitProFeatureRegistry()).toMatchObject({
      packageName: "@chart-kit/pro",
      status: "preview"
    });
    expect(chartKitProPreviewFeatures.map((feature) => feature.id)).toEqual([
      "pro-layout-engine",
      "pro-interactions",
      "pro-chart-types",
      "pro-export",
      "pro-theme-templates",
      "pro-performance",
      "skia-renderer",
      "accessibility-reports"
    ]);
  });

  it("looks up features by id", () => {
    expect(getChartKitProFeature("pro-chart-types")).toMatchObject({
      category: "charts",
      includes: expect.arrayContaining([
        "candlestick and OHLC",
        "combo bar plus line",
        "dual-axis charts"
      ]),
      status: "preview"
    });
    expect(getChartKitProFeature("missing")).toBeUndefined();
  });

  it("documents the monetizable scope and free guardrail for each feature", () => {
    for (const feature of chartKitProPreviewFeatures) {
      expect(feature.commercialRationale.length).toBeGreaterThan(20);
      expect(feature.freeGuardrail.length).toBeGreaterThan(20);
      expect(feature.includes.length).toBeGreaterThan(0);
    }

    expect(getChartKitProFeature("pro-layout-engine")).toMatchObject({
      includes: expect.arrayContaining([
        "smart Y-axis width measurement",
        "auto tick density",
        "currency, percent, and compact formatting"
      ])
    });
    expect(getChartKitProFeature("pro-interactions")).toMatchObject({
      includes: expect.arrayContaining([
        "tooltips",
        "scrubbing",
        "zoom and pan",
        "scrollable charts with fixed Y-axis"
      ])
    });
    expect(getChartKitProFeature("pro-export")).toMatchObject({
      includes: expect.arrayContaining([
        "export chart as PNG",
        "share sheet integration",
        "snapshot API"
      ])
    });
  });

  it("classifies free baseline and pro-candidate public surfaces", () => {
    expect(
      chartKitFreeBaselineSurface.map((surface) => surface.exportName)
    ).toContain("LineChart");
    expect(
      chartKitFreeBaselineSurface.map((surface) => surface.exportName)
    ).toContain("BarChart");
    expect(
      chartKitProCandidateSurface.map((surface) => surface.exportName)
    ).toEqual([
      "CandlestickChart",
      "CombinedChart",
      "ChartSelectionProvider",
      "useChartSelection",
      "useDismissChartSelection"
    ]);
    expect(getChartKitSurfaceExport("CombinedChart")).toMatchObject({
      packageName: "@chart-kit/react-native/pro-preview",
      status: "pro-candidate"
    });
  });

  it("maps pro-candidate capabilities to current preview exports", () => {
    const featureIds = new Set(
      chartKitProPreviewFeatures.map((feature) => feature.id)
    );

    for (const capability of chartKitProCandidateCapabilities) {
      expect(featureIds.has(capability.featureId)).toBe(true);
    }

    expect(
      chartKitProCandidateCapabilities.map(
        (capability) => capability.exportName
      )
    ).toEqual([
      "LineChart",
      "BarChart",
      "CombinedChart",
      "CandlestickChart",
      "DonutChart"
    ]);
    expect(getChartKitProCandidateCapabilities("LineChart")[0]).toMatchObject({
      featureId: "pro-interactions"
    });
  });

  it("creates an injected React Native preview surface without static imports", () => {
    const missingExports: string[] = [];
    const preview = createChartKitProReactNativePreview(
      {
        BarChart: "BarChart",
        CandlestickChart: "CandlestickChart",
        CombinedChart: "CombinedChart",
        DonutChart: "DonutChart",
        LineChart: "LineChart"
      },
      {
        onMissingExport: (exportName) => {
          missingExports.push(exportName);
        }
      }
    );

    expect(chartKitProReactNativePreviewExports).toEqual([
      "BarChart",
      "CandlestickChart",
      "ChartSelectionProvider",
      "CombinedChart",
      "DonutChart",
      "LineChart",
      "useChartSelection",
      "useDismissChartSelection"
    ]);
    expect(preview).toEqual({
      BarChart: "BarChart",
      CandlestickChart: "CandlestickChart",
      CombinedChart: "CombinedChart",
      DonutChart: "DonutChart",
      LineChart: "LineChart"
    });
    expect(missingExports).toEqual([
      "ChartSelectionProvider",
      "useChartSelection",
      "useDismissChartSelection"
    ]);
  });
});

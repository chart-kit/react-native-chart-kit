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
      status: "preview"
    });
    expect(getChartKitProFeature("missing")).toBeUndefined();
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
      status: "pro-candidate"
    });
  });

  it("maps pro-candidate capabilities to current preview exports", () => {
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
        CandlestickChart: "CandlestickChart",
        CombinedChart: "CombinedChart",
        LineChart: "LineChart"
      },
      {
        onMissingExport: (exportName) => {
          missingExports.push(exportName);
        }
      }
    );

    expect(chartKitProReactNativePreviewExports).toEqual([
      "CandlestickChart",
      "ChartSelectionProvider",
      "CombinedChart",
      "useChartSelection",
      "useDismissChartSelection"
    ]);
    expect(preview).toEqual({
      CandlestickChart: "CandlestickChart",
      CombinedChart: "CombinedChart"
    });
    expect(missingExports).toEqual([
      "ChartSelectionProvider",
      "useChartSelection",
      "useDismissChartSelection"
    ]);
  });
});

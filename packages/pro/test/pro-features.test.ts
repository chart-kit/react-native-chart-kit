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

  it("locks the owner-proposed Pro monetization buckets into the registry", () => {
    expect(getChartKitProFeature("pro-layout-engine")).toMatchObject({
      includes: [
        "smart Y-axis width measurement",
        "no clipped labels under dense data",
        "multiline, rotated, and ellipsized X labels",
        "auto tick density",
        "custom ticks",
        "axis titles",
        "fixed min/max ranges",
        "nice numeric formatting",
        "currency, percent, and compact formatting",
        "true full-width plotting",
        "responsive chart area",
        "safe-area and small-screen handling"
      ]
    });
    expect(getChartKitProFeature("pro-interactions")).toMatchObject({
      includes: [
        "tooltips",
        "crosshair",
        "scrubbing",
        "nearest-point selection",
        "click and press handlers",
        "long press",
        "highlight selected series",
        "shared tooltip across multiple series",
        "zoom and pan",
        "scrollable charts with fixed Y-axis",
        "brush and range selection"
      ]
    });
    expect(getChartKitProFeature("pro-chart-types")).toMatchObject({
      includes: [
        "candlestick and OHLC",
        "financial line chart presets",
        "combo bar plus line",
        "dual-axis charts",
        "grouped bars",
        "horizontal stacked bars",
        "advanced donut",
        "gauge",
        "radar",
        "treemap",
        "advanced contribution graph and calendar heatmap"
      ]
    });
    expect(getChartKitProFeature("pro-export")).toMatchObject({
      includes: [
        "export chart as PNG",
        "export chart as SVG where feasible",
        "share sheet integration",
        "snapshot API",
        "server-side or headless chart image generation"
      ]
    });
    expect(getChartKitProFeature("pro-theme-templates")).toMatchObject({
      includes: [
        "beautiful presets",
        "Apple Health style",
        "Linear-style",
        "fintech dark mode",
        "analytics dashboard style",
        "minimal SaaS style",
        "fitness app style",
        "crypto style",
        "accessibility-safe palettes",
        "animated transitions"
      ]
    });
    expect(getChartKitProFeature("pro-performance")).toMatchObject({
      includes: [
        "large dataset mode",
        "decimation and downsampling",
        "virtualized or scrolling chart rendering",
        "memoized path generation",
        "optional Skia renderer",
        "benchmarks in docs"
      ]
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
      "ChartSelectionProvider",
      "CombinedChart",
      "getCandlestickChartAccessibilitySummary",
      "getCandlestickChartDataTable",
      "getCandlestickChartFinancialNarrative",
      "getCandlestickEmergencyClosureSessions",
      "getCombinedChartAccessibilitySummary",
      "getCombinedChartDataTable",
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
      "getCandlestickChartAccessibilitySummary",
      "getCandlestickChartDataTable",
      "getCandlestickChartFinancialNarrative",
      "getCandlestickEmergencyClosureSessions",
      "getCombinedChartAccessibilitySummary",
      "getCombinedChartDataTable",
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
      "getCandlestickChartAccessibilitySummary",
      "getCandlestickChartDataTable",
      "getCandlestickChartFinancialNarrative",
      "getCandlestickEmergencyClosureSessions",
      "getCombinedChartAccessibilitySummary",
      "getCombinedChartDataTable",
      "useChartSelection",
      "useDismissChartSelection"
    ]);
  });
});

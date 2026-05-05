import { describe, expect, it } from "vitest";

import {
  chartKitProPreviewFeatures,
  createChartKitProFeatureRegistry,
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
});

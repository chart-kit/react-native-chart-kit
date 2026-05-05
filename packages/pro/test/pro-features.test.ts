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
      "skia-renderer",
      "large-data",
      "advanced-interactions",
      "financial-charts",
      "accessibility-reports",
      "design-system-tokens",
      "chart-export"
    ]);
  });

  it("looks up features by id", () => {
    expect(getChartKitProFeature("financial-charts")).toMatchObject({
      category: "finance",
      status: "preview"
    });
    expect(getChartKitProFeature("missing")).toBeUndefined();
  });
});

import { describe, expect, it } from "vitest";

import {
  buildLineChartYAxisLabels,
  defaultLineChartAxisLabelAnimationDuration,
  resolveLineChartAxisLabelAnimationConfig,
  resolveLineChartYAxisLabelSizes
} from "../src/charts/line/axisLabels";

describe("LineChart axis labels", () => {
  it("keeps measured y-axis label widths by default", () => {
    const sizes = [
      { width: 18, height: 12 },
      { width: 30, height: 12 }
    ];

    expect(resolveLineChartYAxisLabelSizes({ sizes })).toEqual(sizes);
  });

  it("reserves a fixed y-axis label width when configured", () => {
    expect(
      resolveLineChartYAxisLabelSizes({
        sizes: [
          { width: 18, height: 12 },
          { width: 42, height: 12 }
        ],
        width: 56
      })
    ).toEqual([
      { width: 56, height: 12 },
      { width: 56, height: 12 }
    ]);
  });

  it("reserves stable y-axis width from full-data label sizes", () => {
    expect(
      resolveLineChartYAxisLabelSizes({
        sizes: [
          { width: 18, height: 12 },
          { width: 30, height: 12 }
        ],
        stableSizes: [
          { width: 24, height: 12 },
          { width: 72, height: 12 }
        ],
        width: "stable"
      })
    ).toEqual([
      { width: 72, height: 12 },
      { width: 72, height: 12 }
    ]);
  });

  it("keeps automatic y-axis widths when configured as auto", () => {
    const sizes = [
      { width: 18, height: 12 },
      { width: 30, height: 12 }
    ];

    expect(resolveLineChartYAxisLabelSizes({ sizes, width: "auto" })).toEqual(
      sizes
    );
  });

  it("builds positioned y-axis label models", () => {
    expect(
      buildLineChartYAxisLabels({
        ticks: [0, 50, 100],
        yScale: {
          domain: [0, 100],
          range: [100, 0],
          scale: (value) => 100 - value,
          invert: (value) => 100 - value
        },
        labelOffset: 4,
        formatYLabel: (value) => `$${value}`
      })
    ).toEqual([
      { key: "0:$0", text: "$0", y: 104, opacity: 1 },
      { key: "50:$50", text: "$50", y: 54, opacity: 1 },
      { key: "100:$100", text: "$100", y: 4, opacity: 1 }
    ]);
  });

  it("resolves y-axis label animation config as opt-in", () => {
    expect(resolveLineChartAxisLabelAnimationConfig()).toEqual({
      enabled: false,
      duration: 0,
      strategy: "crossfade"
    });
    expect(resolveLineChartAxisLabelAnimationConfig(true)).toEqual({
      enabled: true,
      duration: defaultLineChartAxisLabelAnimationDuration,
      strategy: "crossfade"
    });
    expect(resolveLineChartAxisLabelAnimationConfig({ duration: 220 })).toEqual(
      {
        enabled: true,
        duration: 220,
        strategy: "crossfade"
      }
    );
  });
});

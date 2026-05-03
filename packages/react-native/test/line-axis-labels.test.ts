import { describe, expect, it } from "vitest";

import { resolveLineChartYAxisLabelSizes } from "../src/charts/line/axisLabels";

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
});

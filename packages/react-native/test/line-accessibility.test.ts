import { describe, expect, it } from "vitest";

import {
  getLineChartAccessibilitySummary,
  getLineChartDataTable
} from "../src/charts/line/accessibility";

const revenueData = [
  { month: "Jan", revenue: 12000, target: 10000 },
  { month: "Feb", revenue: null, target: 14000 },
  { month: "Mar", revenue: 18000, target: 16000 }
];

describe("LineChart accessibility helpers", () => {
  it("builds a screen-reader summary for a single-series line chart", () => {
    expect(
      getLineChartAccessibilitySummary({
        data: revenueData,
        xKey: "month",
        yKey: "revenue",
        formatYLabel: (value) => `$${value.toLocaleString("en-US")}`
      })
    ).toBe(
      "revenue line chart with 3 points. revenue ranges from $12,000 in Jan to $18,000 in Mar. Current value is $18,000."
    );
  });

  it("summarizes multiple series independently", () => {
    expect(
      getLineChartAccessibilitySummary({
        data: revenueData,
        xKey: "month",
        series: [
          { yKey: "revenue", label: "Revenue" },
          { yKey: "target", label: "Target" }
        ],
        formatYLabel: (value) => `$${value / 1000}k`
      })
    ).toBe(
      "Line chart with 2 series and 3 points. Revenue ranges from $12k in Jan to $18k in Mar. Current value is $18k. Target ranges from $10k in Jan to $16k in Mar. Current value is $16k."
    );
  });

  it("returns a data table with raw values and formatted values", () => {
    expect(
      getLineChartDataTable({
        data: revenueData,
        xKey: "month",
        yKeys: ["revenue", "target"],
        formatYLabel: (value) => `${value}`
      })
    ).toEqual({
      columns: [
        { key: "revenue", label: "revenue" },
        { key: "target", label: "target" }
      ],
      rows: [
        {
          formattedValues: { revenue: "12000", target: "10000" },
          index: 0,
          raw: revenueData[0],
          values: { revenue: 12000, target: 10000 },
          x: "Jan",
          xLabel: "Jan"
        },
        {
          formattedValues: { revenue: "No value", target: "14000" },
          index: 1,
          raw: revenueData[1],
          values: { revenue: null, target: 14000 },
          x: "Feb",
          xLabel: "Feb"
        },
        {
          formattedValues: { revenue: "18000", target: "16000" },
          index: 2,
          raw: revenueData[2],
          values: { revenue: 18000, target: 16000 },
          x: "Mar",
          xLabel: "Mar"
        }
      ]
    });
  });
});

import { describe, expect, it } from "vitest";

import {
  getBarChartAccessibilitySummary,
  getBarChartDataTable
} from "../../../src/charts/bar/accessibility";

const rows = [
  { month: "Jan", organic: 42, paid: 18 },
  { month: "Feb", organic: 12, paid: null },
  { month: "Mar", organic: 64, paid: 30 }
];

describe("BarChart accessibility helpers", () => {
  it("builds a table with formatted multi-series values", () => {
    const table = getBarChartDataTable({
      data: rows,
      formatXLabel: (value) => `FY ${value}`,
      formatYLabel: (value) => `$${value}`,
      series: [
        { label: "Organic", yKey: "organic" },
        { label: "Paid", yKey: "paid" }
      ],
      xKey: "month"
    });

    expect(table.columns).toEqual([
      { key: "organic", label: "Organic" },
      { key: "paid", label: "Paid" }
    ]);
    expect(table.rows[1]).toMatchObject({
      formattedValues: {
        organic: "$12",
        paid: "No value"
      },
      values: {
        organic: 12,
        paid: null
      },
      xLabel: "FY Feb"
    });
  });

  it("summarizes highest and lowest values", () => {
    expect(
      getBarChartAccessibilitySummary({
        data: rows,
        formatYLabel: (value) => `${value}k`,
        xKey: "month",
        yKeys: ["organic", "paid"]
      })
    ).toBe(
      "Bar chart with 2 series across 3 categories. Highest value is organic in Mar at 64k. Lowest value is organic in Feb at 12k."
    );
  });

  it("handles empty and undefined-value inputs", () => {
    expect(
      getBarChartAccessibilitySummary({
        data: [],
        xKey: "month",
        yKey: "organic"
      })
    ).toBe("Bar chart with no data.");
    expect(
      getBarChartAccessibilitySummary({
        data: [{ month: "Jan", organic: "n/a" }],
        xKey: "month",
        yKey: "organic"
      })
    ).toBe("Bar chart with 1 category and no defined values.");
  });
});

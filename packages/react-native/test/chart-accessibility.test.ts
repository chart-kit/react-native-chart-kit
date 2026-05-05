import { describe, expect, it } from "vitest";

import {
  getBarChartAccessibilitySummary,
  getBarChartDataTable
} from "../src/charts/bar/accessibility";
import {
  getContributionGraphAccessibilitySummary,
  getContributionGraphDataTable
} from "../src/charts/contribution/accessibility";
import {
  getPieChartAccessibilitySummary,
  getPieChartDataTable
} from "../src/charts/pie/accessibility";
import {
  getProgressChartAccessibilitySummary,
  getProgressChartDataTable
} from "../src/charts/progress/accessibility";

const monthlyChannels = [
  { month: "Jan", paid: 22, organic: 12 },
  { month: "Feb", paid: 34, organic: 18 },
  { month: "Mar", paid: 45, organic: 27 }
];

describe("chart accessibility helpers", () => {
  it("builds a bar chart table and summary for grouped series", () => {
    expect(
      getBarChartAccessibilitySummary({
        data: monthlyChannels,
        xKey: "month",
        series: [
          { yKey: "paid", label: "Paid" },
          { yKey: "organic", label: "Organic" }
        ],
        formatYLabel: (value) => `$${value}`
      })
    ).toBe(
      "Bar chart with 2 series across 3 categories. Highest value is Paid in Mar at $45. Lowest value is Organic in Jan at $12."
    );

    expect(
      getBarChartDataTable({
        data: monthlyChannels,
        xKey: "month",
        yKeys: ["paid", "organic"]
      }).rows[1]
    ).toMatchObject({
      formattedValues: { paid: "34", organic: "18" },
      values: { paid: 34, organic: 18 },
      x: "Feb",
      xLabel: "Feb"
    });
  });

  it("builds pie chart table rows and largest-slice summary", () => {
    const data = [
      { channel: "Organic", value: 42, color: "#0f766e" },
      { channel: "Paid", value: 24, color: "#2563eb" },
      { channel: "Partners", value: 0, color: "#f59e0b" }
    ];

    expect(
      getPieChartAccessibilitySummary({
        data,
        labelKey: "channel",
        valueKey: "value",
        formatValue: (value) => `${value} leads`
      })
    ).toBe(
      "Pie chart with 3 slices. Total 66 leads. Largest slice is Organic at 64%."
    );

    expect(
      getPieChartDataTable({
        data,
        labelKey: "channel",
        valueKey: "value"
      }).rows[0]
    ).toMatchObject({
      color: "#0f766e",
      label: "Organic",
      percentageLabel: "64%",
      value: 42
    });
  });

  it("builds progress chart rows with clamped formatted values", () => {
    const data = [
      { label: "Profile", value: 0.25 },
      { label: "Billing", value: 1.4 },
      { label: "Security", value: null }
    ];

    expect(
      getProgressChartAccessibilitySummary({
        data,
        formatPercentage: (value) => `${Math.round(value * 100)}%`
      })
    ).toBe(
      "Progress chart with 3 rings. Average progress 63%. Current ring Billing is 100%."
    );

    expect(
      getProgressChartDataTable({
        data,
        formatPercentage: (value) => `${Math.round(value * 100)}%`
      }).rows
    ).toMatchObject([
      { formattedValue: "25%", label: "Profile", value: 0.25 },
      { formattedValue: "100%", label: "Billing", value: 1.4 },
      { formattedValue: "No value", label: "Security", value: null }
    ]);
  });

  it("builds contribution graph table rows across empty days", () => {
    const values = [
      { date: "2026-01-01", count: 2 },
      { date: "2026-01-04", count: 5 }
    ];

    expect(
      getContributionGraphAccessibilitySummary({
        endDate: "2026-01-04",
        formatValue: (value) => `${value} sessions`,
        numDays: 4,
        values
      })
    ).toBe(
      "Contribution graph with 4 days. 2 days with activity. Highest value is 5 sessions on 2026-01-04. Lowest value is 0 sessions on 2026-01-02."
    );

    expect(
      getContributionGraphDataTable({
        endDate: "2026-01-04",
        numDays: 4,
        values
      }).rows.map((row) => [row.dateLabel, row.value])
    ).toEqual([
      ["2026-01-01", 2],
      ["2026-01-02", 0],
      ["2026-01-03", 0],
      ["2026-01-04", 5]
    ]);
  });
});

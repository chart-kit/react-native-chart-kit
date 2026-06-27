import { describe, expect, it } from "vitest";

import {
  getPieChartAccessibilitySummary,
  getPieChartDataTable
} from "../../../src/charts/pie/accessibility";

describe("PieChart accessibility helpers", () => {
  it("builds rows with labels, colors, percentages, and invalid values", () => {
    const data = [
      { color: "#2563eb", label: "Organic", value: 60 },
      { label: "Paid", value: 40 },
      { label: "", value: -5 }
    ];
    const table = getPieChartDataTable({
      colors: ["#111827", "#f97316", "#94a3b8"],
      data,
      formatPercentage: (value) => `${Math.round(value * 1000) / 10}%`,
      formatValue: (value) => `${value} users`,
      labelKey: "label",
      valueKey: "value"
    });

    expect(table.total).toBe(100);
    expect(table.rows).toMatchObject([
      {
        color: "#2563eb",
        formattedValue: "60 users",
        label: "Organic",
        percentage: 0.6,
        percentageLabel: "60%",
        value: 60
      },
      {
        color: "#f97316",
        formattedValue: "40 users",
        label: "Paid",
        percentage: 0.4,
        value: 40
      },
      {
        color: "#94a3b8",
        formattedValue: "No value",
        label: "Slice 3",
        percentage: 0,
        value: null
      }
    ]);
  });

  it("summarizes the total and largest slice", () => {
    expect(
      getPieChartAccessibilitySummary({
        data: [
          { name: "Organic", value: 60 },
          { name: "Paid", value: 40 }
        ],
        formatValue: (value) => `${value} users`,
        valueKey: "value"
      })
    ).toBe(
      "Pie chart with 2 slices. Total 100 users. Largest slice is Organic at 60%."
    );
  });

  it("handles charts without defined slices", () => {
    expect(
      getPieChartAccessibilitySummary({
        data: [{ name: "Organic", value: Number.NaN }],
        valueKey: "value"
      })
    ).toBe("Pie chart with no defined slices.");
  });
});

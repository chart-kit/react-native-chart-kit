import { describe, expect, it } from "vitest";

import {
  getProgressChartAccessibilitySummary,
  getProgressChartDataTable
} from "../../../src/charts/progress/accessibility";

describe("ProgressChart accessibility helpers", () => {
  it("builds rows from object data with clamped display values", () => {
    const data = [
      { color: "#ef4444", label: "Move", value: 1.25 },
      { label: "Exercise", value: 0.5 },
      { label: "", value: "n/a" }
    ];
    const table = getProgressChartDataTable({
      colors: ["#111827", "#22c55e", "#94a3b8"],
      data,
      formatPercentage: (value) => `${Math.round(value * 100)} percent`
    });

    expect(table.average).toBe(0.75);
    expect(table.rows).toMatchObject([
      {
        color: "#ef4444",
        formattedValue: "100 percent",
        label: "Move",
        raw: data[0],
        value: 1.25
      },
      {
        color: "#22c55e",
        formattedValue: "50 percent",
        label: "Exercise",
        value: 0.5
      },
      {
        color: "#94a3b8",
        formattedValue: "No value",
        label: "Ring 3",
        value: null
      }
    ]);
  });

  it("builds rows from legacy progress data", () => {
    expect(
      getProgressChartDataTable({
        data: {
          colors: ["#2563eb"],
          data: [0.3, 0.7],
          labels: ["Swim", "Bike"]
        }
      }).rows
    ).toMatchObject([
      { color: "#2563eb", label: "Swim", value: 0.3 },
      { label: "Bike", value: 0.7 }
    ]);
  });

  it("summarizes average and current ring state", () => {
    expect(
      getProgressChartAccessibilitySummary({
        data: [0.25, 0.75],
        formatPercentage: (value) => `${Math.round(value * 100)}%`,
        labels: ["Plan", "Done"]
      })
    ).toBe(
      "Progress chart with 2 rings. Average progress 50%. Current ring Done is 75%."
    );
  });

  it("handles empty and undefined-value charts", () => {
    expect(getProgressChartAccessibilitySummary({ data: [] })).toBe(
      "Progress chart with no rings."
    );
    expect(
      getProgressChartAccessibilitySummary({
        data: [{ label: "Move", value: "n/a" }]
      })
    ).toBe("Progress chart with 1 rings and no defined values.");
  });
});

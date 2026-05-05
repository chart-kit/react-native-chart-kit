import { describe, expect, it } from "vitest";

import {
  buildCombinedChartSelectEvent,
  getNearestCombinedChartInteractionIndex,
  getSelectedCombinedSeries
} from "../src/charts/combined/interaction";
import { buildCombinedChartModel } from "../src/charts/combined/model";

const chartKitTheme = {
  mode: "light" as const,
  preset: "default" as const,
  presets: {},
  theme: undefined
};

const rows = [
  { month: "Jan", revenue: 118, margin: 18 },
  { month: "Feb", revenue: 146, margin: 21 },
  { month: "Mar", revenue: 182, margin: 23 }
];

const buildModel = () =>
  buildCombinedChartModel({
    bars: [{ yKey: "revenue", label: "Revenue" }],
    chartKitTheme,
    data: rows,
    formatLeftYLabel: (value) => `$${value}k`,
    formatRightYLabel: (value) => `${value}%`,
    height: 260,
    leftYDomain: [0, 200],
    lines: [{ yKey: "margin", label: "Margin" }],
    rightYDomain: [0, 40],
    width: 360,
    xKey: "month"
  });

describe("CombinedChart interaction helpers", () => {
  it("selects the nearest x bucket", () => {
    const model = buildModel();

    expect(
      getNearestCombinedChartInteractionIndex({
        locationX: model.interactionPoints[1]!.x + 2,
        points: model.interactionPoints
      })
    ).toBe(1);
  });

  it("builds shared tooltip series across bars and lines", () => {
    const model = buildModel();
    const selectedSeries = getSelectedCombinedSeries({
      model,
      selectedIndex: 1
    });

    expect(selectedSeries.map((item) => item.label)).toEqual([
      "Revenue",
      "Margin"
    ]);
    expect(selectedSeries.map((item) => item.formattedValue)).toEqual([
      "$146k",
      "21%"
    ]);
    expect(selectedSeries.map((item) => item.point.kind)).toEqual([
      "bar",
      "line"
    ]);
  });

  it("returns a combined select event with raw row data", () => {
    const model = buildModel();
    const selectedSeries = getSelectedCombinedSeries({
      model,
      selectedIndex: 2
    });

    expect(
      buildCombinedChartSelectEvent({
        interactionPoints: model.interactionPoints,
        selectedIndex: 2,
        selectedSeries
      })
    ).toMatchObject({
      index: 2,
      raw: rows[2],
      series: [
        { formattedValue: "$182k", key: "bar-revenue" },
        { formattedValue: "23%", key: "line-margin" }
      ],
      xLabel: "Mar"
    });
  });
});

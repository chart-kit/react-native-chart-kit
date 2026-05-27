import { describe, expect, it } from "vitest";

import { buildBarChartModel } from "../src/charts/bar/model";
import { buildStackedBarChartCompatProps } from "../src/charts/bar/stackedCompat";

const chartKitTheme = {
  mode: "light" as const,
  preset: "default" as const,
  presets: {},
  theme: undefined
};

describe("StackedBarChart compatibility facade", () => {
  it("maps legacy stacked bar data into modern stacked BarChart props", () => {
    const { barChartProps } = buildStackedBarChartCompatProps({
      chartConfig: {
        backgroundGradientFrom: "#ffffff",
        backgroundGradientTo: "#f8fafc",
        barPercentage: 0.62,
        barRadius: 6,
        decimalPlaces: 0,
        labelColor: () => "#334155",
        propsForBackgroundLines: {
          stroke: "#cbd5e1"
        }
      },
      data: {
        labels: ["Q1", "Q2"],
        legend: ["iOS", "Android"],
        data: [
          [42, 28],
          [48, 36]
        ],
        barColors: ["#2563eb", "#0891b2"]
      },
      height: 240,
      hideLegend: false,
      segments: 4,
      width: 360,
      yAxisSuffix: "k"
    });

    expect(barChartProps.mode).toBe("stacked");
    expect(barChartProps.barRadius).toBe(6);
    expect(barChartProps.barWidthRatio).toBe(0.62);
    expect(barChartProps.legend).toBe(true);
    expect(barChartProps.showValuesOnTopOfBars).toBe(false);
    expect(barChartProps.yTickCount).toBe(5);
    expect(barChartProps.data).toEqual([
      { label: "Q1", series0: 42, series1: 28 },
      { label: "Q2", series0: 48, series1: 36 }
    ]);
    expect(barChartProps.series).toEqual([
      { color: "#2563eb", key: "series0", label: "iOS", yKey: "series0" },
      {
        color: "#0891b2",
        key: "series1",
        label: "Android",
        yKey: "series1"
      }
    ]);
    expect(barChartProps.formatYLabel?.(42)).toBe("42k");
  });

  it("renders through the modern bar model with percentile and hidden labels", () => {
    const { barChartProps } = buildStackedBarChartCompatProps({
      chartConfig: {
        backgroundColor: "#ffffff",
        color: (_opacity, index = 0) => (index === 0 ? "#111827" : "#64748b")
      },
      data: {
        labels: ["Free", "Team"],
        legend: ["Active", "Paused"],
        data: [
          [70, 30],
          [64, 36]
        ],
        barColors: []
      },
      height: 220,
      hideLegend: true,
      percentile: true,
      width: 320,
      withHorizontalLabels: false,
      withVerticalLabels: false
    });

    const model = buildBarChartModel({
      ...barChartProps,
      chartKitTheme
    });

    expect(model.mode).toBe("stacked100");
    expect(model.showXAxisLabels).toBe(false);
    expect(model.showYAxisLabels).toBe(false);
    expect(model.legendItems).toHaveLength(0);
    expect(model.bars[0]).toMatchObject({
      color: "#111827",
      value: 70
    });
    expect(model.bars[1]).toMatchObject({
      color: "#64748b",
      value: 30
    });
    expect(model.yTicks[0]).toBe(0);
    expect(model.yTicks[model.yTicks.length - 1]).toBe(100);
  });
});

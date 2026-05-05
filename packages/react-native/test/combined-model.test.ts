import { describe, expect, it } from "vitest";

import { buildCombinedChartModel } from "../src/charts/combined/model";

const chartKitTheme = {
  mode: "light" as const,
  preset: "default" as const,
  presets: {},
  theme: undefined
};

const revenueData = [
  { month: "Jan", revenue: 120, target: 18 },
  { month: "Feb", revenue: 160, target: 22 },
  { month: "Mar", revenue: 210, target: 24 },
  { month: "Apr", revenue: 260, target: 26 }
];

describe("CombinedChart model", () => {
  it("builds bars and lines on independent default axes", () => {
    const model = buildCombinedChartModel({
      chartKitTheme,
      data: revenueData,
      xKey: "month",
      bars: [{ yKey: "revenue", label: "Revenue" }],
      lines: [{ yKey: "target", label: "Margin" }],
      width: 360,
      height: 260
    });

    expect(model.bars).toHaveLength(4);
    expect(model.lines).toHaveLength(1);
    expect(model.legendItems.map((item) => item.label)).toEqual([
      "Revenue",
      "Margin"
    ]);
    expect(model.leftDomain[0]).toBe(0);
    expect(model.leftDomain[1]).toBeGreaterThanOrEqual(260);
    expect(model.rightDomain[0]).toBeGreaterThan(0);
    expect(model.rightDomain[1]).toBeLessThan(model.leftDomain[1]);
    expect(model.lines[0]?.geometry.path).toContain("L");
  });

  it("supports explicit domains and right-side axis labels", () => {
    const model = buildCombinedChartModel({
      chartKitTheme,
      data: revenueData,
      xKey: "month",
      bars: [{ yKey: "revenue", label: "Revenue" }],
      lines: [{ yKey: "target", label: "Margin", strokeDasharray: [4, 4] }],
      leftYDomain: [0, 300],
      rightYDomain: [0, 40],
      width: 360,
      height: 260,
      formatLeftYLabel: (value) => `$${value}k`,
      formatRightYLabel: (value) => `${value}%`
    });

    expect(model.leftDomain).toEqual([0, 300]);
    expect(model.rightDomain).toEqual([0, 40]);
    expect(model.yLabels.some((label) => label.text === "$300k")).toBe(true);
    expect(model.yLabels.some((label) => label.text === "40%")).toBe(true);
    expect(model.legendItems[1]).toMatchObject({
      kind: "line",
      strokeDasharray: [4, 4]
    });
  });

  it("can render stacked bars below an independent line", () => {
    const model = buildCombinedChartModel({
      chartKitTheme,
      data: [
        { month: "Jan", ios: 40, android: 60, conversion: 12 },
        { month: "Feb", ios: 55, android: 70, conversion: 14 }
      ],
      xKey: "month",
      bars: [
        { yKey: "ios", label: "iOS" },
        { yKey: "android", label: "Android" }
      ],
      lines: [{ yKey: "conversion", label: "Conversion" }],
      barMode: "stacked",
      width: 360,
      height: 260
    });

    expect(model.bars.map((bar) => bar.stackStart)).toEqual([0, 40, 0, 55]);
    expect(model.lines[0]?.label).toBe("Conversion");
  });

  it("filters visible series and recomputes domains", () => {
    const allVisible = buildCombinedChartModel({
      chartKitTheme,
      data: [
        { month: "Jan", direct: 40, enterprise: 180, margin: 12 },
        { month: "Feb", direct: 55, enterprise: 220, margin: 14 }
      ],
      xKey: "month",
      bars: [
        { yKey: "direct", label: "Direct" },
        { yKey: "enterprise", label: "Enterprise" }
      ],
      lines: [{ yKey: "margin", label: "Margin" }],
      width: 360,
      height: 260
    });
    const directOnly = buildCombinedChartModel({
      chartKitTheme,
      data: [
        { month: "Jan", direct: 40, enterprise: 180, margin: 12 },
        { month: "Feb", direct: 55, enterprise: 220, margin: 14 }
      ],
      xKey: "month",
      bars: [
        { yKey: "direct", label: "Direct" },
        { yKey: "enterprise", label: "Enterprise" }
      ],
      lines: [{ yKey: "margin", label: "Margin" }],
      visibleSeriesKeys: ["bar-direct", "line-margin"],
      width: 360,
      height: 260
    });

    expect(allVisible.leftDomain[1]).toBeGreaterThan(200);
    expect(directOnly.leftDomain[1]).toBeLessThan(100);
    expect(directOnly.bars.map((bar) => bar.seriesKey)).toEqual([
      "bar-direct",
      "bar-direct"
    ]);
    const enterpriseLegend = directOnly.legendItems.find(
      (item) => item.key === "bar-enterprise"
    );

    expect(enterpriseLegend?.active).toBe(false);
  });

  it("places negative combined bars below the zero baseline", () => {
    const model = buildCombinedChartModel({
      chartKitTheme,
      data: [
        { month: "Jan", profit: -20, margin: 8 },
        { month: "Feb", profit: 35, margin: 18 }
      ],
      xKey: "month",
      bars: [{ yKey: "profit", label: "Profit" }],
      lines: [{ yKey: "margin", label: "Margin" }],
      leftYDomain: { min: "dataMin", max: "dataMax", nice: true },
      width: 360,
      height: 260
    });
    const negativeBar = model.bars.find((bar) => bar.value < 0);
    const positiveBar = model.bars.find((bar) => bar.value > 0);

    expect(negativeBar?.y).toBe(negativeBar?.baselineY);
    expect(negativeBar?.height).toBeGreaterThan(0);
    expect(positiveBar?.y).toBeLessThan(positiveBar?.baselineY ?? 0);
  });
});

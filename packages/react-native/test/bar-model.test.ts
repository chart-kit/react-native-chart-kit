import { describe, expect, it } from "vitest";

import { buildBarChartModel } from "../src/charts/bar/model";

const chartKitTheme = {
  mode: "light" as const,
  preset: "default" as const,
  presets: {},
  theme: undefined
};

describe("BarChart model", () => {
  it("builds grouped bars with labels and theme colors", () => {
    const model = buildBarChartModel({
      chartKitTheme,
      data: [
        { month: "Jan", ios: 20, android: 30 },
        { month: "Feb", ios: 40, android: 24 }
      ],
      height: 220,
      width: 320,
      xKey: "month",
      yKeys: ["ios", "android"]
    });

    expect(model.mode).toBe("grouped");
    expect(model.bars).toHaveLength(4);
    expect(model.xLabels.map((label) => label.text)).toEqual(["Jan", "Feb"]);
    expect(model.legendItems.map((item) => item.label)).toEqual([
      "ios",
      "android"
    ]);
    expect(model.yTicks.length).toBeGreaterThan(1);
    expect(model.bars[0]).toMatchObject({
      dataIndex: 0,
      formattedValue: "20",
      seriesKey: "ios",
      value: 20,
      xLabel: "Jan",
      color: "#2563eb"
    });
    expect(model.bars[1]).toMatchObject({
      dataIndex: 0,
      seriesKey: "android",
      value: 30,
      color: "#0891b2"
    });
  });

  it("stacks bars and supports top value labels", () => {
    const model = buildBarChartModel({
      chartKitTheme,
      data: [
        { month: "Jan", ios: 25, android: 75 },
        { month: "Feb", ios: 10, android: 10 }
      ],
      height: 220,
      mode: "stacked100",
      showValuesOnTopOfBars: true,
      width: 320,
      xKey: "month",
      yKeys: ["ios", "android"]
    });

    expect(model.bars.map((bar) => bar.value)).toEqual([25, 75, 10, 10]);
    expect(
      model.bars.map((bar) => bar.height).every((height) => height > 0)
    ).toBe(true);
    expect(model.valueLabels).toHaveLength(4);
    expect(model.yTicks[0]).toBe(0);
    expect(model.yTicks[model.yTicks.length - 1]).toBe(100);
  });

  it("keeps negative bars below the zero baseline", () => {
    const model = buildBarChartModel({
      chartKitTheme,
      data: [
        { month: "Jan", profit: 20 },
        { month: "Feb", profit: -10 }
      ],
      height: 220,
      width: 320,
      xKey: "month",
      yKey: "profit"
    });

    const positive = model.bars[0]!;
    const negative = model.bars[1]!;

    expect(positive.y).toBeLessThan(positive.baselineY);
    expect(negative.y).toBe(negative.baselineY);
    expect(negative.height).toBeGreaterThan(0);
  });

  it("builds horizontal bars with category y-axis labels", () => {
    const model = buildBarChartModel({
      chartKitTheme,
      data: [
        { channel: "Chat", tickets: 62 },
        { channel: "Email", tickets: 48 },
        { channel: "Phone", tickets: 37 },
        { channel: "Social", tickets: 28 },
        { channel: "Community", tickets: 18 }
      ],
      height: 260,
      labelStrategy: "show",
      orientation: "horizontal",
      showValuesOnTopOfBars: true,
      width: 360,
      xKey: "channel",
      yKey: "tickets"
    });

    expect(model.orientation).toBe("horizontal");
    expect(model.bars).toHaveLength(5);
    expect(model.xLabels.map((label) => label.text)).toContain("60");
    expect(model.yLabels.map((label) => label.text)).toEqual([
      "Chat",
      "Email",
      "Phone",
      "Social",
      "Community"
    ]);
    expect(model.bars[0]).toMatchObject({
      baselineX: expect.any(Number),
      seriesKey: "tickets",
      value: 62,
      xLabel: "Chat"
    });
    expect(model.bars[0]!.width).toBeGreaterThan(0);
    expect(model.valueLabels[0]).toMatchObject({
      text: "62",
      textAnchor: "start"
    });
  });
});

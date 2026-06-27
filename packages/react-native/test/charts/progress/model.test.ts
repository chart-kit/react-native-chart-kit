import { describe, expect, it } from "vitest";

import { buildProgressChartModel } from "../../../src/charts/progress/model";

const chartKitTheme = {
  mode: "light" as const,
  preset: "default" as const,
  presets: {},
  theme: undefined
};

describe("ProgressChart model", () => {
  it("builds concentric themed rings from object rows", () => {
    const model = buildProgressChartModel({
      chartKitTheme,
      props: {
        data: [
          { label: "Move", value: 0.72, color: "#ef4444" },
          { label: "Exercise", value: 0.48 },
          { label: "Stand", value: 0.9 }
        ],
        valueKey: "value",
        labelKey: "label",
        colorKey: "color",
        width: 320,
        height: 260,
        formatPercentage: (value) => `${Math.round(value * 100)} percent`
      }
    });

    expect(model.rings).toHaveLength(3);
    expect(model.rings[0]).toMatchObject({
      color: "#ef4444",
      label: "Move",
      clampedValue: 0.72,
      defined: true
    });
    expect(model.rings[1]?.color).toBe("#0891b2");
    expect(model.legendItems.map((item) => item.label)).toEqual([
      "Move",
      "Exercise",
      "Stand"
    ]);
    expect(model.legendItems[0]?.percentageLabel).toBe("72 percent");
    expect(model.average).toBeCloseTo(0.7);
  });

  it("inherits ring colors from the app-level chart preset", () => {
    const model = buildProgressChartModel({
      chartKitTheme: {
        ...chartKitTheme,
        preset: "graphite"
      },
      props: {
        data: [
          { label: "Move", value: 0.72 },
          { label: "Exercise", value: 0.48 },
          { label: "Stand", value: 0.9 }
        ],
        valueKey: "value",
        labelKey: "label",
        width: 320,
        height: 260
      }
    });

    expect(model.rings[0]?.color).toBe("#111827");
    expect(model.rings[1]?.color).toBe("#475569");
    expect(model.resolvedTheme.grid).toBe("#d9dee7");
  });

  it("supports legacy progress data and hidden legends", () => {
    const model = buildProgressChartModel({
      chartKitTheme,
      props: {
        data: {
          labels: ["Swim", "Bike"],
          colors: ["#2563eb", "#f97316"],
          data: [0.4, 0.8]
        },
        width: 280,
        height: 220,
        hideLegend: true,
        strokeWidth: 10,
        ringGap: 5
      }
    });

    expect(model.legendVisible).toBe(false);
    expect(model.chartHeight).toBe(220);
    expect(model.rings.map((ring) => ring.radius)).toEqual([97, 82]);
    expect(model.rings[0]).toMatchObject({
      color: "#2563eb",
      label: "Swim",
      value: 0.4
    });
  });

  it("clamps rendered progress without hiding out-of-range values", () => {
    const model = buildProgressChartModel({
      chartKitTheme,
      props: {
        data: [1.2, undefined],
        width: 240,
        height: 200
      }
    });

    expect(model.rings[0]).toMatchObject({
      value: 1.2,
      clampedValue: 1,
      defined: true
    });
    expect(model.rings[1]).toMatchObject({
      value: null,
      clampedValue: 0,
      defined: false
    });
  });

  it("keeps zero, missing, and clamped rings visible in the model", () => {
    const model = buildProgressChartModel({
      chartKitTheme,
      props: {
        data: [
          { metric: "Brief approved", progress: 0 },
          { metric: "QA pass", progress: null },
          { metric: "Rollout cap", progress: 1.18 }
        ],
        valueKey: "progress",
        labelKey: "metric",
        width: 320,
        height: 260
      }
    });

    expect(model.rings).toHaveLength(3);
    expect(model.rings[0]).toMatchObject({
      value: 0,
      clampedValue: 0,
      defined: false
    });
    expect(model.rings[1]).toMatchObject({
      value: null,
      clampedValue: 0,
      defined: false
    });
    expect(model.rings[2]).toMatchObject({
      value: 1.18,
      clampedValue: 1,
      defined: true
    });
    expect(model.average).toBeCloseTo(0.5);
    expect(model.legendItems.map((item) => item.percentageLabel)).toEqual([
      "0%",
      "0%",
      "100%"
    ]);
  });
});

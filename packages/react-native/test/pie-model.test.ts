import { describe, expect, it } from "vitest";

import { buildPieChartModel } from "../src/charts/pie/model";

const chartKitTheme = {
  mode: "light" as const,
  preset: "default" as const,
  presets: {},
  theme: undefined
};

describe("PieChart model", () => {
  it("builds themed arcs and wrapped legend items", () => {
    const model = buildPieChartModel({
      chartKitTheme,
      props: {
        data: [
          { channel: "Organic", share: 54 },
          { channel: "Paid", share: 31, color: "#f97316" },
          { channel: "Referral", share: 15 }
        ],
        valueKey: "share",
        labelKey: "channel",
        width: 320,
        height: 260,
        formatPercentage: (value) => `${Math.round(value * 100)} percent`
      }
    });

    expect(model.arcs).toHaveLength(3);
    expect(model.arcs[0]?.color).toBe("#2563eb");
    expect(model.arcs[1]?.color).toBe("#f97316");
    expect(model.legendItems.map((item) => item.label)).toEqual([
      "Organic",
      "Paid",
      "Referral"
    ]);
    expect(model.legendItems[0]?.percentageLabel).toBe("54 percent");
    expect(model.total).toBe(100);
  });

  it("inherits arc colors from the app-level chart preset", () => {
    const model = buildPieChartModel({
      chartKitTheme: {
        ...chartKitTheme,
        preset: "minimal"
      },
      props: {
        data: [
          { channel: "Organic", share: 54 },
          { channel: "Paid", share: 31 },
          { channel: "Referral", share: 15 }
        ],
        valueKey: "share",
        labelKey: "channel",
        width: 320,
        height: 260
      }
    });

    expect(model.arcs[0]?.color).toBe("#111827");
    expect(model.arcs[1]?.color).toBe("#64748b");
    expect(model.resolvedTheme.grid).toBe("#eceff3");
  });

  it("uses donut inner radius ratio and can hide legends", () => {
    const model = buildPieChartModel({
      chartKitTheme,
      props: {
        data: [
          { label: "Used", value: 75 },
          { label: "Remaining", value: 25 }
        ],
        valueKey: "value",
        labelKey: "label",
        width: 300,
        height: 240,
        innerRadiusRatio: 0.5,
        legend: false
      }
    });

    expect(model.legendVisible).toBe(false);
    expect(model.chartHeight).toBe(240);
    expect(model.innerRadius).toBeCloseTo(model.radius * 0.5);
    expect(model.arcs[0]?.path).toContain(`A ${model.radius}`);
    expect(model.arcs[0]?.path).toContain(`A ${model.innerRadius}`);
  });

  it("keeps zero-value slices from drawing broken arcs", () => {
    const model = buildPieChartModel({
      chartKitTheme,
      props: {
        data: [
          { status: "Active", accounts: 70 },
          { status: "Paused", accounts: 30 },
          { status: "Migrated", accounts: 0 }
        ],
        valueKey: "accounts",
        labelKey: "status",
        width: 320,
        height: 260
      }
    });

    expect(model.total).toBe(100);
    expect(model.arcs[2]).toMatchObject({
      defined: false,
      label: "Migrated",
      percentage: 0,
      value: null
    });
    expect(model.legendItems.map((item) => item.label)).toEqual([
      "Active",
      "Paused"
    ]);
  });
});

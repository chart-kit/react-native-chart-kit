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

  it("reserves custom legend height for rich legend rows", () => {
    const model = buildPieChartModel({
      chartKitTheme,
      props: {
        data: [
          { label: "Organic", value: 54 },
          { label: "Paid", value: 31 },
          { label: "Referral", value: 15 }
        ],
        valueKey: "value",
        labelKey: "label",
        width: 320,
        height: 280,
        legend: { reservedHeight: 72 }
      }
    });

    expect(model.legendVisible).toBe(true);
    expect(model.chartHeight).toBe(208);
  });

  it("reserves a gutter for active slice zoom and lift", () => {
    const props = {
      data: [
        { label: "Used", value: 75 },
        { label: "Remaining", value: 25 }
      ],
      valueKey: "value" as const,
      labelKey: "label" as const,
      width: 300,
      height: 240,
      innerRadiusRatio: 0.5,
      legend: false
    };
    const staticModel = buildPieChartModel({
      chartKitTheme,
      props
    });
    const selectableModel = buildPieChartModel({
      chartKitTheme,
      props: {
        ...props,
        activeSlice: {
          activeOffset: 8,
          activeScale: 1.04,
          inactiveOpacity: 0.7
        },
        interaction: "tap"
      },
      selectedIndex: 0
    });

    expect(selectableModel.radius).toBeLessThan(staticModel.radius);
    expect(selectableModel.radius * 1.04 + 8).toBeLessThanOrEqual(
      staticModel.radius
    );
    expect(selectableModel.innerRadius).toBeCloseTo(
      selectableModel.radius * 0.5
    );
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

  it("builds external arc labels with small-slice filtering", () => {
    const model = buildPieChartModel({
      chartKitTheme,
      props: {
        arcLabels: {
          minPercentage: 0.12,
          formatLabel: ({ label, percentageLabel, selected }) =>
            `${selected ? "*" : ""}${label}: ${percentageLabel}`
        },
        data: [
          { channel: "Search", share: 52 },
          { channel: "Sales", share: 28 },
          { channel: "Partners", share: 14 },
          { channel: "Lifecycle", share: 6 }
        ],
        labelKey: "channel",
        legend: false,
        valueKey: "share",
        width: 360,
        height: 240
      },
      selectedIndex: 1
    });

    expect(model.arcLabelsVisible).toBe(true);
    expect(model.radius).toBeLessThan(110);
    expect(model.arcLabels.map((label) => label.text)).toEqual([
      "Search: 52%",
      "*Sales: 28%",
      "Partners: 14%"
    ]);
    expect(
      model.arcLabels.some((label) => label.text.includes("Lifecycle"))
    ).toBe(false);
    expect(model.arcLabels.every((label) => label.connectorVisible)).toBe(true);
    model.arcLabels.forEach((label) => {
      expect(label.connectorBendX).toBeCloseTo(
        label.connectorStartX +
          (label.connectorEndX - label.connectorStartX) / 2
      );
      expect(label.connectorBendY).toBeCloseTo(
        label.connectorStartY +
          (label.connectorEndY - label.connectorStartY) / 2
      );
    });
    expect(
      model.arcLabels.every(
        (label) => label.y >= 0 && label.y <= model.chartHeight
      )
    ).toBe(true);
    expect(
      model.arcLabels.every((label) => label.x >= 10 && label.x <= 350)
    ).toBe(true);
  });
});

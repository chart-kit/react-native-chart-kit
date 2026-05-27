import { describe, expect, it, vi } from "vitest";

import {
  buildPieChartSelectEvent,
  getPieChartInteractionConfig,
  getPieChartSliceAtPoint,
  normalizePieChartSelectedIndex
} from "../src/charts/pie/interaction";
import { buildPieChartModel } from "../src/charts/pie/model";
import {
  getAnimatedPieSliceOpacity,
  getAnimatedPieSlicePath,
  resolvePieChartSelectionAnimationConfig
} from "../src/charts/pie/selectionAnimation";

const chartKitTheme = {
  mode: "light" as const,
  preset: "default" as const,
  presets: {},
  theme: undefined
};

const model = buildPieChartModel({
  chartKitTheme,
  props: {
    data: [
      { channel: "Organic", share: 50 },
      { channel: "Paid", share: 30 },
      { channel: "Referral", share: 20 }
    ],
    valueKey: "share",
    labelKey: "channel",
    width: 300,
    height: 250,
    innerRadiusRatio: 0.5
  }
});

describe("PieChart interaction helpers", () => {
  it("keeps tap selection opt-in", () => {
    expect(getPieChartInteractionConfig()).toMatchObject({ mode: "none" });
    expect(getPieChartInteractionConfig("none")).toMatchObject({
      mode: "none"
    });
    expect(getPieChartInteractionConfig("tap")).toMatchObject({ mode: "tap" });

    const onSelect = vi.fn();
    expect(getPieChartInteractionConfig({ onSelect })).toMatchObject({
      mode: "tap",
      onSelect
    });
  });

  it("normalizes controlled and default selected indexes", () => {
    expect(normalizePieChartSelectedIndex(2.9)).toBe(2);
    expect(normalizePieChartSelectedIndex(-2)).toBe(0);
    expect(normalizePieChartSelectedIndex(Number.NaN)).toBeUndefined();
  });

  it("hit-tests donut slices while ignoring the center hole", () => {
    const firstArc = model.arcs[0]!;

    expect(
      getPieChartSliceAtPoint({
        arcs: model.arcs,
        centerX: model.centerX,
        centerY: model.centerY,
        innerRadius: model.innerRadius,
        locationX: model.centerX,
        locationY: model.centerY,
        radius: model.radius
      })
    ).toBeUndefined();

    expect(
      getPieChartSliceAtPoint({
        arcs: model.arcs,
        centerX: model.centerX,
        centerY: model.centerY,
        innerRadius: model.innerRadius,
        locationX: firstArc.centroid.x,
        locationY: firstArc.centroid.y,
        radius: model.radius
      })
    ).toMatchObject({
      index: 0,
      label: "Organic",
      value: 50
    });
  });

  it("builds typed select events from active arcs", () => {
    expect(buildPieChartSelectEvent(model.arcs[1])).toMatchObject({
      index: 1,
      label: "Paid",
      percentage: 0.3,
      value: 30,
      raw: { channel: "Paid", share: 30 }
    });
    expect(buildPieChartSelectEvent(undefined)).toBeUndefined();
  });

  it("animates active slice emphasis between selected indexes", () => {
    expect(resolvePieChartSelectionAnimationConfig(false)).toMatchObject({
      enabled: false,
      duration: 0
    });
    expect(
      resolvePieChartSelectionAnimationConfig({ duration: 240 })
    ).toMatchObject({
      enabled: true,
      duration: 240
    });

    const state = { fromIndex: 0, toIndex: 1, progress: 0.5 };

    expect(
      getAnimatedPieSliceOpacity({
        activeOpacity: 1,
        inactiveOpacity: 0.6,
        index: 0,
        state
      })
    ).toBeCloseTo(0.8);
    expect(
      getAnimatedPieSliceOpacity({
        activeOpacity: 1,
        inactiveOpacity: 0.6,
        index: 2,
        state
      })
    ).toBeCloseTo(0.6);

    expect(
      getAnimatedPieSlicePath({
        activeOffset: 8,
        activeScale: 1.04,
        arc: model.arcs[1]!,
        centerX: model.centerX,
        centerY: model.centerY,
        innerRadius: model.innerRadius,
        radius: model.radius,
        state: { fromIndex: undefined, toIndex: 1, progress: 1 }
      })
    ).not.toBe(model.arcs[1]!.path);
  });
});

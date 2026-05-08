import { describe, expect, it, vi } from "vitest";

import {
  buildBarChartSelectEvent,
  getBarChartBarAtPoint,
  getBarChartInteractionConfig
} from "../src/charts/bar/interaction";
import { getBarChartTooltipConfig } from "../src/charts/bar/options";
import {
  getBarChartSelectionGridOpacity,
  getAnimatedBarSelectionFill,
  getAnimatedBarSelectionGridOpacity,
  getAnimatedBarSelectionOpacity,
  getAnimatedBarSelectionStrokeOpacity,
  getSettledBarChartSelectionAnimationState,
  resolveBarChartSelectionAnimationConfig,
  shouldRenderBarChartGridLines
} from "../src/charts/bar/selectionAnimation";
import { getBarChartTooltipModel } from "../src/charts/bar/tooltipModel";
import { offsetBarChartTooltipForViewport } from "../src/charts/bar/tooltipPlacement";
import type { BarChartBarModel } from "../src/charts/bar/types";

const bars: Array<BarChartBarModel<{ month: string; paid: number }>> = [
  {
    baselineY: 180,
    color: "#2563eb",
    dataIndex: 1,
    formattedValue: "42k",
    height: 80,
    key: "paid-1",
    raw: { month: "Feb", paid: 42 },
    seriesIndex: 0,
    seriesKey: "paid",
    seriesLabel: "Paid",
    value: 42,
    width: 28,
    x: 90,
    xLabel: "Feb",
    xValue: "Feb",
    y: 100
  }
];

const themeTooltip = {
  background: "#ffffff",
  border: "#e5e7eb",
  borderRadius: 8,
  fontSize: 11,
  labelFontSize: 11,
  mutedText: "#64748b",
  padding: 10,
  shadowColor: "#020617",
  shadowOffsetX: 0,
  shadowOffsetY: 1,
  shadowOpacity: 0.07,
  text: "#0f172a"
};

describe("BarChart interaction helpers", () => {
  it("keeps tap interaction opt-in", () => {
    expect(getBarChartInteractionConfig(undefined)).toEqual({
      deselectOnOutsidePress: false,
      mode: "none"
    });
    expect(getBarChartInteractionConfig("tap")).toEqual({
      deselectOnOutsidePress: true,
      mode: "tap"
    });
  });

  it("preserves selection callbacks from config objects", () => {
    const onSelect = vi.fn();

    expect(getBarChartInteractionConfig({ onSelect })).toMatchObject({
      deselectOnOutsidePress: true,
      mode: "tap",
      onSelect
    });
  });

  it("hit-tests bars with touch slop", () => {
    expect(
      getBarChartBarAtPoint({ bars, locationX: 92, locationY: 104 })?.key
    ).toBe("paid-1");
    expect(
      getBarChartBarAtPoint({ bars, locationX: 85, locationY: 98 })?.key
    ).toBe("paid-1");
    expect(
      getBarChartBarAtPoint({ bars, locationX: 20, locationY: 98 })
    ).toBeUndefined();
  });

  it("hit-tests stacked segments by their actual rectangle", () => {
    const stackedBars: Array<BarChartBarModel> = [
      {
        ...bars[0]!,
        height: 45,
        key: "ios-0",
        seriesKey: "ios",
        seriesLabel: "iOS",
        y: 135
      },
      {
        ...bars[0]!,
        height: 35,
        key: "android-0",
        seriesKey: "android",
        seriesLabel: "Android",
        y: 100
      }
    ];

    expect(
      getBarChartBarAtPoint({
        bars: stackedBars,
        hitSlop: 0,
        locationX: 96,
        locationY: 112
      })?.key
    ).toBe("android-0");
  });

  it("builds public select events from bar models", () => {
    expect(buildBarChartSelectEvent(bars[0])).toMatchObject({
      color: "#2563eb",
      dataIndex: 1,
      formattedValue: "42k",
      position: { x: 104, y: 100 },
      raw: { month: "Feb", paid: 42 },
      seriesKey: "paid",
      seriesLabel: "Paid",
      value: 42,
      x: "Feb",
      xLabel: "Feb"
    });
  });

  it("resolves stylable tooltip options from theme tokens", () => {
    expect(
      getBarChartTooltipConfig({
        themeTooltip,
        tooltip: {
          backgroundColor: "#111827",
          positionAnimationDuration: 240,
          visible: true,
          width: 150
        }
      })
    ).toMatchObject({
      anchor: "bar",
      backgroundColor: "#111827",
      borderColor: "#e5e7eb",
      edgePadding: 4,
      offset: 8,
      placement: "auto",
      positionAnimationDuration: 240,
      textColor: "#0f172a",
      visible: true,
      width: 150
    });
  });

  it("resolves animated selection style transitions", () => {
    expect(resolveBarChartSelectionAnimationConfig(false)).toEqual({
      duration: 0,
      enabled: false
    });
    expect(resolveBarChartSelectionAnimationConfig({ duration: 240 })).toEqual({
      duration: 240,
      enabled: true
    });

    const state = {
      fromKey: "paid-1",
      toKey: "organic-1",
      progress: 0.5
    };

    expect(
      getAnimatedBarSelectionOpacity({ barKey: "paid-1", state })
    ).toBeCloseTo(0.77);
    expect(
      getAnimatedBarSelectionOpacity({ barKey: "organic-1", state })
    ).toBeCloseTo(0.77);
    expect(
      getAnimatedBarSelectionFill({
        backgroundColor: "#ffffff",
        barKey: "paid-1",
        color: "#2563eb",
        state
      })
    ).toBe("#5787f0");
    expect(
      getAnimatedBarSelectionStrokeOpacity({ barKey: "paid-1", state })
    ).toBeCloseTo(0);
    expect(
      getAnimatedBarSelectionStrokeOpacity({ barKey: "organic-1", state })
    ).toBeCloseTo(0);

    expect(
      getAnimatedBarSelectionGridOpacity({
        state: { fromKey: undefined, toKey: undefined, progress: 1 }
      })
    ).toBeCloseTo(0.78);
    expect(
      getAnimatedBarSelectionGridOpacity({
        state: { fromKey: undefined, toKey: "paid-1", progress: 0 }
      })
    ).toBeCloseTo(0);
    expect(
      getAnimatedBarSelectionGridOpacity({
        state: { fromKey: "paid-1", toKey: "paid-1", progress: 1 }
      })
    ).toBeCloseTo(0);
    expect(
      getAnimatedBarSelectionGridOpacity({
        state: { fromKey: "paid-1", toKey: undefined, progress: 0.5 }
      })
    ).toBeCloseTo(0);
    expect(
      getBarChartSelectionGridOpacity({
        selectedBarKey: "paid-1",
        state: { fromKey: undefined, toKey: undefined, progress: 1 }
      })
    ).toBeCloseTo(0);
    expect(
      getAnimatedBarSelectionGridOpacity({
        state: getSettledBarChartSelectionAnimationState(undefined)
      })
    ).toBeCloseTo(0.78);
    expect(
      shouldRenderBarChartGridLines({
        selectedBarKey: undefined,
        state: getSettledBarChartSelectionAnimationState(undefined)
      })
    ).toBe(true);
    expect(
      shouldRenderBarChartGridLines({
        selectedBarKey: "paid-1",
        state: getSettledBarChartSelectionAnimationState("paid-1")
      })
    ).toBe(false);
    expect(
      shouldRenderBarChartGridLines({
        selectedBarKey: undefined,
        state: { fromKey: "paid-1", toKey: undefined, progress: 0.5 }
      })
    ).toBe(false);
  });

  it("keeps overlay tooltips inside the visible viewport", () => {
    const tooltip = {
      bar: bars[0]!,
      height: 54,
      width: 132,
      x: 18,
      y: 42
    };

    expect(
      offsetBarChartTooltipForViewport({
        leftInset: 56,
        tooltip,
        viewportOffsetX: 0,
        viewportWidth: 320
      })
    ).toMatchObject({ x: 56, y: 42 });

    expect(
      offsetBarChartTooltipForViewport({
        leftInset: 56,
        tooltip: { ...tooltip, x: 420 },
        viewportOffsetX: 180,
        viewportWidth: 320
      })
    ).toMatchObject({ x: 184, y: 42 });
  });

  it("supports pointer-anchored tooltips above taps", () => {
    const tooltip = getBarChartTooltipModel({
      bar: bars[0],
      boxes: {
        outer: { x: 0, y: 0, width: 320, height: 220 },
        plot: { x: 52, y: 24, width: 240, height: 160 }
      },
      config: getBarChartTooltipConfig({
        themeTooltip,
        tooltip: {
          anchor: "pointer",
          edgePadding: 6,
          offset: 14,
          placement: "above",
          width: 132
        }
      }),
      pointer: { key: "paid-1", x: 144, y: 116 }
    });

    expect(tooltip).toMatchObject({
      x: 78,
      y: 51
    });
  });
});

import { describe, expect, it, vi } from "vitest";

import {
  buildBarChartSelectEvent,
  getBarChartBarAtPoint,
  getBarChartInteractionConfig
} from "../src/charts/bar/interaction";
import { getBarChartTooltipConfig } from "../src/charts/bar/options";
import {
  getAnimatedBarSelectionOpacity,
  getAnimatedBarSelectionStrokeOpacity,
  resolveBarChartSelectionAnimationConfig
} from "../src/charts/bar/selectionAnimation";
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
      backgroundColor: "#111827",
      borderColor: "#e5e7eb",
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
    ).toBeCloseTo(0.71);
    expect(
      getAnimatedBarSelectionOpacity({ barKey: "organic-1", state })
    ).toBeCloseTo(0.71);
    expect(
      getAnimatedBarSelectionStrokeOpacity({ barKey: "paid-1", state })
    ).toBeCloseTo(0.16);
    expect(
      getAnimatedBarSelectionStrokeOpacity({ barKey: "organic-1", state })
    ).toBeCloseTo(0.16);
  });
});

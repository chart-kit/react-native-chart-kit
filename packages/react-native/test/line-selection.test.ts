import { describe, expect, it } from "vitest";

import {
  getSelectedLineSeries,
  type LineChartSelectableGeometry,
  type LineChartSelectablePoint
} from "../src/charts/line/selection";
import { defaultLineChartTooltipPositionAnimationDuration } from "../src/charts/line/options";
import {
  easeLineChartTooltipPosition,
  getLineChartTooltipModel,
  interpolateLineChartTooltipPosition
} from "../src/charts/line/tooltip";

const dot = {
  visible: true,
  shape: "circle" as const,
  radius: 3,
  fill: "background" as const,
  stroke: "series" as const,
  strokeWidth: 2,
  opacity: 1
};

const geometries: Array<LineChartSelectableGeometry<LineChartSelectablePoint>> =
  [
    {
      geometry: {
        key: "actual",
        label: "Actual",
        points: [
          { dataIndex: 0, defined: true, index: 0, value: 10, x: 10, y: 80 },
          { dataIndex: 1, defined: false, index: 1, value: null, x: 20, y: 0 },
          { dataIndex: 2, defined: true, index: 2, value: 16, x: 30, y: 56 }
        ]
      },
      style: {
        color: "#2563eb",
        dot
      }
    },
    {
      geometry: {
        key: "forecast",
        label: "Forecast",
        points: [
          { dataIndex: 0, defined: true, index: 0, value: 8, x: 10, y: 90 },
          { dataIndex: 1, defined: true, index: 1, value: 12, x: 20, y: 70 },
          { dataIndex: 2, defined: true, index: 2, value: 18, x: 30, y: 50 }
        ]
      },
      style: {
        color: "#0891b2",
        dot
      }
    }
  ];

const tooltipConfig = {
  visible: true,
  shared: true,
  width: 120,
  padding: 10,
  borderRadius: 8,
  backgroundColor: "#0f172a",
  borderColor: "#e5e7eb",
  textColor: "#fff",
  labelColor: "#cbd5e1",
  fontFamily: undefined,
  fontSize: 11,
  labelFontSize: 11,
  positionAnimationDuration: defaultLineChartTooltipPositionAnimationDuration
};

describe("LineChart selection model", () => {
  it("omits undefined/null gap points without dropping other selected series", () => {
    const selected = getSelectedLineSeries({
      activeDot: undefined,
      formatYLabel: (value) => `${value}`,
      geometries,
      selectedDataIndex: 1
    });

    expect(selected).toHaveLength(1);
    expect(selected[0]).toMatchObject({
      key: "forecast",
      formattedValue: "12",
      activeDot: { visible: true, radius: 5 }
    });
  });

  it("returns an empty selection for out-of-range indexes", () => {
    expect(
      getSelectedLineSeries({
        activeDot: undefined,
        formatYLabel: (value) => `${value}`,
        geometries,
        selectedDataIndex: undefined
      })
    ).toEqual([]);
  });

  it("keeps shared tooltip content inside chart bounds", () => {
    const selected = getSelectedLineSeries({
      activeDot: undefined,
      formatYLabel: (value) => `${value}`,
      geometries,
      selectedDataIndex: 2
    });
    const tooltip = getLineChartTooltipModel({
      chartHeight: 150,
      chartWidth: 140,
      config: tooltipConfig,
      measureText: (text) => ({ width: text.length * 6, height: 12 }),
      plotY: 24,
      selection: {
        index: 2,
        x: 130,
        y: 28,
        xLabel: "March",
        series: selected
      },
      theme: { axis: "#e5e7eb" }
    });

    expect(tooltip).toMatchObject({
      x: 16,
      y: 40,
      width: 120,
      height: 72
    });
    expect(tooltip?.series).toHaveLength(2);
  });

  it("supports single-series tooltip content", () => {
    const selected = getSelectedLineSeries({
      activeDot: undefined,
      formatYLabel: (value) => `${value}`,
      geometries,
      selectedDataIndex: 2
    });
    const tooltip = getLineChartTooltipModel({
      chartHeight: 150,
      chartWidth: 220,
      config: { ...tooltipConfig, shared: false },
      measureText: (text) => ({ width: text.length * 6, height: 12 }),
      plotY: 24,
      selection: {
        index: 2,
        x: 80,
        y: 120,
        xLabel: "March",
        series: selected
      },
      theme: { axis: "#e5e7eb" }
    });

    expect(tooltip?.series.map((item) => item.key)).toEqual(["actual"]);
    expect(tooltip?.height).toBe(54);
  });

  it("eases tooltip position changes toward the selected point", () => {
    expect(easeLineChartTooltipPosition(-1)).toBe(0);
    expect(easeLineChartTooltipPosition(2)).toBe(1);
    expect(
      interpolateLineChartTooltipPosition({
        from: { x: 10, y: 20 },
        progress: 0.5,
        to: { x: 50, y: 100 }
      })
    ).toEqual({
      x: 45,
      y: 90
    });
  });
});

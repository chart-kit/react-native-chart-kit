import { describe, expect, it, vi } from "vitest";

import {
  buildLineChartSelectEvent,
  getLineChartInteractionConfig,
  getLineChartVisibleInteractionBounds,
  getNearestLineChartInteractionIndex,
  isLineChartInteractionEnabled,
  isLineChartInteractionInBounds,
  normalizeLineChartSelectedIndex,
  type LineChartInteractionPoint
} from "../src/charts/line/interaction";
import type { LineChartSelectedSeriesItem } from "../src/charts/line/selection";

const interactionPoints: Array<LineChartInteractionPoint<{ month: string }>> = [
  {
    dataIndex: 0,
    x: 24,
    xValue: "Jan",
    xLabel: "January",
    raw: { month: "Jan" }
  },
  {
    dataIndex: 1,
    x: 88,
    xValue: "Feb",
    xLabel: "February",
    raw: { month: "Feb" }
  },
  {
    dataIndex: 2,
    x: 152,
    xValue: "Mar",
    xLabel: "March",
    raw: { month: "Mar" }
  }
];

const selectedSeries: Array<
  LineChartSelectedSeriesItem<{
    dataIndex: number;
    defined: boolean;
    index: number;
    value?: number | null;
    x: number;
    y: number;
  }>
> = [
  {
    key: "actual",
    label: "Actual",
    color: "#2563eb",
    value: 42,
    formattedValue: "42",
    point: {
      dataIndex: 1,
      defined: true,
      index: 1,
      value: 42,
      x: 88,
      y: 40
    },
    activeDot: {
      visible: true,
      shape: "circle",
      radius: 5,
      fill: "background",
      stroke: "series",
      strokeWidth: 2.5,
      opacity: 1
    }
  }
];

describe("LineChart interaction helpers", () => {
  it("normalizes controlled and default selected indexes", () => {
    expect(normalizeLineChartSelectedIndex(2.4)).toBe(2);
    expect(normalizeLineChartSelectedIndex(Number.NaN)).toBeUndefined();
    expect(normalizeLineChartSelectedIndex(undefined)).toBeUndefined();
  });

  it("resolves interaction config from strings and objects", () => {
    const onSelect = vi.fn();
    const onDeselect = vi.fn();

    expect(getLineChartInteractionConfig(undefined)).toEqual({
      mode: "none",
      selectionPersistence: "persist",
      deselectOnOutsidePress: false
    });
    expect(getLineChartInteractionConfig("scrub")).toEqual({
      mode: "scrub",
      selectionPersistence: "persist",
      deselectOnOutsidePress: true
    });
    expect(
      getLineChartInteractionConfig({
        onSelect,
        onDeselect,
        onGestureStart: vi.fn(),
        selectionPersistence: "whileActive",
        deselectOnOutsidePress: false
      })
    ).toMatchObject({
      mode: "tap",
      selectionPersistence: "whileActive",
      deselectOnOutsidePress: false,
      onSelect,
      onDeselect
    });
    expect(
      isLineChartInteractionEnabled(getLineChartInteractionConfig("tap"))
    ).toBe(true);
  });

  it("only starts interaction inside the plot plus touch slop", () => {
    const bounds = { x: 40, y: 24, width: 200, height: 120 };

    expect(
      isLineChartInteractionInBounds({
        bounds,
        locationX: 26,
        locationY: 30
      })
    ).toBe(true);
    expect(
      isLineChartInteractionInBounds({
        bounds,
        locationX: 12,
        locationY: 30
      })
    ).toBe(false);
  });

  it("limits outside-press hit testing to the visible scroll viewport", () => {
    const bounds = { x: 52, y: 24, width: 900, height: 140 };

    expect(
      getLineChartVisibleInteractionBounds({
        bounds,
        scrollable: true,
        viewportWidth: 360
      })
    ).toEqual({
      x: 52,
      y: 24,
      width: 308,
      height: 140
    });
    expect(
      getLineChartVisibleInteractionBounds({
        bounds,
        scrollable: false,
        viewportWidth: 360
      })
    ).toEqual(bounds);
  });

  it("maps touch x position to nearest data index", () => {
    expect(
      getNearestLineChartInteractionIndex({
        locationX: 93,
        points: interactionPoints
      })
    ).toBe(1);
    expect(
      getNearestLineChartInteractionIndex({
        locationX: -20,
        points: interactionPoints
      })
    ).toBe(0);
    expect(
      getNearestLineChartInteractionIndex({
        locationX: 1,
        points: []
      })
    ).toBeUndefined();
  });

  it("builds select events without leaking active marker internals", () => {
    const event = buildLineChartSelectEvent({
      interactionPoints,
      selectedDataIndex: 1,
      selectedSeries
    });

    expect(event).toEqual({
      index: 1,
      x: "Feb",
      xLabel: "February",
      position: {
        x: 88,
        y: 40
      },
      raw: { month: "Feb" },
      series: [
        {
          key: "actual",
          label: "Actual",
          color: "#2563eb",
          value: 42,
          formattedValue: "42",
          point: {
            dataIndex: 1,
            defined: true,
            index: 1,
            value: 42,
            x: 88,
            y: 40
          }
        }
      ]
    });
  });
});

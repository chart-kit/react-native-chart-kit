import { describe, expect, it } from "vitest";

import {
  buildLineSeriesGeometry,
  createLinearScale,
  createPointScale,
  createTimeScale,
  normalizeCartesianData
} from "../src";
import type { ChartXValue } from "../src";

const numericX = (value: ChartXValue): number | undefined => {
  return typeof value === "number" ? value : undefined;
};

describe("line series geometry projection", () => {
  it("projects normalized data through point and linear scales", () => {
    const normalized = normalizeCartesianData({
      data: [
        { month: "Jan", revenue: 10 },
        { month: "Feb", revenue: null },
        { month: "Mar", revenue: 30 }
      ],
      xKey: "month",
      yKey: "revenue"
    });
    const xScale = createPointScale<string>({
      domain: ["Jan", "Feb", "Mar"],
      range: [0, 100]
    });
    const yScale = createLinearScale({
      values: [10, 30],
      range: [100, 0]
    });

    const geometry = buildLineSeriesGeometry({
      series: normalized.series[0]!,
      xScale: (value) =>
        typeof value === "string" ? xScale.scale(value) : undefined,
      yScale: (value) => yScale.scale(value)
    });

    expect(geometry.points.map((point) => point.defined)).toEqual([
      true,
      false,
      true
    ]);
    expect(geometry.line.path).toBe("M 0 100 M 100 0");
  });

  it("connects projected points across missing values when requested", () => {
    const normalized = normalizeCartesianData({
      data: [
        { x: 0, actual: 0 },
        { x: 1, actual: null },
        { x: 2, actual: 20 }
      ],
      xKey: "x",
      yKey: "actual"
    });
    const yScale = createLinearScale({
      values: [0, 20],
      range: [100, 0]
    });

    const geometry = buildLineSeriesGeometry({
      series: normalized.series[0]!,
      xScale: (value) => (numericX(value) ?? 0) * 50,
      yScale: (value) => yScale.scale(value),
      connectNulls: true
    });

    expect(geometry.line.path).toBe("M 0 100 L 100 0");
  });

  it("keeps multi-series missing values independent", () => {
    const normalized = normalizeCartesianData({
      data: [
        { x: 0, actual: 10, target: null },
        { x: 1, actual: null, target: 20 },
        { x: 2, actual: 30, target: 40 }
      ],
      xKey: "x",
      yKeys: ["actual", "target"]
    });
    const yScale = createLinearScale({
      values: [10, 40],
      range: [100, 0]
    });
    const [actual, target] = normalized.series.map((series) =>
      buildLineSeriesGeometry({
        series,
        xScale: (value) => (numericX(value) ?? 0) * 50,
        yScale: (value) => yScale.scale(value)
      })
    );

    expect(actual!.points.map((point) => point.defined)).toEqual([
      true,
      false,
      true
    ]);
    expect(target!.points.map((point) => point.defined)).toEqual([
      false,
      true,
      true
    ]);
  });

  it("can preserve original data indexes when projecting a viewport window", () => {
    const normalized = normalizeCartesianData({
      data: [
        { month: "Apr", revenue: 30 },
        { month: "May", revenue: 36 }
      ],
      xKey: "month",
      yKey: "revenue"
    });
    const xScale = createPointScale<string>({
      domain: ["Apr", "May"],
      range: [0, 100]
    });

    const geometry = buildLineSeriesGeometry({
      series: normalized.series[0]!,
      xScale: (value) =>
        typeof value === "string" ? xScale.scale(value) : undefined,
      yScale: (value) => value,
      dataIndexOffset: 3
    });

    expect(geometry.points.map((point) => point.dataIndex)).toEqual([3, 4]);
    expect(geometry.points.map((point) => point.index)).toEqual([3, 4]);
    expect(
      geometry.line.segments[0]?.points.map((point) => point.index)
    ).toEqual([3, 4]);
  });

  it("spaces irregular timestamps proportionally with a time scale", () => {
    const normalized = normalizeCartesianData({
      data: [
        { date: new Date("2026-01-01T00:00:00Z"), price: 10 },
        { date: new Date("2026-01-06T00:00:00Z"), price: 20 },
        { date: new Date("2026-01-11T00:00:00Z"), price: 30 }
      ],
      xKey: "date",
      yKey: "price"
    });
    const xScale = createTimeScale({
      values: [
        new Date("2026-01-01T00:00:00Z"),
        new Date("2026-01-11T00:00:00Z")
      ],
      range: [0, 100]
    });

    const geometry = buildLineSeriesGeometry({
      series: normalized.series[0]!,
      xScale: (value) =>
        value instanceof Date ? xScale.scale(value) : undefined,
      yScale: (value) => value
    });

    expect(geometry.points.map((point) => point.x)).toEqual([0, 50, 100]);
  });

  it("builds area geometry when a baseline is provided", () => {
    const normalized = normalizeCartesianData({
      data: [
        { x: 0, value: 0 },
        { x: 1, value: 10 }
      ],
      xKey: "x",
      yKey: "value"
    });
    const geometry = buildLineSeriesGeometry({
      series: normalized.series[0]!,
      xScale: (value) => (numericX(value) ?? 0) * 50,
      yScale: (value) => 100 - value,
      areaBaselineY: 100
    });

    expect(geometry.area?.path).toBe("M 0 100 L 50 90 L 50 100 L 0 100 Z");
  });

  it("decimates path points without dropping source geometry points", () => {
    const normalized = normalizeCartesianData({
      data: [
        { x: 0, value: 50 },
        { x: 1, value: 10 },
        { x: 2, value: 90 },
        { x: 3, value: 20 },
        { x: 4, value: 80 },
        { x: 5, value: 60 }
      ],
      xKey: "x",
      yKey: "value"
    });

    const geometry = buildLineSeriesGeometry({
      series: normalized.series[0]!,
      xScale: (value) => numericX(value),
      yScale: (value) => value,
      pathDecimation: { maxPoints: 4 }
    });

    expect(geometry.points).toHaveLength(6);
    expect(geometry.line.segments[0]?.points).toHaveLength(4);
    expect(
      geometry.line.segments[0]?.points.map((point) => point.value)
    ).toEqual([50, 10, 90, 60]);
  });

  it("keeps null gaps when decimating disconnected path segments", () => {
    const normalized = normalizeCartesianData({
      data: [
        { x: 0, value: 10 },
        { x: 1, value: null },
        { x: 2, value: 30 },
        { x: 3, value: 40 },
        { x: 4, value: null },
        { x: 5, value: 60 }
      ],
      xKey: "x",
      yKey: "value"
    });

    const geometry = buildLineSeriesGeometry({
      series: normalized.series[0]!,
      xScale: (value) => numericX(value),
      yScale: (value) => value,
      pathDecimation: { maxPoints: 3 }
    });

    expect(geometry.points.map((point) => point.defined)).toEqual([
      true,
      false,
      true,
      true,
      false,
      true
    ]);
    expect(
      geometry.line.segments.map((segment) => segment.points.length)
    ).toEqual([1, 2, 1]);
    expect(geometry.line.path).toBe("M 0 10 M 2 30 L 3 40 M 5 60");
  });
});

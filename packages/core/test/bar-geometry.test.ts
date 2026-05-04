import { describe, expect, it } from "vitest";

import {
  buildBarGeometry,
  buildHorizontalBarGeometry,
  createBandScale,
  createLinearScale,
  normalizeCartesianData
} from "../src";

const buildNormalized = () =>
  normalizeCartesianData({
    data: [
      { month: "Jan", android: 20, ios: 30 },
      { month: "Feb", android: -10, ios: 24 },
      { month: "Mar", android: 15, ios: null }
    ],
    xKey: "month",
    yKeys: ["android", "ios"]
  });

describe("bar geometry", () => {
  it("builds grouped vertical bars with independent series slots", () => {
    const normalized = buildNormalized();
    const xScale = createBandScale<string>({
      domain: ["Jan", "Feb", "Mar"],
      range: [0, 300]
    });
    const yScale = createLinearScale({
      domain: [-20, 40],
      range: [180, 0]
    });
    const geometry = buildBarGeometry({
      series: normalized.series,
      xBand: (value) =>
        typeof value === "string"
          ? { x: xScale.scale(value) ?? 0, width: xScale.bandwidth }
          : undefined,
      yScale: (value) => yScale.scale(value),
      barWidthRatio: 0.8,
      barGapRatio: 0.1
    });

    expect(geometry.mode).toBe("grouped");
    expect(geometry.bars).toHaveLength(5);
    expect(geometry.bars[0]).toMatchObject({
      seriesKey: "android",
      dataIndex: 0,
      value: 20,
      x: 10,
      y: 60,
      width: 36,
      height: 60,
      baselineY: 120
    });
    expect(geometry.bars[1]).toMatchObject({
      seriesKey: "ios",
      dataIndex: 0,
      value: 30,
      x: 54,
      y: 30,
      width: 36,
      height: 90
    });
    expect(geometry.bars[2]).toMatchObject({
      seriesKey: "android",
      dataIndex: 1,
      value: -10,
      y: 120,
      height: 30
    });
  });

  it("stacks positive and negative bars from the zero baseline", () => {
    const normalized = buildNormalized();
    const xScale = createBandScale<string>({
      domain: ["Jan", "Feb", "Mar"],
      range: [0, 300]
    });
    const yScale = createLinearScale({
      domain: [-20, 60],
      range: [200, 0]
    });
    const geometry = buildBarGeometry({
      series: normalized.series,
      mode: "stacked",
      xBand: (value) =>
        typeof value === "string"
          ? { x: xScale.scale(value) ?? 0, width: xScale.bandwidth }
          : undefined,
      yScale: (value) => yScale.scale(value),
      barWidthRatio: 0.6
    });

    expect(geometry.bars).toHaveLength(5);
    expect(geometry.bars[0]).toMatchObject({
      seriesKey: "android",
      value: 20,
      stackStart: 0,
      stackEnd: 20,
      y: 100,
      height: 50
    });
    expect(geometry.bars[1]).toMatchObject({
      seriesKey: "ios",
      value: 30,
      stackStart: 20,
      stackEnd: 50,
      y: 25,
      height: 75
    });
    expect(geometry.bars[2]).toMatchObject({
      seriesKey: "android",
      value: -10,
      stackStart: 0,
      stackEnd: -10,
      y: 150,
      height: 25
    });
  });

  it("normalizes stacked100 bars by row totals", () => {
    const normalized = normalizeCartesianData({
      data: [
        { month: "Jan", ios: 25, android: 75 },
        { month: "Feb", ios: 10, android: 10 }
      ],
      xKey: "month",
      yKeys: ["ios", "android"]
    });
    const xScale = createBandScale<string>({
      domain: ["Jan", "Feb"],
      range: [0, 200]
    });
    const yScale = createLinearScale({
      domain: [0, 100],
      range: [100, 0]
    });
    const geometry = buildBarGeometry({
      series: normalized.series,
      mode: "stacked100",
      xBand: (value) =>
        typeof value === "string"
          ? { x: xScale.scale(value) ?? 0, width: xScale.bandwidth }
          : undefined,
      yScale: (value) => yScale.scale(value)
    });

    expect(
      geometry.bars.map((bar) => ({
        dataIndex: bar.dataIndex,
        scaledValue: bar.scaledValue,
        stackStart: bar.stackStart,
        stackEnd: bar.stackEnd,
        value: bar.value
      }))
    ).toEqual([
      { dataIndex: 0, value: 25, scaledValue: 25, stackStart: 0, stackEnd: 25 },
      {
        dataIndex: 0,
        value: 75,
        scaledValue: 75,
        stackStart: 25,
        stackEnd: 100
      },
      { dataIndex: 1, value: 10, scaledValue: 50, stackStart: 0, stackEnd: 50 },
      {
        dataIndex: 1,
        value: 10,
        scaledValue: 50,
        stackStart: 50,
        stackEnd: 100
      }
    ]);
  });

  it("builds grouped horizontal bars with independent series slots", () => {
    const normalized = buildNormalized();
    const yScale = createBandScale<string>({
      domain: ["Jan", "Feb", "Mar"],
      range: [0, 300]
    });
    const xScale = createLinearScale({
      domain: [-20, 40],
      range: [0, 180]
    });
    const geometry = buildHorizontalBarGeometry({
      series: normalized.series,
      yBand: (value) =>
        typeof value === "string"
          ? { y: yScale.scale(value) ?? 0, height: yScale.bandwidth }
          : undefined,
      xScale: (value) => xScale.scale(value),
      barWidthRatio: 0.8,
      barGapRatio: 0.1
    });

    expect(geometry.mode).toBe("grouped");
    expect(geometry.bars).toHaveLength(5);
    expect(geometry.bars[0]).toMatchObject({
      seriesKey: "android",
      dataIndex: 0,
      value: 20,
      x: 60,
      y: 10,
      width: 60,
      height: 36,
      baselineX: 60
    });
    expect(geometry.bars[1]).toMatchObject({
      seriesKey: "ios",
      dataIndex: 0,
      value: 30,
      x: 60,
      y: 54,
      width: 90,
      height: 36
    });
    expect(geometry.bars[2]).toMatchObject({
      seriesKey: "android",
      dataIndex: 1,
      value: -10,
      x: 30,
      width: 30
    });
  });

  it("stacks horizontal bars from the zero baseline", () => {
    const normalized = buildNormalized();
    const yScale = createBandScale<string>({
      domain: ["Jan", "Feb", "Mar"],
      range: [0, 300]
    });
    const xScale = createLinearScale({
      domain: [-20, 60],
      range: [0, 200]
    });
    const geometry = buildHorizontalBarGeometry({
      series: normalized.series,
      mode: "stacked",
      yBand: (value) =>
        typeof value === "string"
          ? { y: yScale.scale(value) ?? 0, height: yScale.bandwidth }
          : undefined,
      xScale: (value) => xScale.scale(value),
      barWidthRatio: 0.6
    });

    expect(geometry.bars).toHaveLength(5);
    expect(geometry.bars[0]).toMatchObject({
      seriesKey: "android",
      value: 20,
      stackStart: 0,
      stackEnd: 20,
      x: 50,
      width: 50
    });
    expect(geometry.bars[1]).toMatchObject({
      seriesKey: "ios",
      value: 30,
      stackStart: 20,
      stackEnd: 50,
      x: 100,
      width: 75
    });
    expect(geometry.bars[2]).toMatchObject({
      seriesKey: "android",
      value: -10,
      stackStart: 0,
      stackEnd: -10,
      x: 25,
      width: 25
    });
  });
});

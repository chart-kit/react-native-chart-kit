import { describe, expect, it } from "vitest";

import {
  buildCandlestickGeometry,
  createBandScale,
  createLinearScale
} from "../src";

const data = [
  { index: 0, x: "Mon", open: 100, high: 112, low: 96, close: 108, raw: 0 },
  { index: 1, x: "Tue", open: 108, high: 110, low: 91, close: 94, raw: 1 },
  { index: 2, x: "Wed", open: 94, high: 101, low: 92, close: 94, raw: 2 }
];

describe("candlestick geometry", () => {
  it("projects candle bodies and wicks from OHLC values", () => {
    const xScale = createBandScale<string>({
      domain: ["Mon", "Tue", "Wed"],
      range: [0, 300]
    });
    const yScale = createLinearScale({
      domain: [80, 120],
      range: [200, 0]
    });
    const geometry = buildCandlestickGeometry({
      data,
      xBand: (value) =>
        typeof value === "string"
          ? { x: xScale.scale(value) ?? 0, width: xScale.bandwidth }
          : undefined,
      yScale: (value) => yScale.scale(value),
      candleWidthRatio: 0.6
    });

    expect(geometry.candles).toHaveLength(3);
    expect(geometry.candles[0]).toMatchObject({
      bodyHeight: 40,
      bodyWidth: 60,
      bodyX: 20,
      bodyY: 60,
      direction: "up",
      highY: 40,
      lowY: 120,
      wickX: 50
    });
    expect(geometry.candles[1]).toMatchObject({
      bodyHeight: 70,
      bodyY: 60,
      direction: "down",
      highY: 50,
      lowY: 145
    });
  });

  it("renders flat candles with a minimum body height", () => {
    const xScale = createBandScale<string>({
      domain: ["Wed"],
      range: [0, 100]
    });
    const yScale = createLinearScale({
      domain: [90, 100],
      range: [100, 0]
    });
    const geometry = buildCandlestickGeometry({
      data: [data[2]!],
      xBand: (value) =>
        typeof value === "string"
          ? { x: xScale.scale(value) ?? 0, width: xScale.bandwidth }
          : undefined,
      yScale: (value) => yScale.scale(value)
    });

    expect(geometry.candles[0]).toMatchObject({
      bodyHeight: 1,
      direction: "flat"
    });
  });
});

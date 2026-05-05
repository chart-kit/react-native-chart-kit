import { describe, expect, it } from "vitest";

import { buildCandlestickChartModel } from "../src/charts/candlestick/model";

const chartKitTheme = {
  mode: "light" as const,
  preset: "default" as const,
  presets: {},
  theme: undefined
};

const rows = [
  { day: "Mon", open: 100, high: 112, low: 96, close: 108 },
  { day: "Tue", open: 108, high: 110, low: 91, close: 94 },
  { day: "Wed", open: 94, high: 102, low: 92, close: 94 }
];

describe("CandlestickChart model", () => {
  it("builds colored candles from OHLC rows", () => {
    const model = buildCandlestickChartModel({
      chartKitTheme,
      closeKey: "close",
      data: rows,
      height: 260,
      highKey: "high",
      lowKey: "low",
      openKey: "open",
      width: 360,
      xKey: "day",
      yDomain: [80, 120],
      upColor: "#16a34a",
      downColor: "#dc2626"
    });

    expect(model.candles).toHaveLength(3);
    expect(model.candles.map((candle) => candle.direction)).toEqual([
      "up",
      "down",
      "flat"
    ]);
    expect(model.candles.map((candle) => candle.color)).toEqual([
      "#16a34a",
      "#dc2626",
      model.flatColor
    ]);
    expect(model.candles[0]?.highY).toBeLessThan(model.candles[0]?.lowY ?? 0);
  });

  it("skips invalid OHLC rows", () => {
    const model = buildCandlestickChartModel({
      chartKitTheme,
      closeKey: "close",
      data: [
        ...rows,
        { day: "Bad", open: Number.NaN, high: 120, low: 90, close: 100 }
      ],
      height: 260,
      highKey: "high",
      lowKey: "low",
      openKey: "open",
      width: 360,
      xKey: "day"
    });

    expect(model.candles).toHaveLength(3);
  });
});

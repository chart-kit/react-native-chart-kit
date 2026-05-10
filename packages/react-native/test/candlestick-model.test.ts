import { describe, expect, it } from "vitest";

import {
  buildCandlestickChartModel,
  getResponsiveCandlestickBandPadding,
  getResponsiveCandlestickWidthRatio
} from "../src/charts/candlestick/model";
import { chartKitTheme, rows } from "./candlestick.fixtures";

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

  it("builds opt-in volume overlay bars", () => {
    const model = buildCandlestickChartModel({
      chartKitTheme,
      closeKey: "close",
      data: rows,
      height: 260,
      highKey: "high",
      lowKey: "low",
      openKey: "open",
      volumeKey: "volume",
      width: 360,
      xKey: "day",
      yDomain: [80, 120]
    });

    expect(model.volumeBars).toHaveLength(3);
    expect(model.volumeBars[1]?.height).toBeGreaterThan(
      model.volumeBars[0]?.height ?? 0
    );
    expect(model.volumeBars[0]?.opacity).toBe(0.18);
    expect(model.volumeBars[0]?.color).toBe(model.candles[0]?.color);
  });

  it("preserves source indexes for viewport slices", () => {
    const model = buildCandlestickChartModel({
      chartKitTheme,
      closeKey: "close",
      data: rows.slice(1),
      dataIndexOffset: 1,
      height: 260,
      highKey: "high",
      lowKey: "low",
      openKey: "open",
      width: 360,
      xKey: "day"
    });

    expect(model.candles.map((candle) => candle.dataIndex)).toEqual([1, 2]);
    expect(model.xLabels.map((label) => label.index)).toEqual([1, 2]);
  });

  it("compresses candle gaps for dense zoomed-out ranges", () => {
    expect(getResponsiveCandlestickBandPadding(4)).toEqual({
      paddingInner: 0.04,
      paddingOuter: 0.04
    });
    expect(
      getResponsiveCandlestickWidthRatio({ candleWidthRatio: 0.46, step: 4 })
    ).toBe(0.92);
    expect(
      getResponsiveCandlestickWidthRatio({ candleWidthRatio: 0.46, step: 24 })
    ).toBe(0.46);

    const denseRows = Array.from({ length: 72 }, (_, index) => ({
      close: 100 + Math.sin(index / 3) * 6,
      day: `D${index}`,
      high: 108 + Math.sin(index / 3) * 6,
      low: 94 + Math.sin(index / 3) * 6,
      open: 101 + Math.cos(index / 4) * 5,
      volume: 20 + index
    }));
    const model = buildCandlestickChartModel({
      candleWidthRatio: 0.46,
      chartKitTheme,
      closeKey: "close",
      data: denseRows,
      height: 260,
      highKey: "high",
      lowKey: "low",
      openKey: "open",
      width: 360,
      xKey: "day"
    });
    const first = model.candles[0]!;
    const second = model.candles[1]!;
    const step = second.wickX - first.wickX;

    expect(first.bodyWidth / step).toBeGreaterThan(0.82);
  });
});

import { describe, expect, it } from "vitest";

import {
  getStockCandlePriceDomain,
  getStockCandlesForInterval,
  stockCandles,
  type StockCandlePoint
} from "./v2Finance";

const fixtureCandles: StockCandlePoint[] = [
  { close: 11, day: "2026-01-05", high: 12, low: 9, open: 10, volume: 100 },
  { close: 14, day: "2026-01-06", high: 15, low: 10, open: 11, volume: 130 },
  { close: 12, day: "2026-01-09", high: 14, low: 11, open: 14, volume: 90 },
  { close: 15, day: "2026-01-12", high: 16, low: 12, open: 12, volume: 110 },
  { close: 17, day: "2026-02-02", high: 18, low: 14, open: 15, volume: 160 }
];

describe("v2 finance showcase fixtures", () => {
  it("generates a dense one-year stock candle fixture", () => {
    expect(stockCandles.length).toBeGreaterThan(240);
    expect(stockCandles[0]?.day).toBe("2025-05-01");
    expect(stockCandles.at(-1)?.day).toBe("2026-04-30");
  });

  it("keeps daily candles unchanged", () => {
    expect(getStockCandlesForInterval(fixtureCandles, "1D")).toBe(
      fixtureCandles
    );
  });

  it("aggregates weekly candles with first open and last close", () => {
    const weekly = getStockCandlesForInterval(fixtureCandles, "1W");

    expect(weekly).toEqual([
      {
        close: 12,
        day: "2026-01-05",
        high: 15,
        low: 9,
        open: 10,
        volume: 320
      },
      {
        close: 15,
        day: "2026-01-12",
        high: 16,
        low: 12,
        open: 12,
        volume: 110
      },
      {
        close: 17,
        day: "2026-02-02",
        high: 18,
        low: 14,
        open: 15,
        volume: 160
      }
    ]);
  });

  it("aggregates monthly candles for higher timeframe previews", () => {
    const monthly = getStockCandlesForInterval(fixtureCandles, "1M");

    expect(monthly).toEqual([
      {
        close: 15,
        day: "2026-01-01",
        high: 16,
        low: 9,
        open: 10,
        volume: 430
      },
      {
        close: 17,
        day: "2026-02-01",
        high: 18,
        low: 14,
        open: 15,
        volume: 160
      }
    ]);
  });

  it("builds a padded full-series price domain for stable financial panning", () => {
    expect(getStockCandlePriceDomain(fixtureCandles, 0.1)).toEqual([8.1, 18.9]);
  });
});

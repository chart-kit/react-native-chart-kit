import { describe, expect, it } from "vitest";

import {
  getCandlestickPriceScaleDomain,
  getCandlestickPriceScaleFromDrag,
  getCandlestickPriceScaleTicks
} from "../src/charts/candlestick/priceScaleUtils";

describe("candlestick price scale helpers", () => {
  it("compresses and expands a base price domain around its center", () => {
    expect(
      getCandlestickPriceScaleDomain({
        baseDomain: [100, 200],
        scale: 2
      })
    ).toEqual([125, 175]);
    expect(
      getCandlestickPriceScaleDomain({
        baseDomain: [100, 200],
        scale: 0.5,
        minScale: 0.5
      })
    ).toEqual([50, 250]);
  });

  it("generates top-to-bottom price labels", () => {
    expect(
      getCandlestickPriceScaleTicks({
        domain: [100, 200],
        tickCount: 3
      })
    ).toEqual([200, 150, 100]);
  });

  it("maps vertical drag into bounded scale changes", () => {
    expect(
      getCandlestickPriceScaleFromDrag({
        maxScale: 3,
        startScale: 1,
        translationY: -190
      })
    ).toBeCloseTo(Math.E);
    expect(
      getCandlestickPriceScaleFromDrag({
        maxScale: 2,
        startScale: 1,
        translationY: -190
      })
    ).toBe(2);
    expect(
      getCandlestickPriceScaleFromDrag({
        minScale: 0.75,
        startScale: 1,
        translationY: 190
      })
    ).toBe(0.75);
  });
});

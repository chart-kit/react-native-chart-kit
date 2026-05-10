import { describe, expect, it } from "vitest";

import {
  buildCandlestickChartSelectEvent,
  getCandlestickAtPoint,
  getCandlestickChartInteractionConfig,
  getNearestCandlestickByX,
  isCandlestickChartScrollableTap
} from "../src/charts/candlestick/interaction";
import {
  getCandlestickChartTooltipConfig,
  getCandlestickChartTooltipModel
} from "../src/charts/candlestick/tooltipModel";
import type { CandlestickChartCandleModel } from "../src/charts/candlestick/types";

const candle = {
  bodyHeight: 28,
  bodyWidth: 12,
  bodyX: 94,
  bodyY: 72,
  close: 108,
  closeY: 72,
  color: "#16a34a",
  dataIndex: 2,
  defined: true,
  direction: "up",
  high: 112,
  highY: 52,
  key: "candle-2",
  low: 98,
  lowY: 122,
  open: 101,
  openY: 100,
  raw: { day: "Wed", open: 101, high: 112, low: 98, close: 108 },
  wickX: 100,
  xValue: "Wed"
} satisfies CandlestickChartCandleModel<{
  close: number;
  day: string;
  high: number;
  low: number;
  open: number;
}>;

const themeTooltip = {
  background: "#ffffff",
  border: "#d1d5db",
  borderRadius: 8,
  fontSize: 11,
  labelFontSize: 11,
  mutedText: "#64748b",
  padding: 8,
  shadowColor: "#020617",
  shadowOffsetX: 0,
  shadowOffsetY: 1,
  shadowOpacity: 0.08,
  text: "#0f172a"
};

describe("CandlestickChart interaction helpers", () => {
  it("keeps tap interaction opt-in", () => {
    const onDeselect = () => undefined;

    expect(getCandlestickChartInteractionConfig(undefined)).toEqual({
      activation: "press",
      deselectOnOutsidePress: false,
      longPressDelayMs: 320,
      mode: "none"
    });
    expect(getCandlestickChartInteractionConfig("tap")).toEqual({
      activation: "press",
      deselectOnOutsidePress: true,
      longPressDelayMs: 320,
      mode: "tap"
    });
    expect(getCandlestickChartInteractionConfig("crosshair")).toEqual({
      activation: "press",
      deselectOnOutsidePress: true,
      longPressDelayMs: 320,
      mode: "crosshair"
    });
    expect(
      getCandlestickChartInteractionConfig({
        activation: "longPress",
        longPressDelayMs: 260,
        mode: "crosshair"
      })
    ).toMatchObject({
      activation: "longPress",
      longPressDelayMs: 260,
      mode: "crosshair"
    });
    expect(
      getCandlestickChartInteractionConfig({
        mode: "crosshair",
        onDeselect
      }).onDeselect
    ).toBe(onDeselect);
  });

  it("hit-tests wick and body regions", () => {
    expect(
      getCandlestickAtPoint({
        candles: [candle],
        locationX: 100,
        locationY: 58
      })?.key
    ).toBe("candle-2");
    expect(
      getCandlestickAtPoint({
        candles: [candle],
        locationX: 160,
        locationY: 58
      })
    ).toBeUndefined();
  });

  it("keeps scrollable taps separate from horizontal drags", () => {
    expect(
      isCandlestickChartScrollableTap({
        endTime: 180,
        maxDistance: 5,
        startTime: 0
      })
    ).toBe(true);
    expect(
      isCandlestickChartScrollableTap({
        endTime: 180,
        maxDistance: 18,
        startTime: 0
      })
    ).toBe(false);
    expect(
      isCandlestickChartScrollableTap({
        endTime: 620,
        maxDistance: 5,
        startTime: 0
      })
    ).toBe(false);
  });

  it("finds the nearest candle by x for crosshair inspection", () => {
    const nextCandle = {
      ...candle,
      dataIndex: 3,
      key: "candle-3",
      wickX: 150
    };

    expect(
      getNearestCandlestickByX({
        candles: [candle, nextCandle],
        locationX: 136
      })?.key
    ).toBe("candle-3");
  });

  it("builds formatted OHLC selection events", () => {
    expect(
      buildCandlestickChartSelectEvent({
        candle,
        formatXLabel: (value) => `Day ${value}`,
        formatYLabel: (value) => `$${value}`
      })
    ).toMatchObject({
      dataIndex: 2,
      direction: "up",
      formattedClose: "$108",
      formattedHigh: "$112",
      formattedLow: "$98",
      formattedOpen: "$101",
      position: { x: 100, y: 72 },
      xLabel: "Day Wed"
    });
  });

  it("keeps OHLC tooltips inside plot bounds", () => {
    const config = getCandlestickChartTooltipConfig({
      themeTooltip,
      tooltip: { visible: true, width: 154 }
    });
    const tooltip = getCandlestickChartTooltipModel({
      boxes: { plot: { height: 180, width: 240, x: 44, y: 18 } },
      candle,
      config,
      formatXLabel: (value) => `${value}`,
      formatYLabel: (value) => `$${value}`
    });

    expect(tooltip).toMatchObject({
      height: 95,
      lines: [
        { label: "O", value: "$101" },
        { label: "H", value: "$112" },
        { label: "L", value: "$98" },
        { label: "C", value: "$108" }
      ],
      width: 154,
      x: 48,
      xLabel: "Wed"
    });
  });
});

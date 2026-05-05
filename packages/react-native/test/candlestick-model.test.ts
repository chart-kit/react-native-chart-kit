import { describe, expect, it } from "vitest";

import { getCandlestickEmergencyClosureSessions } from "../src/charts/candlestick/emergencyClosures";
import { buildCandlestickChartModel } from "../src/charts/candlestick/model";

const chartKitTheme = {
  mode: "light" as const,
  preset: "default" as const,
  presets: {},
  theme: undefined
};

const rows = [
  { day: "Mon", open: 100, high: 112, low: 96, close: 108, volume: 42 },
  { day: "Tue", open: 108, high: 110, low: 91, close: 94, volume: 80 },
  { day: "Wed", open: 94, high: 102, low: 92, close: 94, volume: 34 }
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

  it("marks opt-in market session gaps between dated candles", () => {
    const model = buildCandlestickChartModel({
      chartKitTheme,
      closeKey: "close",
      data: [
        {
          day: "2026-06-05",
          open: 100,
          high: 112,
          low: 96,
          close: 108
        },
        {
          day: "2026-06-08",
          open: 108,
          high: 114,
          low: 104,
          close: 111
        }
      ],
      height: 260,
      highKey: "high",
      lowKey: "low",
      openKey: "open",
      sessionGaps: { label: true },
      width: 360,
      xKey: "day"
    });

    expect(model.sessionGaps).toHaveLength(1);
    expect(model.sessionGaps[0]).toMatchObject({
      calendar: "calendarDays",
      closedDays: 2,
      gapDays: 3,
      holidayCount: 0,
      key: "session-gap-0-1",
      label: "3d gap",
      nextIndex: 1,
      previousIndex: 0,
      weekendCount: 2
    });
    expect(model.sessionGaps[0]?.x).toBeGreaterThan(
      model.candles[0]?.wickX ?? 0
    );
    expect(model.sessionGaps[0]?.x).toBeLessThan(model.candles[1]?.wickX ?? 0);
  });

  it("supports holiday-aware trading calendars for session gaps", () => {
    const model = buildCandlestickChartModel({
      chartKitTheme,
      closeKey: "close",
      data: [
        {
          day: "2026-06-18",
          open: 100,
          high: 112,
          low: 96,
          close: 108
        },
        {
          day: "2026-06-22",
          open: 108,
          high: 114,
          low: 104,
          close: 111
        }
      ],
      height: 260,
      highKey: "high",
      lowKey: "low",
      openKey: "open",
      sessionGaps: {
        calendar: "tradingDays",
        holidays: ["2026-06-19"],
        label: ({ closedDays, holidayCount }) =>
          `${closedDays} closed / ${holidayCount} holiday`
      },
      width: 360,
      xKey: "day"
    });

    expect(model.sessionGaps).toHaveLength(1);
    expect(model.sessionGaps[0]).toMatchObject({
      calendar: "tradingDays",
      closedDays: 3,
      gapDays: 4,
      holidayCount: 1,
      label: "3 closed / 1 holiday",
      weekendCount: 2
    });
  });

  it("supports NYSE exchange-calendar session gaps", () => {
    const model = buildCandlestickChartModel({
      chartKitTheme,
      closeKey: "close",
      data: [
        {
          day: "2026-04-02",
          open: 100,
          high: 112,
          low: 96,
          close: 108
        },
        {
          day: "2026-04-06",
          open: 108,
          high: 114,
          low: 104,
          close: 111
        }
      ],
      height: 260,
      highKey: "high",
      lowKey: "low",
      openKey: "open",
      sessionGaps: { exchange: "nyse", label: true },
      width: 360,
      xKey: "day"
    });

    expect(model.sessionGaps).toHaveLength(1);
    expect(model.sessionGaps[0]).toMatchObject({
      calendar: "tradingDays",
      closedDays: 3,
      exchange: "nyse",
      holidayCount: 1,
      label: "3 closed",
      weekendCount: 2
    });
  });

  it("supports NASDAQ exchange-calendar observed holidays", () => {
    const model = buildCandlestickChartModel({
      chartKitTheme,
      closeKey: "close",
      data: [
        {
          day: "2026-07-02",
          open: 100,
          high: 112,
          low: 96,
          close: 108
        },
        {
          day: "2026-07-06",
          open: 108,
          high: 114,
          low: 104,
          close: 111
        }
      ],
      height: 260,
      highKey: "high",
      lowKey: "low",
      openKey: "open",
      sessionGaps: {
        exchange: "nasdaq",
        label: ({ exchange, holidayCount }) =>
          `${exchange ?? "market"} / ${holidayCount} holiday`
      },
      width: 360,
      xKey: "day"
    });

    expect(model.sessionGaps).toHaveLength(1);
    expect(model.sessionGaps[0]).toMatchObject({
      calendar: "tradingDays",
      closedDays: 3,
      exchange: "nasdaq",
      holidayCount: 1,
      label: "nasdaq / 1 holiday",
      weekendCount: 2
    });
  });

  it("marks early-close sessions on matching dated candles", () => {
    const model = buildCandlestickChartModel({
      chartKitTheme,
      closeKey: "close",
      data: [
        {
          day: "2026-11-27",
          open: 100,
          high: 112,
          low: 96,
          close: 108
        },
        {
          day: "2026-11-30",
          open: 108,
          high: 114,
          low: 104,
          close: 111
        }
      ],
      height: 260,
      highKey: "high",
      lowKey: "low",
      openKey: "open",
      sessionGaps: {
        exchange: "nyse",
        specialSessions: [
          {
            date: "2026-11-27",
            kind: "earlyClose",
            label: true
          }
        ]
      },
      width: 360,
      xKey: "day"
    });

    expect(model.sessionEvents).toHaveLength(1);
    expect(model.sessionEvents[0]).toMatchObject({
      kind: "earlyClose",
      label: "Early close",
      nextIndex: 0,
      previousIndex: 0
    });
    expect(model.sessionEvents[0]?.x).toBeCloseTo(
      (model.candles[0]?.wickX ?? 0) - 3
    );
  });

  it("marks exchange early-close preset sessions", () => {
    const model = buildCandlestickChartModel({
      chartKitTheme,
      closeKey: "close",
      data: [
        {
          day: "2026-11-25",
          open: 100,
          high: 112,
          low: 96,
          close: 108
        },
        {
          day: "2026-11-27",
          open: 108,
          high: 114,
          low: 104,
          close: 111
        },
        {
          day: "2026-12-24",
          open: 111,
          high: 118,
          low: 109,
          close: 116
        },
        {
          day: "2026-12-28",
          open: 116,
          high: 120,
          low: 110,
          close: 112
        }
      ],
      height: 260,
      highKey: "high",
      lowKey: "low",
      openKey: "open",
      sessionGaps: {
        earlyCloses: true,
        exchange: "nyse"
      },
      width: 360,
      xKey: "day"
    });

    expect(model.sessionEvents).toHaveLength(2);
    expect(
      model.sessionEvents.map(({ kind, label, previousIndex }) => ({
        kind,
        label,
        previousIndex
      }))
    ).toEqual([
      { kind: "earlyClose", label: "Early close", previousIndex: 1 },
      { kind: "earlyClose", label: "Early close", previousIndex: 2 }
    ]);
  });

  it("does not mark full exchange holidays as early closes", () => {
    const model = buildCandlestickChartModel({
      chartKitTheme,
      closeKey: "close",
      data: [
        {
          day: "2026-07-02",
          open: 100,
          high: 112,
          low: 96,
          close: 108
        },
        {
          day: "2026-07-03",
          open: 108,
          high: 114,
          low: 104,
          close: 111
        },
        {
          day: "2026-07-06",
          open: 111,
          high: 116,
          low: 109,
          close: 113
        }
      ],
      height: 260,
      highKey: "high",
      lowKey: "low",
      openKey: "open",
      sessionGaps: {
        earlyCloses: true,
        exchange: "nyse"
      },
      width: 360,
      xKey: "day"
    });

    expect(model.sessionEvents).toEqual([]);
  });

  it("marks emergency closures between dated candles", () => {
    const model = buildCandlestickChartModel({
      chartKitTheme,
      closeKey: "close",
      data: [
        {
          day: "2026-09-10",
          open: 100,
          high: 112,
          low: 96,
          close: 108
        },
        {
          day: "2026-09-14",
          open: 108,
          high: 114,
          low: 104,
          close: 111
        }
      ],
      height: 260,
      highKey: "high",
      lowKey: "low",
      openKey: "open",
      sessionGaps: {
        specialSessions: [
          {
            date: "2026-09-11",
            kind: "closure",
            label: ({ kind, previousIndex, nextIndex }) =>
              `${kind}:${previousIndex}-${nextIndex}`
          }
        ]
      },
      width: 360,
      xKey: "day"
    });

    expect(model.sessionEvents).toHaveLength(1);
    expect(model.sessionEvents[0]).toMatchObject({
      kind: "closure",
      label: "closure:0-1",
      nextIndex: 1,
      previousIndex: 0
    });
    expect(model.sessionEvents[0]?.x).toBeGreaterThan(
      model.candles[0]?.wickX ?? 0
    );
    expect(model.sessionEvents[0]?.x).toBeLessThan(
      model.candles[1]?.wickX ?? 0
    );
  });

  it("maps emergency closure feed rows to session markers", () => {
    const specialSessions = getCandlestickEmergencyClosureSessions(
      [
        {
          date: "2026-09-11",
          reason: "Exchange halt",
          width: 8
        }
      ],
      { fillOpacity: 0.2 }
    );
    const model = buildCandlestickChartModel({
      chartKitTheme,
      closeKey: "close",
      data: [
        {
          day: "2026-09-10",
          open: 100,
          high: 112,
          low: 96,
          close: 108
        },
        {
          day: "2026-09-14",
          open: 108,
          high: 114,
          low: 104,
          close: 111
        }
      ],
      height: 260,
      highKey: "high",
      lowKey: "low",
      openKey: "open",
      sessionGaps: { specialSessions },
      width: 360,
      xKey: "day"
    });

    expect(specialSessions).toEqual([
      {
        date: "2026-09-11",
        fillOpacity: 0.2,
        kind: "closure",
        label: "Exchange halt",
        width: 8
      }
    ]);
    expect(model.sessionEvents[0]).toMatchObject({
      fillOpacity: 0.2,
      kind: "closure",
      label: "Exchange halt",
      width: 8
    });
  });

  it("keeps session gaps disabled by default", () => {
    const model = buildCandlestickChartModel({
      chartKitTheme,
      closeKey: "close",
      data: [
        {
          day: "2026-06-05",
          open: 100,
          high: 112,
          low: 96,
          close: 108
        },
        {
          day: "2026-06-08",
          open: 108,
          high: 114,
          low: 104,
          close: 111
        }
      ],
      height: 260,
      highKey: "high",
      lowKey: "low",
      openKey: "open",
      width: 360,
      xKey: "day"
    });

    expect(model.sessionGaps).toEqual([]);
  });
});

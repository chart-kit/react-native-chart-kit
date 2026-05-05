import type { ChartXValue } from "@chart-kit/core";

import {
  getCandlestickExchangeEarlyCloseKeys,
  isCandlestickExchangeHoliday
} from "./exchangeCalendars";
import type {
  CandlestickChartModel,
  CandlestickChartSessionEventModel,
  CandlestickChartSessionGapCalendar,
  CandlestickChartSessionGapConfig,
  CandlestickChartSessionGapModel,
  CandlestickChartSpecialSessionConfig
} from "./types";

const dayMs = 24 * 60 * 60 * 1000;
const defaultSessionGapMinDays = 1.5;
const defaultTradingWeekdays = [1, 2, 3, 4, 5] as const;

const getTimestamp = (value: ChartXValue): number | undefined => {
  if (value instanceof Date) {
    const timestamp = value.getTime();

    return Number.isFinite(timestamp) ? timestamp : undefined;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const timestamp = Date.parse(value);

  return Number.isFinite(timestamp) ? timestamp : undefined;
};

const getUtcDayStart = (timestamp: number) => {
  const date = new Date(timestamp);

  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

const getUtcDateKey = (timestamp: number) =>
  new Date(getUtcDayStart(timestamp)).toISOString().slice(0, 10);

const getHolidaySet = (holidays: readonly (Date | string)[] | undefined) =>
  new Set(
    (holidays ?? []).flatMap((holiday) => {
      const timestamp =
        holiday instanceof Date ? holiday.getTime() : Date.parse(holiday);

      return Number.isFinite(timestamp) ? [getUtcDateKey(timestamp)] : [];
    })
  );

const getClosedDayStats = <TData>({
  config,
  nextTimestamp,
  previousTimestamp
}: {
  config: CandlestickChartSessionGapConfig<TData>;
  nextTimestamp: number;
  previousTimestamp: number;
}) => {
  const holidaySet = getHolidaySet(config.holidays);
  const tradingWeekdays = new Set(
    config.tradingWeekdays ?? defaultTradingWeekdays
  );
  let closedDays = 0;
  let holidayCount = 0;
  let weekendCount = 0;

  for (
    let day = getUtcDayStart(previousTimestamp) + dayMs;
    day < getUtcDayStart(nextTimestamp);
    day += dayMs
  ) {
    const weekday = new Date(day).getUTCDay();
    const isHoliday =
      holidaySet.has(getUtcDateKey(day)) ||
      isCandlestickExchangeHoliday({
        exchange: config.exchange,
        timestamp: day
      });
    const isTradingWeekday = tradingWeekdays.has(weekday);

    if (!isTradingWeekday || isHoliday) {
      closedDays += 1;
      holidayCount += isHoliday ? 1 : 0;
      weekendCount += !isTradingWeekday ? 1 : 0;
    }
  }

  return { closedDays, holidayCount, weekendCount };
};

export const resolveCandlestickSessionGapConfig = <TData = unknown>(
  config: boolean | CandlestickChartSessionGapConfig<TData> | undefined
): CandlestickChartSessionGapConfig<TData> & { visible: boolean } => {
  if (config === true) {
    return { visible: true };
  }

  if (config === false || config === undefined) {
    return { visible: false };
  }

  return { ...config, visible: config.visible !== false };
};

const getDefaultSessionGapLabel = ({
  calendar,
  closedDays,
  gapDays
}: {
  calendar: CandlestickChartSessionGapCalendar;
  closedDays: number;
  gapDays: number;
}) => {
  if (calendar === "tradingDays") {
    return closedDays > 0 ? `${closedDays} closed` : "";
  }

  return gapDays >= 2 ? `${Math.round(gapDays)}d gap` : "";
};

const getSpecialSessionKey = (session: {
  date: Date | string;
  kind: string;
}) => {
  const timestamp = getTimestamp(session.date);

  return timestamp === undefined
    ? undefined
    : `${session.kind}-${getUtcDateKey(timestamp)}`;
};

const getDefaultSpecialSessionLabel = <TData>(
  session: CandlestickChartSpecialSessionConfig<TData>
) => {
  if (typeof session.label === "string") {
    return session.label;
  }

  if (session.label !== true) {
    return undefined;
  }

  return session.kind === "earlyClose" ? "Early close" : "Closed";
};

const getSpecialSessionYears = <TData extends Record<string, unknown>>(
  candles: CandlestickChartModel<TData>["candles"]
) => {
  const years = new Set<number>();

  candles.forEach((candle) => {
    const timestamp = getTimestamp(candle.xValue);

    if (timestamp !== undefined) {
      years.add(new Date(timestamp).getUTCFullYear());
    }
  });

  return [...years].sort();
};

const getConfiguredEarlyCloseSessions = <
  TData extends Record<string, unknown>
>({
  candles,
  config
}: {
  candles: CandlestickChartModel<TData>["candles"];
  config: CandlestickChartSessionGapConfig<TData> & { visible: boolean };
}): Array<CandlestickChartSpecialSessionConfig<TData>> => {
  if (!config.visible || !config.earlyCloses) {
    return [];
  }

  const exchange = config.exchange;
  const dates = Array.isArray(config.earlyCloses)
    ? config.earlyCloses
    : exchange
      ? getSpecialSessionYears(candles).flatMap((year) => [
          ...getCandlestickExchangeEarlyCloseKeys(exchange, year)
        ])
      : [];

  return dates.map((date) => ({
    date,
    kind: "earlyClose",
    label: config.earlyCloseLabel ?? true
  }));
};

const getResolvedSpecialSessions = <TData extends Record<string, unknown>>({
  candles,
  config
}: {
  candles: CandlestickChartModel<TData>["candles"];
  config: CandlestickChartSessionGapConfig<TData> & { visible: boolean };
}) => {
  const sessionsByKey = new Map<
    string,
    CandlestickChartSpecialSessionConfig<TData>
  >();

  [
    ...getConfiguredEarlyCloseSessions({ candles, config }),
    ...(config.specialSessions ?? [])
  ].forEach((session) => {
    const key = getSpecialSessionKey(session);

    if (key) {
      sessionsByKey.set(key, session);
    }
  });

  return [...sessionsByKey.values()];
};

const findSpecialSessionAnchor = <TData extends Record<string, unknown>>({
  candles,
  timestamp
}: {
  candles: CandlestickChartModel<TData>["candles"];
  timestamp: number;
}) => {
  const targetDay = getUtcDayStart(timestamp);
  const exactCandle = candles.find((candle) => {
    const candleTimestamp = getTimestamp(candle.xValue);

    return (
      candleTimestamp !== undefined &&
      getUtcDayStart(candleTimestamp) === targetDay
    );
  });

  if (exactCandle) {
    return {
      candle: exactCandle,
      next: exactCandle.raw,
      nextIndex: exactCandle.dataIndex,
      previous: exactCandle.raw,
      previousIndex: exactCandle.dataIndex,
      x: exactCandle.wickX
    };
  }

  for (let index = 0; index < candles.length - 1; index += 1) {
    const previous = candles[index];
    const next = candles[index + 1];
    const previousTimestamp = previous
      ? getTimestamp(previous.xValue)
      : undefined;
    const nextTimestamp = next ? getTimestamp(next.xValue) : undefined;

    if (
      previous &&
      next &&
      previousTimestamp !== undefined &&
      nextTimestamp !== undefined &&
      previousTimestamp < timestamp &&
      timestamp < nextTimestamp
    ) {
      const ratio =
        (timestamp - previousTimestamp) / (nextTimestamp - previousTimestamp);

      return {
        next: next.raw,
        nextIndex: next.dataIndex,
        previous: previous.raw,
        previousIndex: previous.dataIndex,
        x: previous.wickX + (next.wickX - previous.wickX) * ratio
      };
    }
  }

  return undefined;
};

export const buildCandlestickSessionEventModels = <
  TData extends Record<string, unknown>
>({
  boxes,
  candles,
  config,
  resolvedTheme
}: {
  boxes: CandlestickChartModel<TData>["boxes"];
  candles: CandlestickChartModel<TData>["candles"];
  config: CandlestickChartSessionGapConfig<TData> & { visible: boolean };
  resolvedTheme: CandlestickChartModel<TData>["resolvedTheme"];
}): Array<CandlestickChartSessionEventModel<TData>> => {
  const sessions = getResolvedSpecialSessions({ candles, config });

  if (!config.visible || !sessions.length) {
    return [];
  }

  return sessions.flatMap((session) => {
    const timestamp = getTimestamp(session.date);
    const key = getSpecialSessionKey(session);

    if (timestamp === undefined || key === undefined) {
      return [];
    }

    const anchor = findSpecialSessionAnchor({ candles, timestamp });

    if (!anchor) {
      return [];
    }

    const width = Math.max(2, Math.min(18, session.width ?? 6));
    const label =
      typeof session.label === "function"
        ? session.label({
            candle: anchor.candle,
            date: session.date,
            kind: session.kind,
            next: anchor.next,
            nextIndex: anchor.nextIndex,
            previous: anchor.previous,
            previousIndex: anchor.previousIndex
          })
        : getDefaultSpecialSessionLabel(session);

    return [
      {
        fill: session.fill ?? resolvedTheme.grid,
        fillOpacity:
          session.fillOpacity ?? (session.kind === "closure" ? 0.12 : 0.08),
        height: boxes.plot.height,
        key: `session-event-${key}`,
        kind: session.kind,
        label,
        labelX: anchor.x,
        labelY: boxes.plot.y + boxes.plot.height - 4,
        next: anchor.next,
        nextIndex: anchor.nextIndex,
        previous: anchor.previous,
        previousIndex: anchor.previousIndex,
        stroke:
          session.stroke ??
          (session.kind === "closure"
            ? (resolvedTheme.series[3] ?? resolvedTheme.axis)
            : resolvedTheme.axis),
        strokeDasharray: session.strokeDasharray ?? [2, 3],
        strokeOpacity:
          session.strokeOpacity ?? (session.kind === "closure" ? 0.42 : 0.3),
        strokeWidth: session.strokeWidth ?? 1,
        width,
        x: anchor.x - width / 2,
        y: boxes.plot.y
      }
    ];
  });
};

export const buildCandlestickSessionGapModels = <
  TData extends Record<string, unknown>
>({
  boxes,
  candles,
  config,
  resolvedTheme
}: {
  boxes: CandlestickChartModel<TData>["boxes"];
  candles: CandlestickChartModel<TData>["candles"];
  config: CandlestickChartSessionGapConfig<TData> & { visible: boolean };
  resolvedTheme: CandlestickChartModel<TData>["resolvedTheme"];
}): Array<CandlestickChartSessionGapModel<TData>> => {
  if (!config.visible || candles.length < 2) {
    return [];
  }

  const minGapMs =
    config.minGapMs ??
    Math.max(0, config.minGapDays ?? defaultSessionGapMinDays) * dayMs;
  const calendar =
    config.calendar ?? (config.exchange ? "tradingDays" : "calendarDays");
  const minClosedDays = Math.max(0, config.minClosedDays ?? 1);

  return candles.flatMap((previous, index) => {
    const next = candles[index + 1];

    if (!next) {
      return [];
    }

    const previousTimestamp = getTimestamp(previous.xValue);
    const nextTimestamp = getTimestamp(next.xValue);

    if (previousTimestamp === undefined || nextTimestamp === undefined) {
      return [];
    }

    const gapMs = nextTimestamp - previousTimestamp;
    const gapDays = gapMs / dayMs;
    const { closedDays, holidayCount, weekendCount } = getClosedDayStats({
      config,
      nextTimestamp,
      previousTimestamp
    });
    const shouldShowGap =
      calendar === "tradingDays"
        ? closedDays >= minClosedDays
        : gapMs > minGapMs;

    if (!shouldShowGap) {
      return [];
    }

    const x = (previous.wickX + next.wickX) / 2;
    const label =
      typeof config.label === "function"
        ? config.label({
            calendar,
            closedDays,
            exchange: config.exchange,
            gapDays,
            gapMs,
            holidayCount,
            next: next.raw,
            nextIndex: next.dataIndex,
            previous: previous.raw,
            previousIndex: previous.dataIndex,
            weekendCount
          })
        : config.label === true
          ? getDefaultSessionGapLabel({ calendar, closedDays, gapDays })
          : undefined;
    const width = Math.max(2, Math.min(18, config.width ?? previous.bodyWidth));

    return [
      {
        calendar,
        closedDays,
        exchange: config.exchange,
        fill: config.fill ?? resolvedTheme.grid,
        fillOpacity: config.fillOpacity ?? 0.08,
        gapDays,
        gapMs,
        height: boxes.plot.height,
        holidayCount,
        key: `session-gap-${previous.dataIndex}-${next.dataIndex}`,
        label: label || undefined,
        labelX: x,
        labelY: boxes.plot.y + 12,
        next: next.raw,
        nextIndex: next.dataIndex,
        previous: previous.raw,
        previousIndex: previous.dataIndex,
        stroke: config.stroke ?? resolvedTheme.axis,
        strokeDasharray: config.strokeDasharray ?? [3, 4],
        strokeOpacity: config.strokeOpacity ?? 0.28,
        strokeWidth: config.strokeWidth ?? 1,
        weekendCount,
        width,
        x: x - width / 2,
        y: boxes.plot.y
      }
    ];
  });
};

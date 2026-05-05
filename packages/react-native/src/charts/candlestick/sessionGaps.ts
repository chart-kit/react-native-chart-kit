import type { ChartXValue } from "@chart-kit/core";

import type {
  CandlestickChartModel,
  CandlestickChartSessionGapCalendar,
  CandlestickChartSessionGapConfig,
  CandlestickChartSessionGapModel
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
    const isHoliday = holidaySet.has(getUtcDateKey(day));
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
  const calendar = config.calendar ?? "calendarDays";
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

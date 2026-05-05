import type { CandlestickChartSessionGapExchange } from "./types";

const dayMs = 24 * 60 * 60 * 1000;
const usEquityHolidayCache = new Map<string, Set<string>>();
const usEquityEarlyCloseCache = new Map<string, Set<string>>();

const getUtcDateKey = (timestamp: number) =>
  new Date(timestamp).toISOString().slice(0, 10);

const getUtcTimestamp = (year: number, month: number, day: number) =>
  Date.UTC(year, month, day);

const getDateKey = (year: number, month: number, day: number) =>
  getUtcDateKey(getUtcTimestamp(year, month, day));

const addObservedFixedHoliday = ({
  day,
  holidays,
  month,
  skipSaturdayObservation = false,
  year
}: {
  day: number;
  holidays: Set<string>;
  month: number;
  skipSaturdayObservation?: boolean;
  year: number;
}) => {
  const timestamp = getUtcTimestamp(year, month, day);
  const weekday = new Date(timestamp).getUTCDay();

  if (weekday === 0) {
    holidays.add(getUtcDateKey(timestamp + dayMs));
    return;
  }

  if (weekday === 6) {
    if (!skipSaturdayObservation) {
      holidays.add(getUtcDateKey(timestamp - dayMs));
    }
    return;
  }

  holidays.add(getUtcDateKey(timestamp));
};

const getNthWeekdayOfMonthTimestamp = ({
  month,
  nth,
  weekday,
  year
}: {
  month: number;
  nth: number;
  weekday: number;
  year: number;
}) => {
  const first = getUtcTimestamp(year, month, 1);
  const firstWeekday = new Date(first).getUTCDay();
  const offset = (weekday - firstWeekday + 7) % 7;
  const day = 1 + offset + (nth - 1) * 7;

  return getUtcTimestamp(year, month, day);
};

const getNthWeekdayOfMonthKey = ({
  month,
  nth,
  weekday,
  year
}: {
  month: number;
  nth: number;
  weekday: number;
  year: number;
}) => {
  const day = new Date(
    getNthWeekdayOfMonthTimestamp({ month, nth, weekday, year })
  ).getUTCDate();

  return getDateKey(year, month, day);
};

const getLastWeekdayOfMonthKey = ({
  month,
  weekday,
  year
}: {
  month: number;
  weekday: number;
  year: number;
}) => {
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const last = getUtcTimestamp(year, month, lastDay);
  const lastWeekday = new Date(last).getUTCDay();
  const offset = (lastWeekday - weekday + 7) % 7;

  return getDateKey(year, month, lastDay - offset);
};

const getGoodFridayKey = (year: number) => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const easterMonth = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const easterDay = ((h + l - 7 * m + 114) % 31) + 1;

  return getUtcDateKey(
    getUtcTimestamp(year, easterMonth, easterDay) - 2 * dayMs
  );
};

export const getCandlestickExchangeHolidayKeys = (
  exchange: CandlestickChartSessionGapExchange,
  year: number
) => {
  const cacheKey = `${exchange}:${year}`;
  const cached = usEquityHolidayCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const holidays = new Set<string>();

  addObservedFixedHoliday({
    day: 1,
    holidays,
    month: 0,
    skipSaturdayObservation: true,
    year
  });
  holidays.add(getNthWeekdayOfMonthKey({ month: 0, nth: 3, weekday: 1, year }));
  holidays.add(getNthWeekdayOfMonthKey({ month: 1, nth: 3, weekday: 1, year }));
  holidays.add(getGoodFridayKey(year));
  holidays.add(getLastWeekdayOfMonthKey({ month: 4, weekday: 1, year }));
  addObservedFixedHoliday({ day: 19, holidays, month: 5, year });
  addObservedFixedHoliday({ day: 4, holidays, month: 6, year });
  holidays.add(getNthWeekdayOfMonthKey({ month: 8, nth: 1, weekday: 1, year }));
  holidays.add(
    getNthWeekdayOfMonthKey({ month: 10, nth: 4, weekday: 4, year })
  );
  addObservedFixedHoliday({ day: 25, holidays, month: 11, year });

  usEquityHolidayCache.set(cacheKey, holidays);

  return holidays;
};

const addEarlyCloseCandidate = ({
  earlyCloses,
  exchange,
  timestamp,
  year
}: {
  earlyCloses: Set<string>;
  exchange: CandlestickChartSessionGapExchange;
  timestamp: number;
  year: number;
}) => {
  const weekday = new Date(timestamp).getUTCDay();

  if (weekday === 0 || weekday === 6) {
    return;
  }

  const key = getUtcDateKey(timestamp);

  if (!getCandlestickExchangeHolidayKeys(exchange, year).has(key)) {
    earlyCloses.add(key);
  }
};

export const getCandlestickExchangeEarlyCloseKeys = (
  exchange: CandlestickChartSessionGapExchange,
  year: number
) => {
  const cacheKey = `${exchange}:${year}`;
  const cached = usEquityEarlyCloseCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const earlyCloses = new Set<string>();

  addEarlyCloseCandidate({
    earlyCloses,
    exchange,
    timestamp: getUtcTimestamp(year, 6, 3),
    year
  });
  addEarlyCloseCandidate({
    earlyCloses,
    exchange,
    timestamp:
      getNthWeekdayOfMonthTimestamp({
        month: 10,
        nth: 4,
        weekday: 4,
        year
      }) + dayMs,
    year
  });
  addEarlyCloseCandidate({
    earlyCloses,
    exchange,
    timestamp: getUtcTimestamp(year, 11, 24),
    year
  });

  usEquityEarlyCloseCache.set(cacheKey, earlyCloses);

  return earlyCloses;
};

export const isCandlestickExchangeHoliday = ({
  exchange,
  timestamp
}: {
  exchange: CandlestickChartSessionGapExchange | undefined;
  timestamp: number;
}) => {
  if (!exchange) {
    return false;
  }

  const year = new Date(timestamp).getUTCFullYear();
  const holidayKeys = getCandlestickExchangeHolidayKeys(exchange, year);

  return holidayKeys.has(getUtcDateKey(timestamp));
};

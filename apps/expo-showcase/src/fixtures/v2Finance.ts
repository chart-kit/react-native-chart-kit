export type StockCandlePoint = {
  close: number;
  day: string;
  high: number;
  low: number;
  open: number;
  volume: number;
};

export type StockCandleInterval = "1D" | "1W" | "1M";

const roundPrice = (value: number) => Math.round(value * 100) / 100;

const toIsoDay = (date: Date) => date.toISOString().slice(0, 10);

const getUtcDay = (isoDay: string) => new Date(`${isoDay}T00:00:00Z`);

const getWeekKey = (isoDay: string) => {
  const date = getUtcDay(isoDay);
  const day = date.getUTCDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;

  date.setUTCDate(date.getUTCDate() + mondayOffset);

  return toIsoDay(date);
};

const stockEventShocks: Record<number, number> = {
  34: -13,
  78: 18,
  137: -21,
  188: 16,
  232: -10
};

const createOneYearStockCandles = (): StockCandlePoint[] => {
  const candles: StockCandlePoint[] = [];
  const end = Date.UTC(2026, 3, 30);
  let date = new Date(Date.UTC(2025, 4, 1));
  let price = 184;

  while (date.getTime() <= end) {
    const day = date.getUTCDay();

    if (day !== 0 && day !== 6) {
      const index = candles.length;
      const open = price + Math.sin(index / 5) * 1.2;
      const shock = stockEventShocks[index] ?? 0;
      const move =
        Math.sin(index / 3.2) * 3.6 +
        Math.cos(index / 9.5) * 2.8 +
        Math.sin(index / 17) * 2.1 +
        shock;
      const close = Math.max(78, open + move);
      const wick = 1.8 + Math.abs(move) * 0.24 + Math.abs(Math.sin(index)) * 3;
      const high = Math.max(open, close) + wick;
      const low = Math.min(open, close) - wick * 0.9;

      candles.push({
        close: roundPrice(close),
        day: toIsoDay(date),
        high: roundPrice(high),
        low: roundPrice(low),
        open: roundPrice(open),
        volume: Math.round(
          78 +
            Math.abs(move) * 7 +
            Math.abs(shock) * 4 +
            Math.sin(index / 8) * 12
        )
      });
      price = close + Math.sin(index / 11) * 0.8;
    }

    date = new Date(date.getTime() + 24 * 60 * 60 * 1000);
  }

  return candles;
};

const aggregateCandles = (
  candles: StockCandlePoint[],
  getGroupKey: (day: string) => string
) => {
  const groups: StockCandlePoint[] = [];

  candles.forEach((candle) => {
    const key = getGroupKey(candle.day);
    const last = groups[groups.length - 1];

    if (!last || getGroupKey(last.day) !== key) {
      groups.push({ ...candle, day: key });
      return;
    }

    last.close = candle.close;
    last.high = Math.max(last.high, candle.high);
    last.low = Math.min(last.low, candle.low);
    last.volume += candle.volume;
  });

  return groups;
};

export const getStockCandlesForInterval = (
  candles: StockCandlePoint[],
  interval: StockCandleInterval
) => {
  if (interval === "1W") {
    return aggregateCandles(candles, getWeekKey);
  }

  if (interval === "1M") {
    return aggregateCandles(candles, (day) => `${day.slice(0, 7)}-01`);
  }

  return candles;
};

export const stockCandles: StockCandlePoint[] = createOneYearStockCandles();

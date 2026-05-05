import type { ChartXValue } from "../data";

export type CandlestickDirection = "up" | "down" | "flat";

export type CandlestickDatum<TData = unknown> = {
  close: number;
  high: number;
  index: number;
  low: number;
  open: number;
  raw: TData;
  x: ChartXValue;
};

export type ProjectedCandlestick<TData = unknown> = {
  bodyHeight: number;
  bodyWidth: number;
  bodyX: number;
  bodyY: number;
  close: number;
  closeY: number;
  dataIndex: number;
  defined: boolean;
  direction: CandlestickDirection;
  high: number;
  highY: number;
  key: string;
  low: number;
  lowY: number;
  open: number;
  openY: number;
  raw: TData;
  wickX: number;
  xValue: ChartXValue;
};

export type ProjectCandlestickBand = (
  value: ChartXValue,
  dataIndex: number
) => { width: number; x: number } | undefined;

export type BuildCandlestickGeometryOptions<TData = unknown> = {
  candleWidthRatio?: number;
  data: Array<CandlestickDatum<TData>>;
  xBand: ProjectCandlestickBand;
  yScale: (value: number) => number | undefined;
};

export type CandlestickGeometry<TData = unknown> = {
  candles: Array<ProjectedCandlestick<TData>>;
};

const clampRatio = (value: number | undefined, fallback: number) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(1, value))
    : fallback;

const isFinitePosition = (value: number | undefined): value is number =>
  typeof value === "number" && Number.isFinite(value);

const getDirection = ({
  close,
  open
}: {
  close: number;
  open: number;
}): CandlestickDirection => {
  if (close > open) {
    return "up";
  }

  if (close < open) {
    return "down";
  }

  return "flat";
};

export const buildCandlestickGeometry = <TData = unknown>({
  candleWidthRatio = 0.62,
  data,
  xBand,
  yScale
}: BuildCandlestickGeometryOptions<TData>): CandlestickGeometry<TData> => {
  const widthRatio = clampRatio(candleWidthRatio, 0.62);
  const candles = data.flatMap<ProjectedCandlestick<TData>>((item) => {
    const band = xBand(item.x, item.index);

    if (!band) {
      return [];
    }

    const high = Math.max(item.high, item.open, item.close, item.low);
    const low = Math.min(item.low, item.open, item.close, item.high);
    const highY = yScale(high);
    const lowY = yScale(low);
    const openY = yScale(item.open);
    const closeY = yScale(item.close);

    if (
      !isFinitePosition(highY) ||
      !isFinitePosition(lowY) ||
      !isFinitePosition(openY) ||
      !isFinitePosition(closeY)
    ) {
      return [];
    }

    const bodyWidth = band.width * widthRatio;
    const bodyX = band.x + (band.width - bodyWidth) / 2;
    const rawBodyY = Math.min(openY, closeY);
    const rawBodyHeight = Math.abs(openY - closeY);

    return [
      {
        bodyHeight: Math.max(1, rawBodyHeight),
        bodyWidth,
        bodyX,
        bodyY: rawBodyHeight === 0 ? rawBodyY - 0.5 : rawBodyY,
        close: item.close,
        closeY,
        dataIndex: item.index,
        defined: true,
        direction: getDirection(item),
        high,
        highY,
        key: `candle-${item.index}`,
        low,
        lowY,
        open: item.open,
        openY,
        raw: item.raw,
        wickX: band.x + band.width / 2,
        xValue: item.x
      }
    ];
  });

  return { candles };
};

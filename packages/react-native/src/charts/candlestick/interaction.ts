import type {
  CandlestickChartCandleModel,
  CandlestickChartDeselectEvent,
  CandlestickChartInteractionActivation,
  CandlestickChartInteraction,
  CandlestickChartSelectEvent
} from "./types";

export type ResolvedCandlestickChartInteractionConfig<TData = unknown> = {
  activation: CandlestickChartInteractionActivation;
  deselectOnOutsidePress: boolean;
  longPressDelayMs: number;
  mode: "none" | "tap" | "crosshair";
  onDeselect?: (event: CandlestickChartDeselectEvent) => void;
  onGestureEnd?: () => void;
  onGestureStart?: () => void;
  onSelect?: (event: CandlestickChartSelectEvent<TData>) => void;
};

export type CandlestickChartScrollableTapState = {
  maxDistance: number;
  startTime: number;
};

export const defaultCandlestickLongPressDelayMs = 480;

export const isCandlestickChartScrollableTap = ({
  endTime,
  maxDistance,
  maxDuration = 420,
  moveTolerance = 8,
  startTime
}: CandlestickChartScrollableTapState & {
  endTime: number;
  maxDuration?: number;
  moveTolerance?: number;
}) =>
  maxDistance <= moveTolerance &&
  Number.isFinite(endTime) &&
  Number.isFinite(startTime) &&
  endTime - startTime <= maxDuration;

export const getCandlestickChartInteractionConfig = <TData>(
  interaction: CandlestickChartInteraction<TData> | undefined
): ResolvedCandlestickChartInteractionConfig<TData> => {
  if (!interaction) {
    return {
      activation: "press",
      deselectOnOutsidePress: false,
      longPressDelayMs: defaultCandlestickLongPressDelayMs,
      mode: "none"
    };
  }

  if (typeof interaction === "string") {
    return {
      activation: "press",
      deselectOnOutsidePress: interaction !== "none",
      longPressDelayMs: defaultCandlestickLongPressDelayMs,
      mode: interaction
    };
  }

  return {
    activation: interaction.activation ?? "press",
    deselectOnOutsidePress: interaction.deselectOnOutsidePress ?? true,
    longPressDelayMs:
      interaction.longPressDelayMs ?? defaultCandlestickLongPressDelayMs,
    mode: interaction.mode ?? "tap",
    ...(interaction.onDeselect ? { onDeselect: interaction.onDeselect } : {}),
    ...(interaction.onGestureEnd
      ? { onGestureEnd: interaction.onGestureEnd }
      : {}),
    ...(interaction.onGestureStart
      ? { onGestureStart: interaction.onGestureStart }
      : {}),
    ...(interaction.onSelect ? { onSelect: interaction.onSelect } : {})
  };
};

export const isCandlestickChartInteractionEnabled = <TData>(
  config: ResolvedCandlestickChartInteractionConfig<TData>
) => config.mode !== "none";

export const getCandlestickAtPoint = <TData>({
  candles,
  hitSlop = 8,
  locationX,
  locationY
}: {
  candles: Array<CandlestickChartCandleModel<TData>>;
  hitSlop?: number;
  locationX: number;
  locationY: number;
}) => {
  const candidates = candles.filter((candle) => {
    const left = Math.min(candle.bodyX, candle.wickX) - hitSlop;
    const right =
      Math.max(candle.bodyX + candle.bodyWidth, candle.wickX) + hitSlop;
    const top = Math.min(candle.highY, candle.bodyY) - hitSlop;
    const bottom =
      Math.max(candle.lowY, candle.bodyY + candle.bodyHeight) + hitSlop;

    return (
      locationX >= left &&
      locationX <= right &&
      locationY >= top &&
      locationY <= bottom
    );
  });

  if (candidates.length <= 1) {
    return candidates[0];
  }

  return candidates
    .map((candle) => ({
      candle,
      distance: Math.abs(locationX - candle.wickX)
    }))
    .sort((a, b) => a.distance - b.distance)[0]?.candle;
};

export const getNearestCandlestickByX = <TData>({
  candles,
  locationX
}: {
  candles: Array<CandlestickChartCandleModel<TData>>;
  locationX: number;
}) => {
  let nearest:
    | {
        candle: CandlestickChartCandleModel<TData>;
        distance: number;
      }
    | undefined;

  candles.forEach((candle) => {
    const distance = Math.abs(candle.wickX - locationX);

    if (!nearest || distance < nearest.distance) {
      nearest = { candle, distance };
    }
  });

  return nearest?.candle;
};

export const buildCandlestickChartSelectEvent = <TData>({
  candle,
  formatXLabel,
  formatYLabel
}: {
  candle: CandlestickChartCandleModel<TData> | undefined;
  formatXLabel: (
    value: CandlestickChartCandleModel<TData>["xValue"],
    index: number
  ) => string;
  formatYLabel: (value: number) => string;
}): CandlestickChartSelectEvent<TData> | undefined => {
  if (!candle) {
    return undefined;
  }

  return {
    close: candle.close,
    dataIndex: candle.dataIndex,
    direction: candle.direction,
    formattedClose: formatYLabel(candle.close),
    formattedHigh: formatYLabel(candle.high),
    formattedLow: formatYLabel(candle.low),
    formattedOpen: formatYLabel(candle.open),
    high: candle.high,
    low: candle.low,
    open: candle.open,
    position: {
      x: candle.wickX,
      y: candle.closeY
    },
    raw: candle.raw,
    x: candle.xValue,
    xLabel: formatXLabel(candle.xValue, candle.dataIndex)
  };
};

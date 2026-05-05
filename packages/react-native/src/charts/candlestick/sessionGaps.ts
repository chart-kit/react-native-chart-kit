import type { ChartXValue } from "@chart-kit/core";

import type {
  CandlestickChartModel,
  CandlestickChartSessionGapConfig,
  CandlestickChartSessionGapModel
} from "./types";

const dayMs = 24 * 60 * 60 * 1000;
const defaultSessionGapMinDays = 1.5;

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

const getDefaultSessionGapLabel = (gapDays: number) =>
  gapDays >= 2 ? `${Math.round(gapDays)}d gap` : "";

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

    if (gapMs <= minGapMs) {
      return [];
    }

    const gapDays = gapMs / dayMs;
    const x = (previous.wickX + next.wickX) / 2;
    const label =
      typeof config.label === "function"
        ? config.label({
            gapDays,
            gapMs,
            next: next.raw,
            nextIndex: next.dataIndex,
            previous: previous.raw,
            previousIndex: previous.dataIndex
          })
        : config.label === true
          ? getDefaultSessionGapLabel(gapDays)
          : undefined;
    const width = Math.max(2, Math.min(18, config.width ?? previous.bodyWidth));

    return [
      {
        fill: config.fill ?? resolvedTheme.grid,
        fillOpacity: config.fillOpacity ?? 0.08,
        gapDays,
        gapMs,
        height: boxes.plot.height,
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
        width,
        x: x - width / 2,
        y: boxes.plot.y
      }
    ];
  });
};

import {
  buildCandlestickGeometry,
  calculateAutoPadding,
  createBandScale,
  createLinearScale,
  generateLinearTicks,
  resolveNumericDomain,
  solveChartBoxes
} from "@chart-kit/core";
import type {
  CandlestickDatum,
  CandlestickDirection,
  ChartXValue
} from "@chart-kit/core";

import { resolveCartesianChartThemeConfig } from "../../theme/presets";
import {
  defaultFormatBarChartXLabel,
  defaultFormatBarChartYLabel,
  getBarChartXKey,
  getMaxBarChartTextSize,
  getVisibleBarChartXLabelInterval,
  labelBaselineOffset,
  measureBarChartText
} from "../bar/modelUtils";
import {
  buildCandlestickSessionEventModels,
  buildCandlestickSessionGapModels,
  resolveCandlestickSessionGapConfig
} from "./sessionGaps";
import type {
  BuildCandlestickChartModelOptions,
  CandlestickChartModel,
  CandlestickChartProps
} from "./types";

const defaultYDomain = { nice: true } as const;
const defaultCandleWidthRatio = 0.62;
const defaultBandPadding = { paddingInner: 0.18, paddingOuter: 0.12 };

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const clampCandleWidthRatio = (value: number | undefined) => {
  if (!isFiniteNumber(value)) {
    return defaultCandleWidthRatio;
  }

  return Math.max(0.12, Math.min(1, value));
};

export const getResponsiveCandlestickBandPadding = (estimatedStep: number) => {
  if (estimatedStep <= 5) {
    return { paddingInner: 0.04, paddingOuter: 0.04 };
  }

  if (estimatedStep <= 8) {
    return { paddingInner: 0.07, paddingOuter: 0.05 };
  }

  if (estimatedStep <= 12) {
    return { paddingInner: 0.1, paddingOuter: 0.07 };
  }

  if (estimatedStep <= 18) {
    return { paddingInner: 0.14, paddingOuter: 0.09 };
  }

  return defaultBandPadding;
};

export const getResponsiveCandlestickWidthRatio = ({
  candleWidthRatio,
  step
}: {
  candleWidthRatio: number | undefined;
  step: number;
}) => {
  const requestedRatio = clampCandleWidthRatio(candleWidthRatio);

  if (step <= 5) {
    return Math.max(requestedRatio, 0.92);
  }

  if (step <= 8) {
    return Math.max(requestedRatio, 0.88);
  }

  if (step <= 12) {
    return Math.max(requestedRatio, 0.82);
  }

  if (step <= 18) {
    return Math.max(requestedRatio, 0.72);
  }

  return requestedRatio;
};

export const normalizeCandlestickRows = <
  TData extends Record<string, unknown>
>({
  closeKey,
  data,
  dataIndexOffset = 0,
  highKey,
  lowKey,
  openKey,
  xKey
}: Pick<
  CandlestickChartProps<TData>,
  "closeKey" | "data" | "highKey" | "lowKey" | "openKey" | "xKey"
> & {
  dataIndexOffset?: number;
}): Array<CandlestickDatum<TData>> =>
  data.flatMap((row, index) => {
    const open = row[openKey];
    const high = row[highKey];
    const low = row[lowKey];
    const close = row[closeKey];
    const x = row[xKey];

    if (
      !isFiniteNumber(open) ||
      !isFiniteNumber(high) ||
      !isFiniteNumber(low) ||
      !isFiniteNumber(close) ||
      !(typeof x === "string" || typeof x === "number" || x instanceof Date)
    ) {
      return [];
    }

    return [
      {
        close,
        high,
        index: index + dataIndexOffset,
        low,
        open,
        raw: row,
        x
      }
    ];
  });

const getCandleColor = ({
  candle,
  downColor,
  flatColor,
  upColor
}: {
  candle: { direction: CandlestickDirection };
  downColor: string;
  flatColor: string;
  upColor: string;
}) => {
  if (candle.direction === "up") {
    return upColor;
  }

  if (candle.direction === "down") {
    return downColor;
  }

  return flatColor;
};

export const buildCandlestickChartModel = <
  TData extends Record<string, unknown>
>({
  candleWidthRatio,
  chartKitTheme,
  closeKey,
  data,
  dataIndexOffset = 0,
  downColor,
  flatColor,
  formatXLabel = defaultFormatBarChartXLabel,
  formatYLabel = defaultFormatBarChartYLabel,
  height,
  highKey,
  lowKey,
  openKey,
  preset,
  sessionGaps,
  showHorizontalGridLines = true,
  showXAxisLabels = true,
  showYAxisLabels = true,
  theme,
  upColor,
  volumeHeightRatio = 0.22,
  volumeKey,
  volumeOpacity = 0.18,
  width,
  xKey,
  yDomain = defaultYDomain,
  yTickCount = 5
}: BuildCandlestickChartModelOptions<TData>): CandlestickChartModel<TData> => {
  const resolvedTheme = resolveCartesianChartThemeConfig({
    mode:
      typeof theme === "string" && theme !== "system"
        ? theme
        : chartKitTheme.mode,
    preset: preset ?? chartKitTheme.preset,
    presets: chartKitTheme.presets,
    theme: typeof theme === "object" ? theme : chartKitTheme.theme
  });
  const rows = normalizeCandlestickRows({
    closeKey,
    data,
    dataIndexOffset,
    highKey,
    lowKey,
    openKey,
    xKey
  });
  const xValues = rows.map((row) => row.x);
  const xDomain = xValues.map(getBarChartXKey);
  const textOptions = { fontSize: resolvedTheme.typography.axisLabelSize };
  const xLabelCandidates = rows.flatMap((row, index) => {
    const text = formatXLabel(row.x, row.index);

    if (text.trim().length === 0) {
      return [];
    }

    const key = xDomain[index];

    return key === undefined
      ? []
      : [
          {
            index: row.index,
            key,
            size: measureBarChartText(text, textOptions),
            text
          }
        ];
  });
  const xLabelSizes = showXAxisLabels
    ? xLabelCandidates.map((label) => label.size)
    : [];
  const domainValues = rows.flatMap((row) => [row.low, row.high]);
  const resolvedYDomain = resolveNumericDomain(domainValues, yDomain);
  const yTicks = generateLinearTicks({
    domain: resolvedYDomain,
    count: Math.max(2, Math.round(yTickCount))
  });
  const yLabelSizes = showYAxisLabels
    ? yTicks.map((tick) => measureBarChartText(formatYLabel(tick), textOptions))
    : [];
  const padding = calculateAutoPadding({
    base: { top: 18, right: 14, bottom: 12, left: 10 },
    bottomLabels:
      xLabelSizes.length > 0 ? [getMaxBarChartTextSize(xLabelSizes)] : [],
    gap: 8,
    leftLabels: yLabelSizes
  });
  const boxes = solveChartBoxes({ width, height }, padding);
  const estimatedCandleStep =
    xDomain.length > 0 ? boxes.plot.width / xDomain.length : boxes.plot.width;
  const bandPadding = getResponsiveCandlestickBandPadding(estimatedCandleStep);
  const yScale = createLinearScale({
    domain: resolvedYDomain,
    range: [boxes.plot.y + boxes.plot.height, boxes.plot.y]
  });
  const xScale = createBandScale<string | number>({
    domain: xDomain,
    range: [boxes.plot.x, boxes.plot.x + boxes.plot.width],
    paddingInner: bandPadding.paddingInner,
    paddingOuter: bandPadding.paddingOuter
  });
  const effectiveCandleWidthRatio = getResponsiveCandlestickWidthRatio({
    candleWidthRatio,
    step: xScale.step
  });
  const geometry = buildCandlestickGeometry({
    candleWidthRatio: effectiveCandleWidthRatio,
    data: rows,
    xBand: (value: ChartXValue) => {
      const key = getBarChartXKey(value);
      const x = xScale.scale(key);

      return x === undefined ? undefined : { x, width: xScale.bandwidth };
    },
    yScale: (value) => yScale.scale(value)
  });
  const resolvedUpColor = upColor ?? resolvedTheme.series[1] ?? "#16a34a";
  const resolvedDownColor = downColor ?? resolvedTheme.series[3] ?? "#dc2626";
  const resolvedFlatColor = flatColor ?? resolvedTheme.mutedText;
  const candles = geometry.candles.map((candle) => ({
    ...candle,
    color: getCandleColor({
      candle,
      downColor: resolvedDownColor,
      flatColor: resolvedFlatColor,
      upColor: resolvedUpColor
    })
  }));
  const resolvedSessionGapConfig =
    resolveCandlestickSessionGapConfig(sessionGaps);
  const sessionGapsModel = buildCandlestickSessionGapModels({
    boxes,
    candles,
    config: resolvedSessionGapConfig,
    resolvedTheme
  });
  const sessionEventsModel = buildCandlestickSessionEventModels({
    boxes,
    candles,
    config: resolvedSessionGapConfig,
    resolvedTheme
  });
  const volumeValues: number[] = volumeKey
    ? candles.flatMap((candle) => {
        const volume = candle.raw[volumeKey];

        return isFiniteNumber(volume) ? [volume] : [];
      })
    : [];
  const volumeScale =
    volumeValues.length > 0
      ? createLinearScale({
          domain: [0, Math.max(...volumeValues)],
          range: [
            boxes.plot.y + boxes.plot.height,
            boxes.plot.y +
              boxes.plot.height *
                (1 - Math.max(0.08, Math.min(0.5, volumeHeightRatio)))
          ]
        })
      : undefined;
  const volumeBars = volumeScale
    ? candles.flatMap((candle) => {
        const volume = volumeKey ? candle.raw[volumeKey] : undefined;
        const y = isFiniteNumber(volume)
          ? volumeScale.scale(volume)
          : undefined;

        return y === undefined
          ? []
          : [
              {
                color: candle.color,
                height: boxes.plot.y + boxes.plot.height - y,
                key: `volume-${candle.dataIndex}`,
                opacity: Math.max(0, Math.min(1, volumeOpacity)),
                width: candle.bodyWidth,
                x: candle.bodyX,
                y
              }
            ];
      })
    : [];
  const xLabelInterval =
    showXAxisLabels && xLabelSizes.length > 0
      ? getVisibleBarChartXLabelInterval({
          labelStrategy: "auto",
          labelSizes: xLabelSizes,
          plotWidth: boxes.plot.width
        })
      : Number.POSITIVE_INFINITY;
  const xLabels = xLabelCandidates.flatMap((label, labelIndex) => {
    if (labelIndex % xLabelInterval !== 0) {
      return [];
    }

    const x = xScale.scale(label.key);

    return x === undefined
      ? []
      : [
          {
            index: label.index,
            text: label.text,
            x: x + xScale.bandwidth / 2,
            y: boxes.plot.y + boxes.plot.height + labelBaselineOffset
          }
        ];
  });
  const yLabels = yTicks.map((tick) => ({
    key: `tick-${tick}`,
    text: formatYLabel(tick),
    x: boxes.plot.x - 8,
    y: yScale.scale(tick) + resolvedTheme.typography.axisLabelSize / 2 - 2
  }));

  return {
    boxes,
    candles,
    downColor: resolvedDownColor,
    flatColor: resolvedFlatColor,
    resolvedTheme,
    sessionEvents: sessionEventsModel,
    sessionGaps: sessionGapsModel,
    showHorizontalGridLines,
    showXAxisLabels,
    showYAxisLabels,
    upColor: resolvedUpColor,
    volumeBars,
    xLabels,
    yLabels,
    yTicks
  };
};

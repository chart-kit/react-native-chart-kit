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
import type {
  BuildCandlestickChartModelOptions,
  CandlestickChartModel,
  CandlestickChartProps
} from "./types";

const defaultYDomain = { nice: true } as const;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export const normalizeCandlestickRows = <
  TData extends Record<string, unknown>
>({
  closeKey,
  data,
  highKey,
  lowKey,
  openKey,
  xKey
}: Pick<
  CandlestickChartProps<TData>,
  "closeKey" | "data" | "highKey" | "lowKey" | "openKey" | "xKey"
>): Array<CandlestickDatum<TData>> =>
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

    return [{ close, high, index, low, open, raw: row, x }];
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
  candleWidthRatio = 0.62,
  chartKitTheme,
  closeKey,
  data,
  downColor,
  flatColor,
  formatXLabel = defaultFormatBarChartXLabel,
  formatYLabel = defaultFormatBarChartYLabel,
  height,
  highKey,
  lowKey,
  openKey,
  preset,
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
    highKey,
    lowKey,
    openKey,
    xKey
  });
  const xValues = rows.map((row) => row.x);
  const xDomain = xValues.map(getBarChartXKey);
  const xLabelTexts = xValues.map((value, index) => formatXLabel(value, index));
  const textOptions = { fontSize: resolvedTheme.typography.axisLabelSize };
  const xLabelSizes = xLabelTexts.map((text) =>
    measureBarChartText(text, textOptions)
  );
  const domainValues = rows.flatMap((row) => [row.low, row.high]);
  const resolvedYDomain = resolveNumericDomain(domainValues, yDomain);
  const yTicks = generateLinearTicks({
    domain: resolvedYDomain,
    count: Math.max(2, Math.round(yTickCount))
  });
  const yLabelSizes = yTicks.map((tick) =>
    measureBarChartText(formatYLabel(tick), textOptions)
  );
  const padding = calculateAutoPadding({
    base: { top: 18, right: 14, bottom: 12, left: 10 },
    bottomLabels:
      xLabelSizes.length > 0 ? [getMaxBarChartTextSize(xLabelSizes)] : [],
    gap: 8,
    leftLabels: yLabelSizes
  });
  const boxes = solveChartBoxes({ width, height }, padding);
  const yScale = createLinearScale({
    domain: resolvedYDomain,
    range: [boxes.plot.y + boxes.plot.height, boxes.plot.y]
  });
  const xScale = createBandScale<string | number>({
    domain: xDomain,
    range: [boxes.plot.x, boxes.plot.x + boxes.plot.width],
    paddingInner: 0.18,
    paddingOuter: 0.12
  });
  const geometry = buildCandlestickGeometry({
    candleWidthRatio,
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
  const xLabels = xLabelTexts.flatMap((text, index) => {
    if (index % xLabelInterval !== 0) {
      return [];
    }

    const key = xDomain[index];
    const x = key === undefined ? undefined : xScale.scale(key);

    return x === undefined
      ? []
      : [
          {
            index,
            text,
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

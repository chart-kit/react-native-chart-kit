import {
  buildBarGeometry,
  buildLineSeriesGeometry,
  calculateAutoPadding,
  createBandScale,
  createLinearScale,
  generateLinearTicks,
  normalizeCartesianData,
  resolveNumericDomain,
  solveChartBoxes
} from "@chart-kit/core";
import type {
  ChartXValue,
  NormalizedSeries,
  NumericDomainInput
} from "@chart-kit/core";

import { resolveCartesianChartThemeConfig } from "../../theme/presets";
import type {
  CartesianChartPresetRegistry,
  CartesianChartPresetValue,
  CartesianChartTheme,
  ResolvedChartKitThemeMode
} from "../../theme/presets";
import {
  defaultFormatBarChartXLabel,
  defaultFormatBarChartYLabel,
  getBarChartSeriesColor,
  getBarChartXKey,
  getMaxBarChartTextSize,
  getVisibleBarChartXLabelInterval,
  labelBaselineOffset,
  measureBarChartText
} from "../bar/modelUtils";
import { getFormattedCombinedSeriesValue } from "./format";
import type {
  CombinedChartAxisId,
  CombinedChartBarSeries,
  CombinedChartLineSeries,
  CombinedChartModel,
  CombinedChartProps
} from "./types";

const defaultLeftDomain = { includeZero: true, nice: true } as const;
const defaultRightDomain = { nice: true } as const;
const legendMarkerSize = 8;
const legendGap = 14;

type CombinedChartThemeContextValue = {
  mode: ResolvedChartKitThemeMode;
  preset: CartesianChartPresetValue;
  presets: CartesianChartPresetRegistry;
  theme: CartesianChartTheme | undefined;
};

type BuildCombinedChartModelOptions<TData extends Record<string, unknown>> =
  CombinedChartProps<TData> & {
    chartKitTheme: CombinedChartThemeContextValue;
  };

type ResolvedCombinedSeries<TData extends Record<string, unknown>> = {
  axisId: CombinedChartAxisId;
  color: string;
  key: string;
  kind: "bar" | "line";
  label: string;
  series: CombinedChartBarSeries<TData> | CombinedChartLineSeries<TData>;
};

const getSeriesAxisId = (
  axisId: CombinedChartAxisId | undefined,
  fallback: CombinedChartAxisId
) => axisId ?? fallback;

const resolveSeries = <TData extends Record<string, unknown>>({
  bars,
  lines,
  theme
}: {
  bars: Array<CombinedChartBarSeries<TData>>;
  lines: Array<CombinedChartLineSeries<TData>>;
  theme: CombinedChartModel["resolvedTheme"];
}): Array<ResolvedCombinedSeries<TData>> => [
  ...bars.map((series, index) => {
    const key = series.key ?? `bar-${series.yKey}`;
    const color = series.color ?? getBarChartSeriesColor(theme, index);

    return {
      axisId: getSeriesAxisId(series.yAxisId, "left"),
      color,
      key,
      kind: "bar" as const,
      label: series.label ?? key,
      series
    };
  }),
  ...lines.map((series, index) => {
    const key = series.key ?? `line-${series.yKey}`;
    const color =
      series.color ?? getBarChartSeriesColor(theme, bars.length + index);

    return {
      axisId: getSeriesAxisId(series.yAxisId, "right"),
      color,
      key,
      kind: "line" as const,
      label: series.label ?? key,
      series
    };
  })
];

const getDomainValues = <TData extends Record<string, unknown>>(
  series: Array<NormalizedSeries<TData>>,
  resolvedSeries: Array<ResolvedCombinedSeries<TData>>,
  axisId: CombinedChartAxisId
) => {
  const keys = new Set(
    resolvedSeries
      .filter((item) => item.axisId === axisId)
      .map((item) => item.key)
  );

  return series.flatMap((item) =>
    keys.has(item.key)
      ? item.points.flatMap((point) =>
          typeof point.value === "number" ? [point.value] : []
        )
      : []
  );
};

const resolveAxisDomain = ({
  fallbackDomain,
  input,
  values
}: {
  fallbackDomain: NumericDomainInput;
  input: NumericDomainInput | undefined;
  values: number[];
}) => resolveNumericDomain(values, input ?? fallbackDomain);

const getLegendItemsRaw = <TData extends Record<string, unknown>>(
  resolvedSeries: Array<ResolvedCombinedSeries<TData>>,
  activeKeys: Set<string>
) =>
  resolvedSeries.map((item) => ({
    active: activeKeys.has(item.key),
    key: item.key,
    label: item.label,
    color: item.color,
    kind: item.kind,
    strokeDasharray:
      item.kind === "line"
        ? (item.series as CombinedChartLineSeries<TData>).strokeDasharray
        : undefined,
    width:
      legendMarkerSize +
      6 +
      measureBarChartText(item.label, { fontSize: 12 }).width
  }));

export const buildCombinedChartModel = <TData extends Record<string, unknown>>({
  data,
  xKey,
  bars = [],
  lines = [],
  width,
  height,
  theme,
  preset,
  barMode = "grouped",
  barWidthRatio = 0.7,
  barGapRatio = 0.12,
  leftYDomain,
  rightYDomain,
  yTickCount = 5,
  showHorizontalGridLines = true,
  showXAxisLabels = true,
  showYAxisLabels = true,
  legend,
  visibleSeriesKeys,
  formatXLabel = defaultFormatBarChartXLabel,
  formatLeftYLabel = defaultFormatBarChartYLabel,
  formatRightYLabel = defaultFormatBarChartYLabel,
  chartKitTheme
}: BuildCombinedChartModelOptions<TData>): CombinedChartModel<TData> => {
  const resolvedTheme = resolveCartesianChartThemeConfig({
    mode:
      typeof theme === "string" && theme !== "system"
        ? theme
        : chartKitTheme.mode,
    preset: preset ?? chartKitTheme.preset,
    presets: chartKitTheme.presets,
    theme: typeof theme === "object" ? theme : chartKitTheme.theme
  });
  const resolvedSeries = resolveSeries({ bars, lines, theme: resolvedTheme });
  const visibleKeySet =
    visibleSeriesKeys === undefined ? undefined : new Set(visibleSeriesKeys);
  const visibleResolvedSeries =
    visibleKeySet === undefined
      ? resolvedSeries
      : resolvedSeries.filter((item) => visibleKeySet.has(item.key));
  const activeResolvedSeries =
    visibleResolvedSeries.length > 0 ? visibleResolvedSeries : resolvedSeries;
  const activeKeys = new Set(activeResolvedSeries.map((item) => item.key));
  const normalized = normalizeCartesianData({
    data,
    xKey,
    series: activeResolvedSeries.map((item) => ({
      yKey: item.series.yKey,
      key: item.key,
      label: item.label,
      color: item.color
    }))
  });
  const xValues = normalized.series[0]?.points.map((point) => point.x) ?? [];
  const xDomain = xValues.map(getBarChartXKey);
  const xLabelTexts = xValues.map((value, index) => formatXLabel(value, index));
  const axisTextOptions = {
    fontSize: resolvedTheme.typography.axisLabelSize
  };
  const xLabelSizes = xLabelTexts.map((text) =>
    measureBarChartText(text, axisTextOptions)
  );
  const leftValues = getDomainValues(
    normalized.series,
    activeResolvedSeries,
    "left"
  );
  const rightValues = getDomainValues(
    normalized.series,
    activeResolvedSeries,
    "right"
  );
  const leftDomain = resolveAxisDomain({
    fallbackDomain: defaultLeftDomain,
    input: leftYDomain,
    values: leftValues.length > 0 ? leftValues : rightValues
  });
  const rightDomain = resolveAxisDomain({
    fallbackDomain: defaultRightDomain,
    input: rightYDomain,
    values: rightValues.length > 0 ? rightValues : leftValues
  });
  const leftTicks = generateLinearTicks({
    domain: leftDomain,
    count: Math.max(2, Math.round(yTickCount))
  });
  const rightTicks = generateLinearTicks({
    domain: rightDomain,
    count: Math.max(2, Math.round(yTickCount))
  });
  const leftLabelSizes = leftTicks.map((tick) =>
    measureBarChartText(formatLeftYLabel(tick), axisTextOptions)
  );
  const rightLabelSizes = rightTicks.map((tick) =>
    measureBarChartText(formatRightYLabel(tick), axisTextOptions)
  );
  const legendVisible = legend ?? resolvedSeries.length > 1;
  const legendItemsRaw = getLegendItemsRaw(resolvedSeries, activeKeys);
  const legendHeight = legendVisible && legendItemsRaw.length > 0 ? 18 : 0;
  const padding = calculateAutoPadding({
    base: { top: 16, right: 10, bottom: 12, left: 10 },
    leftLabels: leftLabelSizes,
    rightLabels: rightLabelSizes,
    bottomLabels:
      xLabelSizes.length > 0 ? [getMaxBarChartTextSize(xLabelSizes)] : [],
    gap: 8,
    ...(legendHeight > 0
      ? {
          legend: {
            height: legendHeight,
            position: "bottom",
            width: width - 24
          }
        }
      : {})
  });
  const boxes = solveChartBoxes({ width, height }, padding);
  const leftScale = createLinearScale({
    domain: leftDomain,
    range: [boxes.plot.y + boxes.plot.height, boxes.plot.y]
  });
  const rightScale = createLinearScale({
    domain: rightDomain,
    range: [boxes.plot.y + boxes.plot.height, boxes.plot.y]
  });
  const xScale = createBandScale<string | number>({
    domain: xDomain,
    range: [boxes.plot.x, boxes.plot.x + boxes.plot.width],
    paddingInner: 0.14,
    paddingOuter: 0.08
  });
  const barKeySet = new Set(
    activeResolvedSeries
      .filter((item) => item.kind === "bar")
      .map((item) => item.key)
  );
  const lineKeySet = new Set(
    activeResolvedSeries
      .filter((item) => item.kind === "line")
      .map((item) => item.key)
  );
  const barNormalizedSeries = normalized.series.filter((item) =>
    barKeySet.has(item.key)
  );
  const lineNormalizedSeries = normalized.series.filter((item) =>
    lineKeySet.has(item.key)
  );
  const seriesByKey = new Map(resolvedSeries.map((item) => [item.key, item]));
  const barGeometry = buildBarGeometry({
    series: barNormalizedSeries,
    mode: barMode,
    xBand: (value: ChartXValue) => {
      const key = getBarChartXKey(value);
      const x = xScale.scale(key);

      return x === undefined ? undefined : { x, width: xScale.bandwidth };
    },
    yScale: (value) => leftScale.scale(value),
    barWidthRatio,
    barGapRatio
  });
  const chartBars = barGeometry.bars.map((bar) => ({
    ...bar,
    axisId: seriesByKey.get(bar.seriesKey)?.axisId ?? "left",
    color:
      seriesByKey.get(bar.seriesKey)?.color ??
      getBarChartSeriesColor(resolvedTheme, bar.seriesIndex),
    formattedValue: getFormattedCombinedSeriesValue({
      axisId: seriesByKey.get(bar.seriesKey)?.axisId ?? "left",
      formatLeftYLabel,
      formatRightYLabel,
      value: bar.value
    })
  }));
  const chartLines = lineNormalizedSeries.map((series) => {
    const resolved = seriesByKey.get(series.key);
    const lineConfig = resolved?.series as
      | CombinedChartLineSeries<TData>
      | undefined;
    const yScale =
      resolved?.axisId === "left"
        ? (value: number) => leftScale.scale(value)
        : (value: number) => rightScale.scale(value);
    const geometry = buildLineSeriesGeometry({
      series,
      xScale: (value) => {
        const key = getBarChartXKey(value);
        const x = xScale.scale(key);

        return x === undefined ? undefined : x + xScale.bandwidth / 2;
      },
      yScale,
      curve: lineConfig?.curve ?? "linear"
    });
    const axisId = resolved?.axisId ?? "right";

    return {
      axisId,
      key: series.key,
      label: series.label,
      color: resolved?.color ?? getBarChartSeriesColor(resolvedTheme, 0),
      strokeWidth: lineConfig?.strokeWidth ?? 3,
      ...(lineConfig?.strokeDasharray
        ? { strokeDasharray: lineConfig.strokeDasharray }
        : {}),
      geometry: {
        points: geometry.points.map((point) => ({
          ...point,
          formattedValue: getFormattedCombinedSeriesValue({
            axisId,
            formatLeftYLabel,
            formatRightYLabel,
            value: point.value
          })
        })),
        path: geometry.line.path
      }
    };
  });
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
    const x = key !== undefined ? xScale.scale(key) : undefined;

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
  const yLabels = [
    ...leftTicks.map((tick) => ({
      key: `left-${tick}`,
      text: formatLeftYLabel(tick),
      x: boxes.plot.x - 8,
      y: leftScale.scale(tick) + resolvedTheme.typography.axisLabelSize / 2 - 2,
      side: "left" as const
    })),
    ...rightTicks.map((tick) => ({
      key: `right-${tick}`,
      text: formatRightYLabel(tick),
      x: boxes.plot.x + boxes.plot.width + 8,
      y:
        rightScale.scale(tick) + resolvedTheme.typography.axisLabelSize / 2 - 2,
      side: "right" as const
    }))
  ];
  const legendWidth =
    legendItemsRaw.reduce((sum, item) => sum + item.width, 0) +
    legendGap * Math.max(0, legendItemsRaw.length - 1);
  const legendStartX = Math.max(8, (width - legendWidth) / 2);
  const legendY = height - 8;
  const legendItems =
    legendVisible && legendItemsRaw.length > 0
      ? legendItemsRaw.map((item, index) => {
          const x =
            legendStartX +
            legendItemsRaw
              .slice(0, index)
              .reduce((sum, previous) => sum + previous.width + legendGap, 0);

          return {
            active: item.active,
            key: item.key,
            label: item.label,
            color: item.color,
            kind: item.kind,
            markerX: x,
            markerY: legendY - legendMarkerSize + 1,
            labelX: x + legendMarkerSize + 6,
            labelY: legendY,
            ...(item.strokeDasharray
              ? { strokeDasharray: item.strokeDasharray }
              : {})
          };
        })
      : [];
  const interactionPoints = xDomain.flatMap((key, index) => {
    const x = xScale.scale(key);
    if (x === undefined) {
      return [];
    }
    const point = {
      dataIndex: index,
      x: x + xScale.bandwidth / 2,
      xLabel: xLabelTexts[index] ?? String(key),
      xValue: xValues[index] ?? key
    };
    const raw = data[index];

    return raw === undefined ? [point] : [{ ...point, raw }];
  });
  const seriesModels = activeResolvedSeries.map((item) => ({
    axisId: item.axisId,
    color: item.color,
    key: item.key,
    kind: item.kind,
    label: item.label
  }));

  return {
    bars: chartBars,
    boxes,
    interactionPoints,
    legendItems,
    lines: chartLines,
    leftDomain,
    rightDomain,
    leftTicks,
    rightTicks,
    resolvedTheme,
    series: seriesModels,
    showHorizontalGridLines,
    showXAxisLabels,
    showYAxisLabels,
    xLabels,
    yLabels
  };
};

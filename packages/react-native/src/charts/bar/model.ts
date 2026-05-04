import {
  buildBarGeometry,
  calculateAutoPadding,
  createBandScale,
  createLinearScale,
  generateLinearTicks,
  normalizeCartesianData,
  resolveNumericDomain,
  solveChartBoxes
} from "@chart-kit/core";
import type { ChartXValue, NumericDomainInput, Size } from "@chart-kit/core";

import {
  resolveCartesianChartThemeConfig,
  type ResolvedCartesianChartTheme
} from "../../theme/presets";
import type {
  BarChartModel,
  BarChartProps,
  BarChartSeries,
  BuildBarChartModelOptions
} from "./types";

const defaultYDomain = { includeZero: true, nice: true } as const;
const labelBaselineOffset = 20;
const measureText = (
  text: string,
  options: { fontSize?: number } = {}
): Size => {
  const fontSize = options.fontSize ?? 12;

  return {
    width: text.length * fontSize * 0.56,
    height: 14
  };
};

const getFontTextOptions = (theme: ResolvedCartesianChartTheme) => ({
  fontSize: theme.typography.axisLabelSize,
  ...(theme.typography.fontFamily
    ? { fontFamily: theme.typography.fontFamily }
    : {})
});

const getSeriesColor = (theme: ResolvedCartesianChartTheme, index: number) =>
  theme.series[index % theme.series.length] ?? "#2563eb";

const defaultFormatXLabel = (value: ChartXValue) => {
  if (value instanceof Date) {
    return value.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });
  }

  return String(value);
};

const defaultFormatYLabel = (value: number) => {
  const absolute = Math.abs(value);

  if (absolute >= 1000) {
    return `${Number((value / 1000).toFixed(1))}k`;
  }

  return String(Number(value.toFixed(2)));
};

const getBarXKey = (value: ChartXValue) =>
  value instanceof Date ? value.valueOf() : value;

const resolveSeriesInput = <TData extends Record<string, unknown>>(
  yKey: BarChartProps<TData>["yKey"],
  yKeys: BarChartProps<TData>["yKeys"],
  series: BarChartProps<TData>["series"]
): Array<BarChartSeries<TData>> => {
  if (series && series.length > 0) {
    return series;
  }

  if (yKeys && yKeys.length > 0) {
    return yKeys.map((key) => ({ yKey: key }));
  }

  return yKey ? [{ yKey }] : [];
};

const getMaxSize = (sizes: Size[]) =>
  sizes.reduce(
    (max, size) => ({
      width: Math.max(max.width, size.width),
      height: Math.max(max.height, size.height)
    }),
    { width: 0, height: 0 }
  );

const getVisibleXLabelInterval = ({
  labelStrategy,
  labelSizes,
  plotWidth
}: {
  labelStrategy: BarChartProps<Record<string, unknown>>["labelStrategy"];
  labelSizes: Size[];
  plotWidth: number;
}) => {
  if (labelStrategy === "hide" || labelSizes.length === 0) {
    return Number.POSITIVE_INFINITY;
  }

  if (labelStrategy === "show") {
    return 1;
  }

  const widest = getMaxSize(labelSizes).width;
  const maxVisibleLabels = Math.max(1, Math.floor(plotWidth / (widest + 10)));

  return Math.max(1, Math.ceil(labelSizes.length / maxVisibleLabels));
};

const getDomainValues = <TData extends Record<string, unknown>>({
  mode,
  series,
  yDomain
}: {
  mode: BarChartModel["mode"];
  series: ReturnType<typeof normalizeCartesianData<TData>>["series"];
  yDomain: NumericDomainInput;
}) => {
  if (mode === "stacked100" && yDomain === defaultYDomain) {
    return [0, 100];
  }

  if (mode === "grouped") {
    return series.flatMap((item) =>
      item.points.flatMap((point) =>
        typeof point.value === "number" ? [point.value] : []
      )
    );
  }

  const rowCount = Math.max(0, ...series.map((item) => item.points.length));
  const values: number[] = [];

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    let positive = 0;
    let negative = 0;

    series.forEach((item) => {
      const value = item.points[rowIndex]?.value;

      if (typeof value !== "number") {
        return;
      }

      if (value >= 0) {
        positive += value;
      } else {
        negative += value;
      }
    });

    values.push(positive, negative);
  }

  return values;
};

export const buildBarChartModel = <TData extends Record<string, unknown>>({
  data,
  xKey,
  yKey,
  yKeys,
  series,
  width,
  height,
  theme,
  preset,
  mode = "grouped",
  yDomain = defaultYDomain,
  barWidthRatio = 0.72,
  barGapRatio = 0.12,
  showValuesOnTopOfBars = false,
  showHorizontalGridLines = true,
  legend,
  labelStrategy = "auto",
  formatXLabel = defaultFormatXLabel,
  formatYLabel = defaultFormatYLabel,
  chartKitTheme
}: BuildBarChartModelOptions<TData>): BarChartModel<TData> => {
  const resolvedTheme = resolveCartesianChartThemeConfig({
    mode:
      typeof theme === "string" && theme !== "system"
        ? theme
        : chartKitTheme.mode,
    preset: preset ?? chartKitTheme.preset,
    presets: chartKitTheme.presets,
    theme: typeof theme === "object" ? theme : chartKitTheme.theme
  });
  const seriesInput = resolveSeriesInput(yKey, yKeys, series);
  const legendVisible = legend ?? seriesInput.length > 1;
  const normalized = normalizeCartesianData({
    data,
    xKey,
    series: seriesInput
  });
  const xValues = normalized.series[0]?.points.map((point) => point.x) ?? [];
  const xDomain = xValues.map(getBarXKey);
  const xLabelTexts = xValues.map((value, index) => formatXLabel(value, index));
  const textOptions = getFontTextOptions(resolvedTheme);
  const xLabelSizes = xLabelTexts.map((text) => measureText(text, textOptions));
  const domainValues = getDomainValues({
    mode,
    series: normalized.series,
    yDomain
  });
  const resolvedYDomain =
    mode === "stacked100" && yDomain === defaultYDomain
      ? ([0, 100] as [number, number])
      : resolveNumericDomain(domainValues, yDomain);
  const yTicks = generateLinearTicks({ domain: resolvedYDomain, count: 5 });
  const yLabelSizes = yTicks.map((tick) =>
    measureText(formatYLabel(tick), textOptions)
  );
  const legendFontSize = resolvedTheme.typography.legendLabelSize;
  const legendMarkerSize = 8;
  const legendGap = 14;
  const legendItemsRaw = seriesInput.map((item, index) => ({
    key: item.key ?? item.yKey,
    label: item.label ?? item.key ?? item.yKey,
    color: item.color ?? getSeriesColor(resolvedTheme, index),
    width:
      legendMarkerSize +
      6 +
      measureText(item.label ?? item.key ?? item.yKey, {
        fontSize: legendFontSize
      }).width
  }));
  const legendHeight = legendVisible && legendItemsRaw.length > 0 ? 18 : 0;
  const autoPaddingOptions = {
    base: { top: 18, right: 14, bottom: 12, left: 10 },
    leftLabels: yLabelSizes,
    bottomLabels: xLabelSizes.length > 0 ? [getMaxSize(xLabelSizes)] : [],
    gap: 8
  };
  const basePadding = calculateAutoPadding(
    legendHeight > 0
      ? {
          ...autoPaddingOptions,
          legend: {
            height: legendHeight,
            position: "bottom",
            width: width - 24
          }
        }
      : autoPaddingOptions
  );
  const boxes = solveChartBoxes({ width, height }, basePadding);
  const yScale = createLinearScale({
    domain: resolvedYDomain,
    range: [boxes.plot.y + boxes.plot.height, boxes.plot.y]
  });
  const xScale = createBandScale<string | number>({
    domain: xDomain,
    range: [boxes.plot.x, boxes.plot.x + boxes.plot.width],
    paddingInner: 0.12,
    paddingOuter: 0.08
  });
  const barGeometry = buildBarGeometry({
    series: normalized.series,
    mode,
    xBand: (value) => {
      const key = getBarXKey(value);
      const x = xScale.scale(key);

      return x !== undefined ? { x, width: xScale.bandwidth } : undefined;
    },
    yScale: (value) => yScale.scale(value),
    barWidthRatio,
    barGapRatio
  });
  const interval = getVisibleXLabelInterval({
    labelStrategy,
    labelSizes: xLabelSizes,
    plotWidth: boxes.plot.width
  });
  const xLabels = xLabelTexts.flatMap((text, index) => {
    if (index % interval !== 0) {
      return [];
    }

    const key = xDomain[index];
    const bandX = key !== undefined ? xScale.scale(key) : undefined;

    if (bandX === undefined) {
      return [];
    }

    return [
      {
        index,
        text,
        x: bandX + xScale.bandwidth / 2,
        y: boxes.plot.y + boxes.plot.height + labelBaselineOffset,
        textAnchor: "middle" as const
      }
    ];
  });
  const yLabels = yTicks.map((tick) => ({
    key: `tick-${tick}`,
    text: formatYLabel(tick),
    x: boxes.plot.x - 8,
    y: yScale.scale(tick) + resolvedTheme.typography.axisLabelSize / 2 - 2
  }));
  const bars = barGeometry.bars.map((bar) => ({
    ...bar,
    color:
      normalized.series[bar.seriesIndex]?.color ??
      seriesInput[bar.seriesIndex]?.color ??
      getSeriesColor(resolvedTheme, bar.seriesIndex)
  }));
  const valueLabels = showValuesOnTopOfBars
    ? bars.map((bar) => ({
        key: `value-${bar.key}`,
        text: formatYLabel(bar.value),
        x: bar.x + bar.width / 2,
        y:
          bar.value >= 0
            ? Math.max(boxes.plot.y + 10, bar.y - 5)
            : Math.min(
                boxes.plot.y + boxes.plot.height - 2,
                bar.y + bar.height + resolvedTheme.typography.axisLabelSize
              ),
        color: resolvedTheme.mutedText
      }))
    : [];
  const legendWidth =
    legendItemsRaw.reduce((sum, item) => sum + item.width, 0) +
    legendGap * Math.max(0, legendItemsRaw.length - 1);
  const legendStartX = Math.max(8, (width - legendWidth) / 2);
  const legendY = height - 8;
  const legendItems = legendVisible
    ? legendItemsRaw.map((item, index) => {
        const x =
          legendStartX +
          legendItemsRaw
            .slice(0, index)
            .reduce((sum, previous) => sum + previous.width + legendGap, 0);

        return {
          key: item.key,
          label: item.label,
          color: item.color,
          markerX: x,
          markerY: legendY - legendMarkerSize + 1,
          labelX: x + legendMarkerSize + 6,
          labelY: legendY
        };
      })
    : [];

  return {
    bars,
    boxes,
    mode,
    resolvedTheme,
    legendItems,
    showHorizontalGridLines,
    valueLabels,
    xLabels,
    yLabels,
    yTicks
  };
};

import {
  buildBarGeometry,
  buildHorizontalBarGeometry,
  calculateAutoPadding,
  createBandScale,
  createLinearScale,
  generateLinearTicks,
  normalizeCartesianData,
  resolveNumericDomain,
  solveChartBoxes
} from "@chart-kit/core";
import type { NumericDomainInput } from "@chart-kit/core";

import { resolveCartesianChartThemeConfig } from "../../theme/presets";
import {
  defaultFormatBarChartXLabel,
  defaultFormatBarChartYLabel,
  getBarChartFontTextOptions,
  getBarChartSeriesColor,
  getBarChartXKey,
  getMaxBarChartTextSize,
  getVisibleBarChartXLabelInterval,
  getVisibleBarChartYLabelInterval,
  labelBaselineOffset,
  measureBarChartText
} from "./modelUtils";
import type {
  BarChartBarModel,
  BarChartModel,
  BarChartProps,
  BarChartSeries,
  BuildBarChartModelOptions
} from "./types";

const defaultYDomain = { includeZero: true, nice: true } as const;

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
  orientation = "vertical",
  yDomain = defaultYDomain,
  barWidthRatio = 0.72,
  barGapRatio = 0.12,
  showValuesOnTopOfBars = false,
  showHorizontalGridLines = true,
  legend,
  labelStrategy = "auto",
  formatXLabel = defaultFormatBarChartXLabel,
  formatYLabel = defaultFormatBarChartYLabel,
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
  const xDomain = xValues.map(getBarChartXKey);
  const xLabelTexts = xValues.map((value, index) => formatXLabel(value, index));
  const textOptions = getBarChartFontTextOptions(resolvedTheme);
  const xLabelSizes = xLabelTexts.map((text) =>
    measureBarChartText(text, textOptions)
  );
  const isHorizontal = orientation === "horizontal";
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
    measureBarChartText(formatYLabel(tick), textOptions)
  );
  const legendFontSize = resolvedTheme.typography.legendLabelSize;
  const legendMarkerSize = 8;
  const legendGap = 14;
  const legendItemsRaw = seriesInput.map((item, index) => ({
    key: item.key ?? item.yKey,
    label: item.label ?? item.key ?? item.yKey,
    color: item.color ?? getBarChartSeriesColor(resolvedTheme, index),
    width:
      legendMarkerSize +
      6 +
      measureBarChartText(item.label ?? item.key ?? item.yKey, {
        fontSize: legendFontSize
      }).width
  }));
  const legendHeight = legendVisible && legendItemsRaw.length > 0 ? 18 : 0;
  const autoPaddingOptions = {
    base: { top: 18, right: 14, bottom: 12, left: 10 },
    leftLabels: isHorizontal ? xLabelSizes : yLabelSizes,
    bottomLabels: isHorizontal
      ? yLabelSizes
      : xLabelSizes.length > 0
        ? [getMaxBarChartTextSize(xLabelSizes)]
        : [],
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
  const horizontalXScale = createLinearScale({
    domain: resolvedYDomain,
    range: [boxes.plot.x, boxes.plot.x + boxes.plot.width]
  });
  const horizontalYScale = createBandScale<string | number>({
    domain: xDomain,
    range: [boxes.plot.y, boxes.plot.y + boxes.plot.height],
    paddingInner: 0.12,
    paddingOuter: 0.08
  });
  const barGeometry = buildBarGeometry({
    series: normalized.series,
    mode,
    xBand: (value) => {
      const key = getBarChartXKey(value);
      const x = xScale.scale(key);

      return x !== undefined ? { x, width: xScale.bandwidth } : undefined;
    },
    yScale: (value) => yScale.scale(value),
    barWidthRatio,
    barGapRatio
  });
  const horizontalBarGeometry = buildHorizontalBarGeometry({
    series: normalized.series,
    mode,
    yBand: (value) => {
      const key = getBarChartXKey(value);
      const y = horizontalYScale.scale(key);

      return y !== undefined
        ? { y, height: horizontalYScale.bandwidth }
        : undefined;
    },
    xScale: (value) => horizontalXScale.scale(value),
    barWidthRatio,
    barGapRatio
  });
  const verticalLabelInterval = getVisibleBarChartXLabelInterval({
    labelStrategy,
    labelSizes: xLabelSizes,
    plotWidth: boxes.plot.width
  });
  const horizontalLabelInterval = getVisibleBarChartYLabelInterval({
    labelStrategy,
    labelSizes: xLabelSizes,
    plotHeight: boxes.plot.height
  });
  const verticalXLabels = xLabelTexts.flatMap((text, index) => {
    if (index % verticalLabelInterval !== 0) {
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
  const verticalYLabels = yTicks.map((tick) => ({
    key: `tick-${tick}`,
    text: formatYLabel(tick),
    x: boxes.plot.x - 8,
    y: yScale.scale(tick) + resolvedTheme.typography.axisLabelSize / 2 - 2
  }));
  const horizontalXLabels = yTicks.map((tick, index) => ({
    index,
    text: formatYLabel(tick),
    x: horizontalXScale.scale(tick),
    y: boxes.plot.y + boxes.plot.height + labelBaselineOffset,
    textAnchor: "middle" as const
  }));
  const horizontalYLabels = xLabelTexts.flatMap((text, index) => {
    if (index % horizontalLabelInterval !== 0) {
      return [];
    }

    const key = xDomain[index];
    const bandY = key !== undefined ? horizontalYScale.scale(key) : undefined;

    if (bandY === undefined) {
      return [];
    }

    return [
      {
        key: `category-${index}`,
        text,
        x: boxes.plot.x - 8,
        y:
          bandY +
          horizontalYScale.bandwidth / 2 +
          resolvedTheme.typography.axisLabelSize / 2 -
          2
      }
    ];
  });
  const verticalBars: Array<BarChartBarModel<TData>> = barGeometry.bars.map(
    (bar) => ({
      baselineY: bar.baselineY,
      color:
        normalized.series[bar.seriesIndex]?.color ??
        seriesInput[bar.seriesIndex]?.color ??
        getBarChartSeriesColor(resolvedTheme, bar.seriesIndex),
      dataIndex: bar.dataIndex,
      formattedValue: formatYLabel(bar.value),
      height: bar.height,
      key: bar.key,
      raw: bar.raw,
      seriesIndex: bar.seriesIndex,
      seriesKey: bar.seriesKey,
      seriesLabel: bar.seriesLabel,
      value: bar.value,
      width: bar.width,
      x: bar.x,
      xLabel: formatXLabel(bar.xValue, bar.dataIndex),
      xValue: bar.xValue,
      y: bar.y
    })
  );
  const horizontalBars: Array<BarChartBarModel<TData>> =
    horizontalBarGeometry.bars.map((bar) => ({
      baselineX: bar.baselineX,
      baselineY: bar.baselineY,
      color:
        normalized.series[bar.seriesIndex]?.color ??
        seriesInput[bar.seriesIndex]?.color ??
        getBarChartSeriesColor(resolvedTheme, bar.seriesIndex),
      dataIndex: bar.dataIndex,
      formattedValue: formatYLabel(bar.value),
      height: bar.height,
      key: bar.key,
      raw: bar.raw,
      seriesIndex: bar.seriesIndex,
      seriesKey: bar.seriesKey,
      seriesLabel: bar.seriesLabel,
      value: bar.value,
      width: bar.width,
      x: bar.x,
      xLabel: formatXLabel(bar.xValue, bar.dataIndex),
      xValue: bar.xValue,
      y: bar.y
    }));
  const bars = isHorizontal ? horizontalBars : verticalBars;
  const valueLabels = showValuesOnTopOfBars
    ? bars.map((bar) =>
        isHorizontal
          ? {
              key: `value-${bar.key}`,
              text: formatYLabel(bar.value),
              x:
                bar.value >= 0
                  ? Math.min(
                      boxes.plot.x + boxes.plot.width - 2,
                      bar.x + bar.width + 5
                    )
                  : Math.max(boxes.plot.x + 2, bar.x - 5),
              y:
                bar.y +
                bar.height / 2 +
                resolvedTheme.typography.axisLabelSize / 2 -
                2,
              color: resolvedTheme.mutedText,
              textAnchor: bar.value >= 0 ? ("start" as const) : ("end" as const)
            }
          : {
              key: `value-${bar.key}`,
              text: formatYLabel(bar.value),
              x: bar.x + bar.width / 2,
              y:
                bar.value >= 0
                  ? Math.max(boxes.plot.y + 10, bar.y - 5)
                  : Math.min(
                      boxes.plot.y + boxes.plot.height - 2,
                      bar.y +
                        bar.height +
                        resolvedTheme.typography.axisLabelSize
                    ),
              color: resolvedTheme.mutedText
            }
      )
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
    orientation,
    resolvedTheme,
    legendItems,
    showHorizontalGridLines,
    valueLabels,
    xLabels: isHorizontal ? horizontalXLabels : verticalXLabels,
    yLabels: isHorizontal ? horizontalYLabels : verticalYLabels,
    yTicks
  };
};

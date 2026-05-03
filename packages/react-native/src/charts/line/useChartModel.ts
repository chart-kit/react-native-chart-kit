import { useMemo } from "react";

import {
  buildLineSeriesGeometry,
  calculateAutoPadding,
  createLinearScale,
  generateLinearTicks,
  normalizeCartesianData,
  resolveNumericDomain,
  solveChartBoxes
} from "@chart-kit/core";
import type { ProjectScale } from "@chart-kit/core";

import {
  resolveCartesianChartThemeConfig,
  type ChartKitThemeContextValue
} from "../../theme";
import {
  getLineChartCrosshairConfig,
  getLineChartDotConfig,
  getLineChartStrokeStyle,
  getLineChartTooltipConfig
} from "./options";
import { getSelectedLineSeries } from "./selection";
import { getLineChartTooltipModel } from "./tooltip";
import {
  buildLegendLayout,
  getLegendConfig,
  getLegendX,
  getLegendY
} from "./legend";
import {
  buildLineChartReferenceBandModels,
  buildLineChartReferenceLineModels
} from "./references";
import { getFontFamilyProps, measureLineChartText } from "./text";
import type {
  LineChartLegendRenderItem,
  LineChartLegendRenderProps,
  LineChartProps,
  LineChartSelectedSeriesItem,
  LineChartSelectionModel
} from "./types";
import {
  defaultLabelRotation,
  getMaxSize,
  resolveXLabelLayout,
  xLabelBaselineOffset,
  type XLabelCandidate
} from "./xLabels";
import {
  defaultFormatXLabel,
  defaultFormatYLabel,
  getSeriesColor
} from "./utils";
import {
  normalizeLineChartSelectedIndex,
  type LineChartInteractionPoint
} from "./interaction";
import { useSeriesInput } from "./seriesInput";
import { buildLineChartXScale } from "./xScale";

const defaultYDomain = { includeZero: true, nice: true } as const;

export const useChartModel = <TData extends Record<string, unknown>>({
  data,
  xKey,
  yKey,
  yKeys,
  series,
  width,
  height,
  theme,
  preset,
  curve = "linear",
  connectNulls = false,
  area = false,
  showDots = true,
  dots,
  selectedIndex,
  activeDot,
  crosshair,
  tooltip,
  referenceBands,
  referenceLines,
  showHorizontalGridLines = false,
  showVerticalGridLines = false,
  legend,
  labelStrategy = "auto",
  labelRotation = defaultLabelRotation,
  labelMinGap = 8,
  edgeLabelPolicy = "shift",
  yDomain = defaultYDomain,
  formatXLabel = defaultFormatXLabel,
  formatYLabel = defaultFormatYLabel,
  chartKitTheme
}: LineChartProps<TData> & { chartKitTheme: ChartKitThemeContextValue }) => {
  const seriesInput = useSeriesInput(yKey, yKeys, series);

  return useMemo(() => {
    const resolvedTheme = resolveCartesianChartThemeConfig({
      mode:
        typeof theme === "string" && theme !== "system"
          ? theme
          : chartKitTheme.mode,
      preset: preset ?? chartKitTheme.preset,
      presets: chartKitTheme.presets,
      theme: typeof theme === "object" ? theme : chartKitTheme.theme
    });
    const normalized = normalizeCartesianData({
      data,
      xKey,
      series: seriesInput
    });
    const legendConfig = getLegendConfig(
      legend,
      normalized.series.length,
      resolvedTheme
    );
    const axisTextOptions = {
      fontSize: resolvedTheme.typography.axisLabelSize,
      ...getFontFamilyProps(resolvedTheme.typography.fontFamily)
    };
    const allPoints = normalized.series.flatMap((item) => item.points);
    const yValues = allPoints.flatMap((point) =>
      typeof point.value === "number" ? [point.value] : []
    );
    const xValues = normalized.series[0]?.points.map((point) => point.x) ?? [];
    const yDomainResolved = resolveNumericDomain(yValues, yDomain);
    const yTicks = generateLinearTicks({
      domain: yDomainResolved,
      count: 4
    });
    const yLabelSizes = yTicks.map((tick) =>
      measureLineChartText(formatYLabel(tick), axisTextOptions)
    );
    const xLabelTexts = xValues.map((value, index) =>
      formatXLabel(value, index)
    );
    const xLabelSizes = xLabelTexts.map((text) =>
      measureLineChartText(text, axisTextOptions)
    );
    const styleByKey = new Map(
      seriesInput.map((item, index) => [
        String(item.key ?? item.yKey),
        {
          strokeWidth: item.strokeWidth ?? 3,
          strokeStyle: getLineChartStrokeStyle({
            strokeDasharray: item.strokeDasharray,
            strokeLinecap: item.strokeLinecap,
            strokeLinejoin: item.strokeLinejoin,
            strokeOpacity: item.strokeOpacity
          }),
          area: item.area,
          curve: item.curve,
          color: item.color ?? getSeriesColor(resolvedTheme, index),
          dot: getLineChartDotConfig({
            dots,
            seriesDot: item.dot,
            showDots
          })
        }
      ])
    );
    const legendLayout = legendConfig.visible
      ? buildLegendLayout({
          config: legendConfig,
          items: normalized.series.map((item) => ({
            id: item.key,
            label: item.label
          })),
          maxWidth: width,
          measureText: measureLineChartText
        })
      : undefined;
    const buildXLabelCandidates = (
      chartBoxes: ReturnType<typeof solveChartBoxes>,
      xScaleForBoxes: ProjectScale<TData>
    ): XLabelCandidate[] => {
      return xValues.flatMap((value, index) => {
        const point = normalized.series[0]?.points[index];
        const x = point ? xScaleForBoxes(value, point) : undefined;
        const text = xLabelTexts[index];
        const size = xLabelSizes[index];

        if (x === undefined || text === undefined || size === undefined) {
          return [];
        }

        return [
          {
            index,
            value,
            text,
            x,
            size
          }
        ];
      });
    };
    const baseAutoPaddingOptions = {
      base: { top: 16, right: 18, bottom: 12, left: 10 },
      leftLabels: yLabelSizes,
      gap: 8
    };
    const withLegendPaddingOptions = (bottomLabelHeight: number) =>
      legendLayout
        ? {
            ...baseAutoPaddingOptions,
            bottomLabels:
              bottomLabelHeight > 0
                ? [{ width: 1, height: bottomLabelHeight }]
                : [],
            legend: {
              width: Math.min(width - 32, legendLayout.width),
              height: legendLayout.height,
              position: legendLayout.position
            }
          }
        : {
            ...baseAutoPaddingOptions,
            bottomLabels:
              bottomLabelHeight > 0
                ? [{ width: 1, height: bottomLabelHeight }]
                : []
          };
    const initialPadding = calculateAutoPadding(
      withLegendPaddingOptions(getMaxSize(xLabelSizes).height)
    );
    const initialBoxes = solveChartBoxes({ width, height }, initialPadding);
    const initialXScale = buildLineChartXScale<TData>({
      boxes: initialBoxes,
      xValues
    });
    const initialXLabelLayout = resolveXLabelLayout({
      candidates: buildXLabelCandidates(initialBoxes, initialXScale),
      plotWidth: initialBoxes.plot.width,
      chartWidth: width,
      strategy: labelStrategy,
      rotation: labelRotation,
      edgeLabelPolicy,
      minGap: labelMinGap,
      baseY:
        initialBoxes.plot.y + initialBoxes.plot.height + xLabelBaselineOffset
    });
    const padding = calculateAutoPadding(
      withLegendPaddingOptions(initialXLabelLayout.height)
    );
    const boxes = solveChartBoxes({ width, height }, padding);
    const yScale = createLinearScale({
      domain: yDomainResolved,
      range: [boxes.plot.y + boxes.plot.height, boxes.plot.y]
    });
    const referenceBandModels = buildLineChartReferenceBandModels({
      bands: referenceBands,
      plot: boxes.plot,
      theme: resolvedTheme,
      yScale
    });
    const referenceLineModels = buildLineChartReferenceLineModels({
      lines: referenceLines,
      plot: boxes.plot,
      theme: resolvedTheme,
      yScale
    });
    const xScale = buildLineChartXScale<TData>({ boxes, xValues });
    const baselineValue =
      yDomainResolved[0] < 0 && yDomainResolved[1] > 0 ? 0 : yDomainResolved[0];
    const baselineY = yScale.scale(baselineValue);
    const geometries = normalized.series.map((item, index) => {
      const style = styleByKey.get(item.key);
      const wantsArea = style?.area ?? area;

      return {
        style: {
          strokeWidth: style?.strokeWidth ?? 3,
          strokeStyle: style?.strokeStyle ?? getLineChartStrokeStyle(),
          dot:
            style?.dot ??
            getLineChartDotConfig({
              dots,
              seriesDot: undefined,
              showDots
            }),
          color:
            item.color ?? style?.color ?? getSeriesColor(resolvedTheme, index)
        },
        geometry: buildLineSeriesGeometry({
          series: item,
          xScale,
          yScale: (value) => yScale.scale(value),
          curve: style?.curve ?? curve,
          connectNulls,
          ...(wantsArea ? { areaBaselineY: baselineY } : {})
        })
      };
    });
    const interactionPoints: Array<LineChartInteractionPoint<TData>> =
      geometries[0]?.geometry.points.flatMap((point) => {
        if (!Number.isFinite(point.x)) {
          return [];
        }

        const dataIndex = point.dataIndex;
        const xLabel = xLabelTexts[dataIndex] ?? String(point.xValue);
        const interactionPoint = {
          dataIndex,
          x: point.x,
          xValue: point.xValue,
          xLabel
        };

        return point.raw !== undefined
          ? [{ ...interactionPoint, raw: point.raw }]
          : [interactionPoint];
      }) ?? [];
    const xLabelLayout = resolveXLabelLayout({
      candidates: buildXLabelCandidates(boxes, xScale),
      plotWidth: boxes.plot.width,
      chartWidth: width,
      strategy: labelStrategy,
      rotation: labelRotation,
      edgeLabelPolicy,
      minGap: labelMinGap,
      baseY: boxes.plot.y + boxes.plot.height + xLabelBaselineOffset
    });
    const crosshairConfig = getLineChartCrosshairConfig({
      crosshair,
      themeAxisColor: resolvedTheme.axis
    });
    const tooltipConfig = getLineChartTooltipConfig({
      tooltip,
      themeFontFamily: resolvedTheme.typography.fontFamily,
      themeTooltip: resolvedTheme.tooltip
    });
    const roundedSelectedIndex = normalizeLineChartSelectedIndex(selectedIndex);
    const selectedDataIndex =
      roundedSelectedIndex !== undefined &&
      roundedSelectedIndex >= 0 &&
      roundedSelectedIndex < xValues.length
        ? roundedSelectedIndex
        : undefined;
    const selectedSeries: Array<LineChartSelectedSeriesItem<TData>> =
      getSelectedLineSeries({
        activeDot,
        formatYLabel,
        geometries,
        selectedDataIndex
      });
    const selectionBase =
      selectedDataIndex !== undefined && selectedSeries.length > 0
        ? {
            index: selectedDataIndex,
            x: selectedSeries[0]!.point.x,
            y: Math.min(...selectedSeries.map((item) => item.point.y)),
            xLabel: xLabelTexts[selectedDataIndex] ?? String(selectedDataIndex),
            series: selectedSeries
          }
        : undefined;
    const selectionModel: LineChartSelectionModel<TData> | undefined =
      selectionBase
        ? {
            ...selectionBase,
            tooltip: getLineChartTooltipModel({
              chartHeight: height,
              chartWidth: width,
              config: tooltipConfig,
              measureText: measureLineChartText,
              plotY: boxes.plot.y,
              selection: selectionBase,
              theme: resolvedTheme
            })
          }
        : undefined;
    const legendOrigin =
      legendLayout && legendLayout.items.length > 0
        ? {
            x: getLegendX({
              align: legendConfig.align,
              boxes,
              legendWidth: legendLayout.width,
              width
            }),
            y: getLegendY({
              boxes,
              xLabelHeight: xLabelLayout.height,
              xLabelLineHeight: getMaxSize(xLabelSizes).height,
              legendHeight: legendLayout.height,
              position: legendConfig.position
            })
          }
        : undefined;
    const legendModel =
      legendLayout && legendOrigin
        ? {
            config: legendConfig,
            renderProps: {
              x: legendOrigin.x,
              y: legendOrigin.y,
              width: legendLayout.width,
              height: legendLayout.height,
              position: legendConfig.position,
              align: legendConfig.align,
              theme: resolvedTheme,
              items: legendLayout.items.map((item, index) => {
                const style = styleByKey.get(item.id);

                return {
                  index,
                  key: item.id,
                  label: item.label,
                  color: style?.color ?? getSeriesColor(resolvedTheme, index),
                  x: legendOrigin.x + item.x,
                  y: legendOrigin.y + item.y,
                  width: item.width,
                  height: item.height,
                  contentX: legendOrigin.x + item.contentX,
                  contentY: legendOrigin.y + item.contentY,
                  contentWidth: item.contentWidth,
                  contentHeight: item.contentHeight,
                  markerSize: item.markerSize ?? legendConfig.markerSize,
                  marker: legendConfig.marker,
                  fontSize: legendConfig.fontSize,
                  ...getFontFamilyProps(legendConfig.fontFamily),
                  labelColor: legendConfig.labelColor,
                  labelGap: legendConfig.labelGap,
                  paddingHorizontal: legendConfig.itemPaddingHorizontal,
                  paddingVertical: legendConfig.itemPaddingVertical,
                  strokeDasharray: style?.strokeStyle.strokeDasharray,
                  strokeLinecap: style?.strokeStyle.strokeLinecap ?? "round",
                  strokeOpacity: style?.strokeStyle.strokeOpacity ?? 1,
                  strokeWidth: style?.strokeWidth ?? 3
                } satisfies LineChartLegendRenderItem;
              })
            } satisfies LineChartLegendRenderProps
          }
        : undefined;

    return {
      boxes,
      geometries,
      interactionPoints,
      legendModel,
      referenceBandModels,
      referenceLineModels,
      resolvedTheme,
      showHorizontalGridLines,
      showVerticalGridLines,
      crosshairConfig,
      selectionModel,
      xLabelLayout,
      yScale,
      yTicks,
      formatYLabel
    };
  }, [
    area,
    activeDot,
    connectNulls,
    crosshair,
    curve,
    data,
    dots,
    formatXLabel,
    formatYLabel,
    height,
    edgeLabelPolicy,
    labelMinGap,
    labelRotation,
    labelStrategy,
    legend,
    referenceBands,
    referenceLines,
    selectedIndex,
    seriesInput,
    showDots,
    showHorizontalGridLines,
    showVerticalGridLines,
    theme,
    preset,
    chartKitTheme,
    tooltip,
    width,
    xKey,
    yDomain
  ]);
};

export type LineChartModel<TData extends Record<string, unknown>> = ReturnType<
  typeof useChartModel<TData>
>;

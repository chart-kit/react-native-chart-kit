import { useMemo } from "react";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import {
  buildLineSeriesGeometry,
  calculateAutoPadding,
  createLinearScale,
  createPointScale,
  createTimeScale,
  generateLinearTicks,
  layoutLegend,
  normalizeCartesianData,
  resolveNumericDomain,
  solveChartBoxes
} from "@chart-kit/core";
import type {
  ChartXValue,
  LineCurve,
  NumericDomainInput,
  ProjectScale
} from "@chart-kit/core";
import {
  SvgCircle,
  SvgDefs,
  SvgGroup,
  SvgLine,
  SvgLinearGradientDef,
  SvgPath,
  SvgRect,
  SvgSurface,
  SvgText,
  createSvgTextMeasurer,
  createSvgTestId
} from "@chart-kit/svg-renderer";

export type LineChartSeries<TData extends Record<string, unknown>> = {
  yKey: keyof TData & string;
  key?: string;
  label?: string;
  color?: string;
  strokeWidth?: number;
  area?: boolean;
  curve?: LineCurve;
};

export type CartesianChartTypography = {
  fontFamily?: string;
  axisLabelSize: number;
  legendLabelSize: number;
};

export type CartesianChartTheme = {
  background: string;
  plotBackground: string;
  grid: string;
  axis: string;
  text: string;
  mutedText: string;
  series: string[];
  typography?: Partial<CartesianChartTypography>;
};

export type ResolvedCartesianChartTheme = Omit<
  CartesianChartTheme,
  "typography"
> & {
  typography: CartesianChartTypography;
};

export type LineChartLegendPosition = "top" | "bottom";
export type LineChartLegendAlign = "start" | "center" | "end";
export type LineChartLegendMarker = "square" | "circle" | "line";

export type LineChartLegendRenderItem = {
  index: number;
  key: string;
  label: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  markerSize: number;
  marker: LineChartLegendMarker;
  fontSize: number;
  fontFamily?: string;
  labelColor: string;
};

export type LineChartLegendRenderProps = {
  items: LineChartLegendRenderItem[];
  x: number;
  y: number;
  width: number;
  height: number;
  position: LineChartLegendPosition;
  align: LineChartLegendAlign;
  theme: ResolvedCartesianChartTheme;
};

export type LineChartLegendConfig = {
  visible?: boolean;
  position?: LineChartLegendPosition;
  align?: LineChartLegendAlign;
  wrap?: boolean;
  itemGap?: number;
  rowGap?: number;
  padding?: number;
  markerSize?: number;
  marker?: LineChartLegendMarker;
  labelColor?: string;
  fontSize?: number;
  fontFamily?: string;
  renderItem?: (item: LineChartLegendRenderItem) => ReactNode;
  renderLegend?: (props: LineChartLegendRenderProps) => ReactNode;
};

type ResolvedLineChartLegendConfig = {
  visible: boolean;
  position: LineChartLegendPosition;
  align: LineChartLegendAlign;
  wrap: boolean;
  itemGap: number;
  rowGap: number;
  padding: number;
  markerSize: number;
  marker: LineChartLegendMarker;
  labelColor: string;
  fontSize: number;
  fontFamily: string | undefined;
  renderItem: LineChartLegendConfig["renderItem"] | undefined;
  renderLegend: LineChartLegendConfig["renderLegend"] | undefined;
};

export type LineChartProps<TData extends Record<string, unknown>> = {
  data: TData[];
  xKey: keyof TData & string;
  yKey?: keyof TData & string;
  yKeys?: Array<keyof TData & string>;
  series?: Array<LineChartSeries<TData>>;
  width: number;
  height: number;
  theme?: "light" | "dark" | CartesianChartTheme;
  curve?: LineCurve;
  connectNulls?: boolean;
  area?: boolean;
  showDots?: boolean;
  legend?: boolean | LineChartLegendConfig;
  yDomain?: NumericDomainInput;
  formatXLabel?: (value: ChartXValue, index: number) => string;
  formatYLabel?: (value: number) => string;
  testID?: string;
};

const lightTheme: CartesianChartTheme = {
  background: "#ffffff",
  plotBackground: "#ffffff",
  grid: "#e5e7eb",
  axis: "#e5e7eb",
  text: "#0f172a",
  mutedText: "#64748b",
  series: ["#2563eb", "#0891b2", "#7c3aed", "#16a34a"],
  typography: {
    axisLabelSize: 11,
    legendLabelSize: 11
  }
};

const darkTheme: CartesianChartTheme = {
  background: "#0f172a",
  plotBackground: "#111827",
  grid: "#334155",
  axis: "#475569",
  text: "#e5e7eb",
  mutedText: "#94a3b8",
  series: ["#38bdf8", "#a78bfa", "#22c55e", "#f59e0b"],
  typography: {
    axisLabelSize: 11,
    legendLabelSize: 11
  }
};

const defaultYDomain: NumericDomainInput = { includeZero: true, nice: true };
const defaultTypography: CartesianChartTypography = {
  axisLabelSize: 11,
  legendLabelSize: 11
};

const measureText = createSvgTextMeasurer({
  lineHeight: 14
});

const resolveTheme = (
  theme: LineChartProps<Record<string, unknown>>["theme"]
): ResolvedCartesianChartTheme => {
  const base =
    theme === "dark"
      ? darkTheme
      : theme && theme !== "light"
        ? theme
        : lightTheme;

  return {
    ...base,
    typography: {
      ...defaultTypography,
      ...base.typography
    }
  };
};

const getFontFamilyProps = (fontFamily: string | undefined) => {
  return fontFamily ? { fontFamily } : {};
};

const getLegendConfig = (
  legend: LineChartProps<Record<string, unknown>>["legend"],
  seriesCount: number,
  theme: ResolvedCartesianChartTheme
): ResolvedLineChartLegendConfig => {
  const config = typeof legend === "object" ? legend : {};
  const visible =
    typeof legend === "boolean"
      ? legend
      : config.visible !== undefined
        ? config.visible
        : seriesCount > 1;

  return {
    visible,
    position: config.position ?? "top",
    align: config.align ?? "start",
    wrap: config.wrap ?? true,
    itemGap: config.itemGap ?? 20,
    rowGap: config.rowGap ?? 8,
    padding: config.padding ?? 0,
    markerSize: config.markerSize ?? 8,
    marker: config.marker ?? "square",
    labelColor: config.labelColor ?? theme.text,
    fontSize: config.fontSize ?? theme.typography.legendLabelSize,
    fontFamily: config.fontFamily ?? theme.typography.fontFamily,
    renderItem: config.renderItem,
    renderLegend: config.renderLegend
  };
};

const getLegendX = ({
  align,
  boxes,
  legendWidth,
  width
}: {
  align: LineChartLegendAlign;
  boxes: ReturnType<typeof solveChartBoxes>;
  legendWidth: number;
  width: number;
}) => {
  if (align === "center") {
    return Math.max(4, (width - legendWidth) / 2);
  }

  if (align === "end") {
    return Math.max(4, width - boxes.padding.right - legendWidth);
  }

  return boxes.plot.x;
};

const getLegendY = ({
  boxes,
  hasBottomLabels,
  legendHeight,
  position
}: {
  boxes: ReturnType<typeof solveChartBoxes>;
  hasBottomLabels: boolean;
  legendHeight: number;
  position: LineChartLegendPosition;
}) => {
  if (position === "bottom") {
    return boxes.plot.y + boxes.plot.height + (hasBottomLabels ? 34 : 10);
  }

  return Math.max(8, boxes.plot.y - legendHeight - 8);
};

const renderDefaultLegendItem = (item: LineChartLegendRenderItem) => {
  const markerCenterY = item.y + item.height / 2;

  return (
    <SvgGroup key={`legend-${item.key}`}>
      {item.marker === "circle" ? (
        <SvgCircle
          cx={item.x + item.markerSize / 2}
          cy={markerCenterY}
          r={item.markerSize / 2}
          fill={item.color}
        />
      ) : item.marker === "line" ? (
        <SvgLine
          x1={item.x}
          x2={item.x + item.markerSize}
          y1={markerCenterY}
          y2={markerCenterY}
          stroke={item.color}
          strokeLinecap="round"
          strokeWidth={3}
        />
      ) : (
        <SvgRect
          x={item.x}
          y={markerCenterY - item.markerSize / 2}
          width={item.markerSize}
          height={item.markerSize}
          rx={2}
          fill={item.color}
        />
      )}
      <SvgText
        x={item.x + item.markerSize + 6}
        y={item.y + item.height / 2 + item.fontSize * 0.36}
        fill={item.labelColor}
        fontSize={item.fontSize}
        {...getFontFamilyProps(item.fontFamily)}
      >
        {item.label}
      </SvgText>
    </SvgGroup>
  );
};

const renderConfiguredLegend = ({
  legend,
  config
}: {
  legend: LineChartLegendRenderProps;
  config: ReturnType<typeof getLegendConfig>;
}) => {
  if (config.renderLegend) {
    return config.renderLegend(legend);
  }

  return (
    <SvgGroup>
      {legend.items.map((item) =>
        config.renderItem
          ? config.renderItem(item)
          : renderDefaultLegendItem(item)
      )}
    </SvgGroup>
  );
};

const getSeriesColor = (theme: ResolvedCartesianChartTheme, index: number) => {
  return theme.series[index % theme.series.length] ?? lightTheme.series[0]!;
};

const unique = <TValue,>(values: TValue[]) => {
  return values.filter((value, index) => values.indexOf(value) === index);
};

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

const getXKey = (value: ChartXValue) => {
  return value instanceof Date ? value.valueOf() : value;
};

const getXScaleType = (values: ChartXValue[]) => {
  if (values.every((value) => value instanceof Date)) {
    return "time";
  }

  if (values.every((value) => typeof value === "number")) {
    return "linear";
  }

  return "point";
};

const getXLabelIndexes = (
  count: number,
  plotWidth: number,
  labelWidths: number[],
  labelPositions: Array<number | undefined>
) => {
  if (count <= 0) {
    return [];
  }

  if (count === 1) {
    return [0];
  }

  const widestLabel = Math.max(...labelWidths, 0);
  const pointSpacing = plotWidth / Math.max(1, count - 1);
  const getPosition = (index: number) =>
    labelPositions[index] ?? index * pointSpacing;
  const getRequiredGap = (previous: number, index: number) => {
    const previousWidth = labelWidths[previous] ?? widestLabel;
    const currentWidth = labelWidths[index] ?? widestLabel;
    const previousRightExtent =
      previous === 0 ? previousWidth : previousWidth / 2;
    const currentLeftExtent =
      index === count - 1 ? currentWidth : currentWidth / 2;

    return previousRightExtent + currentLeftExtent + 10;
  };
  const canShowEveryLabel = Array.from(
    { length: count - 1 },
    (_, index) => index
  ).every((index) => {
    const nextIndex = index + 1;

    return (
      getPosition(nextIndex) - getPosition(index) >=
      getRequiredGap(index, nextIndex)
    );
  });

  if (canShowEveryLabel) {
    return Array.from({ length: count }, (_, index) => index);
  }

  const maxLabels = Math.max(2, Math.floor(plotWidth / (widestLabel + 14)));
  const interval = Math.max(1, Math.ceil(count / maxLabels));
  const indexes = Array.from({ length: count }, (_, index) => index).filter(
    (index) => index === 0 || index === count - 1 || index % interval === 0
  );

  return unique(indexes).reduce<number[]>((selected, index) => {
    const previous = selected[selected.length - 1];

    if (previous === undefined) {
      return [index];
    }

    const distance = getPosition(index) - getPosition(previous);
    const requiredGap = getRequiredGap(previous, index);

    if (distance >= requiredGap) {
      return [...selected, index];
    }

    if (index === count - 1) {
      return [...selected.slice(0, -1), index];
    }

    return selected;
  }, []);
};

const useSeriesInput = <TData extends Record<string, unknown>>(
  yKey: LineChartProps<TData>["yKey"],
  yKeys: LineChartProps<TData>["yKeys"],
  series: LineChartProps<TData>["series"]
) => {
  return useMemo(() => {
    if (series && series.length > 0) {
      return series;
    }

    if (yKeys && yKeys.length > 0) {
      return yKeys.map<LineChartSeries<TData>>((key) => ({ yKey: key }));
    }

    return yKey ? [{ yKey } satisfies LineChartSeries<TData>] : [];
  }, [series, yKey, yKeys]);
};

const useChartModel = <TData extends Record<string, unknown>>({
  data,
  xKey,
  yKey,
  yKeys,
  series,
  width,
  height,
  theme = "light",
  curve = "linear",
  connectNulls = false,
  area = false,
  showDots = true,
  legend,
  yDomain = defaultYDomain,
  formatXLabel = defaultFormatXLabel,
  formatYLabel = defaultFormatYLabel
}: LineChartProps<TData>) => {
  const seriesInput = useSeriesInput(yKey, yKeys, series);

  return useMemo(() => {
    const resolvedTheme = resolveTheme(theme);
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
      measureText(formatYLabel(tick), axisTextOptions)
    );
    const xLabelSizes = xValues.map((value, index) =>
      measureText(formatXLabel(value, index), axisTextOptions)
    );
    const styleByKey = new Map(
      seriesInput.map((item, index) => [
        String(item.key ?? item.yKey),
        {
          strokeWidth: item.strokeWidth ?? 3,
          area: item.area,
          curve: item.curve,
          color: item.color ?? getSeriesColor(resolvedTheme, index)
        }
      ])
    );
    const legendMarkerSize =
      legendConfig.marker === "line"
        ? legendConfig.markerSize + 8
        : legendConfig.markerSize;
    const legendLayout = legendConfig.visible
      ? layoutLegend({
          items: normalized.series.map((item) => {
            const labelSize = measureText(item.label, {
              fontSize: legendConfig.fontSize,
              ...getFontFamilyProps(legendConfig.fontFamily)
            });

            return {
              id: item.key,
              label: item.label,
              markerSize: legendMarkerSize,
              labelWidth: labelSize.width,
              labelHeight: labelSize.height
            };
          }),
          position: legendConfig.position,
          maxWidth: legendConfig.wrap ? Math.max(0, width - 32) : 100_000,
          itemGap: legendConfig.itemGap,
          rowGap: legendConfig.rowGap,
          padding: legendConfig.padding
        })
      : undefined;
    const autoPaddingOptions = {
      base: { top: 16, right: 18, bottom: 12, left: 10 },
      leftLabels: yLabelSizes,
      bottomLabels: xLabelSizes.length > 0 ? [{ width: 1, height: 14 }] : [],
      gap: 8
    };
    const padding = calculateAutoPadding(
      legendLayout
        ? {
            ...autoPaddingOptions,
            legend: {
              width: Math.min(width - 32, legendLayout.width),
              height: legendLayout.height,
              position: legendLayout.position
            }
          }
        : autoPaddingOptions
    );
    const boxes = solveChartBoxes({ width, height }, padding);
    const yScale = createLinearScale({
      domain: yDomainResolved,
      range: [boxes.plot.y + boxes.plot.height, boxes.plot.y]
    });
    const xScaleType = getXScaleType(xValues);
    const xScale: ProjectScale<TData> =
      xScaleType === "time"
        ? (() => {
            const dates = xValues.filter(
              (value): value is Date => value instanceof Date
            );
            const scale = createTimeScale({
              values: dates,
              range: [boxes.plot.x, boxes.plot.x + boxes.plot.width]
            });

            return (value) =>
              value instanceof Date ? scale.scale(value) : undefined;
          })()
        : xScaleType === "linear"
          ? (() => {
              const numbers = xValues.filter(
                (value): value is number => typeof value === "number"
              );
              const scale = createLinearScale({
                values: numbers,
                range: [boxes.plot.x, boxes.plot.x + boxes.plot.width]
              });

              return (value) =>
                typeof value === "number" ? scale.scale(value) : undefined;
            })()
          : (() => {
              const domain = unique(xValues.map(getXKey));
              const scale = createPointScale<ReturnType<typeof getXKey>>({
                domain,
                range: [boxes.plot.x, boxes.plot.x + boxes.plot.width]
              });

              return (value) => scale.scale(getXKey(value));
            })();
    const baselineValue =
      yDomainResolved[0] < 0 && yDomainResolved[1] > 0 ? 0 : yDomainResolved[0];
    const baselineY = yScale.scale(baselineValue);
    const geometries = normalized.series.map((item, index) => {
      const style = styleByKey.get(item.key);
      const wantsArea = style?.area ?? area;

      return {
        style: {
          strokeWidth: style?.strokeWidth ?? 3,
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
    const xLabelPositions = xValues.map((value, index) => {
      const point = normalized.series[0]?.points[index];

      return point ? xScale(value, point) : undefined;
    });
    const xLabelIndexes = getXLabelIndexes(
      xValues.length,
      boxes.plot.width,
      xLabelSizes.map((size) => size.width),
      xLabelPositions
    );
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
              hasBottomLabels: xValues.length > 0,
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
                  markerSize: item.markerSize ?? legendConfig.markerSize,
                  marker: legendConfig.marker,
                  fontSize: legendConfig.fontSize,
                  ...getFontFamilyProps(legendConfig.fontFamily),
                  labelColor: legendConfig.labelColor
                } satisfies LineChartLegendRenderItem;
              })
            } satisfies LineChartLegendRenderProps
          }
        : undefined;

    return {
      boxes,
      geometries,
      legendModel,
      normalized,
      resolvedTheme,
      showDots,
      xLabelIndexes,
      xValues,
      xScale,
      yScale,
      yTicks,
      formatXLabel,
      formatYLabel
    };
  }, [
    area,
    connectNulls,
    curve,
    data,
    formatXLabel,
    formatYLabel,
    height,
    legend,
    seriesInput,
    showDots,
    theme,
    width,
    xKey,
    yDomain
  ]);
};

export const LineChart = <TData extends Record<string, unknown>>(
  props: LineChartProps<TData>
) => {
  const model = useChartModel(props);
  const {
    boxes,
    geometries,
    legendModel,
    normalized,
    resolvedTheme,
    showDots,
    xLabelIndexes,
    xValues,
    xScale,
    yScale,
    yTicks,
    formatXLabel,
    formatYLabel
  } = model;

  return (
    <View
      testID={props.testID}
      style={[styles.container, { width: props.width, height: props.height }]}
    >
      <SvgSurface width={props.width} height={props.height}>
        <SvgRect
          x={0}
          y={0}
          width={props.width}
          height={props.height}
          rx={8}
          fill={resolvedTheme.background}
        />
        <SvgRect
          x={boxes.plot.x}
          y={boxes.plot.y}
          width={boxes.plot.width}
          height={boxes.plot.height}
          rx={6}
          fill={resolvedTheme.plotBackground}
        />
        <SvgDefs>
          {geometries.map(({ style }, index) => (
            <SvgLinearGradientDef
              key={`area-gradient-${index}`}
              id={`area-gradient-${index}`}
              x1="0%"
              x2="0%"
              y1="0%"
              y2="100%"
              stops={[
                { offset: "0%", color: style.color, opacity: 0.22 },
                { offset: "100%", color: style.color, opacity: 0.02 }
              ]}
            />
          ))}
        </SvgDefs>
        {legendModel
          ? renderConfiguredLegend({
              legend: legendModel.renderProps,
              config: legendModel.config
            })
          : null}
        {yTicks.map((tick) => {
          const y = yScale.scale(tick);

          return (
            <SvgLine
              key={`grid-y-${tick}`}
              x1={boxes.plot.x}
              x2={boxes.plot.x + boxes.plot.width}
              y1={y}
              y2={y}
              stroke={resolvedTheme.grid}
              strokeWidth={1}
            />
          );
        })}
        {yTicks.map((tick) => {
          const y = yScale.scale(tick);

          return (
            <SvgText
              key={`label-y-${tick}`}
              x={boxes.plot.x - 8}
              y={y + resolvedTheme.typography.axisLabelSize * 0.36}
              fill={resolvedTheme.mutedText}
              fontSize={resolvedTheme.typography.axisLabelSize}
              textAnchor="end"
              {...getFontFamilyProps(resolvedTheme.typography.fontFamily)}
            >
              {formatYLabel(tick)}
            </SvgText>
          );
        })}
        {xLabelIndexes.map((index) => {
          const value = xValues[index];

          if (value === undefined) {
            return null;
          }

          const firstPoint = normalized.series[0]?.points[index];

          if (!firstPoint) {
            return null;
          }

          const x = xScale(value, firstPoint);

          if (x === undefined) {
            return null;
          }

          const isFirstLabel = index === 0;
          const isLastLabel = index === xValues.length - 1;
          const labelX = isFirstLabel
            ? Math.max(x, 4)
            : isLastLabel
              ? Math.min(x, props.width - 4)
              : x;
          const textAnchor = isFirstLabel
            ? "start"
            : isLastLabel
              ? "end"
              : "middle";

          return (
            <SvgText
              key={`label-x-${index}`}
              x={labelX}
              y={boxes.plot.y + boxes.plot.height + 20}
              fill={resolvedTheme.mutedText}
              fontSize={resolvedTheme.typography.axisLabelSize}
              textAnchor={textAnchor}
              {...getFontFamilyProps(resolvedTheme.typography.fontFamily)}
            >
              {formatXLabel(value, index)}
            </SvgText>
          );
        })}
        {geometries.map(({ geometry }, index) =>
          geometry.area ? (
            <SvgPath
              key={`area-${geometry.key}`}
              d={geometry.area.path}
              fill={`url(#area-gradient-${index})`}
            />
          ) : null
        )}
        {geometries.map(({ geometry, style }) => (
          <SvgPath
            key={`line-${geometry.key}`}
            d={geometry.line.path}
            fill="none"
            stroke={style.color}
            strokeWidth={style.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {showDots
          ? geometries.flatMap(({ geometry, style }) =>
              geometry.points
                .filter((point) => point.defined)
                .map((point) => (
                  <SvgCircle
                    key={`dot-${geometry.key}-${point.index}`}
                    testID={createSvgTestId(
                      "line-dot",
                      geometry.key,
                      point.index
                    )}
                    cx={point.x}
                    cy={point.y}
                    r={3.5}
                    fill={resolvedTheme.background}
                    stroke={style.color}
                    strokeWidth={2}
                  />
                ))
            )
          : null}
      </SvgSurface>
    </View>
  );
};

export const AreaChart = <TData extends Record<string, unknown>>(
  props: LineChartProps<TData>
) => <LineChart {...props} area />;

const styles = StyleSheet.create({
  container: {
    overflow: "hidden"
  }
});

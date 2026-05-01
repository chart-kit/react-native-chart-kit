import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import {
  buildLineSeriesGeometry,
  calculateAutoPadding,
  createLinearScale,
  createPointScale,
  createTimeScale,
  generateLinearTicks,
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

export type CartesianChartTheme = {
  background: string;
  plotBackground: string;
  grid: string;
  axis: string;
  text: string;
  mutedText: string;
  series: string[];
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
  yDomain?: NumericDomainInput;
  formatXLabel?: (value: ChartXValue, index: number) => string;
  formatYLabel?: (value: number) => string;
  testID?: string;
};

const lightTheme: CartesianChartTheme = {
  background: "#ffffff",
  plotBackground: "#fbfdff",
  grid: "#d9e2ec",
  axis: "#94a3b8",
  text: "#0f172a",
  mutedText: "#64748b",
  series: ["#2563eb", "#0891b2", "#7c3aed", "#16a34a"]
};

const darkTheme: CartesianChartTheme = {
  background: "#0f172a",
  plotBackground: "#111827",
  grid: "#334155",
  axis: "#475569",
  text: "#e5e7eb",
  mutedText: "#94a3b8",
  series: ["#38bdf8", "#a78bfa", "#22c55e", "#f59e0b"]
};

const defaultYDomain: NumericDomainInput = { includeZero: true, nice: true };

const measureText = createSvgTextMeasurer({
  fontSize: 11,
  lineHeight: 14
});

const getTheme = (theme: LineChartProps<Record<string, unknown>>["theme"]) => {
  if (theme === "dark") {
    return darkTheme;
  }

  if (theme && theme !== "light") {
    return theme;
  }

  return lightTheme;
};

const getSeriesColor = (theme: CartesianChartTheme, index: number) => {
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

const getXLabelIndexes = (count: number, plotWidth: number) => {
  if (count <= 0) {
    return [];
  }

  const maxLabels = Math.max(2, Math.floor(plotWidth / 58));
  const interval = Math.max(1, Math.ceil(count / maxLabels));
  const indexes = Array.from({ length: count }, (_, index) => index).filter(
    (index) => index === 0 || index === count - 1 || index % interval === 0
  );

  return unique(indexes);
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
  yDomain = defaultYDomain,
  formatXLabel = defaultFormatXLabel,
  formatYLabel = defaultFormatYLabel
}: LineChartProps<TData>) => {
  const seriesInput = useSeriesInput(yKey, yKeys, series);

  return useMemo(() => {
    const resolvedTheme = getTheme(theme);
    const normalized = normalizeCartesianData({
      data,
      xKey,
      series: seriesInput
    });
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
      measureText(formatYLabel(tick), { fontSize: 11 })
    );
    const xLabelSizes = xValues.map((value, index) =>
      measureText(formatXLabel(value, index), { fontSize: 11 })
    );
    const hasLegend = normalized.series.length > 1;
    const autoPaddingOptions = {
      base: { top: 16, right: 34, bottom: 12, left: 12 },
      leftLabels: yLabelSizes,
      bottomLabels: xLabelSizes.length > 0 ? [{ width: 1, height: 14 }] : [],
      gap: 8
    };
    const padding = calculateAutoPadding(
      hasLegend
        ? {
            ...autoPaddingOptions,
            legend: { width: width - 32, height: 18, position: "top" }
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
    const xLabelIndexes = getXLabelIndexes(xValues.length, boxes.plot.width);

    return {
      boxes,
      geometries,
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
        <SvgLine
          x1={boxes.plot.x}
          x2={boxes.plot.x}
          y1={boxes.plot.y}
          y2={boxes.plot.y + boxes.plot.height}
          stroke={resolvedTheme.axis}
          strokeWidth={1}
        />
        <SvgLine
          x1={boxes.plot.x}
          x2={boxes.plot.x + boxes.plot.width}
          y1={boxes.plot.y + boxes.plot.height}
          y2={boxes.plot.y + boxes.plot.height}
          stroke={resolvedTheme.axis}
          strokeWidth={1}
        />
        {yTicks.map((tick) => {
          const y = yScale.scale(tick);

          return (
            <SvgText
              key={`label-y-${tick}`}
              x={boxes.plot.x - 8}
              y={y + 4}
              fill={resolvedTheme.mutedText}
              fontSize={11}
              textAnchor="end"
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

          const label = formatXLabel(value, index);
          const labelWidth = measureText(label, { fontSize: 11 }).width + 16;
          const labelX = Math.min(
            Math.max(x - labelWidth / 2, 4),
            props.width - labelWidth - 4
          );

          return (
            <SvgText
              key={`label-x-${index}`}
              x={labelX}
              y={boxes.plot.y + boxes.plot.height + 20}
              fill={resolvedTheme.mutedText}
              fontSize={11}
              textAnchor="start"
            >
              {label}
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
        {geometries.length > 1
          ? geometries.map(({ geometry, style }, index) => {
              const x = boxes.plot.x + index * 92;
              const y = 16;

              return (
                <SvgGroup key={`legend-${geometry.key}`}>
                  <SvgRect
                    x={x}
                    y={y - 6}
                    width={8}
                    height={8}
                    rx={2}
                    fill={style.color}
                  />
                  <SvgText
                    x={x + 14}
                    y={y + 4}
                    fill={resolvedTheme.text}
                    fontSize={11}
                  >
                    {geometry.label}
                  </SvgText>
                </SvgGroup>
              );
            })
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

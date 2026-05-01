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
  solveChartBoxes,
  solveLabelCollision
} from "@chart-kit/core";
import type {
  ChartXValue,
  LineCurve,
  NumericDomainInput,
  ProjectScale,
  Size
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
export type LineChartLabelStrategy =
  | "auto"
  | "show"
  | "skip"
  | "rotate"
  | "stagger"
  | "hide";
export type LineChartResolvedLabelStrategy = Exclude<
  LineChartLabelStrategy,
  "auto"
>;
export type LineChartEdgeLabelPolicy = "shift" | "hide" | "show";

export type LineChartLegendRenderItem = {
  index: number;
  key: string;
  label: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  contentX: number;
  contentY: number;
  contentWidth: number;
  contentHeight: number;
  markerSize: number;
  marker: LineChartLegendMarker;
  fontSize: number;
  fontFamily?: string;
  labelColor: string;
  labelGap: number;
  paddingHorizontal: number;
  paddingVertical: number;
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
  labelGap?: number;
  itemPaddingHorizontal?: number;
  itemPaddingVertical?: number;
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
  labelGap: number;
  itemPaddingHorizontal: number;
  itemPaddingVertical: number;
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
  showHorizontalGridLines?: boolean;
  showVerticalGridLines?: boolean;
  legend?: boolean | LineChartLegendConfig;
  labelStrategy?: LineChartLabelStrategy;
  labelRotation?: number;
  labelMinGap?: number;
  edgeLabelPolicy?: LineChartEdgeLabelPolicy;
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
const defaultLabelRotation = -35;
const xLabelRowGap = 6;
const xLabelBaselineOffset = 20;
const rotatedLabelClearance = 10;
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
    labelGap: config.labelGap ?? 6,
    itemPaddingHorizontal: config.itemPaddingHorizontal ?? 0,
    itemPaddingVertical: config.itemPaddingVertical ?? 0,
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
  xLabelHeight,
  xLabelLineHeight,
  legendHeight,
  position
}: {
  boxes: ReturnType<typeof solveChartBoxes>;
  xLabelHeight: number;
  xLabelLineHeight: number;
  legendHeight: number;
  position: LineChartLegendPosition;
}) => {
  if (position === "bottom") {
    return (
      boxes.plot.y +
      boxes.plot.height +
      (xLabelHeight > 0
        ? xLabelBaselineOffset +
          Math.max(0, xLabelHeight - xLabelLineHeight) +
          10
        : 10)
    );
  }

  return Math.max(8, boxes.plot.y - legendHeight - 8);
};

const renderDefaultLegendItem = (item: LineChartLegendRenderItem) => {
  const markerCenterY = item.contentY + item.contentHeight / 2;

  return (
    <SvgGroup key={`legend-${item.key}`}>
      {item.marker === "circle" ? (
        <SvgCircle
          cx={item.contentX + item.markerSize / 2}
          cy={markerCenterY}
          r={item.markerSize / 2}
          fill={item.color}
        />
      ) : item.marker === "line" ? (
        <SvgLine
          x1={item.contentX}
          x2={item.contentX + item.markerSize}
          y1={markerCenterY}
          y2={markerCenterY}
          stroke={item.color}
          strokeLinecap="round"
          strokeWidth={3}
        />
      ) : (
        <SvgRect
          x={item.contentX}
          y={markerCenterY - item.markerSize / 2}
          width={item.markerSize}
          height={item.markerSize}
          rx={2}
          fill={item.color}
        />
      )}
      <SvgText
        x={item.contentX + item.markerSize + item.labelGap}
        y={item.contentY + item.contentHeight / 2 + item.fontSize * 0.36}
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

type XLabelCandidate = {
  index: number;
  value: ChartXValue;
  text: string;
  x: number;
  size: Size;
};

type XLabelLayoutItem = XLabelCandidate & {
  gridX: number;
  y: number;
  row: number;
  rotation: number;
  textAnchor: "start" | "middle" | "end";
};

type XLabelLayout = {
  strategy: LineChartResolvedLabelStrategy;
  items: XLabelLayoutItem[];
  height: number;
  rotation: number;
  rows: number;
};

const clamp = (value: number, min: number, max: number) => {
  if (max < min) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
};

const getMaxSize = (sizes: Size[]) => {
  return sizes.reduce(
    (max, size) => ({
      width: Math.max(max.width, size.width),
      height: Math.max(max.height, size.height)
    }),
    { width: 0, height: 0 }
  );
};

const getRotatedLabelHeight = (sizes: Size[], rotation: number) => {
  const maxSize = getMaxSize(sizes);
  const radians = (Math.abs(rotation) * Math.PI) / 180;

  return (
    maxSize.width * Math.sin(radians) +
    maxSize.height * Math.cos(radians) +
    rotatedLabelClearance
  );
};

const getXLabelHeight = ({
  strategy,
  sizes,
  rotation,
  rows
}: {
  strategy: LineChartResolvedLabelStrategy;
  sizes: Size[];
  rotation: number;
  rows: number;
}) => {
  if (strategy === "hide" || sizes.length === 0) {
    return 0;
  }

  if (strategy === "rotate") {
    return getRotatedLabelHeight(sizes, rotation);
  }

  const maxHeight = getMaxSize(sizes).height;

  if (strategy === "stagger") {
    return maxHeight * rows + xLabelRowGap * Math.max(0, rows - 1);
  }

  return maxHeight;
};

const getExplicitXLabelCollision = ({
  labels,
  strategy,
  availableWidth,
  minGap,
  rotation
}: {
  labels: Array<{
    id: string;
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  strategy: Exclude<LineChartLabelStrategy, "auto">;
  availableWidth: number;
  minGap: number;
  rotation: number;
}) => {
  const allIndexes = labels.map((_, index) => index);

  if (strategy === "hide") {
    return {
      strategy,
      visibleIndexes: [],
      rotation: 0,
      rows: 0
    };
  }

  if (strategy === "skip") {
    const result = solveLabelCollision({
      labels,
      availableWidth,
      allowRotate: false,
      allowStagger: false,
      minGap
    });

    return {
      strategy: result.strategy === "hide" ? "hide" : result.strategy,
      visibleIndexes: result.visibleIndexes,
      rotation: 0,
      rows: 1
    };
  }

  return {
    strategy,
    visibleIndexes: allIndexes,
    rotation: strategy === "rotate" ? rotation : 0,
    rows: strategy === "stagger" ? 2 : 1
  };
};

const getShiftedXLabel = ({
  candidate,
  chartWidth,
  edgeLabelPolicy,
  rotation,
  textAnchor
}: {
  candidate: XLabelCandidate;
  chartWidth: number;
  edgeLabelPolicy: LineChartEdgeLabelPolicy;
  rotation: number;
  textAnchor: XLabelLayoutItem["textAnchor"];
}) => {
  if (edgeLabelPolicy === "show") {
    return candidate.x;
  }

  const margin = 4;
  const width =
    rotation === 0
      ? candidate.size.width
      : candidate.size.width * Math.cos((Math.abs(rotation) * Math.PI) / 180);
  const leftExtent =
    textAnchor === "start" ? 0 : textAnchor === "end" ? width : width / 2;
  const rightExtent =
    textAnchor === "start" ? width : textAnchor === "end" ? 0 : width / 2;
  const min = margin + leftExtent;
  const max = chartWidth - margin - rightExtent;

  return clamp(candidate.x, min, max);
};

const getXLabelTextAnchor = ({
  candidate,
  candidates,
  rotation
}: {
  candidate: XLabelCandidate;
  candidates: XLabelCandidate[];
  rotation: number;
}): XLabelLayoutItem["textAnchor"] => {
  if (rotation === 0) {
    return "middle";
  }

  if (rotation < 0) {
    return candidate.index === candidates[0]?.index ? "start" : "end";
  }

  return candidate.index === candidates[candidates.length - 1]?.index
    ? "end"
    : "start";
};

const getRotatedBaselineOffset = ({
  rotation,
  size,
  textAnchor
}: {
  rotation: number;
  size: Size;
  textAnchor: XLabelLayoutItem["textAnchor"];
}) => {
  if (rotation === 0) {
    return 0;
  }

  const radians = (Math.abs(rotation) * Math.PI) / 180;
  const widthProjection = size.width * Math.sin(radians);

  if (rotation < 0 && textAnchor === "start") {
    return widthProjection;
  }

  if (rotation > 0 && textAnchor === "end") {
    return widthProjection;
  }

  return 0;
};

const getXLabelHorizontalBounds = (label: XLabelLayoutItem) => {
  if (label.rotation === 0) {
    const leftExtent =
      label.textAnchor === "start"
        ? 0
        : label.textAnchor === "end"
          ? label.size.width
          : label.size.width / 2;
    const rightExtent =
      label.textAnchor === "start"
        ? label.size.width
        : label.textAnchor === "end"
          ? 0
          : label.size.width / 2;

    return {
      left: label.x - leftExtent,
      right: label.x + rightExtent
    };
  }

  const radians = (Math.abs(label.rotation) * Math.PI) / 180;
  const projectedWidth =
    label.size.width * Math.cos(radians) +
    label.size.height * Math.sin(radians);
  const leftExtent =
    label.textAnchor === "start"
      ? 0
      : label.textAnchor === "end"
        ? projectedWidth
        : projectedWidth / 2;
  const rightExtent =
    label.textAnchor === "start"
      ? projectedWidth
      : label.textAnchor === "end"
        ? 0
        : projectedWidth / 2;

  return {
    left: label.x - leftExtent,
    right: label.x + rightExtent
  };
};

const filterOverlappingRotatedLabels = (
  items: XLabelLayoutItem[],
  minGap: number
) => {
  if (items.length <= 1) {
    return items;
  }

  const accepted: Array<{
    bounds: ReturnType<typeof getXLabelHorizontalBounds>;
    item: XLabelLayoutItem;
  }> = [];
  const lastIndex = items.length - 1;

  items.forEach((item, index) => {
    const bounds = getXLabelHorizontalBounds(item);
    const overlapsPrevious = () => {
      const previous = accepted[accepted.length - 1];

      return previous ? previous.bounds.right + minGap > bounds.left : false;
    };

    if (index === lastIndex) {
      while (overlapsPrevious()) {
        accepted.pop();
      }

      accepted.push({ bounds, item });
      return;
    }

    if (!overlapsPrevious()) {
      accepted.push({ bounds, item });
    }
  });

  return accepted.map(({ item }) => item);
};

const isXLabelInsideChart = ({
  candidate,
  chartWidth,
  x,
  textAnchor
}: {
  candidate: XLabelCandidate;
  chartWidth: number;
  x: number;
  textAnchor: XLabelLayoutItem["textAnchor"];
}) => {
  const margin = 4;
  const leftExtent =
    textAnchor === "start"
      ? 0
      : textAnchor === "end"
        ? candidate.size.width
        : candidate.size.width / 2;
  const rightExtent =
    textAnchor === "start"
      ? candidate.size.width
      : textAnchor === "end"
        ? 0
        : candidate.size.width / 2;

  return x - leftExtent >= margin && x + rightExtent <= chartWidth - margin;
};

const resolveXLabelLayout = ({
  candidates,
  plotWidth,
  chartWidth,
  strategy,
  rotation,
  edgeLabelPolicy,
  minGap,
  baseY
}: {
  candidates: XLabelCandidate[];
  plotWidth: number;
  chartWidth: number;
  strategy: LineChartLabelStrategy;
  rotation: number;
  edgeLabelPolicy: LineChartEdgeLabelPolicy;
  minGap: number;
  baseY: number;
}): XLabelLayout => {
  const labels = candidates.map((candidate) => ({
    id: String(candidate.index),
    text: candidate.text,
    x: candidate.x - candidate.size.width / 2,
    y: 0,
    width: candidate.size.width,
    height: candidate.size.height
  }));
  const getAutoCollision = () => {
    return solveLabelCollision({
      labels,
      availableWidth: plotWidth,
      allowRotate: false,
      allowStagger: false,
      minGap
    });
  };
  const collision =
    strategy === "auto"
      ? getAutoCollision()
      : getExplicitXLabelCollision({
          labels,
          strategy,
          availableWidth: plotWidth,
          minGap,
          rotation
        });
  const resolvedStrategy = collision.strategy as LineChartResolvedLabelStrategy;
  const resolvedRotation =
    resolvedStrategy === "rotate"
      ? rotation < 0
        ? rotation
        : -Math.abs(rotation)
      : 0;
  const rows = resolvedStrategy === "stagger" ? 2 : collision.rows;
  const sizes = collision.visibleIndexes.flatMap((candidateIndex) => {
    const candidate = candidates[candidateIndex];

    return candidate ? [candidate.size] : [];
  });
  const height = getXLabelHeight({
    strategy: resolvedStrategy,
    sizes,
    rotation: resolvedRotation,
    rows
  });
  const items = collision.visibleIndexes.flatMap<XLabelLayoutItem>(
    (candidateIndex) => {
      const candidate = candidates[candidateIndex];

      if (!candidate) {
        return [];
      }

      const row = resolvedStrategy === "stagger" ? candidate.index % rows : 0;
      const textAnchor = getXLabelTextAnchor({
        candidate,
        candidates,
        rotation: resolvedRotation
      });
      const baselineOffset =
        resolvedStrategy === "rotate"
          ? getRotatedBaselineOffset({
              rotation: resolvedRotation,
              size: candidate.size,
              textAnchor
            })
          : 0;
      const y =
        baseY + row * (candidate.size.height + xLabelRowGap) + baselineOffset;
      const x = getShiftedXLabel({
        candidate,
        chartWidth,
        edgeLabelPolicy,
        rotation: resolvedRotation,
        textAnchor
      });

      if (
        edgeLabelPolicy === "hide" &&
        !isXLabelInsideChart({
          candidate,
          chartWidth,
          x,
          textAnchor
        })
      ) {
        return [];
      }

      return [
        {
          ...candidate,
          gridX: candidate.x,
          x,
          y,
          row,
          rotation: resolvedRotation,
          textAnchor
        }
      ];
    }
  );
  const visibleItems =
    resolvedStrategy === "rotate"
      ? filterOverlappingRotatedLabels(items, minGap)
      : items;

  return {
    strategy: resolvedStrategy,
    items: visibleItems,
    height,
    rotation: resolvedRotation,
    rows
  };
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
  showHorizontalGridLines = false,
  showVerticalGridLines = false,
  legend,
  labelStrategy = "auto",
  labelRotation = defaultLabelRotation,
  labelMinGap = 8,
  edgeLabelPolicy = "shift",
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
    const xLabelTexts = xValues.map((value, index) =>
      formatXLabel(value, index)
    );
    const xLabelSizes = xLabelTexts.map((text) =>
      measureText(text, axisTextOptions)
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
          padding: legendConfig.padding,
          labelGap: legendConfig.labelGap,
          itemPaddingHorizontal: legendConfig.itemPaddingHorizontal,
          itemPaddingVertical: legendConfig.itemPaddingVertical
        })
      : undefined;
    const xScaleType = getXScaleType(xValues);
    const buildXScale = (
      chartBoxes: ReturnType<typeof solveChartBoxes>
    ): ProjectScale<TData> =>
      xScaleType === "time"
        ? (() => {
            const dates = xValues.filter(
              (value): value is Date => value instanceof Date
            );
            const scale = createTimeScale({
              values: dates,
              range: [
                chartBoxes.plot.x,
                chartBoxes.plot.x + chartBoxes.plot.width
              ]
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
                range: [
                  chartBoxes.plot.x,
                  chartBoxes.plot.x + chartBoxes.plot.width
                ]
              });

              return (value) =>
                typeof value === "number" ? scale.scale(value) : undefined;
            })()
          : (() => {
              const domain = unique(xValues.map(getXKey));
              const scale = createPointScale<ReturnType<typeof getXKey>>({
                domain,
                range: [
                  chartBoxes.plot.x,
                  chartBoxes.plot.x + chartBoxes.plot.width
                ]
              });

              return (value) => scale.scale(getXKey(value));
            })();
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
    const initialXScale = buildXScale(initialBoxes);
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
    const xScale = buildXScale(boxes);
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
                  paddingVertical: legendConfig.itemPaddingVertical
                } satisfies LineChartLegendRenderItem;
              })
            } satisfies LineChartLegendRenderProps
          }
        : undefined;

    return {
      boxes,
      geometries,
      legendModel,
      resolvedTheme,
      showDots,
      showHorizontalGridLines,
      showVerticalGridLines,
      xLabelLayout,
      yScale,
      yTicks,
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
    edgeLabelPolicy,
    labelMinGap,
    labelRotation,
    labelStrategy,
    legend,
    seriesInput,
    showDots,
    showHorizontalGridLines,
    showVerticalGridLines,
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
    resolvedTheme,
    showDots,
    showHorizontalGridLines,
    showVerticalGridLines,
    xLabelLayout,
    yScale,
    yTicks,
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
        {showVerticalGridLines
          ? xLabelLayout.items.map((label) => (
              <SvgLine
                key={`grid-x-${label.index}`}
                x1={label.gridX}
                x2={label.gridX}
                y1={boxes.plot.y}
                y2={boxes.plot.y + boxes.plot.height}
                stroke={resolvedTheme.grid}
                strokeOpacity={0.72}
                strokeWidth={1}
              />
            ))
          : null}
        {showHorizontalGridLines
          ? yTicks.map((tick) => {
              const y = yScale.scale(tick);

              return (
                <SvgLine
                  key={`grid-y-${tick}`}
                  x1={boxes.plot.x}
                  x2={boxes.plot.x + boxes.plot.width}
                  y1={y}
                  y2={y}
                  stroke={resolvedTheme.grid}
                  strokeOpacity={0.78}
                  strokeWidth={1}
                />
              );
            })
          : null}
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
        {xLabelLayout.items.map((label) => (
          <SvgGroup
            key={`label-x-${label.index}`}
            transform={
              label.rotation !== 0
                ? `rotate(${label.rotation} ${label.x} ${label.y})`
                : undefined
            }
          >
            <SvgText
              x={label.x}
              y={label.y}
              fill={resolvedTheme.mutedText}
              fontSize={resolvedTheme.typography.axisLabelSize}
              textAnchor={label.textAnchor}
              {...getFontFamilyProps(resolvedTheme.typography.fontFamily)}
            >
              {label.text}
            </SvgText>
          </SvgGroup>
        ))}
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

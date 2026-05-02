import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from "react";
import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import type { GestureResponderEvent } from "react-native";

import {
  buildLineSeriesGeometry,
  calculateAutoPadding,
  createLinearScale,
  createPointScale,
  createTimeScale,
  generateLinearTicks,
  layoutLegend,
  normalizeCartesianData,
  resolveChartViewport,
  resolveChartViewportInitialOffset,
  resolveChartViewportWindow,
  resolveChartViewportWindowFromPosition,
  resolveNumericDomain,
  sliceChartViewportData,
  solveChartBoxes,
  solveLabelCollision,
  type ChartViewportInitialIndex,
  type ResolvedChartViewportWindow
} from "@chart-kit/core";
import type {
  ChartXValue,
  LineCurve,
  NumericDomainInput,
  ProjectScale,
  ProjectedLinePoint,
  Size
} from "@chart-kit/core";
import {
  SvgCircle,
  SvgDefs,
  SvgGroup,
  SvgLayer,
  SvgLine,
  SvgLinearGradientDef,
  SvgPath,
  SvgRect,
  SvgSurface,
  SvgSymbol,
  SvgText,
  createSvgTextMeasurer,
  createSvgTestId
} from "@chart-kit/svg-renderer";
import {
  resolveCartesianChartThemeConfig,
  useChartKitTheme,
  type CartesianChartPresetValue,
  type CartesianChartTheme,
  type ChartKitThemeMode,
  type ChartKitThemeContextValue,
  type ResolvedCartesianChartTheme
} from "../../theme";
import {
  getLineChartCrosshairConfig,
  getLineChartDotConfig,
  getLineChartTooltipConfig,
  type LineChartCrosshairConfig,
  type LineChartDotColor,
  type LineChartDotConfig,
  type LineChartTooltipConfig,
  type ResolvedLineChartDotConfig
} from "./options";
import {
  buildLineChartSelectEvent,
  getLineChartInteractionConfig,
  getLineChartVisibleInteractionBounds,
  getNearestLineChartInteractionIndex,
  isLineChartInteractionEnabled,
  isLineChartInteractionInBounds,
  normalizeLineChartSelectedIndex,
  type LineChartInteraction,
  type LineChartDeselectEvent,
  type LineChartInteractionPoint
} from "./interaction";
import {
  getSelectedLineSeries,
  type LineChartSelectedSeriesItem as BaseLineChartSelectedSeriesItem
} from "./selection";
import {
  interpolateLineChartTooltipPosition,
  getLineChartTooltipModel,
  lineChartTooltipLineHeight,
  type LineChartTooltipRenderProps as BaseLineChartTooltipRenderProps,
  type LineChartTooltipSeriesItem as BaseLineChartTooltipSeriesItem
} from "./tooltip";

export type {
  LineChartInteraction,
  LineChartInteractionConfig,
  LineChartInteractionMode,
  LineChartDeselectEvent,
  LineChartSelectEvent
} from "./interaction";

export type {
  LineChartCrosshairConfig,
  LineChartDotColor,
  LineChartDotConfig,
  LineChartDotShape,
  LineChartTooltipConfig,
  ResolvedLineChartCrosshairConfig,
  ResolvedLineChartDotConfig,
  ResolvedLineChartTooltipConfig
} from "./options";

export type LineChartSeries<TData extends Record<string, unknown>> = {
  yKey: keyof TData & string;
  key?: string;
  label?: string;
  color?: string;
  strokeWidth?: number;
  dot?: boolean | LineChartDotConfig;
  area?: boolean;
  curve?: LineCurve;
};

export type LineChartDotRenderProps<TData = unknown> = {
  point: ProjectedLinePoint<TData>;
  seriesKey: string;
  seriesLabel: string;
  color: string;
  x: number;
  y: number;
  value: number | null | undefined;
  dataIndex: number;
  config: ResolvedLineChartDotConfig;
  theme: ResolvedCartesianChartTheme;
};

export type LineChartTooltipSeriesItem<TData = unknown> =
  BaseLineChartTooltipSeriesItem<ProjectedLinePoint<TData>>;

export type LineChartTooltipRenderProps<TData = unknown> =
  BaseLineChartTooltipRenderProps<
    ProjectedLinePoint<TData>,
    ResolvedCartesianChartTheme
  >;

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
export type LineChartInitialIndex = ChartViewportInitialIndex;

export type LineChartViewportConfig = {
  startIndex?: number;
  endIndex?: number;
  visiblePoints?: number;
  initialIndex?: ChartViewportInitialIndex;
};

export type LineChartRangeSelectorConfig = {
  visible?: boolean;
  height?: number;
  gap?: number;
  interactive?: boolean;
  windowFill?: string;
  windowOpacity?: number;
  windowStroke?: string;
  lineOpacity?: number;
  handleColor?: string;
  handleOpacity?: number;
  handleWidth?: number;
};

export type LineChartViewportChangeEvent = {
  viewport: LineChartViewportConfig;
  startIndex: number;
  endIndex: number;
  visibleCount: number;
  itemCount: number;
  isWindowed: boolean;
  source: "rangeSelector";
};

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
  theme?: ChartKitThemeMode | CartesianChartTheme;
  preset?: CartesianChartPresetValue;
  scrollable?: boolean;
  visiblePoints?: number;
  initialIndex?: ChartViewportInitialIndex;
  viewport?: LineChartViewportConfig;
  onViewportChange?: (event: LineChartViewportChangeEvent) => void;
  rangeSelector?: boolean | LineChartRangeSelectorConfig;
  curve?: LineCurve;
  connectNulls?: boolean;
  area?: boolean;
  showDots?: boolean;
  dots?: boolean | LineChartDotConfig;
  renderDot?: (props: LineChartDotRenderProps<TData>) => ReactNode;
  selectedIndex?: number;
  defaultSelectedIndex?: number;
  activeDot?: boolean | LineChartDotConfig;
  renderActiveDot?: (props: LineChartDotRenderProps<TData>) => ReactNode;
  interaction?: LineChartInteraction<TData>;
  crosshair?: boolean | LineChartCrosshairConfig;
  tooltip?: boolean | LineChartTooltipConfig;
  renderTooltip?: (props: LineChartTooltipRenderProps<TData>) => ReactNode;
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

const defaultYDomain: NumericDomainInput = { includeZero: true, nice: true };
const defaultLabelRotation = -35;
const xLabelRowGap = 6;
const xLabelBaselineOffset = 20;
const rotatedLabelClearance = 10;

const measureText = createSvgTextMeasurer({
  lineHeight: 14
});

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

const getRangeSelectorConfig = (
  rangeSelector: LineChartProps<Record<string, unknown>>["rangeSelector"]
) => {
  const config = typeof rangeSelector === "object" ? rangeSelector : {};
  const visible =
    typeof rangeSelector === "boolean"
      ? rangeSelector
      : rangeSelector !== undefined && config.visible !== false;

  return {
    visible,
    height: config.height ?? 54,
    gap: config.gap ?? 10,
    interactive: config.interactive ?? false,
    windowFill: config.windowFill,
    windowOpacity: config.windowOpacity ?? 0.1,
    windowStroke: config.windowStroke,
    lineOpacity: config.lineOpacity ?? 0.62,
    handleColor: config.handleColor,
    handleOpacity: config.handleOpacity ?? 0.9,
    handleWidth: config.handleWidth ?? 3
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
  const markerShape = item.marker === "line" ? "line" : item.marker;

  return (
    <SvgGroup key={`legend-${item.key}`}>
      <SvgSymbol
        shape={markerShape}
        x={item.contentX + item.markerSize / 2}
        y={markerCenterY}
        size={item.markerSize}
        fill={item.color}
        stroke={item.color}
        cornerRadius={2}
        {...(item.marker === "line" ? { strokeWidth: 3 } : {})}
      />
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
  return theme.series[index % theme.series.length] ?? "#2563eb";
};

const resolveDotColor = ({
  color,
  fallback,
  seriesColor,
  theme
}: {
  color: LineChartDotColor;
  fallback: string;
  seriesColor: string;
  theme: ResolvedCartesianChartTheme;
}) => {
  if (color === "background") {
    return theme.background;
  }

  if (color === "series") {
    return seriesColor;
  }

  return color || fallback;
};

const renderDefaultDot = <TData,>({
  color,
  config,
  point,
  theme
}: LineChartDotRenderProps<TData>) => {
  const fill = resolveDotColor({
    color: config.fill,
    fallback: theme.background,
    seriesColor: color,
    theme
  });
  const stroke = resolveDotColor({
    color: config.stroke,
    fallback: color,
    seriesColor: color,
    theme
  });
  const dotKey = `dot-${point.seriesKey}-${point.index}`;
  const commonProps = {
    testID: createSvgTestId("line-dot", point.seriesKey, point.index),
    fill,
    opacity: config.opacity,
    stroke,
    strokeWidth: config.strokeWidth
  };

  return (
    <SvgSymbol
      key={dotKey}
      shape={config.shape}
      x={point.x}
      y={point.y}
      size={config.radius * 2}
      cornerRadius={Math.min(3, config.radius * 0.45)}
      {...commonProps}
    />
  );
};

const renderDefaultTooltip = <TData,>({
  config,
  height,
  series,
  width,
  x,
  xLabel,
  y
}: LineChartTooltipRenderProps<TData>) => {
  const contentX = x + config.padding;
  const labelY = y + config.padding + config.labelFontSize;
  const firstItemY = labelY + lineChartTooltipLineHeight;

  return (
    <SvgGroup>
      <SvgRect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={config.borderRadius}
        fill={config.backgroundColor}
        stroke={config.borderColor}
        strokeOpacity={0.2}
        strokeWidth={1}
      />
      <SvgText
        x={contentX}
        y={labelY}
        fill={config.labelColor}
        fontSize={config.labelFontSize}
        fontWeight="600"
      >
        {xLabel}
      </SvgText>
      {series.map((item, index) => {
        const itemY = firstItemY + index * lineChartTooltipLineHeight;

        return (
          <SvgGroup key={`tooltip-${item.key}`}>
            <SvgCircle
              cx={contentX + 3}
              cy={itemY - config.fontSize * 0.32}
              r={3}
              fill={item.color}
            />
            <SvgText
              x={contentX + 12}
              y={itemY}
              fill={config.textColor}
              fontSize={config.fontSize}
            >
              {`${item.label}: ${item.formattedValue}`}
            </SvgText>
          </SvgGroup>
        );
      })}
    </SvgGroup>
  );
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

type LineChartSelectedSeriesItem<TData = unknown> =
  BaseLineChartSelectedSeriesItem<ProjectedLinePoint<TData>>;

type LineChartSelectionModel<TData = unknown> = {
  index: number;
  x: number;
  y: number;
  xLabel: string;
  series: Array<LineChartSelectedSeriesItem<TData>>;
  tooltip: LineChartTooltipRenderProps<TData> | undefined;
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
          color: item.color ?? getSeriesColor(resolvedTheme, index),
          dot: getLineChartDotConfig({
            dots,
            seriesDot: item.dot,
            showDots
          })
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
      themeAxisColor: resolvedTheme.axis
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
              measureText,
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
                  paddingVertical: legendConfig.itemPaddingVertical
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
      resolvedTheme,
      showDots,
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

const tooltipPositionThreshold = 0.5;

const useAnimatedTooltipModel = <TData,>(
  tooltip: LineChartTooltipRenderProps<TData> | undefined
) => {
  const latestPositionRef = useRef<{ x: number; y: number } | undefined>(
    undefined
  );
  const previousTooltipRef = useRef<
    LineChartTooltipRenderProps<TData> | undefined
  >(undefined);
  const [animatedPosition, setAnimatedPosition] = useState<
    { x: number; y: number } | undefined
  >(undefined);

  useEffect(() => {
    let animationFrame = 0;

    if (!tooltip) {
      latestPositionRef.current = undefined;
      previousTooltipRef.current = undefined;
      animationFrame = requestAnimationFrame(() => {
        setAnimatedPosition(undefined);
      });

      return () => {
        cancelAnimationFrame(animationFrame);
      };
    }

    const targetPosition = { x: tooltip.x, y: tooltip.y };
    const currentPosition = latestPositionRef.current ?? targetPosition;
    const hasPreviousTooltip = previousTooltipRef.current !== undefined;
    const positionAnimationDuration = tooltip.config.positionAnimationDuration;

    previousTooltipRef.current = tooltip;

    if (!hasPreviousTooltip) {
      latestPositionRef.current = targetPosition;
      animationFrame = requestAnimationFrame(() => {
        setAnimatedPosition(targetPosition);
      });

      return () => {
        cancelAnimationFrame(animationFrame);
      };
    }

    if (positionAnimationDuration <= 0) {
      latestPositionRef.current = targetPosition;
      animationFrame = requestAnimationFrame(() => {
        setAnimatedPosition(targetPosition);
      });

      return () => {
        cancelAnimationFrame(animationFrame);
      };
    }

    const deltaX = Math.abs(currentPosition.x - targetPosition.x);
    const deltaY = Math.abs(currentPosition.y - targetPosition.y);

    if (
      deltaX < tooltipPositionThreshold &&
      deltaY < tooltipPositionThreshold
    ) {
      latestPositionRef.current = targetPosition;
      animationFrame = requestAnimationFrame(() => {
        setAnimatedPosition(targetPosition);
      });

      return () => {
        cancelAnimationFrame(animationFrame);
      };
    }

    let startTime: number | undefined;

    const tick = (timestamp: number) => {
      startTime ??= timestamp;

      const progress = Math.min(
        (timestamp - startTime) / positionAnimationDuration,
        1
      );
      const nextPosition = interpolateLineChartTooltipPosition({
        from: currentPosition,
        progress,
        to: targetPosition
      });

      latestPositionRef.current = nextPosition;
      setAnimatedPosition(nextPosition);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(tick);
      }
    };

    animationFrame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [tooltip]);

  if (!tooltip) {
    return undefined;
  }

  const position = animatedPosition ?? { x: tooltip.x, y: tooltip.y };

  return {
    ...tooltip,
    x: position.x,
    y: position.y
  };
};

export const LineChart = <TData extends Record<string, unknown>>(
  props: LineChartProps<TData>
) => {
  const chartId = useId().replace(/:/g, "");
  const chartKitTheme = useChartKitTheme();
  const { onViewportChange } = props;
  const scrollViewRef = useRef<ScrollView>(null);
  const interactionConfig = useMemo(
    () => getLineChartInteractionConfig(props.interaction),
    [props.interaction]
  );
  const [gestureSelectedIndex, setGestureSelectedIndex] = useState<
    number | undefined
  >(() => normalizeLineChartSelectedIndex(props.defaultSelectedIndex));
  const effectiveSelectedIndex = props.selectedIndex ?? gestureSelectedIndex;
  const rangeSelectorConfig = useMemo(
    () => getRangeSelectorConfig(props.rangeSelector),
    [props.rangeSelector]
  );
  const viewportWindow = useMemo(
    () =>
      resolveChartViewportWindow({
        itemCount: props.data.length,
        startIndex: props.viewport?.startIndex,
        endIndex: props.viewport?.endIndex,
        visiblePoints: props.viewport?.visiblePoints,
        initialIndex: props.viewport?.initialIndex
      }),
    [
      props.data.length,
      props.viewport?.endIndex,
      props.viewport?.initialIndex,
      props.viewport?.startIndex,
      props.viewport?.visiblePoints
    ]
  );
  const mainData = useMemo(
    () => sliceChartViewportData(props.data, viewportWindow),
    [props.data, viewportWindow]
  );
  const isRangeSelectorVisible =
    rangeSelectorConfig.visible && props.data.length > 1;
  const mainHeight = isRangeSelectorVisible
    ? Math.max(
        120,
        props.height - rangeSelectorConfig.height - rangeSelectorConfig.gap
      )
    : props.height;
  const viewport = useMemo(
    () =>
      resolveChartViewport({
        itemCount: mainData.length,
        scrollable: props.scrollable,
        viewportWidth: props.width,
        visiblePoints: props.visiblePoints
      }),
    [mainData.length, props.scrollable, props.visiblePoints, props.width]
  );
  const initialScrollOffset = useMemo(
    () =>
      resolveChartViewportInitialOffset({
        initialIndex: props.initialIndex,
        viewport
      }),
    [props.initialIndex, viewport]
  );
  const chartProps =
    effectiveSelectedIndex !== undefined
      ? {
          ...props,
          data: mainData,
          height: mainHeight,
          width: viewport.contentWidth,
          selectedIndex: effectiveSelectedIndex
        }
      : {
          ...props,
          data: mainData,
          height: mainHeight,
          width: viewport.contentWidth
        };
  const model = useChartModel({ ...chartProps, chartKitTheme });
  const {
    activeDot: _overviewActiveDot,
    crosshair: _overviewCrosshair,
    defaultSelectedIndex: _overviewDefaultSelectedIndex,
    initialIndex: _overviewInitialIndex,
    interaction: _overviewInteraction,
    legend: _overviewLegend,
    rangeSelector: _overviewRangeSelector,
    selectedIndex: _overviewSelectedIndex,
    scrollable: _overviewScrollable,
    tooltip: _overviewTooltip,
    viewport: _overviewViewport,
    visiblePoints: _overviewVisiblePoints,
    ...overviewBaseProps
  } = props;
  const overviewModel = useChartModel({
    ...overviewBaseProps,
    activeDot: false,
    chartKitTheme,
    crosshair: false,
    height: rangeSelectorConfig.height,
    labelStrategy: "hide",
    legend: false,
    showDots: false,
    tooltip: false,
    width: props.width
  });
  const {
    boxes,
    geometries,
    interactionPoints,
    legendModel,
    resolvedTheme,
    showHorizontalGridLines,
    showVerticalGridLines,
    crosshairConfig,
    selectionModel,
    xLabelLayout,
    yScale,
    yTicks,
    formatYLabel
  } = model;
  const isInteractionEnabled = isLineChartInteractionEnabled(interactionConfig);
  useEffect(() => {
    if (!viewport.scrollable) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({
        animated: false,
        x: initialScrollOffset
      });
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [initialScrollOffset, viewport.scrollable]);
  const isResponderEventInPlot = useCallback(
    (event: GestureResponderEvent) => {
      const { locationX, locationY } = event.nativeEvent;

      return isLineChartInteractionInBounds({
        bounds: boxes.plot,
        locationX,
        locationY
      });
    },
    [boxes.plot]
  );
  const visibleInteractionBounds = useMemo(
    () =>
      getLineChartVisibleInteractionBounds({
        bounds: boxes.plot,
        scrollable: viewport.scrollable,
        viewportWidth: props.width
      }),
    [boxes.plot, props.width, viewport.scrollable]
  );
  const clearGestureSelection = useCallback(
    (event: LineChartDeselectEvent) => {
      if (props.selectedIndex === undefined) {
        setGestureSelectedIndex(undefined);
      }

      interactionConfig.onDeselect?.(event);
    },
    [interactionConfig, props.selectedIndex]
  );
  const preventBrowserSelection = useCallback(
    (event: GestureResponderEvent) => {
      event.preventDefault();
    },
    []
  );
  const handleInteractionEvent = useCallback(
    (event: GestureResponderEvent) => {
      preventBrowserSelection(event);

      const { locationX } = event.nativeEvent;
      const selectedDataIndex = getNearestLineChartInteractionIndex({
        locationX,
        points: interactionPoints
      });

      if (selectedDataIndex === undefined) {
        return;
      }

      const selectedSeries = getSelectedLineSeries({
        activeDot: props.activeDot,
        formatYLabel,
        geometries,
        selectedDataIndex
      });
      const selectEvent = buildLineChartSelectEvent<
        TData,
        ProjectedLinePoint<TData>
      >({
        interactionPoints,
        selectedDataIndex,
        selectedSeries
      });

      if (!selectEvent) {
        return;
      }

      if (
        props.selectedIndex === undefined &&
        interactionConfig.selectionPersistence !== "none"
      ) {
        setGestureSelectedIndex(selectedDataIndex);
      }

      interactionConfig.onSelect?.(selectEvent);
    },
    [
      formatYLabel,
      geometries,
      interactionConfig,
      interactionPoints,
      props.activeDot,
      props.selectedIndex,
      preventBrowserSelection
    ]
  );
  const handleResponderGrant = useCallback(
    (event: GestureResponderEvent) => {
      preventBrowserSelection(event);

      if (!isResponderEventInPlot(event)) {
        if (interactionConfig.deselectOnOutsidePress) {
          clearGestureSelection({ reason: "outsidePress" });
        }

        return;
      }

      interactionConfig.onGestureStart?.();
      handleInteractionEvent(event);
    },
    [
      clearGestureSelection,
      handleInteractionEvent,
      interactionConfig,
      isResponderEventInPlot,
      preventBrowserSelection
    ]
  );
  const handleResponderMove = useCallback(
    (event: GestureResponderEvent) => {
      if (interactionConfig.mode === "scrub") {
        handleInteractionEvent(event);
      }
    },
    [handleInteractionEvent, interactionConfig.mode]
  );
  const handleResponderEnd = useCallback(() => {
    if (interactionConfig.selectionPersistence === "whileActive") {
      clearGestureSelection({ reason: "gestureEnd" });
    }

    interactionConfig.onGestureEnd?.();
  }, [clearGestureSelection, interactionConfig]);
  const outsidePressSurfaceResponderProps =
    isInteractionEnabled && interactionConfig.deselectOnOutsidePress
      ? {
          onStartShouldSetResponder: () => true,
          onResponderGrant: (event: GestureResponderEvent) => {
            preventBrowserSelection(event);
            clearGestureSelection({ reason: "outsidePress" });
          }
        }
      : {};
  const responderProps = isInteractionEnabled
    ? {
        onStartShouldSetResponder: () => true,
        onMoveShouldSetResponder: (event: GestureResponderEvent) =>
          interactionConfig.mode === "scrub" && isResponderEventInPlot(event),
        onResponderTerminationRequest: () => interactionConfig.mode !== "scrub",
        onResponderGrant: handleResponderGrant,
        onResponderMove: handleResponderMove,
        onResponderRelease: handleResponderEnd,
        onResponderTerminate: handleResponderEnd
      }
    : {};
  const outsidePressSurfaces =
    isInteractionEnabled && interactionConfig.deselectOnOutsidePress
      ? [
          {
            key: "top",
            height: visibleInteractionBounds.y,
            left: 0,
            top: 0,
            width: props.width
          },
          {
            key: "left",
            height: visibleInteractionBounds.height,
            left: 0,
            top: visibleInteractionBounds.y,
            width: visibleInteractionBounds.x
          },
          {
            key: "right",
            height: visibleInteractionBounds.height,
            left: visibleInteractionBounds.x + visibleInteractionBounds.width,
            top: visibleInteractionBounds.y,
            width:
              props.width -
              (visibleInteractionBounds.x + visibleInteractionBounds.width)
          },
          {
            key: "bottom",
            height:
              mainHeight -
              (visibleInteractionBounds.y + visibleInteractionBounds.height),
            left: 0,
            top: visibleInteractionBounds.y + visibleInteractionBounds.height,
            width: props.width
          }
        ].filter((surface) => surface.width > 0 && surface.height > 0)
      : [];
  const animatedTooltip = useAnimatedTooltipModel(selectionModel?.tooltip);
  const chartWidth = viewport.contentWidth;
  const xAxisLabelFadeY = boxes.plot.y + boxes.plot.height;
  const xAxisLabelFadeHeight = Math.max(0, mainHeight - xAxisLabelFadeY);
  const scrollStartFadeWidth = Math.min(
    12,
    Math.max(0, props.width - boxes.plot.x)
  );
  const scrollStartFadeId = `${chartId}-scroll-start-fade`;

  const chartSurface = (
    <View style={{ width: chartWidth, height: mainHeight }} {...responderProps}>
      <SvgSurface width={chartWidth} height={mainHeight}>
        <SvgLayer name="background">
          <SvgRect
            x={0}
            y={0}
            width={chartWidth}
            height={mainHeight}
            rx={8}
            fill={resolvedTheme.background}
          />
        </SvgLayer>
        <SvgLayer name="plot">
          <SvgRect
            x={boxes.plot.x}
            y={boxes.plot.y}
            width={boxes.plot.width}
            height={boxes.plot.height}
            rx={6}
            fill={resolvedTheme.plotBackground}
          />
        </SvgLayer>
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
        <SvgLayer name="grid">
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
        </SvgLayer>
        <SvgLayer name="axes">
          {viewport.scrollable
            ? null
            : yTicks.map((tick) => {
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
        </SvgLayer>
        <SvgLayer name="dataArea">
          {geometries.map(({ geometry }, index) =>
            geometry.area ? (
              <SvgPath
                key={`area-${geometry.key}`}
                d={geometry.area.path}
                fill={`url(#area-gradient-${index})`}
              />
            ) : null
          )}
        </SvgLayer>
        <SvgLayer name="data">
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
        </SvgLayer>
        <SvgLayer name="markers">
          {geometries.flatMap(({ geometry, style }) =>
            geometry.points
              .filter((point) => point.defined && style.dot.visible)
              .map((point) => {
                const dotProps: LineChartDotRenderProps<TData> = {
                  point,
                  seriesKey: geometry.key,
                  seriesLabel: geometry.label,
                  color: style.color,
                  x: point.x,
                  y: point.y,
                  value: point.value,
                  dataIndex: point.dataIndex,
                  config: style.dot,
                  theme: resolvedTheme
                };
                const renderedDot = props.renderDot
                  ? props.renderDot(dotProps)
                  : renderDefaultDot(dotProps);

                return renderedDot ? (
                  <SvgGroup key={`dot-${geometry.key}-${point.index}`}>
                    {renderedDot}
                  </SvgGroup>
                ) : null;
              })
          )}
        </SvgLayer>
        <SvgLayer name="overlays">
          {selectionModel && crosshairConfig.visible ? (
            <SvgLine
              key="selection-crosshair"
              x1={selectionModel.x}
              x2={selectionModel.x}
              y1={boxes.plot.y}
              y2={boxes.plot.y + boxes.plot.height}
              stroke={crosshairConfig.color}
              strokeOpacity={crosshairConfig.opacity}
              strokeWidth={crosshairConfig.strokeWidth}
              {...(crosshairConfig.strokeDasharray
                ? { strokeDasharray: crosshairConfig.strokeDasharray }
                : {})}
            />
          ) : null}
          {legendModel
            ? renderConfiguredLegend({
                legend: legendModel.renderProps,
                config: legendModel.config
              })
            : null}
        </SvgLayer>
        <SvgLayer name="interaction">
          {selectionModel
            ? selectionModel.series
                .filter((item) => item.activeDot.visible)
                .map((item) => {
                  const dotProps: LineChartDotRenderProps<TData> = {
                    point: item.point,
                    seriesKey: item.key,
                    seriesLabel: item.label,
                    color: item.color,
                    x: item.point.x,
                    y: item.point.y,
                    value: item.value,
                    dataIndex: item.point.dataIndex,
                    config: item.activeDot,
                    theme: resolvedTheme
                  };
                  const renderedDot = props.renderActiveDot
                    ? props.renderActiveDot(dotProps)
                    : renderDefaultDot(dotProps);

                  return renderedDot ? (
                    <SvgGroup key={`active-dot-${item.key}`}>
                      {renderedDot}
                    </SvgGroup>
                  ) : null;
                })
            : null}
          {animatedTooltip
            ? props.renderTooltip
              ? props.renderTooltip(animatedTooltip)
              : renderDefaultTooltip(animatedTooltip)
            : null}
        </SvgLayer>
      </SvgSurface>
    </View>
  );
  const stickyYAxis = viewport.scrollable ? (
    <View
      pointerEvents="none"
      style={[styles.stickyYAxis, { width: props.width, height: mainHeight }]}
    >
      <SvgSurface width={props.width} height={mainHeight}>
        <SvgDefs>
          <SvgLinearGradientDef
            id={scrollStartFadeId}
            x1="0%"
            x2="100%"
            y1="0%"
            y2="0%"
            stops={[
              { offset: "0%", color: resolvedTheme.background, opacity: 1 },
              { offset: "100%", color: resolvedTheme.background, opacity: 0 }
            ]}
          />
        </SvgDefs>
        <SvgLayer name="background">
          <SvgRect
            x={0}
            y={0}
            width={boxes.plot.x}
            height={mainHeight}
            fill={resolvedTheme.background}
          />
          {scrollStartFadeWidth > 0 ? (
            <SvgRect
              x={boxes.plot.x}
              y={xAxisLabelFadeY}
              width={scrollStartFadeWidth}
              height={xAxisLabelFadeHeight}
              fill={`url(#${scrollStartFadeId})`}
            />
          ) : null}
        </SvgLayer>
        <SvgLayer name="axes">
          {yTicks.map((tick) => {
            const y = yScale.scale(tick);

            return (
              <SvgText
                key={`sticky-label-y-${tick}`}
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
        </SvgLayer>
      </SvgSurface>
    </View>
  ) : null;
  const rangeStartPoint = overviewModel.interactionPoints.find(
    (point) => point.dataIndex === viewportWindow.startIndex
  );
  const rangeEndPoint = overviewModel.interactionPoints.find(
    (point) => point.dataIndex === Math.max(0, viewportWindow.endIndex - 1)
  );
  const rangeSelectorWindowX = rangeStartPoint?.x ?? overviewModel.boxes.plot.x;
  const rangeSelectorWindowEndX =
    rangeEndPoint?.x ??
    overviewModel.boxes.plot.x + overviewModel.boxes.plot.width;
  const rangeSelectorWindowWidth = Math.max(
    10,
    rangeSelectorWindowEndX - rangeSelectorWindowX
  );
  const emitViewportChange = useCallback(
    (nextWindow: ResolvedChartViewportWindow) => {
      onViewportChange?.({
        viewport: {
          startIndex: nextWindow.startIndex,
          endIndex: nextWindow.endIndex
        },
        startIndex: nextWindow.startIndex,
        endIndex: nextWindow.endIndex,
        visibleCount: nextWindow.visibleCount,
        itemCount: nextWindow.itemCount,
        isWindowed: nextWindow.isWindowed,
        source: "rangeSelector"
      });
    },
    [onViewportChange]
  );
  const isRangeSelectorInteractive =
    isRangeSelectorVisible &&
    rangeSelectorConfig.interactive &&
    onViewportChange !== undefined;
  const handleRangeSelectorInteraction = useCallback(
    (event: GestureResponderEvent) => {
      preventBrowserSelection(event);

      if (!isRangeSelectorInteractive) {
        return;
      }

      const nextWindow = resolveChartViewportWindowFromPosition({
        itemCount: props.data.length,
        locationX: event.nativeEvent.locationX,
        plotWidth: overviewModel.boxes.plot.width,
        plotX: overviewModel.boxes.plot.x,
        visibleCount: viewportWindow.visibleCount
      });

      if (
        nextWindow.startIndex === viewportWindow.startIndex &&
        nextWindow.endIndex === viewportWindow.endIndex
      ) {
        return;
      }

      emitViewportChange(nextWindow);
    },
    [
      emitViewportChange,
      isRangeSelectorInteractive,
      overviewModel.boxes.plot.width,
      overviewModel.boxes.plot.x,
      preventBrowserSelection,
      props.data.length,
      viewportWindow.endIndex,
      viewportWindow.startIndex,
      viewportWindow.visibleCount
    ]
  );
  const rangeSelectorResponderProps = isRangeSelectorInteractive
    ? {
        onStartShouldSetResponder: () => true,
        onMoveShouldSetResponder: () => true,
        onResponderGrant: handleRangeSelectorInteraction,
        onResponderMove: handleRangeSelectorInteraction,
        onResponderTerminationRequest: () => false
      }
    : {};
  const rangeSelectorHandleWidth = rangeSelectorConfig.handleWidth;
  const rangeSelectorHandleColor =
    rangeSelectorConfig.handleColor ??
    rangeSelectorConfig.windowStroke ??
    overviewModel.resolvedTheme.axis;
  const rangeSelectorHandleMinX = overviewModel.boxes.plot.x;
  const rangeSelectorHandleMaxX =
    overviewModel.boxes.plot.x +
    overviewModel.boxes.plot.width -
    rangeSelectorHandleWidth;
  const rangeSelectorStartHandleX = clamp(
    rangeSelectorWindowX - rangeSelectorHandleWidth / 2,
    rangeSelectorHandleMinX,
    rangeSelectorHandleMaxX
  );
  const rangeSelectorEndHandleX = clamp(
    rangeSelectorWindowEndX - rangeSelectorHandleWidth / 2,
    rangeSelectorHandleMinX,
    rangeSelectorHandleMaxX
  );
  const rangeSelectorElement = isRangeSelectorVisible ? (
    <View
      pointerEvents={isRangeSelectorInteractive ? "auto" : "none"}
      style={[
        styles.rangeSelector,
        {
          height: rangeSelectorConfig.height,
          marginTop: rangeSelectorConfig.gap,
          width: props.width
        }
      ]}
      testID={props.testID ? `${props.testID}-range-selector` : undefined}
      {...rangeSelectorResponderProps}
    >
      <SvgSurface width={props.width} height={rangeSelectorConfig.height}>
        <SvgLayer name="background">
          <SvgRect
            x={0}
            y={0}
            width={props.width}
            height={rangeSelectorConfig.height}
            rx={8}
            fill={overviewModel.resolvedTheme.background}
          />
          <SvgRect
            x={overviewModel.boxes.plot.x}
            y={overviewModel.boxes.plot.y}
            width={overviewModel.boxes.plot.width}
            height={overviewModel.boxes.plot.height}
            rx={6}
            fill={overviewModel.resolvedTheme.plotBackground}
          />
        </SvgLayer>
        <SvgLayer name="data">
          {overviewModel.geometries.map(({ geometry, style }) => (
            <SvgPath
              key={`range-line-${geometry.key}`}
              d={geometry.line.path}
              fill="none"
              stroke={style.color}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity={rangeSelectorConfig.lineOpacity}
              strokeWidth={Math.max(1.5, style.strokeWidth * 0.62)}
            />
          ))}
        </SvgLayer>
        <SvgLayer name="overlays">
          <SvgRect
            x={rangeSelectorWindowX}
            y={overviewModel.boxes.plot.y}
            width={rangeSelectorWindowWidth}
            height={overviewModel.boxes.plot.height}
            rx={6}
            fill={
              rangeSelectorConfig.windowFill ?? overviewModel.resolvedTheme.axis
            }
            opacity={rangeSelectorConfig.windowOpacity}
            stroke={
              rangeSelectorConfig.windowStroke ??
              overviewModel.resolvedTheme.axis
            }
            strokeOpacity={0.42}
            strokeWidth={1}
          />
          {isRangeSelectorInteractive ? (
            <>
              <SvgRect
                x={rangeSelectorStartHandleX}
                y={overviewModel.boxes.plot.y + 6}
                width={rangeSelectorHandleWidth}
                height={Math.max(8, overviewModel.boxes.plot.height - 12)}
                rx={rangeSelectorHandleWidth / 2}
                fill={rangeSelectorHandleColor}
                opacity={rangeSelectorConfig.handleOpacity}
              />
              <SvgRect
                x={rangeSelectorEndHandleX}
                y={overviewModel.boxes.plot.y + 6}
                width={rangeSelectorHandleWidth}
                height={Math.max(8, overviewModel.boxes.plot.height - 12)}
                rx={rangeSelectorHandleWidth / 2}
                fill={rangeSelectorHandleColor}
                opacity={rangeSelectorConfig.handleOpacity}
              />
            </>
          ) : null}
        </SvgLayer>
      </SvgSurface>
    </View>
  ) : null;

  return (
    <View
      testID={props.testID}
      style={[styles.container, { width: props.width, height: props.height }]}
    >
      <View style={{ width: props.width, height: mainHeight }}>
        {viewport.scrollable ? (
          <ScrollView
            ref={scrollViewRef}
            horizontal
            bounces={false}
            showsHorizontalScrollIndicator
            style={[
              styles.scroller,
              { width: props.width, height: mainHeight }
            ]}
            contentContainerStyle={[
              styles.scrollerContent,
              { width: chartWidth, height: mainHeight }
            ]}
          >
            {chartSurface}
          </ScrollView>
        ) : (
          chartSurface
        )}
        {stickyYAxis}
        {outsidePressSurfaces.map((surface) => (
          <View
            key={`outside-press-${surface.key}`}
            style={[
              styles.outsidePressSurface,
              {
                height: surface.height,
                left: surface.left,
                top: surface.top,
                width: surface.width
              }
            ]}
            {...outsidePressSurfaceResponderProps}
          />
        ))}
      </View>
      {rangeSelectorElement}
    </View>
  );
};

export const AreaChart = <TData extends Record<string, unknown>>(
  props: LineChartProps<TData>
) => <LineChart {...props} area />;

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    userSelect: "none"
  },
  scroller: {
    overflow: "hidden"
  },
  scrollerContent: {
    flexGrow: 0
  },
  stickyYAxis: {
    left: 0,
    position: "absolute",
    top: 0
  },
  outsidePressSurface: {
    position: "absolute"
  },
  rangeSelector: {
    overflow: "hidden"
  }
});

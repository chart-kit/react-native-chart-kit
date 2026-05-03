import type { ReactNode } from "react";

import type {
  ChartViewportInitialIndex,
  ChartXValue,
  LineCurve,
  NumericDomainInput,
  ProjectedLinePoint
} from "@chart-kit/core";

import type {
  CartesianChartPresetValue,
  CartesianChartTheme,
  ChartKitThemeMode,
  ResolvedCartesianChartTheme
} from "../../theme";
import type { LineChartInteraction } from "./interaction";
import type {
  LineChartCrosshairConfig,
  LineChartDotConfig,
  LineChartStrokeLinecap,
  LineChartStrokeLinejoin,
  LineChartTooltipConfig,
  ResolvedLineChartDotConfig
} from "./options";
import type { LineChartSelectedSeriesItem as BaseLineChartSelectedSeriesItem } from "./selection";
import type {
  LineChartTooltipRenderProps as BaseLineChartTooltipRenderProps,
  LineChartTooltipSeriesItem as BaseLineChartTooltipSeriesItem
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
  LineChartStrokeLinecap,
  LineChartStrokeLinejoin,
  LineChartStrokeStyleConfig,
  LineChartTooltipConfig,
  ResolvedLineChartCrosshairConfig,
  ResolvedLineChartDotConfig,
  ResolvedLineChartStrokeStyle,
  ResolvedLineChartTooltipConfig
} from "./options";

export type LineChartSeries<TData extends Record<string, unknown>> = {
  yKey: keyof TData & string;
  key?: string;
  label?: string;
  color?: string;
  strokeWidth?: number;
  strokeDasharray?: readonly number[] | undefined;
  strokeLinecap?: LineChartStrokeLinecap;
  strokeLinejoin?: LineChartStrokeLinejoin;
  strokeOpacity?: number;
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
export type LineChartReferenceLabelPosition = "start" | "center" | "end";
export type LineChartReferenceLabelPlacement = "auto" | "above" | "below";

export type LineChartReferenceLineConfig = {
  y: number;
  label?: string;
  labelColor?: string;
  labelFontSize?: number;
  labelOffset?: number;
  labelPlacement?: LineChartReferenceLabelPlacement;
  labelPosition?: LineChartReferenceLabelPosition;
  color?: string;
  opacity?: number;
  strokeDasharray?: readonly number[];
  strokeWidth?: number;
};

export type LineChartReferenceBandConfig = {
  y1: number;
  y2: number;
  label?: string;
  labelColor?: string;
  labelFontSize?: number;
  labelPosition?: LineChartReferenceLabelPosition;
  color?: string;
  opacity?: number;
};

export type LineChartViewportConfig = {
  startIndex?: number;
  endIndex?: number;
  visiblePoints?: number;
  initialIndex?: ChartViewportInitialIndex;
};

export type LineChartRangeSelectorSeriesStyle = {
  color?: string;
  opacity?: number;
  strokeDasharray?: readonly number[] | undefined;
  strokeWidth?: number;
};

export type LineChartRangeSelectorWindowRenderProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  fill: string;
  opacity: number;
  stroke: string;
  strokeOpacity: number;
  strokeWidth: number;
  theme: ResolvedCartesianChartTheme;
};

export type LineChartRangeSelectorHandleRenderProps = {
  side: "start" | "end";
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  color: string;
  opacity: number;
  theme: ResolvedCartesianChartTheme;
  window: LineChartRangeSelectorWindowRenderProps;
};

export type LineChartRangeSelectorInteraction =
  | "move"
  | "resizeStart"
  | "resizeEnd";

export type LineChartRangeSelectorGestureEvent = {
  interaction: LineChartRangeSelectorInteraction;
};

export type LineChartRangeSelectorConfig = {
  visible?: boolean;
  height?: number;
  gap?: number;
  interactive?: boolean;
  minVisiblePoints?: number;
  backgroundFill?: string;
  plotFill?: string;
  plotRadius?: number;
  lineMinStrokeWidth?: number;
  lineStrokeWidth?: number;
  lineStrokeWidthScale?: number;
  series?: Record<string, LineChartRangeSelectorSeriesStyle>;
  outsideFill?: string;
  outsideOpacity?: number;
  windowFill?: string;
  windowOpacity?: number;
  windowRadius?: number;
  windowStroke?: string;
  windowStrokeOpacity?: number;
  windowStrokeWidth?: number;
  lineOpacity?: number;
  handleColor?: string;
  handleHeight?: number;
  handleHitSlop?: number;
  handleInset?: number;
  handleOpacity?: number;
  handleRadius?: number;
  handleWidth?: number;
  renderHandle?: (props: LineChartRangeSelectorHandleRenderProps) => ReactNode;
  renderWindow?: (props: LineChartRangeSelectorWindowRenderProps) => ReactNode;
  onGestureEnd?: (event: LineChartRangeSelectorGestureEvent) => void;
  onGestureStart?: (event: LineChartRangeSelectorGestureEvent) => void;
};

export type LineChartViewportChangeEvent = {
  viewport: LineChartViewportConfig;
  startIndex: number;
  endIndex: number;
  visibleCount: number;
  itemCount: number;
  isWindowed: boolean;
  source: "rangeSelector";
  interaction: LineChartRangeSelectorInteraction;
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
  strokeDasharray?: readonly number[] | undefined;
  strokeLinecap: LineChartStrokeLinecap;
  strokeOpacity: number;
  strokeWidth: number;
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

export type ResolvedLineChartLegendConfig = {
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
  referenceLines?: LineChartReferenceLineConfig[];
  referenceBands?: LineChartReferenceBandConfig[];
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

export type LineChartSelectedSeriesItem<TData = unknown> =
  BaseLineChartSelectedSeriesItem<ProjectedLinePoint<TData>>;

export type LineChartSelectionModel<TData = unknown> = {
  index: number;
  x: number;
  y: number;
  xLabel: string;
  series: Array<LineChartSelectedSeriesItem<TData>>;
  tooltip: LineChartTooltipRenderProps<TData> | undefined;
};

import type {
  ChartBoxes,
  ChartViewportInitialIndex,
  ChartXValue,
  NumericDomainInput,
  ProjectedCandlestick
} from "@chart-kit/core";

import type {
  CartesianChartPresetValue,
  CartesianChartTheme,
  ChartKitThemeContextValue,
  ChartKitThemeMode,
  ResolvedCartesianChartTheme
} from "../../theme";
import type {
  BarChartTooltipConfig,
  ResolvedBarChartTooltipConfig
} from "../bar/types";
import type {
  ChartViewportChangeEvent,
  ChartViewportConfig,
  ChartViewportInteractionConfig,
  ChartViewportInteractionType
} from "../../viewport/types";

export type CandlestickChartPriceKeys<TData extends Record<string, unknown>> = {
  closeKey: keyof TData & string;
  highKey: keyof TData & string;
  lowKey: keyof TData & string;
  openKey: keyof TData & string;
};

export type CandlestickChartProps<TData extends Record<string, unknown>> =
  CandlestickChartPriceKeys<TData> & {
    data: TData[];
    height: number;
    width: number;
    xKey: keyof TData & string;
    theme?: ChartKitThemeMode | CartesianChartTheme;
    preset?: CartesianChartPresetValue;
    yDomain?: NumericDomainInput;
    candleWidthRatio?: number;
    downColor?: string;
    flatColor?: string;
    upColor?: string;
    showHorizontalGridLines?: boolean;
    showXAxisLabels?: boolean;
    showYAxisLabels?: boolean;
    yTickCount?: number;
    formatXLabel?: (value: ChartXValue, index: number) => string;
    formatYLabel?: (value: number) => string;
    initialIndex?: ChartViewportInitialIndex;
    scrollable?: boolean;
    visiblePoints?: number;
    defaultSelectedIndex?: number;
    interaction?: CandlestickChartInteraction<TData>;
    selectedIndex?: number;
    tooltip?: boolean | CandlestickChartTooltipConfig;
    onViewportChange?: (event: CandlestickChartViewportChangeEvent) => void;
    rangeSelector?: boolean | CandlestickChartRangeSelectorConfig;
    sessionGaps?: boolean | CandlestickChartSessionGapConfig<TData>;
    viewport?: CandlestickChartViewportConfig;
    viewportInteraction?: boolean | CandlestickChartViewportInteractionConfig;
    volumeHeightRatio?: number;
    volumeKey?: keyof TData & string;
    volumeOpacity?: number;
    accessibilityLabel?: string;
    testID?: string;
  };

export type CandlestickChartInitialIndex = ChartViewportInitialIndex;

export type CandlestickChartInteractionMode = "none" | "tap";

export type CandlestickChartInteraction<TData = unknown> =
  | CandlestickChartInteractionMode
  | CandlestickChartInteractionConfig<TData>;

export type CandlestickChartInteractionConfig<TData = unknown> = {
  deselectOnOutsidePress?: boolean;
  mode?: CandlestickChartInteractionMode;
  onSelect?: (event: CandlestickChartSelectEvent<TData>) => void;
};

export type CandlestickChartSelectEvent<TData = unknown> = {
  close: number;
  dataIndex: number;
  direction: ProjectedCandlestick<TData>["direction"];
  formattedClose: string;
  formattedHigh: string;
  formattedLow: string;
  formattedOpen: string;
  high: number;
  low: number;
  open: number;
  position: { x: number; y: number };
  raw: TData;
  x: ChartXValue;
  xLabel: string;
};

export type CandlestickChartTooltipConfig = BarChartTooltipConfig;
export type ResolvedCandlestickChartTooltipConfig =
  ResolvedBarChartTooltipConfig;

export type CandlestickChartViewportConfig = ChartViewportConfig;
export type CandlestickChartViewportInteractionConfig =
  ChartViewportInteractionConfig;

export type CandlestickChartRangeSelectorInteraction =
  | "move"
  | "resizeStart"
  | "resizeEnd";

export type CandlestickChartRangeSelectorGestureEvent = {
  interaction: CandlestickChartRangeSelectorInteraction;
};

export type CandlestickChartViewportChangeEvent = Omit<
  ChartViewportChangeEvent,
  "interaction" | "source"
> & {
  interaction:
    | ChartViewportInteractionType
    | CandlestickChartRangeSelectorInteraction;
  source: "mainPlot" | "rangeSelector";
};

export type CandlestickChartRangeSelectorConfig = {
  backgroundFill?: string;
  gap?: number;
  handleColor?: string;
  handleHeight?: number;
  handleHitSlop?: number;
  handleOpacity?: number;
  handleRadius?: number;
  handleWidth?: number;
  height?: number;
  interactive?: boolean;
  minVisiblePoints?: number;
  onGestureEnd?: (event: CandlestickChartRangeSelectorGestureEvent) => void;
  onGestureStart?: (event: CandlestickChartRangeSelectorGestureEvent) => void;
  outsideFill?: string;
  outsideOpacity?: number;
  plotFill?: string;
  plotRadius?: number;
  visible?: boolean;
  volumeOpacity?: number;
  windowFill?: string;
  windowOpacity?: number;
  windowRadius?: number;
  windowStroke?: string;
  windowStrokeOpacity?: number;
  windowStrokeWidth?: number;
};

export type CandlestickChartSessionGapLabelRenderProps<TData = unknown> = {
  gapDays: number;
  gapMs: number;
  next: TData;
  nextIndex: number;
  previous: TData;
  previousIndex: number;
};

export type CandlestickChartSessionGapConfig<TData = unknown> = {
  fill?: string;
  fillOpacity?: number;
  label?:
    | boolean
    | ((props: CandlestickChartSessionGapLabelRenderProps<TData>) => string);
  minGapDays?: number;
  minGapMs?: number;
  stroke?: string;
  strokeDasharray?: readonly number[];
  strokeOpacity?: number;
  strokeWidth?: number;
  visible?: boolean;
  width?: number;
};

export type BuildCandlestickChartModelOptions<
  TData extends Record<string, unknown>
> = CandlestickChartProps<TData> & {
  chartKitTheme: ChartKitThemeContextValue;
  dataIndexOffset?: number;
};

export type CandlestickChartXLabelModel = {
  index: number;
  text: string;
  x: number;
  y: number;
};

export type CandlestickChartYLabelModel = {
  key: string;
  text: string;
  x: number;
  y: number;
};

export type CandlestickChartCandleModel<TData = unknown> =
  ProjectedCandlestick<TData> & {
    color: string;
  };

export type CandlestickChartVolumeBarModel = {
  color: string;
  height: number;
  key: string;
  opacity: number;
  width: number;
  x: number;
  y: number;
};

export type CandlestickChartSessionGapModel<TData = unknown> = {
  fill: string;
  fillOpacity: number;
  gapDays: number;
  gapMs: number;
  height: number;
  key: string;
  label?: string | undefined;
  labelX: number;
  labelY: number;
  next: TData;
  nextIndex: number;
  previous: TData;
  previousIndex: number;
  stroke: string;
  strokeDasharray?: readonly number[];
  strokeOpacity: number;
  strokeWidth: number;
  width: number;
  x: number;
  y: number;
};

export type CandlestickChartModel<TData = unknown> = {
  boxes: ChartBoxes;
  candles: Array<CandlestickChartCandleModel<TData>>;
  downColor: string;
  flatColor: string;
  resolvedTheme: ResolvedCartesianChartTheme;
  sessionGaps: Array<CandlestickChartSessionGapModel<TData>>;
  showHorizontalGridLines: boolean;
  showXAxisLabels: boolean;
  showYAxisLabels: boolean;
  upColor: string;
  volumeBars: CandlestickChartVolumeBarModel[];
  xLabels: CandlestickChartXLabelModel[];
  yLabels: CandlestickChartYLabelModel[];
  yTicks: number[];
};

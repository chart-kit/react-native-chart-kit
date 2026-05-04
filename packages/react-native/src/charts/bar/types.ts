import type {
  ChartBoxes,
  ChartXValue,
  NumericDomainInput
} from "@chart-kit/core";

import type {
  CartesianChartPresetValue,
  CartesianChartTheme,
  ChartKitThemeContextValue,
  ChartKitThemeMode,
  ResolvedCartesianChartTheme
} from "../../theme";

export type BarChartMode = "grouped" | "stacked" | "stacked100";

export type BarChartSeries<TData extends Record<string, unknown>> = {
  yKey: keyof TData & string;
  key?: string;
  label?: string;
  color?: string;
};

export type BarChartLabelStrategy = "auto" | "show" | "hide";
export type BarChartInteractionMode = "none" | "tap";

export type BarChartSelectedBar = {
  dataIndex: number;
  seriesKey: string;
};

export type BarChartSelectEvent<TData = unknown> = {
  color: string;
  dataIndex: number;
  seriesKey: string;
  seriesLabel: string;
  value: number;
  formattedValue: string;
  x: ChartXValue;
  xLabel: string;
  position: {
    x: number;
    y: number;
  };
  raw: TData | undefined;
};

export type BarChartDeselectEvent = {
  reason: "outsidePress" | "programmatic";
};

export type BarChartInteractionConfig<TData = unknown> = {
  mode?: BarChartInteractionMode;
  deselectOnOutsidePress?: boolean;
  onSelect?: (event: BarChartSelectEvent<TData>) => void;
  onDeselect?: (event: BarChartDeselectEvent) => void;
};

export type BarChartInteraction<TData = unknown> =
  | BarChartInteractionMode
  | BarChartInteractionConfig<TData>;

export type BarChartTooltipConfig = {
  visible?: boolean;
  width?: number;
  padding?: number;
  borderRadius?: number;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  labelColor?: string;
  shadowColor?: string;
  shadowOpacity?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  fontFamily?: string;
  fontSize?: number;
  labelFontSize?: number;
};

export type ResolvedBarChartTooltipConfig = {
  visible: boolean;
  width: number;
  padding: number;
  borderRadius: number;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  labelColor: string;
  shadowColor: string;
  shadowOpacity: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  fontFamily: string | undefined;
  fontSize: number;
  labelFontSize: number;
};

export type BarChartProps<TData extends Record<string, unknown>> = {
  data: TData[];
  xKey: keyof TData & string;
  yKey?: keyof TData & string;
  yKeys?: Array<keyof TData & string>;
  series?: Array<BarChartSeries<TData>>;
  width: number;
  height: number;
  theme?: ChartKitThemeMode | CartesianChartTheme;
  preset?: CartesianChartPresetValue;
  mode?: BarChartMode;
  yDomain?: NumericDomainInput;
  barRadius?: number;
  barWidthRatio?: number;
  barGapRatio?: number;
  showValuesOnTopOfBars?: boolean;
  showHorizontalGridLines?: boolean;
  legend?: boolean;
  interaction?: BarChartInteraction<TData>;
  selectedBar?: BarChartSelectedBar;
  defaultSelectedBar?: BarChartSelectedBar;
  tooltip?: boolean | BarChartTooltipConfig;
  labelStrategy?: BarChartLabelStrategy;
  formatXLabel?: (value: ChartXValue, index: number) => string;
  formatYLabel?: (value: number) => string;
  accessibilityLabel?: string;
  testID?: string;
};

export type BarChartXLabelModel = {
  index: number;
  text: string;
  x: number;
  y: number;
  textAnchor: "middle";
};

export type BarChartYLabelModel = {
  key: string;
  text: string;
  x: number;
  y: number;
};

export type BarChartValueLabelModel = {
  key: string;
  text: string;
  x: number;
  y: number;
  color: string;
};

export type BarChartLegendItemModel = {
  key: string;
  label: string;
  color: string;
  markerX: number;
  markerY: number;
  labelX: number;
  labelY: number;
};

export type BarChartBarModel<TData = unknown> = {
  key: string;
  seriesKey: string;
  seriesLabel: string;
  seriesIndex: number;
  dataIndex: number;
  xValue: ChartXValue;
  xLabel: string;
  value: number;
  formattedValue: string;
  x: number;
  y: number;
  width: number;
  height: number;
  baselineY: number;
  color: string;
  raw: TData | undefined;
};

export type BuildBarChartModelOptions<TData extends Record<string, unknown>> =
  BarChartProps<TData> & {
    chartKitTheme: ChartKitThemeContextValue;
  };

export type BarChartModel<TData = unknown> = {
  bars: Array<BarChartBarModel<TData>>;
  boxes: ChartBoxes;
  mode: BarChartMode;
  resolvedTheme: ResolvedCartesianChartTheme;
  legendItems: BarChartLegendItemModel[];
  showHorizontalGridLines: boolean;
  valueLabels: BarChartValueLabelModel[];
  xLabels: BarChartXLabelModel[];
  yLabels: BarChartYLabelModel[];
  yTicks: number[];
};

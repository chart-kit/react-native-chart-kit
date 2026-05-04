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

export type BuildBarChartModelOptions<TData extends Record<string, unknown>> =
  BarChartProps<TData> & {
    chartKitTheme: ChartKitThemeContextValue;
  };

export type BarChartModel<TData = unknown> = {
  bars: Array<{
    key: string;
    seriesKey: string;
    seriesLabel: string;
    dataIndex: number;
    value: number;
    x: number;
    y: number;
    width: number;
    height: number;
    baselineY: number;
    color: string;
    raw: TData | undefined;
  }>;
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

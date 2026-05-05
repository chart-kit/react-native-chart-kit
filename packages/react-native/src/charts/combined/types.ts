import type {
  ChartBoxes,
  ChartXValue,
  LineCurve,
  NumericDomainInput,
  ProjectedBarRect,
  ProjectedLinePoint
} from "@chart-kit/core";

import type {
  CartesianChartPresetValue,
  CartesianChartTheme,
  ChartKitThemeMode,
  ResolvedCartesianChartTheme
} from "../../theme";

export type CombinedChartAxisId = "left" | "right";
export type CombinedChartBarMode = "grouped" | "stacked" | "stacked100";

export type CombinedChartBarSeries<TData extends Record<string, unknown>> = {
  yKey: keyof TData & string;
  key?: string;
  label?: string;
  color?: string;
  yAxisId?: CombinedChartAxisId;
};

export type CombinedChartLineSeries<TData extends Record<string, unknown>> = {
  yKey: keyof TData & string;
  key?: string;
  label?: string;
  color?: string;
  curve?: LineCurve;
  strokeDasharray?: readonly number[] | undefined;
  strokeWidth?: number;
  yAxisId?: CombinedChartAxisId;
};

export type CombinedChartProps<TData extends Record<string, unknown>> = {
  data: TData[];
  xKey: keyof TData & string;
  bars?: Array<CombinedChartBarSeries<TData>>;
  lines?: Array<CombinedChartLineSeries<TData>>;
  width: number;
  height: number;
  theme?: ChartKitThemeMode | CartesianChartTheme;
  preset?: CartesianChartPresetValue;
  barMode?: CombinedChartBarMode;
  barRadius?: number;
  barWidthRatio?: number;
  barGapRatio?: number;
  leftYDomain?: NumericDomainInput;
  rightYDomain?: NumericDomainInput;
  yTickCount?: number;
  showHorizontalGridLines?: boolean;
  showXAxisLabels?: boolean;
  showYAxisLabels?: boolean;
  legend?: boolean;
  formatXLabel?: (value: ChartXValue, index: number) => string;
  formatLeftYLabel?: (value: number) => string;
  formatRightYLabel?: (value: number) => string;
  accessibilityLabel?: string;
  testID?: string;
};

export type CombinedChartLegendItemModel = {
  key: string;
  label: string;
  color: string;
  kind: "bar" | "line";
  markerX: number;
  markerY: number;
  labelX: number;
  labelY: number;
  strokeDasharray?: readonly number[] | undefined;
};

export type CombinedChartXLabelModel = {
  index: number;
  text: string;
  x: number;
  y: number;
};

export type CombinedChartYLabelModel = {
  key: string;
  text: string;
  x: number;
  y: number;
  side: CombinedChartAxisId;
};

export type CombinedChartLineModel<TData = unknown> = {
  key: string;
  label: string;
  color: string;
  strokeDasharray?: readonly number[] | undefined;
  strokeWidth: number;
  geometry: {
    points: Array<ProjectedLinePoint<TData>>;
    path: string;
  };
};

export type CombinedChartModel<TData = unknown> = {
  bars: Array<ProjectedBarRect<TData> & { color: string }>;
  boxes: ChartBoxes;
  legendItems: CombinedChartLegendItemModel[];
  lines: Array<CombinedChartLineModel<TData>>;
  leftDomain: [number, number];
  rightDomain: [number, number];
  leftTicks: number[];
  rightTicks: number[];
  resolvedTheme: ResolvedCartesianChartTheme;
  showHorizontalGridLines: boolean;
  showXAxisLabels: boolean;
  showYAxisLabels: boolean;
  xLabels: CombinedChartXLabelModel[];
  yLabels: CombinedChartYLabelModel[];
};

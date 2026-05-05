import type { ReactNode } from "react";

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
import type { LineChartTooltipConfig } from "../line/options";
import type {
  LineChartTooltipRenderProps,
  LineChartTooltipSeriesItem
} from "../line/tooltip";

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

export type CombinedChartInteractionMode = "none" | "tap";

export type CombinedChartDeselectEvent = {
  reason: "outsidePress" | "programmatic";
};

export type CombinedChartTooltipConfig = LineChartTooltipConfig;

export type CombinedChartInteractionPoint<TData = unknown> = {
  dataIndex: number;
  raw?: TData;
  x: number;
  xLabel: string;
  xValue: ChartXValue;
};

export type CombinedChartTooltipPoint<TData = unknown> = {
  dataIndex: number;
  kind: "bar" | "line";
  raw?: TData;
  seriesKey: string;
  value: number | null | undefined;
  x: number;
  xValue: ChartXValue;
  y: number;
};

export type CombinedChartTooltipSeriesItem<TData = unknown> =
  LineChartTooltipSeriesItem<CombinedChartTooltipPoint<TData>>;

export type CombinedChartTooltipRenderProps<TData = unknown> =
  LineChartTooltipRenderProps<
    CombinedChartTooltipPoint<TData>,
    ResolvedCartesianChartTheme
  >;

export type CombinedChartSelectEvent<TData = unknown> = {
  index: number;
  position: {
    x: number;
    y: number;
  };
  raw?: TData;
  series: Array<CombinedChartTooltipSeriesItem<TData>>;
  x: ChartXValue;
  xLabel: string;
};

export type CombinedChartInteractionConfig<TData = unknown> = {
  deselectOnOutsidePress?: boolean;
  mode?: CombinedChartInteractionMode;
  onDeselect?: (event: CombinedChartDeselectEvent) => void;
  onSelect?: (event: CombinedChartSelectEvent<TData>) => void;
};

export type CombinedChartInteraction<TData = unknown> =
  | CombinedChartInteractionMode
  | CombinedChartInteractionConfig<TData>;

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
  interaction?: CombinedChartInteraction<TData>;
  selectedIndex?: number;
  defaultSelectedIndex?: number;
  tooltip?: boolean | CombinedChartTooltipConfig;
  renderTooltip?: (props: CombinedChartTooltipRenderProps<TData>) => ReactNode;
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

export type CombinedChartSeriesModel = {
  axisId: CombinedChartAxisId;
  color: string;
  key: string;
  kind: "bar" | "line";
  label: string;
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

export type CombinedChartBarModel<TData = unknown> = ProjectedBarRect<TData> & {
  axisId: CombinedChartAxisId;
  color: string;
  formattedValue: string;
};

export type CombinedChartLinePoint<TData = unknown> =
  ProjectedLinePoint<TData> & {
    formattedValue: string;
  };

export type CombinedChartLineModel<TData = unknown> = {
  axisId: CombinedChartAxisId;
  key: string;
  label: string;
  color: string;
  strokeDasharray?: readonly number[] | undefined;
  strokeWidth: number;
  geometry: {
    points: Array<CombinedChartLinePoint<TData>>;
    path: string;
  };
};

export type CombinedChartModel<TData = unknown> = {
  bars: Array<CombinedChartBarModel<TData>>;
  boxes: ChartBoxes;
  interactionPoints: Array<CombinedChartInteractionPoint<TData>>;
  legendItems: CombinedChartLegendItemModel[];
  lines: Array<CombinedChartLineModel<TData>>;
  leftDomain: [number, number];
  rightDomain: [number, number];
  leftTicks: number[];
  rightTicks: number[];
  resolvedTheme: ResolvedCartesianChartTheme;
  series: CombinedChartSeriesModel[];
  showHorizontalGridLines: boolean;
  showXAxisLabels: boolean;
  showYAxisLabels: boolean;
  xLabels: CombinedChartXLabelModel[];
  yLabels: CombinedChartYLabelModel[];
};

import type { PieArcModel } from "@chart-kit/core";

import type {
  CartesianChartPresetValue,
  CartesianChartTheme,
  ResolvedCartesianChartTheme
} from "../../theme";

export type PieChartLegendConfig = {
  visible?: boolean;
};

export type PieChartCenterLabelRenderProps<TData = unknown> = {
  total: number;
  arcs: Array<PieArcModel<TData>>;
  theme: ResolvedCartesianChartTheme;
};

export type PieChartProps<TData extends Record<string, unknown>> = {
  data: TData[];
  valueKey: keyof TData & string;
  labelKey?: keyof TData & string;
  colorKey?: keyof TData & string;
  colors?: string[];
  width: number;
  height: number;
  theme?: "light" | "dark" | "system" | CartesianChartTheme;
  preset?: CartesianChartPresetValue;
  innerRadius?: number;
  innerRadiusRatio?: number;
  legend?: boolean | PieChartLegendConfig;
  centerLabel?:
    | string
    | ((props: PieChartCenterLabelRenderProps<TData>) => string);
  accessibilityLabel?: string;
  testID?: string;
  formatValue?: (value: number) => string;
  formatPercentage?: (percentage: number) => string;
};

export type PieChartLegendItem<TData = unknown> = {
  index: number;
  key: string;
  label: string;
  valueLabel: string;
  percentageLabel: string;
  color: string;
  arc: PieArcModel<TData>;
};

export type PieChartModel<TData = unknown> = {
  arcs: Array<PieArcModel<TData>>;
  centerX: number;
  centerY: number;
  chartHeight: number;
  innerRadius: number;
  legendItems: Array<PieChartLegendItem<TData>>;
  legendVisible: boolean;
  radius: number;
  resolvedTheme: ResolvedCartesianChartTheme;
  total: number;
};

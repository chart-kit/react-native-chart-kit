import type { LegacyProgressData, ProgressRingModel } from "@chart-kit/core";

import type {
  CartesianChartPresetValue,
  CartesianChartTheme,
  ResolvedCartesianChartTheme
} from "../../theme";
import type { LineChartRenderer } from "../line/types";

export type ProgressChartRenderer = LineChartRenderer;

export type ProgressRingDatum = {
  label?: string;
  value: number | null | undefined;
  color?: string;
};

export type ProgressChartData<TData extends Record<string, unknown>> =
  | LegacyProgressData
  | TData[];

export type ProgressChartLegendConfig = {
  visible?: boolean;
};

export type ProgressChartStrokeLinecap = "butt" | "round" | "square";

export type ProgressChartCenterLabelRenderProps = {
  average: number;
  rings: ProgressRingModel[];
  theme: ResolvedCartesianChartTheme;
};

export type ProgressChartProps<
  TData extends Record<string, unknown> = ProgressRingDatum
> = {
  data: ProgressChartData<TData>;
  valueKey?: keyof TData & string;
  labelKey?: keyof TData & string;
  colorKey?: keyof TData & string;
  labels?: string[];
  colors?: string[];
  width: number;
  height: number;
  theme?: "light" | "dark" | "system" | CartesianChartTheme;
  preset?: CartesianChartPresetValue;
  legend?: boolean | ProgressChartLegendConfig;
  hideLegend?: boolean;
  centerLabel?:
    | string
    | ((props: ProgressChartCenterLabelRenderProps) => string);
  strokeWidth?: number;
  ringGap?: number;
  radius?: number;
  strokeLinecap?: ProgressChartStrokeLinecap;
  backgroundRingColor?: string;
  renderer?: ProgressChartRenderer;
  accessibilityLabel?: string;
  testID?: string;
  formatPercentage?: (value: number) => string;
};

export type ProgressRingProps = Omit<
  ProgressChartProps<ProgressRingDatum>,
  "data" | "valueKey" | "labelKey" | "colorKey" | "colors" | "labels"
> & {
  value: number | null | undefined;
  label?: string;
  color?: string;
};

export type ProgressChartLegendItem = {
  index: number;
  key: string;
  label: string;
  percentageLabel: string;
  color: string;
  ring: ProgressRingModel;
};

export type ProgressChartModel = {
  average: number;
  centerX: number;
  centerY: number;
  chartHeight: number;
  legendItems: ProgressChartLegendItem[];
  legendVisible: boolean;
  resolvedTheme: ResolvedCartesianChartTheme;
  rings: ProgressRingModel[];
};

import type { ReactNode } from "react";
import type { ViewStyle } from "react-native";

import type { PieArcModel } from "@chart-kit/core";

import type {
  CartesianChartPresetValue,
  CartesianChartTheme,
  ResolvedCartesianChartTheme
} from "../../theme";

export type PieChartDeselectEvent = {
  reason: "outsidePress" | "programmatic";
};

export type PieChartSelectEvent<TData = unknown> = {
  index: number;
  label: string;
  value: number | null;
  percentage: number;
  color?: string;
  raw?: TData;
};

export type PieChartInteractionMode = "none" | "tap";

export type PieChartInteractionConfig<TData = unknown> = {
  mode?: PieChartInteractionMode;
  deselectOnOutsidePress?: boolean;
  onDeselect?: (event: PieChartDeselectEvent) => void;
  onSelect?: (event: PieChartSelectEvent<TData>) => void;
};

export type PieChartInteraction<TData = unknown> =
  | PieChartInteractionMode
  | PieChartInteractionConfig<TData>;

export type PieChartActiveSliceConfig = {
  strokeColor?: string;
  strokeWidth?: number;
  activeOpacity?: number;
  inactiveOpacity?: number;
};

export type PieChartCenterLabelRenderProps<TData = unknown> = {
  total: number;
  arcs: Array<PieArcModel<TData>>;
  theme: ResolvedCartesianChartTheme;
  selectedArc?: PieArcModel<TData>;
  selectedIndex?: number;
};

export type PieChartLegendRenderProps<TData = unknown> = {
  index: number;
  item: PieChartLegendItem<TData>;
  selected: boolean;
  theme: ResolvedCartesianChartTheme;
};

export type PieChartLegendConfig<TData = unknown> = {
  visible?: boolean;
  itemGap?: number;
  maxItemWidth?: ViewStyle["maxWidth"];
  renderItem?: (props: PieChartLegendRenderProps<TData>) => ReactNode;
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
  legend?: boolean | PieChartLegendConfig<TData>;
  selectedIndex?: number;
  defaultSelectedIndex?: number;
  activeSlice?: PieChartActiveSliceConfig;
  interaction?: PieChartInteraction<TData>;
  centerLabel?:
    | string
    | ReactNode
    | ((props: PieChartCenterLabelRenderProps<TData>) => ReactNode);
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

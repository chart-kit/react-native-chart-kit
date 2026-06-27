import type {
  ContributionHeatmapCell,
  ContributionHeatmapModel,
  LegacyContributionValue
} from "@chart-kit/core";

import type {
  CartesianChartPresetValue,
  CartesianChartTheme,
  ResolvedCartesianChartTheme
} from "../../theme";
import type { LineChartRenderer } from "../line/types";

export type ContributionGraphRenderer = LineChartRenderer;

export type ContributionGraphDayPressEvent<TData = LegacyContributionValue> = {
  index: number;
  date: Date;
  value: number | null;
  raw?: TData;
};

export type ContributionGraphInteractionMode = "none" | "tap" | "pressAndDrag";

export type ContributionGraphInteractionConfig<
  TData = LegacyContributionValue
> = {
  mode?: ContributionGraphInteractionMode;
  hitSlop?: number;
  pointerOffset?: {
    x?: number;
    y?: number;
  };
  onSelect?: (event: ContributionGraphDayPressEvent<TData>) => void;
};

export type ContributionGraphInteraction<TData = LegacyContributionValue> =
  | ContributionGraphInteractionMode
  | ContributionGraphInteractionConfig<TData>;

export type ContributionGraphColorRenderProps<TData = LegacyContributionValue> =
  {
    cell: ContributionHeatmapCell<TData>;
    valueMin: number;
    valueMax: number;
    theme: ResolvedCartesianChartTheme;
  };

export type ContributionGraphCellModel<TData = LegacyContributionValue> =
  ContributionHeatmapCell<TData> & {
    fill: string;
    opacity: number;
  };

export type ContributionGraphActiveCellConfig = {
  date?: string | number | Date;
  index?: number;
  opacity?: number;
  scale?: number;
  strokeColor?: string;
  strokeWidth?: number;
};

export type ContributionGraphProps<
  TData extends LegacyContributionValue = LegacyContributionValue
> = {
  values: TData[];
  endDate: string | number | Date;
  numDays: number;
  width: number;
  height: number;
  accessor?: keyof TData & string;
  cellSize?: number;
  gutterSize?: number;
  weekStartsOn?: number;
  showMonthLabels?: boolean;
  showWeekdayLabels?: boolean;
  showOutOfRangeDays?: boolean;
  theme?: "light" | "dark" | "system" | CartesianChartTheme;
  preset?: CartesianChartPresetValue;
  colors?: string[];
  emptyColor?: string;
  activeCell?: false | ContributionGraphActiveCellConfig;
  colorForValue?: (props: ContributionGraphColorRenderProps<TData>) => string;
  getMonthLabel?: (monthIndex: number, date: Date) => string;
  getWeekdayLabel?: (dayIndex: number) => string;
  interaction?: ContributionGraphInteraction<TData>;
  onDayPress?: (event: ContributionGraphDayPressEvent<TData>) => void;
  renderer?: ContributionGraphRenderer;
  accessibilityLabel?: string;
  testID?: string;
};

export type ContributionGraphModel<TData = LegacyContributionValue> = Omit<
  ContributionHeatmapModel<TData>,
  "cells"
> & {
  cells: Array<ContributionGraphCellModel<TData>>;
  resolvedTheme: ResolvedCartesianChartTheme;
};

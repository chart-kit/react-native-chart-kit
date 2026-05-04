import {
  buildContributionHeatmap,
  normalizeLegacyContributionData
} from "@chart-kit/core";
import type {
  ContributionHeatmapCell,
  LegacyContributionValue
} from "@chart-kit/core";

import { resolveCartesianChartThemeConfig } from "../../theme/presets";
import type {
  CartesianChartPresetRegistry,
  CartesianChartPresetValue,
  CartesianChartTheme,
  ResolvedChartKitThemeMode
} from "../../theme/presets";
import type {
  ContributionGraphCellModel,
  ContributionGraphColorRenderProps,
  ContributionGraphModel,
  ContributionGraphProps
} from "./types";

type ContributionGraphThemeContextValue = {
  mode: ResolvedChartKitThemeMode;
  preset: CartesianChartPresetValue;
  presets: CartesianChartPresetRegistry;
  theme: CartesianChartTheme | undefined;
};

const defaultCellSize = 12;
const defaultGutterSize = 3;
const defaultMonthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];
const defaultWeekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const clamp = (value: number, min: number, max: number) => {
  if (max < min) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
};

const getDefaultCellOpacity = ({
  cell,
  valueMax
}: {
  cell: ContributionHeatmapCell;
  valueMax: number;
}) => {
  if (
    !cell.defined ||
    cell.value === null ||
    cell.value <= 0 ||
    valueMax <= 0
  ) {
    return 0.22;
  }

  return 0.28 + clamp(cell.value / valueMax, 0, 1) * 0.72;
};

const getDefaultCellFill = <TData extends LegacyContributionValue>({
  cell,
  colors,
  emptyColor,
  theme,
  valueMax
}: ContributionGraphColorRenderProps<TData> & {
  colors: string[] | undefined;
  emptyColor: string;
}) => {
  if (
    !cell.defined ||
    cell.value === null ||
    cell.value <= 0 ||
    valueMax <= 0
  ) {
    return emptyColor;
  }

  if (colors && colors.length > 0) {
    const level = clamp(
      Math.ceil((cell.value / valueMax) * colors.length) - 1,
      0,
      colors.length - 1
    );

    return (
      colors[level] ??
      colors[colors.length - 1] ??
      theme.series[0] ??
      theme.text
    );
  }

  return theme.series[0] ?? theme.text;
};

export const getContributionGraphMonthLabel = (
  monthIndex: number,
  date: Date,
  formatter: ContributionGraphProps["getMonthLabel"]
) => formatter?.(monthIndex, date) ?? defaultMonthLabels[monthIndex] ?? "";

export const getContributionGraphWeekdayLabel = (
  dayIndex: number,
  formatter: ContributionGraphProps["getWeekdayLabel"]
) => formatter?.(dayIndex) ?? defaultWeekdayLabels[dayIndex] ?? "";

export const buildContributionGraphModel = <
  TData extends LegacyContributionValue
>({
  chartKitTheme,
  props
}: {
  chartKitTheme: ContributionGraphThemeContextValue;
  props: ContributionGraphProps<TData>;
}): ContributionGraphModel<TData> => {
  const {
    accessor = "count" as keyof TData & string,
    cellSize = defaultCellSize,
    colorForValue,
    colors,
    emptyColor,
    endDate,
    gutterSize = defaultGutterSize,
    numDays,
    preset,
    showOutOfRangeDays,
    theme,
    values,
    weekStartsOn
  } = props;
  const resolvedTheme = resolveCartesianChartThemeConfig({
    mode:
      typeof theme === "string" && theme !== "system"
        ? theme
        : chartKitTheme.mode,
    preset: preset ?? chartKitTheme.preset,
    presets: chartKitTheme.presets,
    theme: typeof theme === "object" ? theme : chartKitTheme.theme
  });
  const normalized = normalizeLegacyContributionData(values, {
    accessor,
    endDate,
    numDays
  });
  const heatmap = buildContributionHeatmap({
    data: normalized,
    cellSize,
    gutterSize,
    weekStartsOn,
    showOutOfRangeDays
  });
  const resolvedEmptyColor = emptyColor ?? resolvedTheme.grid;
  const cells = heatmap.cells.map<ContributionGraphCellModel<TData>>((cell) => {
    const renderProps: ContributionGraphColorRenderProps<TData> = {
      cell,
      valueMin: heatmap.valueMin,
      valueMax: heatmap.valueMax,
      theme: resolvedTheme
    };
    const fill =
      colorForValue?.(renderProps) ??
      getDefaultCellFill({
        ...renderProps,
        colors,
        emptyColor: resolvedEmptyColor
      });

    return {
      ...cell,
      fill,
      opacity:
        colorForValue || colors
          ? 1
          : getDefaultCellOpacity({ cell, valueMax: heatmap.valueMax })
    };
  });

  return {
    ...heatmap,
    cells,
    resolvedTheme
  };
};

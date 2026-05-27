import type { StyleProp, ViewStyle } from "react-native";

import type { CartesianChartTheme, ChartKitThemeMode } from "../../theme";
import type { BarChartProps, BarChartSeries } from "./types";

export type StackedBarChartLegacyData = {
  labels: string[];
  legend: string[];
  data: Array<Array<number | null | undefined>>;
  barColors: string[];
};

export type StackedBarChartLegacyConfig = {
  backgroundColor?: string;
  backgroundGradientFrom?: string;
  backgroundGradientTo?: string;
  color?: (opacity?: number, index?: number) => string;
  labelColor?: (opacity?: number) => string;
  decimalPlaces?: number;
  barPercentage?: number;
  barRadius?: number;
  propsForBackgroundLines?: {
    stroke?: string;
  };
};

export type StackedBarChartProps = {
  data: StackedBarChartLegacyData;
  width: number;
  height: number;
  chartConfig: StackedBarChartLegacyConfig;
  hideLegend?: boolean;
  style?: StyleProp<ViewStyle>;
  barPercentage?: number;
  decimalPlaces?: number;
  withVerticalLabels?: boolean;
  withHorizontalLabels?: boolean;
  withInnerLines?: boolean;
  segments?: number;
  percentile?: boolean;
  fromZero?: boolean;
  yAxisLabel?: string;
  yAxisSuffix?: string;
  verticalLabelsHeightPercentage?: number;
  formatYLabel?: (yLabel: string) => string;
  theme?: ChartKitThemeMode | CartesianChartTheme;
  preset?: BarChartProps<StackedBarChartRow>["preset"];
  accessibilityLabel?: string;
  testID?: string;
};

export type StackedBarChartRow = Record<
  string,
  number | string | null | undefined
> & {
  label: string;
};

export type StackedBarChartCompatProps = {
  barChartProps: BarChartProps<StackedBarChartRow>;
  style: StyleProp<ViewStyle> | undefined;
};

const getSegmentCount = (data: StackedBarChartLegacyData) =>
  Math.max(
    data.legend.length,
    data.barColors.length,
    ...data.data.map((group) => group.length)
  );

const clampRatio = (value: number | undefined, fallback: number) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(0.05, Math.min(1, value));
};

const getLegacyTheme = ({
  chartConfig,
  fallbackSeries
}: {
  chartConfig: StackedBarChartLegacyConfig;
  fallbackSeries: string[];
}): CartesianChartTheme => {
  const background =
    chartConfig.backgroundColor ??
    chartConfig.backgroundGradientFrom ??
    chartConfig.backgroundGradientTo;
  const plotBackground =
    chartConfig.backgroundGradientTo ??
    chartConfig.backgroundGradientFrom ??
    background;
  const labelColor = chartConfig.labelColor?.(1);
  const lineColor = chartConfig.propsForBackgroundLines?.stroke;

  return {
    ...(background ? { background } : {}),
    ...(plotBackground ? { plotBackground } : {}),
    ...(lineColor ? { axis: lineColor, grid: lineColor } : {}),
    ...(labelColor ? { mutedText: labelColor, text: labelColor } : {}),
    ...(fallbackSeries.length > 0 ? { series: fallbackSeries } : {})
  };
};

const formatStackedBarValue = ({
  decimalPlaces,
  formatYLabel,
  value,
  yAxisLabel,
  yAxisSuffix
}: {
  decimalPlaces: number;
  formatYLabel: ((yLabel: string) => string) | undefined;
  value: number;
  yAxisLabel: string | undefined;
  yAxisSuffix: string | undefined;
}) => {
  const fixed = value.toFixed(decimalPlaces);
  const formatted = formatYLabel ? formatYLabel(fixed) : fixed;

  return `${yAxisLabel ?? ""}${formatted}${yAxisSuffix ?? ""}`;
};

export const buildStackedBarChartCompatProps = ({
  accessibilityLabel,
  barPercentage,
  chartConfig,
  data,
  decimalPlaces,
  formatYLabel,
  fromZero,
  height,
  hideLegend,
  percentile,
  preset,
  segments,
  style,
  testID,
  theme,
  width,
  withHorizontalLabels,
  withInnerLines,
  withVerticalLabels,
  yAxisLabel,
  yAxisSuffix
}: StackedBarChartProps): StackedBarChartCompatProps => {
  const segmentCount = getSegmentCount(data);
  const yKeys = Array.from(
    { length: segmentCount },
    (_, index) => `series${index}`
  );
  const rows = data.data.map<StackedBarChartRow>((group, groupIndex) => {
    const row: StackedBarChartRow = {
      label: data.labels[groupIndex] ?? String(groupIndex)
    };

    yKeys.forEach((key, segmentIndex) => {
      row[key] = group[segmentIndex] ?? null;
    });

    return row;
  });
  const series = yKeys.map<BarChartSeries<StackedBarChartRow>>((key, index) => {
    const color = data.barColors[index] ?? chartConfig.color?.(1, index);

    return {
      ...(color ? { color } : {}),
      key,
      label: data.legend[index] ?? `Series ${index + 1}`,
      yKey: key
    };
  });
  const resolvedDecimalPlaces =
    decimalPlaces ?? chartConfig.decimalPlaces ?? (percentile ? 0 : 2);
  const resolvedTheme =
    typeof theme === "object"
      ? theme
      : getLegacyTheme({
          chartConfig,
          fallbackSeries: series
            .map((item) => item.color)
            .filter((color): color is string => Boolean(color))
        });
  const resolvedBarRatio = clampRatio(
    barPercentage ?? chartConfig.barPercentage,
    0.72
  );

  const barChartProps: BarChartProps<StackedBarChartRow> = {
    barRadius: Math.max(0, chartConfig.barRadius ?? 5),
    barWidthRatio: resolvedBarRatio,
    data: rows,
    formatYLabel: (value) =>
      formatStackedBarValue({
        decimalPlaces: resolvedDecimalPlaces,
        formatYLabel,
        value,
        yAxisLabel,
        yAxisSuffix
      }),
    height,
    legend: !hideLegend,
    mode: percentile ? "stacked100" : "stacked",
    series,
    showHorizontalGridLines: withInnerLines ?? true,
    showValuesOnTopOfBars: false,
    showXAxisLabels: withVerticalLabels ?? true,
    showYAxisLabels: withHorizontalLabels ?? true,
    theme: resolvedTheme,
    width,
    xKey: "label",
    yDomain: percentile
      ? [0, 100]
      : fromZero
        ? { includeZero: true, min: 0, nice: true }
        : { includeZero: true, nice: true }
  };

  if (accessibilityLabel) {
    barChartProps.accessibilityLabel = accessibilityLabel;
  }

  if (preset) {
    barChartProps.preset = preset;
  }

  if (testID) {
    barChartProps.testID = testID;
  }

  if (segments) {
    barChartProps.yTickCount = segments + 1;
  }

  return {
    style,
    barChartProps
  };
};

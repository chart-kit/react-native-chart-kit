import type { ChartXValue, Size } from "@chart-kit/core";

import type { ResolvedCartesianChartTheme } from "../../theme/presets";
import type { BarChartProps } from "./types";

export const labelBaselineOffset = 20;

export const measureBarChartText = (
  text: string,
  options: { fontSize?: number } = {}
): Size => {
  const fontSize = options.fontSize ?? 12;

  return {
    width: text.length * fontSize * 0.56,
    height: 14
  };
};

export const getBarChartFontTextOptions = (
  theme: ResolvedCartesianChartTheme
) => ({
  fontSize: theme.typography.axisLabelSize,
  ...(theme.typography.fontFamily
    ? { fontFamily: theme.typography.fontFamily }
    : {})
});

export const getBarChartSeriesColor = (
  theme: ResolvedCartesianChartTheme,
  index: number
) => theme.series[index % theme.series.length] ?? "#2563eb";

export const defaultFormatBarChartXLabel = (value: ChartXValue) => {
  if (value instanceof Date) {
    return value.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });
  }

  return String(value);
};

export const defaultFormatBarChartYLabel = (value: number) => {
  const absolute = Math.abs(value);

  if (absolute >= 1000) {
    return `${Number((value / 1000).toFixed(1))}k`;
  }

  return String(Number(value.toFixed(2)));
};

export const getBarChartXKey = (value: ChartXValue) =>
  value instanceof Date ? value.valueOf() : value;

export const getMaxBarChartTextSize = (sizes: Size[]) =>
  sizes.reduce(
    (max, size) => ({
      width: Math.max(max.width, size.width),
      height: Math.max(max.height, size.height)
    }),
    { width: 0, height: 0 }
  );

export const getVisibleBarChartXLabelInterval = ({
  labelStrategy,
  labelSizes,
  plotWidth
}: {
  labelStrategy: BarChartProps<Record<string, unknown>>["labelStrategy"];
  labelSizes: Size[];
  plotWidth: number;
}) => {
  if (labelStrategy === "hide" || labelSizes.length === 0) {
    return Number.POSITIVE_INFINITY;
  }

  if (labelStrategy === "show") {
    return 1;
  }

  const widest = getMaxBarChartTextSize(labelSizes).width;
  const maxVisibleLabels = Math.max(1, Math.floor(plotWidth / (widest + 10)));

  return Math.max(1, Math.ceil(labelSizes.length / maxVisibleLabels));
};

export const getVisibleBarChartYLabelInterval = ({
  labelStrategy,
  labelSizes,
  plotHeight
}: {
  labelStrategy: BarChartProps<Record<string, unknown>>["labelStrategy"];
  labelSizes: Size[];
  plotHeight: number;
}) => {
  if (labelStrategy === "hide" || labelSizes.length === 0) {
    return Number.POSITIVE_INFINITY;
  }

  if (labelStrategy === "show") {
    return 1;
  }

  const tallest = getMaxBarChartTextSize(labelSizes).height;
  const maxVisibleLabels = Math.max(1, Math.floor(plotHeight / (tallest + 8)));

  return Math.max(1, Math.ceil(labelSizes.length / maxVisibleLabels));
};

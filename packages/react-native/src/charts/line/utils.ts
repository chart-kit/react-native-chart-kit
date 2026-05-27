import type { ChartXValue } from "@chart-kit/core";

import type { ResolvedCartesianChartTheme } from "../../theme";

export const clamp = (value: number, min: number, max: number) => {
  if (max < min) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
};

export const unique = <TValue>(values: TValue[]) => {
  return values.filter((value, index) => values.indexOf(value) === index);
};

export const getSeriesColor = (
  theme: ResolvedCartesianChartTheme,
  index: number
) => {
  return theme.series[index % theme.series.length] ?? "#2563eb";
};

export const defaultFormatXLabel = (value: ChartXValue) => {
  if (value instanceof Date) {
    return value.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });
  }

  return String(value);
};

export const defaultFormatYLabel = (value: number) => {
  const absolute = Math.abs(value);

  if (absolute >= 1000) {
    return `${Number((value / 1000).toFixed(1))}k`;
  }

  return String(Number(value.toFixed(2)));
};

export const getXKey = (value: ChartXValue) => {
  return value instanceof Date ? value.valueOf() : value;
};

export const getXScaleType = (values: ChartXValue[]) => {
  if (values.every((value) => value instanceof Date)) {
    return "time";
  }

  if (values.every((value) => typeof value === "number")) {
    return "linear";
  }

  return "point";
};

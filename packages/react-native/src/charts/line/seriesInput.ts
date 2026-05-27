import { useMemo } from "react";

import type { LineChartProps, LineChartSeries } from "./types";

export const resolveLineChartSeriesInput = <
  TData extends Record<string, unknown>
>(
  yKey: LineChartProps<TData>["yKey"],
  yKeys: LineChartProps<TData>["yKeys"],
  series: LineChartProps<TData>["series"]
) => {
  if (series && series.length > 0) {
    return series;
  }

  if (yKeys && yKeys.length > 0) {
    return yKeys.map<LineChartSeries<TData>>((key) => ({ yKey: key }));
  }

  return yKey ? [{ yKey } satisfies LineChartSeries<TData>] : [];
};

export const useSeriesInput = <TData extends Record<string, unknown>>(
  yKey: LineChartProps<TData>["yKey"],
  yKeys: LineChartProps<TData>["yKeys"],
  series: LineChartProps<TData>["series"]
) => {
  return useMemo(
    () => resolveLineChartSeriesInput(yKey, yKeys, series),
    [series, yKey, yKeys]
  );
};

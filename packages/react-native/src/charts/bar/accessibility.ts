import { normalizeCartesianData } from "@chart-kit/core";
import type { ChartXValue } from "@chart-kit/core";

import type { BarChartProps, BarChartSeries } from "./types";
import {
  defaultFormatBarChartXLabel,
  defaultFormatBarChartYLabel
} from "./modelUtils";

export type BarChartDataTableColumn = {
  key: string;
  label: string;
};

export type BarChartDataTableRow<TData = unknown> = {
  index: number;
  x: ChartXValue;
  xLabel: string;
  values: Record<string, number | null>;
  formattedValues: Record<string, string>;
  raw: TData;
};

export type BarChartDataTable<TData = unknown> = {
  columns: BarChartDataTableColumn[];
  rows: Array<BarChartDataTableRow<TData>>;
};

type BarChartAccessibilityInput<TData extends Record<string, unknown>> = {
  data: BarChartProps<TData>["data"];
  formatXLabel?: BarChartProps<TData>["formatXLabel"] | undefined;
  formatYLabel?: BarChartProps<TData>["formatYLabel"] | undefined;
  series?: BarChartProps<TData>["series"] | undefined;
  xKey: BarChartProps<TData>["xKey"];
  yKey?: BarChartProps<TData>["yKey"] | undefined;
  yKeys?: BarChartProps<TData>["yKeys"] | undefined;
};

type BarValuePoint<TData> = {
  formattedValue: string;
  raw: TData;
  seriesLabel: string;
  value: number;
  xLabel: string;
};

const pluralize = (count: number, singular: string, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`;

const resolveSeriesInput = <TData extends Record<string, unknown>>(
  yKey: BarChartProps<TData>["yKey"],
  yKeys: BarChartProps<TData>["yKeys"],
  series: BarChartProps<TData>["series"]
): Array<BarChartSeries<TData>> => {
  if (series && series.length > 0) {
    return series;
  }

  if (yKeys && yKeys.length > 0) {
    return yKeys.map((key) => ({ yKey: key }));
  }

  return yKey ? [{ yKey }] : [];
};

const getDefinedPoints = <TData>(
  table: BarChartDataTable<TData>
): Array<BarValuePoint<TData>> =>
  table.rows.flatMap((row) =>
    table.columns.flatMap((column) => {
      const value = row.values[column.key];

      return typeof value === "number"
        ? [
            {
              formattedValue: row.formattedValues[column.key] ?? String(value),
              raw: row.raw,
              seriesLabel: column.label,
              value,
              xLabel: row.xLabel
            }
          ]
        : [];
    })
  );

const getMinPoint = <TData>(points: Array<BarValuePoint<TData>>) =>
  points.reduce<BarValuePoint<TData> | undefined>(
    (min, point) => (!min || point.value < min.value ? point : min),
    undefined
  );

const getMaxPoint = <TData>(points: Array<BarValuePoint<TData>>) =>
  points.reduce<BarValuePoint<TData> | undefined>(
    (max, point) => (!max || point.value > max.value ? point : max),
    undefined
  );

const getPointLabel = <TData>({
  point,
  seriesCount
}: {
  point: BarValuePoint<TData>;
  seriesCount: number;
}) =>
  seriesCount > 1 ? `${point.seriesLabel} in ${point.xLabel}` : point.xLabel;

export const getBarChartDataTable = <TData extends Record<string, unknown>>({
  data,
  formatXLabel = defaultFormatBarChartXLabel,
  formatYLabel = defaultFormatBarChartYLabel,
  series,
  xKey,
  yKey,
  yKeys
}: BarChartAccessibilityInput<TData>): BarChartDataTable<TData> => {
  const seriesInput = resolveSeriesInput(yKey, yKeys, series);
  const normalized = normalizeCartesianData({
    data,
    xKey,
    series: seriesInput
  });

  return {
    columns: normalized.series.map((item) => ({
      key: item.key,
      label: item.label
    })),
    rows: data.map((row, rowIndex) => {
      const values: Record<string, number | null> = {};
      const formattedValues: Record<string, string> = {};

      normalized.series.forEach((seriesItem) => {
        const value = seriesItem.points[rowIndex]?.value ?? null;

        values[seriesItem.key] = value;
        formattedValues[seriesItem.key] =
          value === null ? "No value" : formatYLabel(value);
      });

      const x = normalized.series[0]?.points[rowIndex]?.x ?? rowIndex;

      return {
        index: rowIndex,
        x,
        xLabel: formatXLabel(x, rowIndex),
        values,
        formattedValues,
        raw: row
      };
    })
  };
};

export const getBarChartAccessibilitySummary = <
  TData extends Record<string, unknown>
>(
  input: BarChartAccessibilityInput<TData>
) => {
  const table = getBarChartDataTable(input);

  if (table.columns.length === 0 || table.rows.length === 0) {
    return "Bar chart with no data.";
  }

  const points = getDefinedPoints(table);

  if (points.length === 0) {
    return `Bar chart with ${pluralize(
      table.rows.length,
      "category",
      "categories"
    )} and no defined values.`;
  }

  const intro =
    table.columns.length === 1
      ? `Bar chart with ${pluralize(points.length, "bar")}.`
      : `Bar chart with ${pluralize(
          table.columns.length,
          "series",
          "series"
        )} across ${pluralize(table.rows.length, "category", "categories")}.`;
  const minPoint = getMinPoint(points);
  const maxPoint = getMaxPoint(points);

  if (!minPoint || !maxPoint) {
    return intro;
  }

  return `${intro} Highest value is ${getPointLabel({
    point: maxPoint,
    seriesCount: table.columns.length
  })} at ${maxPoint.formattedValue}. Lowest value is ${getPointLabel({
    point: minPoint,
    seriesCount: table.columns.length
  })} at ${minPoint.formattedValue}.`;
};

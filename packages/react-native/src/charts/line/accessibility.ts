import { useMemo } from "react";

import { resolveLineChartSeriesInput } from "./seriesInput";
import type { LineChartProps, LineChartSeries } from "./types";
import { defaultFormatXLabel, defaultFormatYLabel } from "./utils";

type ChartXValue = string | number | Date;

export type LineChartDataTableColumn = {
  key: string;
  label: string;
};

export type LineChartDataTableRow<TData = unknown> = {
  index: number;
  x: ChartXValue;
  xLabel: string;
  values: Record<string, number | null>;
  formattedValues: Record<string, string>;
  raw: TData;
};

export type LineChartDataTable<TData = unknown> = {
  columns: LineChartDataTableColumn[];
  rows: Array<LineChartDataTableRow<TData>>;
};

type LineChartAccessibilityInput<TData extends Record<string, unknown>> = {
  data: LineChartProps<TData>["data"];
  formatXLabel?: LineChartProps<TData>["formatXLabel"] | undefined;
  formatYLabel?: LineChartProps<TData>["formatYLabel"] | undefined;
  series?: LineChartProps<TData>["series"] | undefined;
  xKey: LineChartProps<TData>["xKey"];
  yKey?: LineChartProps<TData>["yKey"] | undefined;
  yKeys?: LineChartProps<TData>["yKeys"] | undefined;
};

type SeriesPoint<TData> = {
  formattedValue: string;
  raw: TData;
  value: number;
  xLabel: string;
};

const pluralize = (count: number, singular: string, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`;

const normalizeXValue = (value: unknown, fallback: number): ChartXValue => {
  return typeof value === "string" ||
    (typeof value === "number" && Number.isFinite(value)) ||
    value instanceof Date
    ? value
    : fallback;
};

const normalizeYValue = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const getDefinedSeriesPoints = <TData extends Record<string, unknown>>(
  series: LineChartSeries<TData>,
  rows: Array<LineChartDataTableRow<TData>>
): Array<SeriesPoint<TData>> =>
  rows.flatMap((row) => {
    const columnKey = String(series.key ?? series.yKey);
    const value = row.values[columnKey];

    return typeof value === "number"
      ? [
          {
            formattedValue: row.formattedValues[columnKey] ?? String(value),
            raw: row.raw,
            value,
            xLabel: row.xLabel
          }
        ]
      : [];
  });

const getMinPoint = <TData>(points: Array<SeriesPoint<TData>>) =>
  points.reduce<SeriesPoint<TData> | undefined>(
    (min, point) => (!min || point.value < min.value ? point : min),
    undefined
  );

const getMaxPoint = <TData>(points: Array<SeriesPoint<TData>>) =>
  points.reduce<SeriesPoint<TData> | undefined>(
    (max, point) => (!max || point.value > max.value ? point : max),
    undefined
  );

export const getLineChartDataTable = <TData extends Record<string, unknown>>({
  data,
  formatXLabel = defaultFormatXLabel,
  formatYLabel = defaultFormatYLabel,
  series,
  xKey,
  yKey,
  yKeys
}: LineChartAccessibilityInput<TData>): LineChartDataTable<TData> => {
  const seriesInputs = resolveLineChartSeriesInput(yKey, yKeys, series);
  const columns = seriesInputs.map((item, index) => ({
    key: String(item.key ?? item.yKey ?? `series-${index}`),
    label: String(item.label ?? item.key ?? item.yKey ?? `Series ${index + 1}`)
  }));

  return {
    columns,
    rows: data.map((row, index) => {
      const x = normalizeXValue(row[xKey], index);
      const values: Record<string, number | null> = {};
      const formattedValues: Record<string, string> = {};

      seriesInputs.forEach((item, seriesIndex) => {
        const key = String(item.key ?? item.yKey ?? `series-${seriesIndex}`);
        const value = normalizeYValue(row[item.yKey]);

        values[key] = value;
        formattedValues[key] =
          value === null ? "No value" : formatYLabel(value);
      });

      return {
        index,
        x,
        xLabel: formatXLabel(x, index),
        values,
        formattedValues,
        raw: row
      };
    })
  };
};

export const getLineChartAccessibilitySummary = <
  TData extends Record<string, unknown>
>(
  input: LineChartAccessibilityInput<TData>
) => {
  const table = getLineChartDataTable(input);

  if (table.columns.length === 0 || table.rows.length === 0) {
    return "Line chart with no data.";
  }

  const seriesInputs = resolveLineChartSeriesInput(
    input.yKey,
    input.yKeys,
    input.series
  );
  const intro =
    table.columns.length === 1
      ? `${table.columns[0]!.label} line chart with ${pluralize(
          table.rows.length,
          "point"
        )}.`
      : `Line chart with ${pluralize(
          table.columns.length,
          "series",
          "series"
        )} and ${pluralize(table.rows.length, "point")}.`;
  const seriesSummaries = seriesInputs.flatMap((series) => {
    const columnKey = String(series.key ?? series.yKey);
    const label =
      table.columns.find((column) => column.key === columnKey)?.label ??
      columnKey;
    const points = getDefinedSeriesPoints(series, table.rows);
    const minPoint = getMinPoint(points);
    const maxPoint = getMaxPoint(points);
    const currentPoint = points[points.length - 1];

    if (!minPoint || !maxPoint || !currentPoint) {
      return [`${label} has no defined values.`];
    }

    return [
      `${label} ranges from ${minPoint.formattedValue} in ${minPoint.xLabel} to ${maxPoint.formattedValue} in ${maxPoint.xLabel}. Current value is ${currentPoint.formattedValue}.`
    ];
  });

  return [intro, ...seriesSummaries].join(" ");
};

export const useLineChartAccessibilityLabel = <
  TData extends Record<string, unknown>
>({
  accessibilityLabel,
  data,
  formatXLabel,
  formatYLabel,
  series,
  xKey,
  yKey,
  yKeys
}: LineChartAccessibilityInput<TData> & {
  accessibilityLabel?: string | undefined;
}) =>
  useMemo(
    () =>
      accessibilityLabel ??
      getLineChartAccessibilitySummary({
        data,
        formatXLabel,
        formatYLabel,
        series,
        xKey,
        yKey,
        yKeys
      }),
    [
      accessibilityLabel,
      data,
      formatXLabel,
      formatYLabel,
      series,
      xKey,
      yKey,
      yKeys
    ]
  );

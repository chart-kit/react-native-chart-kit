import { normalizeCartesianData } from "@chart-kit/core";
import type { ChartXValue } from "@chart-kit/core";

import {
  defaultFormatBarChartXLabel,
  defaultFormatBarChartYLabel
} from "../bar/modelUtils";
import type {
  CombinedChartAxisId,
  CombinedChartBarSeries,
  CombinedChartLineSeries,
  CombinedChartProps
} from "./types";

export type CombinedChartDataTableColumn = {
  axisId: CombinedChartAxisId;
  key: string;
  kind: "bar" | "line";
  label: string;
};

export type CombinedChartDataTableRow<TData = unknown> = {
  formattedValues: Record<string, string>;
  index: number;
  raw: TData;
  values: Record<string, number | null>;
  x: ChartXValue;
  xLabel: string;
};

export type CombinedChartDataTable<TData = unknown> = {
  columns: CombinedChartDataTableColumn[];
  rows: Array<CombinedChartDataTableRow<TData>>;
};

type CombinedChartAccessibilityInput<TData extends Record<string, unknown>> = {
  bars?: CombinedChartProps<TData>["bars"] | undefined;
  data: CombinedChartProps<TData>["data"];
  formatLeftYLabel?: CombinedChartProps<TData>["formatLeftYLabel"] | undefined;
  formatRightYLabel?:
    | CombinedChartProps<TData>["formatRightYLabel"]
    | undefined;
  formatXLabel?: CombinedChartProps<TData>["formatXLabel"] | undefined;
  lines?: CombinedChartProps<TData>["lines"] | undefined;
  visibleSeriesKeys?:
    | CombinedChartProps<TData>["visibleSeriesKeys"]
    | undefined;
  xKey: CombinedChartProps<TData>["xKey"];
};

type CombinedChartResolvedColumn<TData extends Record<string, unknown>> =
  CombinedChartDataTableColumn & {
    yKey: keyof TData & string;
  };

const pluralize = (count: number, singular: string, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`;

const resolveBarColumn = <TData extends Record<string, unknown>>(
  series: CombinedChartBarSeries<TData>
): CombinedChartResolvedColumn<TData> => {
  const key = series.key ?? `bar-${series.yKey}`;

  return {
    axisId: series.yAxisId ?? "left",
    key,
    kind: "bar",
    label: series.label ?? key,
    yKey: series.yKey
  };
};

const resolveLineColumn = <TData extends Record<string, unknown>>(
  series: CombinedChartLineSeries<TData>
): CombinedChartResolvedColumn<TData> => {
  const key = series.key ?? `line-${series.yKey}`;

  return {
    axisId: series.yAxisId ?? "right",
    key,
    kind: "line",
    label: series.label ?? key,
    yKey: series.yKey
  };
};

const resolveColumns = <TData extends Record<string, unknown>>({
  bars = [],
  lines = [],
  visibleSeriesKeys
}: Pick<
  CombinedChartAccessibilityInput<TData>,
  "bars" | "lines" | "visibleSeriesKeys"
>): Array<CombinedChartResolvedColumn<TData>> => {
  const columns = [
    ...bars.map(resolveBarColumn),
    ...lines.map(resolveLineColumn)
  ];

  if (visibleSeriesKeys === undefined) {
    return columns;
  }

  const visibleKeySet = new Set(visibleSeriesKeys);
  const visibleColumns = columns.filter((column) =>
    visibleKeySet.has(column.key)
  );

  return visibleColumns.length > 0 ? visibleColumns : columns;
};

const getColumnFormatter = <TData extends Record<string, unknown>>({
  column,
  formatLeftYLabel,
  formatRightYLabel
}: {
  column: CombinedChartResolvedColumn<TData>;
  formatLeftYLabel: NonNullable<
    CombinedChartAccessibilityInput<TData>["formatLeftYLabel"]
  >;
  formatRightYLabel: NonNullable<
    CombinedChartAccessibilityInput<TData>["formatRightYLabel"]
  >;
}) => (column.axisId === "left" ? formatLeftYLabel : formatRightYLabel);

export const getCombinedChartDataTable = <
  TData extends Record<string, unknown>
>({
  bars,
  data,
  formatLeftYLabel = defaultFormatBarChartYLabel,
  formatRightYLabel = defaultFormatBarChartYLabel,
  formatXLabel = defaultFormatBarChartXLabel,
  lines,
  visibleSeriesKeys,
  xKey
}: CombinedChartAccessibilityInput<TData>): CombinedChartDataTable<TData> => {
  const columns = resolveColumns({ bars, lines, visibleSeriesKeys });
  const normalized = normalizeCartesianData({
    data,
    xKey,
    series: columns.map((column) => ({
      key: column.key,
      label: column.label,
      yKey: column.yKey
    }))
  });

  return {
    columns: columns.map(({ axisId, key, kind, label }) => ({
      axisId,
      key,
      kind,
      label
    })),
    rows: data.map((row, rowIndex) => {
      const formattedValues: Record<string, string> = {};
      const values: Record<string, number | null> = {};

      columns.forEach((column) => {
        const series = normalized.series.find(
          (item) => item.key === column.key
        );
        const value = series?.points[rowIndex]?.value ?? null;
        const formatYLabel = getColumnFormatter({
          column,
          formatLeftYLabel,
          formatRightYLabel
        });

        values[column.key] = value;
        formattedValues[column.key] =
          value === null ? "No value" : formatYLabel(value);
      });

      const x = normalized.series[0]?.points[rowIndex]?.x ?? rowIndex;

      return {
        formattedValues,
        index: rowIndex,
        raw: row,
        values,
        x,
        xLabel: formatXLabel(x, rowIndex)
      };
    })
  };
};

export const getCombinedChartAccessibilitySummary = <
  TData extends Record<string, unknown>
>(
  input: CombinedChartAccessibilityInput<TData>
) => {
  const table = getCombinedChartDataTable(input);

  if (table.columns.length === 0 || table.rows.length === 0) {
    return "Combined chart with no data.";
  }

  const barCount = table.columns.filter(
    (column) => column.kind === "bar"
  ).length;
  const lineCount = table.columns.filter(
    (column) => column.kind === "line"
  ).length;
  const latestRow = [...table.rows]
    .reverse()
    .find((row) =>
      table.columns.some((column) => row.values[column.key] !== null)
    );
  const intro = `Combined chart with ${pluralize(
    barCount,
    "bar series",
    "bar series"
  )} and ${pluralize(lineCount, "line series", "line series")} across ${pluralize(
    table.rows.length,
    "category",
    "categories"
  )}.`;

  if (!latestRow) {
    return `${intro} No defined values.`;
  }

  const latestValues = table.columns
    .map((column) => {
      const value = latestRow.formattedValues[column.key];

      return value && value !== "No value" ? `${column.label} ${value}` : "";
    })
    .filter(Boolean)
    .join(", ");

  return latestValues
    ? `${intro} Latest category ${latestRow.xLabel}: ${latestValues}.`
    : intro;
};

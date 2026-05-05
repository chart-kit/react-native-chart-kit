import type { LegacyProgressData } from "@chart-kit/core";

import type { ProgressChartProps } from "./types";

export type ProgressChartDataTableRow<TData = unknown> = {
  color?: string | undefined;
  formattedValue: string;
  index: number;
  label: string;
  raw?: TData | undefined;
  value: number | null;
};

export type ProgressChartDataTable<TData = unknown> = {
  average: number;
  rows: Array<ProgressChartDataTableRow<TData>>;
};

type ProgressChartAccessibilityInput<TData extends Record<string, unknown>> = {
  colorKey?: ProgressChartProps<TData>["colorKey"] | undefined;
  colors?: ProgressChartProps<TData>["colors"] | undefined;
  data: ProgressChartProps<TData>["data"];
  formatPercentage?: ProgressChartProps<TData>["formatPercentage"] | undefined;
  labelKey?: ProgressChartProps<TData>["labelKey"] | undefined;
  labels?: ProgressChartProps<TData>["labels"] | undefined;
  valueKey?: ProgressChartProps<TData>["valueKey"] | undefined;
};

const defaultValueKey = "value";
const defaultLabelKey = "label";
const defaultColorKey = "color";
const defaultFormatPercentage = (value: number) =>
  `${Math.round(value * 100)}%`;

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isObjectRowData = <TData extends Record<string, unknown>>(
  data: ProgressChartProps<TData>["data"]
): data is TData[] => Array.isArray(data) && data.some(isObjectRecord);

const getStringValue = (value: unknown, fallback: string | undefined) =>
  typeof value === "string" && value.length > 0 ? value : fallback;

const getProgressValue = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  return null;
};

const clampProgress = (value: number) => Math.min(Math.max(value, 0), 1);

const getLegacyRows = (data: LegacyProgressData) =>
  Array.isArray(data) ? { data, labels: undefined, colors: undefined } : data;

export const getProgressChartDataTable = <
  TData extends Record<string, unknown>
>({
  colorKey,
  colors,
  data,
  formatPercentage = defaultFormatPercentage,
  labelKey,
  labels,
  valueKey
}: ProgressChartAccessibilityInput<TData>): ProgressChartDataTable<TData> => {
  const rows = isObjectRowData(data)
    ? data.map<ProgressChartDataTableRow<TData>>((item, index) => {
        const value = getProgressValue(item[valueKey ?? defaultValueKey]);
        const color = getStringValue(
          item[colorKey ?? defaultColorKey],
          colors?.[index]
        );
        const row: ProgressChartDataTableRow<TData> = {
          formattedValue:
            value === null
              ? "No value"
              : formatPercentage(clampProgress(value)),
          index,
          label:
            getStringValue(
              item[labelKey ?? defaultLabelKey],
              labels?.[index]
            ) ?? `Ring ${index + 1}`,
          raw: item,
          value
        };

        if (color !== undefined) {
          row.color = color;
        }

        return row;
      })
    : getLegacyRows(data).data.map<ProgressChartDataTableRow<TData>>(
        (rawValue, index) => {
          const value = getProgressValue(rawValue);
          const color = getLegacyRows(data).colors?.[index] ?? colors?.[index];
          const row: ProgressChartDataTableRow<TData> = {
            formattedValue:
              value === null
                ? "No value"
                : formatPercentage(clampProgress(value)),
            index,
            label:
              getLegacyRows(data).labels?.[index] ??
              labels?.[index] ??
              `Ring ${index + 1}`,
            value
          };

          if (color !== undefined) {
            row.color = color;
          }

          return row;
        }
      );
  const definedRows = rows.filter((row) => row.value !== null);
  const average =
    definedRows.length > 0
      ? definedRows.reduce(
          (sum, row) => sum + clampProgress(row.value ?? 0),
          0
        ) / definedRows.length
      : 0;

  return { average, rows };
};

export const getProgressChartAccessibilitySummary = <
  TData extends Record<string, unknown>
>(
  input: ProgressChartAccessibilityInput<TData>
) => {
  const table = getProgressChartDataTable(input);

  if (table.rows.length === 0) {
    return "Progress chart with no rings.";
  }

  const definedRows = table.rows.filter((row) => row.value !== null);

  if (definedRows.length === 0) {
    return `Progress chart with ${table.rows.length} rings and no defined values.`;
  }

  const currentRow = definedRows[definedRows.length - 1];
  const formatPercentage = input.formatPercentage ?? defaultFormatPercentage;

  return `Progress chart with ${table.rows.length} rings. Average progress ${formatPercentage(
    table.average
  )}. Current ring ${currentRow?.label ?? "Ring"} is ${
    currentRow?.formattedValue ?? "No value"
  }.`;
};

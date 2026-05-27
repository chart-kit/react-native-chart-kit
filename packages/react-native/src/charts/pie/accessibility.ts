import type { PieChartProps } from "./types";

export type PieChartDataTableRow<TData = unknown> = {
  color?: string | undefined;
  formattedValue: string;
  index: number;
  label: string;
  percentage: number;
  percentageLabel: string;
  raw: TData;
  value: number | null;
};

export type PieChartDataTable<TData = unknown> = {
  rows: Array<PieChartDataTableRow<TData>>;
  total: number;
};

type PieChartAccessibilityInput<TData extends Record<string, unknown>> = {
  colorKey?: PieChartProps<TData>["colorKey"] | undefined;
  colors?: PieChartProps<TData>["colors"] | undefined;
  data: PieChartProps<TData>["data"];
  formatPercentage?: PieChartProps<TData>["formatPercentage"] | undefined;
  formatValue?: PieChartProps<TData>["formatValue"] | undefined;
  labelKey?: PieChartProps<TData>["labelKey"] | undefined;
  valueKey: PieChartProps<TData>["valueKey"];
};

const defaultLabelKey = "name";
const defaultColorKey = "color";
const defaultFormatValue = (value: number) => String(value);
const defaultFormatPercentage = (percentage: number) =>
  `${Math.round(percentage * 100)}%`;

const getStringValue = (value: unknown, fallback: string) =>
  typeof value === "string" && value.length > 0 ? value : fallback;

const getColorValue = (value: unknown, fallback: string | undefined) =>
  typeof value === "string" && value.length > 0 ? value : fallback;

const getPieValue = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : null;

const getMaxRow = <TData>(rows: Array<PieChartDataTableRow<TData>>) =>
  rows.reduce<PieChartDataTableRow<TData> | undefined>(
    (max, row) =>
      typeof row.value === "number" && (!max || row.value > (max.value ?? 0))
        ? row
        : max,
    undefined
  );

export const getPieChartDataTable = <TData extends Record<string, unknown>>({
  colorKey,
  colors,
  data,
  formatPercentage = defaultFormatPercentage,
  formatValue = defaultFormatValue,
  labelKey,
  valueKey
}: PieChartAccessibilityInput<TData>): PieChartDataTable<TData> => {
  const values = data.map((item) => getPieValue(item[valueKey]));
  const total = values.reduce<number>(
    (sum, value) => (value === null ? sum : sum + value),
    0
  );

  return {
    total,
    rows: data.map((item, index) => {
      const value = values[index] ?? null;
      const percentage = value !== null && total > 0 ? value / total : 0;
      const color = getColorValue(
        item[colorKey ?? defaultColorKey],
        colors?.[index]
      );
      const row: PieChartDataTableRow<TData> = {
        formattedValue: value === null ? "No value" : formatValue(value),
        index,
        label: getStringValue(
          item[labelKey ?? defaultLabelKey],
          `Slice ${index + 1}`
        ),
        percentage,
        percentageLabel: formatPercentage(percentage),
        raw: item,
        value
      };

      if (color !== undefined) {
        row.color = color;
      }

      return row;
    })
  };
};

export const getPieChartAccessibilitySummary = <
  TData extends Record<string, unknown>
>(
  input: PieChartAccessibilityInput<TData>
) => {
  const table = getPieChartDataTable(input);
  const definedRows = table.rows.filter((row) => row.value !== null);

  if (definedRows.length === 0) {
    return "Pie chart with no defined slices.";
  }

  const maxRow = getMaxRow(definedRows);
  const intro = `Pie chart with ${definedRows.length} ${
    definedRows.length === 1 ? "slice" : "slices"
  }. Total ${input.formatValue?.(table.total) ?? defaultFormatValue(table.total)}.`;

  return maxRow
    ? `${intro} Largest slice is ${maxRow.label} at ${maxRow.percentageLabel}.`
    : intro;
};

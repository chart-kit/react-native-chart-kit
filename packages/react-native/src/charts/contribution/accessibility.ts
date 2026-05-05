import { normalizeLegacyContributionData } from "@chart-kit/core";
import type { LegacyContributionValue } from "@chart-kit/core";

import type { ContributionGraphProps } from "./types";

export type ContributionGraphDataTableRow<TData = LegacyContributionValue> = {
  date: Date;
  dateLabel: string;
  formattedValue: string;
  index: number;
  raw?: TData | undefined;
  value: number | null;
};

export type ContributionGraphDataTable<TData = LegacyContributionValue> = {
  rows: Array<ContributionGraphDataTableRow<TData>>;
};

type ContributionGraphAccessibilityInput<
  TData extends LegacyContributionValue = LegacyContributionValue
> = {
  accessor?: ContributionGraphProps<TData>["accessor"] | undefined;
  endDate: ContributionGraphProps<TData>["endDate"];
  formatDate?: ((date: Date, index: number) => string) | undefined;
  formatValue?: ((value: number) => string) | undefined;
  numDays: ContributionGraphProps<TData>["numDays"];
  values: ContributionGraphProps<TData>["values"];
};

const defaultFormatDate = (date: Date) => date.toISOString().slice(0, 10);
const defaultFormatValue = (value: number) => String(value);

const pluralize = (count: number, singular: string, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`;

const getMinRow = <TData extends LegacyContributionValue>(
  rows: Array<ContributionGraphDataTableRow<TData>>
) =>
  rows.reduce<ContributionGraphDataTableRow<TData> | undefined>(
    (min, row) =>
      typeof row.value === "number" && (!min || row.value < (min.value ?? 0))
        ? row
        : min,
    undefined
  );

const getMaxRow = <TData extends LegacyContributionValue>(
  rows: Array<ContributionGraphDataTableRow<TData>>
) =>
  rows.reduce<ContributionGraphDataTableRow<TData> | undefined>(
    (max, row) =>
      typeof row.value === "number" && (!max || row.value > (max.value ?? 0))
        ? row
        : max,
    undefined
  );

export const getContributionGraphDataTable = <
  TData extends LegacyContributionValue
>({
  accessor,
  endDate,
  formatDate = defaultFormatDate,
  formatValue = defaultFormatValue,
  numDays,
  values
}: ContributionGraphAccessibilityInput<TData>): ContributionGraphDataTable<TData> => {
  const normalized = normalizeLegacyContributionData(values, {
    endDate,
    numDays,
    ...(accessor !== undefined ? { accessor } : {})
  });

  return {
    rows: normalized.days.map((day) => {
      const row: ContributionGraphDataTableRow<TData> = {
        date: day.date,
        dateLabel: formatDate(day.date, day.index),
        formattedValue:
          day.value === null ? "No value" : formatValue(day.value),
        index: day.index,
        value: day.value
      };

      if (day.raw !== undefined) {
        row.raw = day.raw;
      }

      return row;
    })
  };
};

export const getContributionGraphAccessibilitySummary = <
  TData extends LegacyContributionValue
>(
  input: ContributionGraphAccessibilityInput<TData>
) => {
  const table = getContributionGraphDataTable(input);

  if (table.rows.length === 0) {
    return "Contribution graph with no days.";
  }

  const definedRows = table.rows.filter((row) => row.value !== null);
  const activeRows = definedRows.filter((row) => (row.value ?? 0) > 0);

  if (definedRows.length === 0) {
    return `Contribution graph with ${pluralize(
      table.rows.length,
      "day"
    )} and no defined values.`;
  }

  const minRow = getMinRow(definedRows);
  const maxRow = getMaxRow(definedRows);
  const intro = `Contribution graph with ${pluralize(
    table.rows.length,
    "day"
  )}. ${pluralize(activeRows.length, "day")} with activity.`;

  if (!minRow || !maxRow) {
    return intro;
  }

  return `${intro} Highest value is ${maxRow.formattedValue} on ${maxRow.dateLabel}. Lowest value is ${minRow.formattedValue} on ${minRow.dateLabel}.`;
};

import type { CandlestickDirection, ChartXValue } from "@chart-kit/core";

import {
  defaultFormatBarChartXLabel,
  defaultFormatBarChartYLabel
} from "../bar/modelUtils";
import { normalizeCandlestickRows } from "./model";
import type { CandlestickChartProps } from "./types";

export type CandlestickChartDataTableRow<TData = unknown> = {
  close: number;
  direction: CandlestickDirection;
  formattedClose: string;
  formattedHigh: string;
  formattedLow: string;
  formattedOpen: string;
  high: number;
  index: number;
  low: number;
  open: number;
  raw: TData;
  x: ChartXValue;
  xLabel: string;
};

export type CandlestickChartDataTable<TData = unknown> = {
  rows: Array<CandlestickChartDataTableRow<TData>>;
};

type CandlestickChartPriceInput<TData extends Record<string, unknown>> = Pick<
  CandlestickChartProps<TData>,
  "closeKey" | "highKey" | "lowKey" | "openKey"
>;

type CandlestickChartAccessibilityInput<TData extends Record<string, unknown>> =
  CandlestickChartPriceInput<TData> & {
    data: CandlestickChartProps<TData>["data"];
    formatXLabel?: CandlestickChartProps<TData>["formatXLabel"] | undefined;
    formatYLabel?: CandlestickChartProps<TData>["formatYLabel"] | undefined;
    xKey: CandlestickChartProps<TData>["xKey"];
  };

const pluralize = (count: number, singular: string, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`;

const getDirection = ({
  close,
  open
}: {
  close: number;
  open: number;
}): CandlestickDirection => {
  if (close > open) {
    return "up";
  }

  if (close < open) {
    return "down";
  }

  return "flat";
};

const getMaxRow = <TData>(rows: Array<CandlestickChartDataTableRow<TData>>) =>
  rows.reduce<CandlestickChartDataTableRow<TData> | undefined>(
    (max, row) => (!max || row.high > max.high ? row : max),
    undefined
  );

const getMinRow = <TData>(rows: Array<CandlestickChartDataTableRow<TData>>) =>
  rows.reduce<CandlestickChartDataTableRow<TData> | undefined>(
    (min, row) => (!min || row.low < min.low ? row : min),
    undefined
  );

export const getCandlestickChartDataTable = <
  TData extends Record<string, unknown>
>({
  closeKey,
  data,
  formatXLabel = defaultFormatBarChartXLabel,
  formatYLabel = defaultFormatBarChartYLabel,
  highKey,
  lowKey,
  openKey,
  xKey
}: CandlestickChartAccessibilityInput<TData>): CandlestickChartDataTable<TData> => {
  const rows = normalizeCandlestickRows({
    closeKey,
    data,
    highKey,
    lowKey,
    openKey,
    xKey
  });

  return {
    rows: rows.map((row) => ({
      close: row.close,
      direction: getDirection({ close: row.close, open: row.open }),
      formattedClose: formatYLabel(row.close),
      formattedHigh: formatYLabel(row.high),
      formattedLow: formatYLabel(row.low),
      formattedOpen: formatYLabel(row.open),
      high: row.high,
      index: row.index,
      low: row.low,
      open: row.open,
      raw: row.raw,
      x: row.x,
      xLabel: formatXLabel(row.x, row.index)
    }))
  };
};

export const getCandlestickChartAccessibilitySummary = <
  TData extends Record<string, unknown>
>(
  input: CandlestickChartAccessibilityInput<TData>
) => {
  const table = getCandlestickChartDataTable(input);

  if (table.rows.length === 0) {
    return "Candlestick chart with no valid candles.";
  }

  const latest = table.rows[table.rows.length - 1];
  const highest = getMaxRow(table.rows);
  const lowest = getMinRow(table.rows);
  const intro = `Candlestick chart with ${pluralize(
    table.rows.length,
    "candle"
  )}.`;

  if (!latest || !highest || !lowest) {
    return intro;
  }

  return `${intro} Latest close is ${latest.formattedClose} on ${latest.xLabel}. Highest high is ${highest.formattedHigh} on ${highest.xLabel}. Lowest low is ${lowest.formattedLow} on ${lowest.xLabel}.`;
};

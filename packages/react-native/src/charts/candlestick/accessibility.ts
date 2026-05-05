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

export type CandlestickChartAccessibilityInput<
  TData extends Record<string, unknown>
> = CandlestickChartPriceInput<TData> & {
  data: CandlestickChartProps<TData>["data"];
  formatXLabel?: CandlestickChartProps<TData>["formatXLabel"] | undefined;
  formatYLabel?: CandlestickChartProps<TData>["formatYLabel"] | undefined;
  xKey: CandlestickChartProps<TData>["xKey"];
};

export type CandlestickChartFinancialNarrativeInput<
  TData extends Record<string, unknown>
> = CandlestickChartAccessibilityInput<TData> & {
  formatPercent?: ((value: number) => string) | undefined;
  title?: string | undefined;
};

export type CandlestickChartFinancialNarrative<TData = unknown> = {
  candleCount: number;
  closeChange: number;
  closeChangePercent: number | undefined;
  direction: CandlestickDirection;
  downCount: number;
  flatCount: number;
  first: CandlestickChartDataTableRow<TData>;
  highest: CandlestickChartDataTableRow<TData>;
  latest: CandlestickChartDataTableRow<TData>;
  lowest: CandlestickChartDataTableRow<TData>;
  range: number;
  rangePercentOfLatestClose: number | undefined;
  summary: string;
  upCount: number;
};

const pluralize = (count: number, singular: string, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`;

const defaultFormatPercent = (value: number) => `${value.toFixed(1)}%`;

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

const getDirectionVerb = (direction: CandlestickDirection) => {
  if (direction === "up") {
    return "rose";
  }

  if (direction === "down") {
    return "fell";
  }

  return "was unchanged";
};

const getDirectionCounts = <TData>(
  rows: Array<CandlestickChartDataTableRow<TData>>
) =>
  rows.reduce(
    (counts, row) => ({
      down: counts.down + (row.direction === "down" ? 1 : 0),
      flat: counts.flat + (row.direction === "flat" ? 1 : 0),
      up: counts.up + (row.direction === "up" ? 1 : 0)
    }),
    { down: 0, flat: 0, up: 0 }
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

export const getCandlestickChartFinancialNarrative = <
  TData extends Record<string, unknown>
>({
  formatPercent = defaultFormatPercent,
  formatYLabel = defaultFormatBarChartYLabel,
  title = "Candlestick financial narrative",
  ...input
}: CandlestickChartFinancialNarrativeInput<TData>):
  | CandlestickChartFinancialNarrative<TData>
  | undefined => {
  const table = getCandlestickChartDataTable({
    ...input,
    formatYLabel
  });

  if (table.rows.length === 0) {
    return undefined;
  }

  const first = table.rows[0];
  const latest = table.rows[table.rows.length - 1];
  const highest = getMaxRow(table.rows);
  const lowest = getMinRow(table.rows);

  if (!first || !latest || !highest || !lowest) {
    return undefined;
  }

  const closeChange = latest.close - first.close;
  const closeChangePercent =
    first.close === 0 ? undefined : (closeChange / Math.abs(first.close)) * 100;
  const direction = getDirection({ close: latest.close, open: first.close });
  const directionVerb = getDirectionVerb(direction);
  const formattedChange = formatYLabel(Math.abs(closeChange));
  const formattedPercent =
    closeChangePercent === undefined
      ? ""
      : ` (${formatPercent(Math.abs(closeChangePercent))})`;
  const changeSentence =
    direction === "flat"
      ? `Close was unchanged at ${latest.formattedClose} from ${first.xLabel} to ${latest.xLabel}.`
      : `Close ${directionVerb} ${formattedChange}${formattedPercent} from ${first.formattedClose} on ${first.xLabel} to ${latest.formattedClose} on ${latest.xLabel}.`;
  const range = highest.high - lowest.low;
  const rangePercentOfLatestClose =
    latest.close === 0 ? undefined : (range / Math.abs(latest.close)) * 100;
  const rangeSentence = `Trading range spans ${formatYLabel(range)} from ${lowest.formattedLow} on ${lowest.xLabel} to ${highest.formattedHigh} on ${highest.xLabel}.`;
  const counts = getDirectionCounts(table.rows);
  const mixSentence = `Candle mix: ${counts.up} up, ${counts.down} down, ${counts.flat} flat.`;

  return {
    candleCount: table.rows.length,
    closeChange,
    closeChangePercent,
    direction,
    downCount: counts.down,
    first,
    flatCount: counts.flat,
    highest,
    latest,
    lowest,
    range,
    rangePercentOfLatestClose,
    summary: `${title} for ${pluralize(table.rows.length, "candle")}. ${changeSentence} ${rangeSentence} ${mixSentence}`,
    upCount: counts.up
  };
};

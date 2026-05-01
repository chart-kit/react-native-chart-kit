export type ChartXValue = string | number | Date;
export type ChartYValue = number | null;

export type ChartKitWarningCode =
  | "invalid-x-value"
  | "invalid-date"
  | "missing-value"
  | "invalid-number"
  | "negative-pie-value"
  | "progress-out-of-range"
  | "contribution-out-of-range";

export type ChartKitWarning = {
  code: ChartKitWarningCode;
  message: string;
  path: string;
};

export type NormalizeOptions = {
  onWarning?: (warning: ChartKitWarning) => void;
};

export type CartesianSeriesInput<TData> = {
  yKey: keyof TData & string;
  key?: string;
  label?: string;
  color?: string;
};

export type NormalizeCartesianInput<TData extends Record<string, unknown>> = {
  data: TData[];
  xKey: keyof TData & string;
  yKey?: keyof TData & string;
  yKeys?: Array<keyof TData & string>;
  series?: Array<CartesianSeriesInput<TData>>;
};

export type NormalizedDataPoint<TData = unknown> = {
  index: number;
  x: ChartXValue;
  value: ChartYValue;
  defined: boolean;
  raw: TData;
};

export type NormalizedSeries<TData = unknown> = {
  key: string;
  label: string;
  points: Array<NormalizedDataPoint<TData>>;
  color?: string;
};

export type NormalizedCartesianData<TData = unknown> = {
  kind: "cartesian";
  xKey: string;
  series: Array<NormalizedSeries<TData>>;
  rows: TData[];
  warnings: ChartKitWarning[];
};

export type LegacyDataset = {
  data: Array<number | null | undefined>;
  color?: (opacity?: number) => string;
  colors?: Array<(opacity?: number) => string>;
  strokeWidth?: number;
  withDots?: boolean;
  withScrollableDot?: boolean;
  key?: string | number;
  strokeDashArray?: number[] | string;
  strokeDashOffset?: number;
};

export type LegacyLineData = {
  labels?: string[];
  datasets: LegacyDataset[];
  legend?: string[];
};

export type LegacyPieDataItem = {
  name?: string;
  color?: string;
  legendFontColor?: string;
  legendFontSize?: number;
  legendFontFamily?: string;
  [key: string]: unknown;
};

export type NormalizeLegacyPieOptions = NormalizeOptions & {
  accessor?: string;
};

export type NormalizedPieSlice<TData = unknown> = {
  index: number;
  label: string;
  value: ChartYValue;
  defined: boolean;
  color?: string;
  raw: TData;
};

export type NormalizedPieData<TData = unknown> = {
  kind: "pie";
  accessor: string;
  slices: Array<NormalizedPieSlice<TData>>;
  warnings: ChartKitWarning[];
};

export type LegacyProgressData =
  | Array<number | null | undefined>
  | {
      labels?: string[];
      colors?: string[];
      data: Array<number | null | undefined>;
    };

export type NormalizedProgressRing = {
  index: number;
  label?: string;
  value: ChartYValue;
  defined: boolean;
  color?: string;
};

export type NormalizedProgressData = {
  kind: "progress";
  rings: NormalizedProgressRing[];
  warnings: ChartKitWarning[];
};

export type LegacyStackedBarData = {
  labels: string[];
  legend: string[];
  data: Array<Array<number | null | undefined>>;
  barColors: string[];
};

export type NormalizeLegacyStackedBarOptions = NormalizeOptions & {
  percentile?: boolean;
};

export type NormalizedStackedBarSegment<TData = unknown> = {
  index: number;
  seriesIndex: number;
  label: string;
  value: ChartYValue;
  defined: boolean;
  color?: string;
  raw: TData;
};

export type NormalizedStackedBarGroup<TData = unknown> = {
  index: number;
  label: string;
  total: number;
  segments: Array<NormalizedStackedBarSegment<TData>>;
  raw: TData;
};

export type NormalizedStackedBarData<TData = unknown> = {
  kind: "stacked-bar";
  legend: string[];
  colors: string[];
  percentile: boolean;
  groups: Array<NormalizedStackedBarGroup<TData>>;
  warnings: ChartKitWarning[];
};

export type LegacyContributionValue = {
  date?: string | number | Date;
  [key: string]: unknown;
};

export type NormalizeLegacyContributionOptions = NormalizeOptions & {
  accessor?: string;
  endDate: string | number | Date;
  numDays: number;
  emptyValue?: 0 | null;
};

export type NormalizedContributionDay<TData = unknown> = {
  index: number;
  date: Date;
  value: ChartYValue;
  defined: boolean;
  raw?: TData;
};

export type NormalizedContributionData<TData = unknown> = {
  kind: "contribution";
  accessor: string;
  startDate: Date;
  endDate: Date;
  days: Array<NormalizedContributionDay<TData>>;
  warnings: ChartKitWarning[];
};

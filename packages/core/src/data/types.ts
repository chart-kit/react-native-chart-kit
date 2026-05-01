export type ChartXValue = string | number | Date;
export type ChartYValue = number | null;

export type ChartKitWarningCode =
  | "invalid-x-value"
  | "missing-value"
  | "invalid-number"
  | "negative-pie-value"
  | "progress-out-of-range";

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

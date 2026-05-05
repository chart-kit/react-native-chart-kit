import type {
  ChartBoxes,
  ChartXValue,
  NumericDomainInput,
  ProjectedCandlestick
} from "@chart-kit/core";

import type {
  CartesianChartPresetValue,
  CartesianChartTheme,
  ChartKitThemeContextValue,
  ChartKitThemeMode,
  ResolvedCartesianChartTheme
} from "../../theme";

export type CandlestickChartPriceKeys<TData extends Record<string, unknown>> = {
  closeKey: keyof TData & string;
  highKey: keyof TData & string;
  lowKey: keyof TData & string;
  openKey: keyof TData & string;
};

export type CandlestickChartProps<TData extends Record<string, unknown>> =
  CandlestickChartPriceKeys<TData> & {
    data: TData[];
    height: number;
    width: number;
    xKey: keyof TData & string;
    theme?: ChartKitThemeMode | CartesianChartTheme;
    preset?: CartesianChartPresetValue;
    yDomain?: NumericDomainInput;
    candleWidthRatio?: number;
    downColor?: string;
    flatColor?: string;
    upColor?: string;
    showHorizontalGridLines?: boolean;
    showXAxisLabels?: boolean;
    showYAxisLabels?: boolean;
    yTickCount?: number;
    formatXLabel?: (value: ChartXValue, index: number) => string;
    formatYLabel?: (value: number) => string;
    accessibilityLabel?: string;
    testID?: string;
  };

export type BuildCandlestickChartModelOptions<
  TData extends Record<string, unknown>
> = CandlestickChartProps<TData> & {
  chartKitTheme: ChartKitThemeContextValue;
};

export type CandlestickChartXLabelModel = {
  index: number;
  text: string;
  x: number;
  y: number;
};

export type CandlestickChartYLabelModel = {
  key: string;
  text: string;
  x: number;
  y: number;
};

export type CandlestickChartCandleModel<TData = unknown> =
  ProjectedCandlestick<TData> & {
    color: string;
  };

export type CandlestickChartModel<TData = unknown> = {
  boxes: ChartBoxes;
  candles: Array<CandlestickChartCandleModel<TData>>;
  downColor: string;
  flatColor: string;
  resolvedTheme: ResolvedCartesianChartTheme;
  showHorizontalGridLines: boolean;
  showXAxisLabels: boolean;
  showYAxisLabels: boolean;
  upColor: string;
  xLabels: CandlestickChartXLabelModel[];
  yLabels: CandlestickChartYLabelModel[];
  yTicks: number[];
};

import {
  generateLinearTicks,
  normalizeCartesianData,
  resolveNumericDomain,
  type CartesianSeriesInput,
  type NormalizedCartesianData,
  type NumericDomainInput
} from "@chart-kit/core";

import {
  resolveLineChartYAxisLabelSizes,
  type LineChartYAxisLabelWidth
} from "./axisLabels";

type AxisLabelSize = {
  width: number;
  height: number;
};

type TextMeasurer = (
  text: string,
  options?: Record<string, unknown>
) => AxisLabelSize;

type ResolveLineChartYAxisModelOptions<TData extends Record<string, unknown>> =
  {
    data: TData[];
    stableData?: TData[] | undefined;
    xKey: keyof TData & string;
    series: Array<CartesianSeriesInput<TData>>;
    yDomain: NumericDomainInput;
    yAxisLabelWidth?: LineChartYAxisLabelWidth | undefined;
    formatYLabel: (value: number) => string;
    measureText: TextMeasurer;
    textOptions: Record<string, unknown>;
  };

const getNumericYValues = <TData extends Record<string, unknown>>(
  normalized: NormalizedCartesianData<TData>
) =>
  normalized.series.flatMap((item) =>
    item.points.flatMap((point) =>
      typeof point.value === "number" ? [point.value] : []
    )
  );

export const resolveLineChartYAxisModel = <
  TData extends Record<string, unknown>
>({
  data,
  stableData,
  xKey,
  series,
  yDomain,
  yAxisLabelWidth,
  formatYLabel,
  measureText,
  textOptions
}: ResolveLineChartYAxisModelOptions<TData>) => {
  const normalized = normalizeCartesianData({
    data,
    xKey,
    series
  });
  const yValues = getNumericYValues(normalized);
  const yDomainResolved = resolveNumericDomain(yValues, yDomain);
  const yTicks = generateLinearTicks({
    domain: yDomainResolved,
    count: 4
  });
  const stableYLabelSizes =
    yAxisLabelWidth === "stable"
      ? generateLinearTicks({
          domain: resolveNumericDomain(
            stableData
              ? getNumericYValues(
                  normalizeCartesianData({
                    data: stableData,
                    xKey,
                    series
                  })
                )
              : yValues,
            yDomain
          ),
          count: 4
        }).map((tick) => measureText(formatYLabel(tick), textOptions))
      : undefined;
  const yLabelSizes = resolveLineChartYAxisLabelSizes({
    sizes: yTicks.map((tick) => measureText(formatYLabel(tick), textOptions)),
    stableSizes: stableYLabelSizes,
    width: yAxisLabelWidth
  });

  return {
    normalized,
    yDomainResolved,
    yLabelSizes,
    yTicks
  };
};

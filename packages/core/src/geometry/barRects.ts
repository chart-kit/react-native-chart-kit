import type { ChartXValue, NormalizedSeries } from "../data";

export type BarGeometryMode = "grouped" | "stacked" | "stacked100";

export type ProjectedBarBand<TData = unknown> = {
  x: number;
  width: number;
  raw?: TData;
};

export type ProjectBarBand<TData = unknown> = (
  value: ChartXValue,
  dataIndex: number,
  raw: TData | undefined
) => ProjectedBarBand<TData> | undefined;

export type ProjectBarValueScale = (value: number) => number | undefined;

export type ProjectedBarRect<TData = unknown> = {
  key: string;
  seriesKey: string;
  seriesLabel: string;
  seriesIndex: number;
  dataIndex: number;
  xValue: ChartXValue;
  value: number;
  scaledValue: number;
  x: number;
  y: number;
  width: number;
  height: number;
  baselineY: number;
  defined: boolean;
  raw: TData | undefined;
  stackStart?: number;
  stackEnd?: number;
};

export type BarGeometry<TData = unknown> = {
  mode: BarGeometryMode;
  bars: Array<ProjectedBarRect<TData>>;
};

export type BuildBarGeometryOptions<TData = unknown> = {
  series: Array<NormalizedSeries<TData>>;
  xBand: ProjectBarBand<TData>;
  yScale: ProjectBarValueScale;
  mode?: BarGeometryMode;
  baselineValue?: number;
  barWidthRatio?: number;
  barGapRatio?: number;
  dataIndexOffset?: number;
};

const defaultBarWidthRatio = 0.72;
const defaultBarGapRatio = 0.12;

const clampRatio = (value: number | undefined, fallback: number) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(1, value))
    : fallback;

const isFinitePosition = (value: number | undefined): value is number =>
  typeof value === "number" && Number.isFinite(value);

const buildRect = <TData>({
  baselineY,
  dataIndex,
  heightValue,
  raw,
  scaledValue,
  series,
  seriesIndex,
  value,
  width,
  x,
  xValue,
  yScale
}: {
  baselineY: number;
  dataIndex: number;
  heightValue: number;
  raw: TData | undefined;
  scaledValue: number;
  series: NormalizedSeries<TData>;
  seriesIndex: number;
  value: number;
  width: number;
  x: number;
  xValue: ChartXValue;
  yScale: ProjectBarValueScale;
}): ProjectedBarRect<TData> | undefined => {
  const valueY = yScale(heightValue);

  if (!isFinitePosition(valueY)) {
    return undefined;
  }

  return {
    key: `${series.key}-${dataIndex}`,
    seriesKey: series.key,
    seriesLabel: series.label,
    seriesIndex,
    dataIndex,
    xValue,
    value,
    scaledValue,
    x,
    y: Math.min(valueY, baselineY),
    width,
    height: Math.abs(baselineY - valueY),
    baselineY,
    defined: true,
    raw
  };
};

const getSeriesPoint = <TData>(
  series: NormalizedSeries<TData>,
  rowIndex: number
) => series.points[rowIndex];

const getSeriesRowCount = <TData>(series: Array<NormalizedSeries<TData>>) =>
  Math.max(0, ...series.map((item) => item.points.length));

const getStackTotals = <TData>(
  series: Array<NormalizedSeries<TData>>,
  rowIndex: number
) => {
  let positive = 0;
  let negative = 0;

  series.forEach((item) => {
    const value = getSeriesPoint(item, rowIndex)?.value;

    if (typeof value !== "number" || !Number.isFinite(value)) {
      return;
    }

    if (value >= 0) {
      positive += value;
    } else {
      negative += Math.abs(value);
    }
  });

  return { negative, positive };
};

const getStackedScaledValue = <TData>({
  mode,
  rowIndex,
  series,
  value
}: {
  mode: BarGeometryMode;
  rowIndex: number;
  series: Array<NormalizedSeries<TData>>;
  value: number;
}) => {
  if (mode !== "stacked100") {
    return value;
  }

  const totals = getStackTotals(series, rowIndex);

  if (value >= 0) {
    return totals.positive > 0 ? (value / totals.positive) * 100 : 0;
  }

  return totals.negative > 0 ? (value / totals.negative) * 100 : 0;
};

const buildGroupedBars = <TData>({
  baselineY,
  barGapRatio,
  barWidthRatio,
  dataIndexOffset,
  series,
  xBand,
  yScale
}: Required<
  Pick<
    BuildBarGeometryOptions<TData>,
    "barGapRatio" | "barWidthRatio" | "dataIndexOffset" | "series"
  >
> &
  Pick<BuildBarGeometryOptions<TData>, "xBand" | "yScale"> & {
    baselineY: number;
  }) => {
  const rowCount = getSeriesRowCount(series);
  const bars: Array<ProjectedBarRect<TData>> = [];
  const seriesCount = Math.max(1, series.length);

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const referencePoint = series[0]?.points[rowIndex];

    if (!referencePoint) {
      continue;
    }

    const band = xBand(
      referencePoint.x,
      rowIndex + dataIndexOffset,
      referencePoint.raw
    );

    if (!band || !Number.isFinite(band.x) || !Number.isFinite(band.width)) {
      continue;
    }

    const groupWidth = band.width * barWidthRatio;
    const groupX = band.x + (band.width - groupWidth) / 2;
    const totalGapWidth =
      groupWidth * barGapRatio * Math.max(0, seriesCount - 1);
    const barWidth = Math.max(0, (groupWidth - totalGapWidth) / seriesCount);
    const gapWidth = seriesCount > 1 ? groupWidth * barGapRatio : 0;

    series.forEach((item, seriesIndex) => {
      const point = getSeriesPoint(item, rowIndex);

      if (
        !point ||
        typeof point.value !== "number" ||
        !Number.isFinite(point.value)
      ) {
        return;
      }

      const rect = buildRect({
        baselineY,
        dataIndex: rowIndex + dataIndexOffset,
        heightValue: point.value,
        raw: point.raw,
        scaledValue: point.value,
        series: item,
        seriesIndex,
        value: point.value,
        width: barWidth,
        x: groupX + seriesIndex * (barWidth + gapWidth),
        xValue: point.x,
        yScale
      });

      if (rect) {
        bars.push(rect);
      }
    });
  }

  return bars;
};

const buildStackedBars = <TData>({
  baselineY,
  barWidthRatio,
  dataIndexOffset,
  mode,
  series,
  xBand,
  yScale
}: Required<
  Pick<
    BuildBarGeometryOptions<TData>,
    "barWidthRatio" | "dataIndexOffset" | "mode" | "series"
  >
> &
  Pick<BuildBarGeometryOptions<TData>, "xBand" | "yScale"> & {
    baselineY: number;
  }) => {
  const rowCount = getSeriesRowCount(series);
  const bars: Array<ProjectedBarRect<TData>> = [];

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const referencePoint = series[0]?.points[rowIndex];

    if (!referencePoint) {
      continue;
    }

    const band = xBand(
      referencePoint.x,
      rowIndex + dataIndexOffset,
      referencePoint.raw
    );

    if (!band || !Number.isFinite(band.x) || !Number.isFinite(band.width)) {
      continue;
    }

    let positiveStart = 0;
    let negativeStart = 0;
    const barWidth = band.width * barWidthRatio;
    const x = band.x + (band.width - barWidth) / 2;

    series.forEach((item, seriesIndex) => {
      const point = getSeriesPoint(item, rowIndex);

      if (
        !point ||
        typeof point.value !== "number" ||
        !Number.isFinite(point.value)
      ) {
        return;
      }

      const scaledValue = getStackedScaledValue({
        mode,
        rowIndex,
        series,
        value: point.value
      });
      const stackStart = scaledValue >= 0 ? positiveStart : negativeStart;
      const stackEnd = stackStart + scaledValue;
      const stackStartY = yScale(stackStart);
      const stackEndY = yScale(stackEnd);

      if (!isFinitePosition(stackStartY) || !isFinitePosition(stackEndY)) {
        return;
      }

      const rect: ProjectedBarRect<TData> = {
        key: `${item.key}-${rowIndex + dataIndexOffset}`,
        seriesKey: item.key,
        seriesLabel: item.label,
        seriesIndex,
        dataIndex: rowIndex + dataIndexOffset,
        xValue: point.x,
        value: point.value,
        scaledValue,
        x,
        y: Math.min(stackStartY, stackEndY),
        width: barWidth,
        height: Math.abs(stackStartY - stackEndY),
        baselineY,
        defined: true,
        raw: point.raw,
        stackStart,
        stackEnd
      };

      bars.push(rect);

      if (scaledValue >= 0) {
        positiveStart = stackEnd;
      } else {
        negativeStart = stackEnd;
      }
    });
  }

  return bars;
};

export const buildBarGeometry = <TData = unknown>({
  series,
  xBand,
  yScale,
  mode = "grouped",
  baselineValue = 0,
  barWidthRatio: rawBarWidthRatio,
  barGapRatio: rawBarGapRatio,
  dataIndexOffset = 0
}: BuildBarGeometryOptions<TData>): BarGeometry<TData> => {
  const baselineY = yScale(baselineValue);

  if (!isFinitePosition(baselineY) || series.length === 0) {
    return { mode, bars: [] };
  }

  const barWidthRatio = clampRatio(rawBarWidthRatio, defaultBarWidthRatio);
  const barGapRatio = clampRatio(rawBarGapRatio, defaultBarGapRatio);
  const bars =
    mode === "grouped"
      ? buildGroupedBars({
          baselineY,
          barGapRatio,
          barWidthRatio,
          dataIndexOffset,
          series,
          xBand,
          yScale
        })
      : buildStackedBars({
          baselineY,
          barWidthRatio,
          dataIndexOffset,
          mode,
          series,
          xBand,
          yScale
        });

  return {
    mode,
    bars
  };
};

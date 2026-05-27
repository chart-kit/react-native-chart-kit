import type { ChartXValue, NormalizedSeries } from "../data";
import type {
  BarGeometryMode,
  ProjectBarValueScale,
  ProjectedBarRect
} from "./barRects";

export type ProjectedHorizontalBarBand<TData = unknown> = {
  y: number;
  height: number;
  raw?: TData;
};

export type ProjectHorizontalBarBand<TData = unknown> = (
  value: ChartXValue,
  dataIndex: number,
  raw: TData | undefined
) => ProjectedHorizontalBarBand<TData> | undefined;

export type ProjectedHorizontalBarRect<TData = unknown> =
  ProjectedBarRect<TData> & {
    baselineX: number;
  };

export type HorizontalBarGeometry<TData = unknown> = {
  mode: BarGeometryMode;
  bars: Array<ProjectedHorizontalBarRect<TData>>;
};

export type BuildHorizontalBarGeometryOptions<TData = unknown> = {
  series: Array<NormalizedSeries<TData>>;
  yBand: ProjectHorizontalBarBand<TData>;
  xScale: ProjectBarValueScale;
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

const buildRect = <TData>({
  baselineX,
  dataIndex,
  height,
  raw,
  scaledValue,
  series,
  seriesIndex,
  value,
  widthValue,
  xScale,
  xValue,
  y
}: {
  baselineX: number;
  dataIndex: number;
  height: number;
  raw: TData | undefined;
  scaledValue: number;
  series: NormalizedSeries<TData>;
  seriesIndex: number;
  value: number;
  widthValue: number;
  xScale: ProjectBarValueScale;
  xValue: ChartXValue;
  y: number;
}): ProjectedHorizontalBarRect<TData> | undefined => {
  const valueX = xScale(widthValue);

  if (!isFinitePosition(valueX)) {
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
    x: Math.min(valueX, baselineX),
    y,
    width: Math.abs(valueX - baselineX),
    height,
    baselineX,
    baselineY: y + height / 2,
    defined: true,
    raw
  };
};

const buildGroupedHorizontalBars = <TData>({
  baselineX,
  barGapRatio,
  barWidthRatio,
  dataIndexOffset,
  series,
  xScale,
  yBand
}: Required<
  Pick<
    BuildHorizontalBarGeometryOptions<TData>,
    "barGapRatio" | "barWidthRatio" | "dataIndexOffset" | "series"
  >
> &
  Pick<BuildHorizontalBarGeometryOptions<TData>, "xScale" | "yBand"> & {
    baselineX: number;
  }) => {
  const rowCount = getSeriesRowCount(series);
  const bars: Array<ProjectedHorizontalBarRect<TData>> = [];
  const seriesCount = Math.max(1, series.length);

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const referencePoint = series[0]?.points[rowIndex];

    if (!referencePoint) {
      continue;
    }

    const band = yBand(
      referencePoint.x,
      rowIndex + dataIndexOffset,
      referencePoint.raw
    );

    if (!band || !Number.isFinite(band.y) || !Number.isFinite(band.height)) {
      continue;
    }

    const groupHeight = band.height * barWidthRatio;
    const groupY = band.y + (band.height - groupHeight) / 2;
    const totalGapHeight =
      groupHeight * barGapRatio * Math.max(0, seriesCount - 1);
    const barHeight = Math.max(0, (groupHeight - totalGapHeight) / seriesCount);
    const gapHeight = seriesCount > 1 ? groupHeight * barGapRatio : 0;

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
        baselineX,
        dataIndex: rowIndex + dataIndexOffset,
        height: barHeight,
        raw: point.raw,
        scaledValue: point.value,
        series: item,
        seriesIndex,
        value: point.value,
        widthValue: point.value,
        xScale,
        xValue: point.x,
        y: groupY + seriesIndex * (barHeight + gapHeight)
      });

      if (rect) {
        bars.push(rect);
      }
    });
  }

  return bars;
};

const buildStackedHorizontalBars = <TData>({
  baselineX,
  barWidthRatio,
  dataIndexOffset,
  mode,
  series,
  xScale,
  yBand
}: Required<
  Pick<
    BuildHorizontalBarGeometryOptions<TData>,
    "barWidthRatio" | "dataIndexOffset" | "mode" | "series"
  >
> &
  Pick<BuildHorizontalBarGeometryOptions<TData>, "xScale" | "yBand"> & {
    baselineX: number;
  }) => {
  const rowCount = getSeriesRowCount(series);
  const bars: Array<ProjectedHorizontalBarRect<TData>> = [];

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const referencePoint = series[0]?.points[rowIndex];

    if (!referencePoint) {
      continue;
    }

    const band = yBand(
      referencePoint.x,
      rowIndex + dataIndexOffset,
      referencePoint.raw
    );

    if (!band || !Number.isFinite(band.y) || !Number.isFinite(band.height)) {
      continue;
    }

    let positiveStart = 0;
    let negativeStart = 0;
    const barHeight = band.height * barWidthRatio;
    const y = band.y + (band.height - barHeight) / 2;

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
      const stackStartX = xScale(stackStart);
      const stackEndX = xScale(stackEnd);

      if (!isFinitePosition(stackStartX) || !isFinitePosition(stackEndX)) {
        return;
      }

      bars.push({
        key: `${item.key}-${rowIndex + dataIndexOffset}`,
        seriesKey: item.key,
        seriesLabel: item.label,
        seriesIndex,
        dataIndex: rowIndex + dataIndexOffset,
        xValue: point.x,
        value: point.value,
        scaledValue,
        x: Math.min(stackStartX, stackEndX),
        y,
        width: Math.abs(stackEndX - stackStartX),
        height: barHeight,
        baselineX,
        baselineY: y + barHeight / 2,
        defined: true,
        raw: point.raw,
        stackStart,
        stackEnd
      });

      if (scaledValue >= 0) {
        positiveStart = stackEnd;
      } else {
        negativeStart = stackEnd;
      }
    });
  }

  return bars;
};

export const buildHorizontalBarGeometry = <TData = unknown>({
  series,
  yBand,
  xScale,
  mode = "grouped",
  baselineValue = 0,
  barWidthRatio: rawBarWidthRatio,
  barGapRatio: rawBarGapRatio,
  dataIndexOffset = 0
}: BuildHorizontalBarGeometryOptions<TData>): HorizontalBarGeometry<TData> => {
  const baselineX = xScale(baselineValue);

  if (!isFinitePosition(baselineX) || series.length === 0) {
    return { mode, bars: [] };
  }

  const barWidthRatio = clampRatio(rawBarWidthRatio, defaultBarWidthRatio);
  const barGapRatio = clampRatio(rawBarGapRatio, defaultBarGapRatio);
  const bars =
    mode === "grouped"
      ? buildGroupedHorizontalBars({
          baselineX,
          barGapRatio,
          barWidthRatio,
          dataIndexOffset,
          series,
          xScale,
          yBand
        })
      : buildStackedHorizontalBars({
          baselineX,
          barWidthRatio,
          dataIndexOffset,
          mode,
          series,
          xScale,
          yBand
        });

  return {
    mode,
    bars
  };
};

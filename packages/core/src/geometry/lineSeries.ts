import type {
  ChartXValue,
  NormalizedDataPoint,
  NormalizedSeries
} from "../data";
import { buildAreaPath } from "./areaPath";
import { buildLinePath } from "./linePath";
import type {
  BuildAreaPathOptions,
  GeometryPoint,
  LineCurve,
  LinePathModel
} from "./types";

export type ProjectedLinePoint<TData = unknown> = GeometryPoint<TData> & {
  dataIndex: number;
  seriesKey: string;
  xValue: ChartXValue;
};

export type ProjectScale<TData = unknown> = (
  value: ChartXValue,
  point: NormalizedDataPoint<TData>
) => number | undefined;

export type ProjectValueScale<TData = unknown> = (
  value: number,
  point: NormalizedDataPoint<TData>
) => number | undefined;

export type BuildLineSeriesGeometryOptions<TData = unknown> = {
  series: NormalizedSeries<TData>;
  xScale: ProjectScale<TData>;
  yScale: ProjectValueScale<TData>;
  curve?: LineCurve;
  connectNulls?: boolean;
  dataIndexOffset?: number;
  areaBaselineY?: BuildAreaPathOptions<ProjectedLinePoint<TData>>["baselineY"];
};

export type LineSeriesGeometry<TData = unknown> = {
  key: string;
  label: string;
  color?: string;
  points: Array<ProjectedLinePoint<TData>>;
  line: LinePathModel<ProjectedLinePoint<TData>>;
  area?: LinePathModel<ProjectedLinePoint<TData>>;
};

const isFinitePosition = (value: number | undefined): value is number => {
  return typeof value === "number" && Number.isFinite(value);
};

const projectPoint = <TData>(
  series: NormalizedSeries<TData>,
  point: NormalizedDataPoint<TData>,
  xScale: ProjectScale<TData>,
  yScale: ProjectValueScale<TData>,
  dataIndexOffset: number
): ProjectedLinePoint<TData> => {
  const projectedX = xScale(point.x, point);
  const projectedY =
    point.value === null ? undefined : yScale(point.value, point);
  const defined =
    point.defined &&
    isFinitePosition(projectedX) &&
    isFinitePosition(projectedY);

  return {
    index: point.index + dataIndexOffset,
    dataIndex: point.index + dataIndexOffset,
    seriesKey: series.key,
    xValue: point.x,
    x: projectedX ?? 0,
    y: projectedY ?? 0,
    value: point.value,
    defined,
    raw: point.raw
  };
};

export const buildLineSeriesGeometry = <TData = unknown>({
  series,
  xScale,
  yScale,
  curve = "linear",
  connectNulls = false,
  dataIndexOffset = 0,
  areaBaselineY
}: BuildLineSeriesGeometryOptions<TData>): LineSeriesGeometry<TData> => {
  const points = series.points.map((point) =>
    projectPoint(series, point, xScale, yScale, dataIndexOffset)
  );
  const line = buildLinePath({
    points,
    curve,
    connectNulls
  });
  const geometry: LineSeriesGeometry<TData> = {
    key: series.key,
    label: series.label,
    points,
    line
  };

  if (series.color !== undefined) {
    geometry.color = series.color;
  }

  if (areaBaselineY !== undefined) {
    geometry.area = buildAreaPath({
      points,
      curve,
      connectNulls,
      baselineY: areaBaselineY
    });
  }

  return geometry;
};

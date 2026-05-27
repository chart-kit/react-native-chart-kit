import { getDecimatedLinePathSegments } from "./lineDecimation";
import { buildLineSegmentPath } from "./linePath";
import { pointCommand } from "./path";
import type {
  BuildAreaPathOptions,
  GeometryPoint,
  GeometrySegment,
  LinePathModel
} from "./types";

const getBaselineY = <TPoint extends GeometryPoint>(
  baselineY: BuildAreaPathOptions<TPoint>["baselineY"],
  point: TPoint
) => {
  return typeof baselineY === "function" ? baselineY(point) : baselineY;
};

const closeAreaPath = <TPoint extends GeometryPoint>(
  linePath: string,
  points: TPoint[],
  baselineY: BuildAreaPathOptions<TPoint>["baselineY"]
) => {
  const first = points[0];
  const last = points[points.length - 1];

  if (!first || !last) {
    return "";
  }

  return [
    linePath,
    pointCommand("L", last.x, getBaselineY(baselineY, last)),
    pointCommand("L", first.x, getBaselineY(baselineY, first)),
    "Z"
  ].join(" ");
};

export const buildAreaPath = <TPoint extends GeometryPoint = GeometryPoint>({
  points,
  curve = "linear",
  connectNulls = false,
  decimation,
  baselineY
}: BuildAreaPathOptions<TPoint>): LinePathModel<TPoint> => {
  const segments = getDecimatedLinePathSegments({
    points,
    connectNulls,
    decimation
  }).map<GeometrySegment<TPoint>>((segment) => {
    const linePath = buildLineSegmentPath(segment, curve);

    return {
      points: segment,
      path: closeAreaPath(linePath, segment, baselineY)
    };
  });

  return {
    segments,
    path: segments.map((segment) => segment.path).join(" ")
  };
};

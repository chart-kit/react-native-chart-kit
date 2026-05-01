import {
  cubicCommand,
  horizontalCommand,
  pointCommand,
  verticalCommand
} from "./path";
import type {
  BuildLinePathOptions,
  GeometryPoint,
  GeometrySegment,
  LinePathModel
} from "./types";

const isFinitePoint = (point: GeometryPoint): boolean => {
  return point.defined && Number.isFinite(point.x) && Number.isFinite(point.y);
};

export const splitDefinedSegments = <
  TPoint extends GeometryPoint = GeometryPoint
>(
  points: TPoint[],
  connectNulls = false
): TPoint[][] => {
  if (connectNulls) {
    return [points.filter(isFinitePoint)];
  }

  const segments: TPoint[][] = [];
  let current: TPoint[] = [];

  points.forEach((point) => {
    if (isFinitePoint(point)) {
      current.push(point);
      return;
    }

    if (current.length > 0) {
      segments.push(current);
      current = [];
    }
  });

  if (current.length > 0) {
    segments.push(current);
  }

  return segments;
};

const buildLinearSegmentPath = <TPoint extends GeometryPoint>(
  points: TPoint[]
) => {
  return points
    .map((point, index) =>
      pointCommand(index === 0 ? "M" : "L", point.x, point.y)
    )
    .join(" ");
};

const buildStepSegmentPath = <TPoint extends GeometryPoint>(
  points: TPoint[]
) => {
  if (points.length === 0) {
    return "";
  }

  const first = points[0];

  if (!first) {
    return "";
  }

  const rest = points.slice(1);
  let path = pointCommand("M", first.x, first.y);
  let previous = first;

  rest.forEach((point) => {
    const midpoint = previous.x + (point.x - previous.x) / 2;
    path = [
      path,
      horizontalCommand(midpoint),
      verticalCommand(point.y),
      horizontalCommand(point.x)
    ].join(" ");
    previous = point;
  });

  return path;
};

const isStrictlyIncreasingX = <TPoint extends GeometryPoint>(
  points: TPoint[]
) => {
  return points.every((point, index) => {
    return index === 0 || point.x > points[index - 1]!.x;
  });
};

const buildMonotoneSegmentPath = <TPoint extends GeometryPoint>(
  points: TPoint[]
) => {
  if (points.length < 3 || !isStrictlyIncreasingX(points)) {
    return buildLinearSegmentPath(points);
  }

  const slopes = points.slice(0, -1).map((point, index) => {
    const next = points[index + 1]!;
    return (next.y - point.y) / (next.x - point.x);
  });
  const tangents = points.map((_, index) => {
    if (index === 0) {
      return slopes[0]!;
    }

    if (index === points.length - 1) {
      return slopes[slopes.length - 1]!;
    }

    const previousSlope = slopes[index - 1]!;
    const nextSlope = slopes[index]!;

    if (previousSlope * nextSlope <= 0) {
      return 0;
    }

    const sign = Math.sign(previousSlope);
    return (
      sign *
      Math.min(
        Math.abs(previousSlope),
        Math.abs(nextSlope),
        Math.abs((previousSlope + nextSlope) / 2)
      )
    );
  });

  let path = pointCommand("M", points[0]!.x, points[0]!.y);

  for (let index = 0; index < points.length - 1; index++) {
    const point = points[index]!;
    const next = points[index + 1]!;
    const deltaX = next.x - point.x;

    path = [
      path,
      cubicCommand(
        point.x + deltaX / 3,
        point.y + (tangents[index]! * deltaX) / 3,
        next.x - deltaX / 3,
        next.y - (tangents[index + 1]! * deltaX) / 3,
        next.x,
        next.y
      )
    ].join(" ");
  }

  return path;
};

export const buildLineSegmentPath = <TPoint extends GeometryPoint>(
  points: TPoint[],
  curve: BuildLinePathOptions<TPoint>["curve"] = "linear"
) => {
  if (points.length === 0) {
    return "";
  }

  if (curve === "step") {
    return buildStepSegmentPath(points);
  }

  if (curve === "monotone") {
    return buildMonotoneSegmentPath(points);
  }

  return buildLinearSegmentPath(points);
};

export const buildLinePath = <TPoint extends GeometryPoint = GeometryPoint>({
  points,
  curve = "linear",
  connectNulls = false
}: BuildLinePathOptions<TPoint>): LinePathModel<TPoint> => {
  const segments = splitDefinedSegments(points, connectNulls)
    .filter((segment) => segment.length > 0)
    .map<GeometrySegment<TPoint>>((segment) => ({
      points: segment,
      path: buildLineSegmentPath(segment, curve)
    }));

  return {
    segments,
    path: segments.map((segment) => segment.path).join(" ")
  };
};

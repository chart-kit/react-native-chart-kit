import type { GeometryPoint, LinePathDecimationConfig } from "./types";

const isFiniteGeometryPoint = <TPoint extends GeometryPoint>(
  point: TPoint
): boolean => {
  return point.defined && Number.isFinite(point.x) && Number.isFinite(point.y);
};

const appendUniquePoint = <TPoint extends GeometryPoint>(
  points: TPoint[],
  point: TPoint
) => {
  if (points[points.length - 1] !== point) {
    points.push(point);
  }
};

export const splitLinePathSegments = <
  TPoint extends GeometryPoint = GeometryPoint
>(
  points: TPoint[],
  connectNulls = false
): TPoint[][] => {
  if (connectNulls) {
    return [points.filter(isFiniteGeometryPoint)];
  }

  const segments: TPoint[][] = [];
  let current: TPoint[] = [];

  points.forEach((point) => {
    if (isFiniteGeometryPoint(point)) {
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

const getSegmentMinimumBudget = <TPoint extends GeometryPoint>(
  segment: TPoint[]
) => {
  return segment.length > 1 ? 2 : segment.length;
};

const decimateMinMaxSegment = <TPoint extends GeometryPoint>(
  segment: TPoint[],
  maxPoints: number
) => {
  if (segment.length <= maxPoints) {
    return segment;
  }

  if (maxPoints <= 1) {
    return segment.slice(0, 1);
  }

  const first = segment[0]!;
  const last = segment[segment.length - 1]!;
  const interior = segment.slice(1, -1);
  const selected: TPoint[] = [first];
  const interiorBudget = Math.max(0, maxPoints - 2);
  const bucketCount = Math.max(1, Math.ceil(interiorBudget / 2));
  const bucketSize = interior.length / bucketCount;

  for (let bucketIndex = 0; bucketIndex < bucketCount; bucketIndex++) {
    const bucketStart = Math.floor(bucketIndex * bucketSize);
    const bucketEnd =
      bucketIndex === bucketCount - 1
        ? interior.length
        : Math.floor((bucketIndex + 1) * bucketSize);
    const bucket = interior.slice(bucketStart, bucketEnd);

    if (bucket.length === 0) {
      continue;
    }

    let minIndex = 0;
    let maxIndex = 0;

    bucket.forEach((point, index) => {
      if (point.y < bucket[minIndex]!.y) {
        minIndex = index;
      }

      if (point.y > bucket[maxIndex]!.y) {
        maxIndex = index;
      }
    });

    const extrema =
      minIndex <= maxIndex
        ? [bucket[minIndex]!, bucket[maxIndex]!]
        : [bucket[maxIndex]!, bucket[minIndex]!];

    for (const point of extrema) {
      if (selected.length >= maxPoints - 1) {
        break;
      }

      appendUniquePoint(selected, point);
    }
  }

  appendUniquePoint(selected, last);

  return selected;
};

const allocateSegmentBudgets = <TPoint extends GeometryPoint>(
  segments: TPoint[][],
  maxPoints: number
) => {
  const minimumRequired = segments.reduce(
    (sum, segment) => sum + getSegmentMinimumBudget(segment),
    0
  );
  const effectiveMaxPoints = Math.max(maxPoints, minimumRequired);
  let remainingBudget = effectiveMaxPoints;
  let remainingPoints = segments.reduce(
    (sum, segment) => sum + segment.length,
    0
  );

  return segments.map((segment, index) => {
    if (index === segments.length - 1) {
      return Math.min(segment.length, remainingBudget);
    }

    const minimumBudget = getSegmentMinimumBudget(segment);
    const proportionalBudget = Math.round(
      (segment.length / remainingPoints) * remainingBudget
    );
    const budget = Math.min(
      segment.length,
      Math.max(minimumBudget, proportionalBudget)
    );

    remainingBudget -= budget;
    remainingPoints -= segment.length;

    return budget;
  });
};

export const getDecimatedLinePathSegments = <
  TPoint extends GeometryPoint = GeometryPoint
>({
  connectNulls = false,
  decimation,
  points
}: {
  connectNulls?: boolean;
  decimation?: false | LinePathDecimationConfig | undefined;
  points: TPoint[];
}): TPoint[][] => {
  const segments = splitLinePathSegments(points, connectNulls).filter(
    (segment) => segment.length > 0
  );

  if (
    !decimation ||
    !Number.isFinite(decimation.maxPoints) ||
    decimation.maxPoints <= 0
  ) {
    return segments;
  }

  const totalPointCount = segments.reduce(
    (sum, segment) => sum + segment.length,
    0
  );
  const maxPoints = Math.floor(decimation.maxPoints);

  if (totalPointCount <= maxPoints) {
    return segments;
  }

  const budgets = allocateSegmentBudgets(segments, maxPoints);

  return segments.map((segment, index) =>
    decimateMinMaxSegment(segment, budgets[index] ?? segment.length)
  );
};

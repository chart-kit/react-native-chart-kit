import { useEffect, useMemo, useRef, useState } from "react";

import { buildAreaPath, buildLinePath } from "@chart-kit/core";

import type { ProjectedLinePoint } from "@chart-kit/core";
import type { LineChartViewportAnimationConfig } from "./types";
import type { LineChartModel } from "./useChartModel";

type LineChartGeometryModel<TData extends Record<string, unknown>> =
  LineChartModel<TData>["geometries"][number];

export type ResolvedLineChartViewportAnimationConfig = {
  enabled: boolean;
  duration: number;
};

const defaultViewportAnimationDuration = 140;
const geometryPositionThreshold = 0.5;

const interpolateValue = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

const easeViewportAnimation = (progress: number) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return 1 - Math.pow(1 - clampedProgress, 3);
};

export const resolveLineChartViewportAnimationConfig = (
  animation?: boolean | LineChartViewportAnimationConfig
): ResolvedLineChartViewportAnimationConfig => {
  if (!animation) {
    return {
      enabled: false,
      duration: defaultViewportAnimationDuration
    };
  }

  if (animation === true) {
    return {
      enabled: true,
      duration: defaultViewportAnimationDuration
    };
  }

  return {
    enabled: animation.enabled !== false,
    duration:
      typeof animation.duration === "number" &&
      Number.isFinite(animation.duration)
        ? Math.max(0, animation.duration)
        : defaultViewportAnimationDuration
  };
};

const getPointKey = (point: ProjectedLinePoint) => point.dataIndex;

const interpolatePoint = <TData>({
  from,
  progress,
  to
}: {
  from: ProjectedLinePoint<TData> | undefined;
  progress: number;
  to: ProjectedLinePoint<TData>;
}): ProjectedLinePoint<TData> => {
  if (!from || from.defined !== to.defined) {
    return to;
  }

  return {
    ...to,
    x: interpolateValue(from.x, to.x, progress),
    y: interpolateValue(from.y, to.y, progress)
  };
};

const getInterpolatedGeometry = <TData extends Record<string, unknown>>({
  from,
  progress,
  to
}: {
  from: LineChartGeometryModel<TData> | undefined;
  progress: number;
  to: LineChartGeometryModel<TData>;
}): LineChartGeometryModel<TData> => {
  if (!from) {
    return to;
  }

  const sourcePointsByKey = new Map(
    from.geometry.points.map((point) => [getPointKey(point), point])
  );
  const points = to.geometry.points.map((point) =>
    interpolatePoint({
      from: sourcePointsByKey.get(getPointKey(point)),
      progress,
      to: point
    })
  );
  const { areaBaselineY, connectNulls, curve } = to.viewportAnimation;
  const line = buildLinePath({
    points,
    connectNulls,
    curve
  });
  const fromAreaBaselineY = from.viewportAnimation.areaBaselineY;
  const interpolatedAreaBaselineY =
    areaBaselineY !== undefined
      ? interpolateValue(
          fromAreaBaselineY ?? areaBaselineY,
          areaBaselineY,
          progress
        )
      : undefined;
  const area =
    to.geometry.area && interpolatedAreaBaselineY !== undefined
      ? buildAreaPath({
          points,
          connectNulls,
          curve,
          baselineY: interpolatedAreaBaselineY
        })
      : undefined;

  const geometry = {
    ...to.geometry,
    points,
    line
  };

  if (area) {
    return {
      ...to,
      geometry: {
        ...geometry,
        area
      }
    };
  }

  return {
    ...to,
    geometry
  };
};

export const getInterpolatedLineChartGeometries = <
  TData extends Record<string, unknown>
>({
  from,
  progress,
  to
}: {
  from: Array<LineChartGeometryModel<TData>>;
  progress: number;
  to: Array<LineChartGeometryModel<TData>>;
}) => {
  const fromByKey = new Map(from.map((item) => [item.geometry.key, item]));

  return to.map((geometry) =>
    getInterpolatedGeometry({
      from: fromByKey.get(geometry.geometry.key),
      progress,
      to: geometry
    })
  );
};

const hasMeaningfulGeometryDelta = <TData extends Record<string, unknown>>({
  from,
  to
}: {
  from: Array<LineChartGeometryModel<TData>>;
  to: Array<LineChartGeometryModel<TData>>;
}) => {
  if (from.length !== to.length) {
    return true;
  }

  return to.some((geometry, geometryIndex) => {
    const previousGeometry = from[geometryIndex];

    if (
      !previousGeometry ||
      previousGeometry.geometry.key !== geometry.geometry.key
    ) {
      return true;
    }

    if (
      previousGeometry.geometry.points.length !==
      geometry.geometry.points.length
    ) {
      return true;
    }

    return geometry.geometry.points.some((point, pointIndex) => {
      const previousPoint = previousGeometry.geometry.points[pointIndex];

      return (
        !previousPoint ||
        previousPoint.dataIndex !== point.dataIndex ||
        previousPoint.defined !== point.defined ||
        Math.abs(previousPoint.x - point.x) > geometryPositionThreshold ||
        Math.abs(previousPoint.y - point.y) > geometryPositionThreshold
      );
    });
  });
};

export const useAnimatedLineChartGeometries = <
  TData extends Record<string, unknown>
>(
  geometries: Array<LineChartGeometryModel<TData>>,
  animation?: boolean | LineChartViewportAnimationConfig
) => {
  const resolvedAnimation = useMemo(
    () => resolveLineChartViewportAnimationConfig(animation),
    [animation]
  );
  const latestGeometriesRef = useRef(geometries);
  const hasInitialGeometriesRef = useRef(false);
  const [animatedGeometries, setAnimatedGeometries] = useState(geometries);

  useEffect(() => {
    let animationFrame = 0;
    const targetGeometries = geometries;
    const currentGeometries = latestGeometriesRef.current;

    if (!hasInitialGeometriesRef.current) {
      hasInitialGeometriesRef.current = true;
      latestGeometriesRef.current = targetGeometries;
      setAnimatedGeometries(targetGeometries);

      return () => {
        cancelAnimationFrame(animationFrame);
      };
    }

    if (
      !hasMeaningfulGeometryDelta({
        from: currentGeometries,
        to: targetGeometries
      })
    ) {
      latestGeometriesRef.current = targetGeometries;

      return () => {
        cancelAnimationFrame(animationFrame);
      };
    }

    if (!resolvedAnimation.enabled || resolvedAnimation.duration <= 0) {
      latestGeometriesRef.current = targetGeometries;
      animationFrame = requestAnimationFrame(() => {
        setAnimatedGeometries(targetGeometries);
      });

      return () => {
        cancelAnimationFrame(animationFrame);
      };
    }

    let startTime: number | undefined;

    const tick = (timestamp: number) => {
      startTime ??= timestamp;

      const progress = Math.min(
        (timestamp - startTime) / resolvedAnimation.duration,
        1
      );
      const easedProgress = easeViewportAnimation(progress);
      const nextGeometries = getInterpolatedLineChartGeometries({
        from: currentGeometries,
        progress: easedProgress,
        to: targetGeometries
      });

      latestGeometriesRef.current = nextGeometries;
      setAnimatedGeometries(nextGeometries);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(tick);
      } else {
        latestGeometriesRef.current = targetGeometries;
        setAnimatedGeometries(targetGeometries);
      }
    };

    animationFrame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [geometries, resolvedAnimation.duration, resolvedAnimation.enabled]);

  return animatedGeometries;
};

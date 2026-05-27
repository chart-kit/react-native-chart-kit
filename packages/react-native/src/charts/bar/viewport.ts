import type { ChartViewportInitialIndex } from "@chart-kit/core";

export type ResolvedBarChartViewport = {
  contentWidth: number;
  itemCount: number;
  maxOffset: number;
  scrollable: boolean;
  viewportWidth: number;
  visiblePoints: number;
};

const minVisiblePoints = 1;

const clamp = (value: number, min: number, max: number) => {
  if (max < min) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
};

const normalizePositiveInteger = (
  value: number | undefined,
  fallback: number,
  min = 1
) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(min, Math.floor(value));
};

export const resolveBarChartViewport = ({
  itemCount,
  scrollable = false,
  viewportWidth,
  visiblePoints
}: {
  itemCount: number;
  scrollable?: boolean | undefined;
  viewportWidth: number;
  visiblePoints?: number | undefined;
}): ResolvedBarChartViewport => {
  const safeViewportWidth =
    Number.isFinite(viewportWidth) && viewportWidth > 0 ? viewportWidth : 0;
  const safeItemCount = normalizePositiveInteger(itemCount, 0, 0);
  const fallbackVisiblePoints = Math.max(safeItemCount, minVisiblePoints);
  const normalizedVisiblePoints = clamp(
    normalizePositiveInteger(visiblePoints, fallbackVisiblePoints),
    minVisiblePoints,
    Math.max(safeItemCount, minVisiblePoints)
  );
  const shouldScroll =
    scrollable &&
    safeViewportWidth > 0 &&
    safeItemCount > normalizedVisiblePoints;
  const contentWidth = shouldScroll
    ? Math.max(
        safeViewportWidth,
        (safeViewportWidth / normalizedVisiblePoints) * safeItemCount
      )
    : safeViewportWidth;

  return {
    contentWidth,
    itemCount: safeItemCount,
    maxOffset: Math.max(0, contentWidth - safeViewportWidth),
    scrollable: shouldScroll,
    viewportWidth: safeViewportWidth,
    visiblePoints: normalizedVisiblePoints
  };
};

export const resolveBarChartViewportInitialOffset = ({
  initialIndex = "start",
  viewport
}: {
  initialIndex?: ChartViewportInitialIndex | undefined;
  viewport: ResolvedBarChartViewport;
}) => {
  if (!viewport.scrollable || initialIndex === "start") {
    return 0;
  }

  if (initialIndex === "end") {
    return viewport.maxOffset;
  }

  if (!Number.isFinite(initialIndex) || viewport.itemCount <= 0) {
    return 0;
  }

  const index = clamp(Math.floor(initialIndex), 0, viewport.itemCount - 1);
  const bandWidth = viewport.contentWidth / viewport.itemCount;

  return clamp(index * bandWidth, 0, viewport.maxOffset);
};

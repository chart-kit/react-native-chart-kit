export type ChartViewportInitialIndex = "start" | "end" | number;

export type ResolveChartViewportOptions = {
  itemCount: number;
  scrollable?: boolean | undefined;
  viewportWidth: number;
  visiblePoints?: number | undefined;
};

export type ResolvedChartViewport = {
  contentWidth: number;
  itemCount: number;
  maxOffset: number;
  pointSpacing: number;
  scrollable: boolean;
  viewportWidth: number;
  visiblePoints: number;
};

export type ResolveChartViewportWindowOptions = {
  endIndex?: number | undefined;
  initialIndex?: ChartViewportInitialIndex | undefined;
  itemCount: number;
  startIndex?: number | undefined;
  visiblePoints?: number | undefined;
};

export type ResolvedChartViewportWindow = {
  endIndex: number;
  isWindowed: boolean;
  itemCount: number;
  startIndex: number;
  visibleCount: number;
};

const minVisiblePoints = 2;

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

export const resolveChartViewport = ({
  itemCount,
  scrollable = false,
  viewportWidth,
  visiblePoints
}: ResolveChartViewportOptions): ResolvedChartViewport => {
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
  const pointSpacing =
    normalizedVisiblePoints > 1
      ? safeViewportWidth / (normalizedVisiblePoints - 1)
      : safeViewportWidth;
  const contentWidth = shouldScroll
    ? safeViewportWidth +
      (safeItemCount - normalizedVisiblePoints) * pointSpacing
    : safeViewportWidth;

  return {
    contentWidth,
    itemCount: safeItemCount,
    maxOffset: Math.max(0, contentWidth - safeViewportWidth),
    pointSpacing,
    scrollable: shouldScroll,
    viewportWidth: safeViewportWidth,
    visiblePoints: normalizedVisiblePoints
  };
};

export const resolveChartViewportInitialOffset = ({
  initialIndex = "start",
  viewport
}: {
  initialIndex?: ChartViewportInitialIndex | undefined;
  viewport: ResolvedChartViewport;
}) => {
  if (!viewport.scrollable || initialIndex === "start") {
    return 0;
  }

  if (initialIndex === "end") {
    return viewport.maxOffset;
  }

  if (!Number.isFinite(initialIndex)) {
    return 0;
  }

  const index = clamp(Math.floor(initialIndex), 0, viewport.itemCount - 1);

  return clamp(index * viewport.pointSpacing, 0, viewport.maxOffset);
};

export const resolveChartViewportWindow = ({
  endIndex,
  initialIndex = "start",
  itemCount,
  startIndex,
  visiblePoints
}: ResolveChartViewportWindowOptions): ResolvedChartViewportWindow => {
  const safeItemCount = normalizePositiveInteger(itemCount, 0, 0);

  if (safeItemCount === 0) {
    return {
      endIndex: 0,
      isWindowed: false,
      itemCount: 0,
      startIndex: 0,
      visibleCount: 0
    };
  }

  if (startIndex !== undefined || endIndex !== undefined) {
    const normalizedStartIndex = clamp(
      normalizePositiveInteger(startIndex, 0, 0),
      0,
      safeItemCount - 1
    );
    const normalizedEndIndex = clamp(
      normalizePositiveInteger(endIndex, safeItemCount, 0),
      normalizedStartIndex + 1,
      safeItemCount
    );

    return {
      endIndex: normalizedEndIndex,
      isWindowed:
        normalizedStartIndex > 0 || normalizedEndIndex < safeItemCount,
      itemCount: safeItemCount,
      startIndex: normalizedStartIndex,
      visibleCount: normalizedEndIndex - normalizedStartIndex
    };
  }

  const normalizedVisiblePoints = clamp(
    normalizePositiveInteger(visiblePoints, safeItemCount),
    minVisiblePoints,
    safeItemCount
  );

  if (normalizedVisiblePoints >= safeItemCount) {
    return {
      endIndex: safeItemCount,
      isWindowed: false,
      itemCount: safeItemCount,
      startIndex: 0,
      visibleCount: safeItemCount
    };
  }

  const startFromInitialIndex =
    initialIndex === "end"
      ? safeItemCount - normalizedVisiblePoints
      : typeof initialIndex === "number" && Number.isFinite(initialIndex)
        ? Math.floor(initialIndex)
        : 0;
  const normalizedStartIndex = clamp(
    startFromInitialIndex,
    0,
    safeItemCount - normalizedVisiblePoints
  );

  return {
    endIndex: normalizedStartIndex + normalizedVisiblePoints,
    isWindowed: true,
    itemCount: safeItemCount,
    startIndex: normalizedStartIndex,
    visibleCount: normalizedVisiblePoints
  };
};

export const sliceChartViewportData = <TData>(
  data: readonly TData[],
  window: ResolvedChartViewportWindow
) => data.slice(window.startIndex, window.endIndex);

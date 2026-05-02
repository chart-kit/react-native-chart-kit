import type { ChartXValue } from "../data";

export type ChartViewportInitialIndex = "start" | "end" | number;
export type ChartViewportPresetName =
  | "1D"
  | "1W"
  | "1M"
  | "3M"
  | "6M"
  | "YTD"
  | "1Y"
  | "ALL";

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

export type ResolveChartViewportPresetWindowOptions = {
  preset: ChartViewportPresetName;
  xValues: readonly ChartXValue[];
};

export type ResolveChartViewportWindowFromPositionOptions = {
  itemCount: number;
  locationX: number;
  plotWidth: number;
  plotX: number;
  visibleCount: number;
};

const minVisiblePoints = 2;
const millisecondsInOneDay = 24 * 60 * 60 * 1000;

const presetDayCounts: Partial<Record<ChartViewportPresetName, number>> = {
  "1D": 1,
  "1W": 7,
  "1M": 30,
  "3M": 90,
  "6M": 180,
  "1Y": 365
};

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

export const resolveChartViewportWindowFromPosition = ({
  itemCount,
  locationX,
  plotWidth,
  plotX,
  visibleCount
}: ResolveChartViewportWindowFromPositionOptions): ResolvedChartViewportWindow => {
  const safeItemCount = normalizePositiveInteger(itemCount, 0, 0);

  if (safeItemCount === 0) {
    return resolveChartViewportWindow({ itemCount: safeItemCount });
  }

  const safeVisibleCount = clamp(
    normalizePositiveInteger(visibleCount, safeItemCount),
    minVisiblePoints,
    safeItemCount
  );

  if (safeVisibleCount >= safeItemCount) {
    return resolveChartViewportWindow({ itemCount: safeItemCount });
  }

  const safePlotWidth =
    Number.isFinite(plotWidth) && plotWidth > 0 ? plotWidth : 1;
  const normalizedPosition = clamp((locationX - plotX) / safePlotWidth, 0, 1);
  const centerIndex = Math.round(normalizedPosition * (safeItemCount - 1));
  const startIndex = clamp(
    centerIndex - Math.floor(safeVisibleCount / 2),
    0,
    safeItemCount - safeVisibleCount
  );

  return resolveChartViewportWindow({
    itemCount: safeItemCount,
    startIndex,
    endIndex: startIndex + safeVisibleCount
  });
};

const isFiniteDate = (value: ChartXValue): value is Date =>
  value instanceof Date && Number.isFinite(value.valueOf());

const getPresetPointFallback = (
  preset: ChartViewportPresetName,
  itemCount: number
) => {
  if (preset === "ALL") {
    return itemCount;
  }

  if (preset === "YTD") {
    return Math.min(itemCount, 252);
  }

  return Math.min(itemCount, presetDayCounts[preset] ?? itemCount);
};

const getStartDateForPreset = (
  preset: ChartViewportPresetName,
  lastDate: Date
) => {
  if (preset === "ALL") {
    return undefined;
  }

  if (preset === "YTD") {
    return new Date(lastDate.getFullYear(), 0, 1);
  }

  const days = presetDayCounts[preset];

  if (days === undefined) {
    return undefined;
  }

  return new Date(lastDate.valueOf() - days * millisecondsInOneDay);
};

export const resolveChartViewportPresetWindow = ({
  preset,
  xValues
}: ResolveChartViewportPresetWindowOptions): ResolvedChartViewportWindow => {
  const itemCount = xValues.length;

  if (preset === "ALL") {
    return resolveChartViewportWindow({ itemCount });
  }

  const lastValue = xValues[itemCount - 1];

  if (lastValue && isFiniteDate(lastValue)) {
    const startDate = getStartDateForPreset(preset, lastValue);

    if (startDate) {
      const startIndex = xValues.findIndex(
        (value) => isFiniteDate(value) && value.valueOf() >= startDate.valueOf()
      );

      return resolveChartViewportWindow({
        itemCount,
        startIndex: startIndex >= 0 ? startIndex : itemCount - 1,
        endIndex: itemCount
      });
    }
  }

  return resolveChartViewportWindow({
    itemCount,
    visiblePoints: getPresetPointFallback(preset, itemCount),
    initialIndex: "end"
  });
};

import {
  resolveChartViewportWindow,
  type ResolvedChartViewportWindow
} from "./viewport";

export type ResolveChartViewportWindowFromZoomOptions = {
  anchorIndex?: number | undefined;
  currentWindow: ResolvedChartViewportWindow;
  itemCount: number;
  maxVisibleCount?: number | undefined;
  minVisibleCount?: number | undefined;
  zoomFactor: number;
};

export type ResolveChartViewportWindowFromPanDeltaOptions = {
  currentWindow: ResolvedChartViewportWindow;
  deltaPoints: number;
  itemCount: number;
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

export const resolveChartViewportWindowFromZoom = ({
  anchorIndex,
  currentWindow,
  itemCount,
  maxVisibleCount,
  minVisibleCount,
  zoomFactor
}: ResolveChartViewportWindowFromZoomOptions): ResolvedChartViewportWindow => {
  const safeItemCount = normalizePositiveInteger(itemCount, 0, 0);

  if (safeItemCount === 0) {
    return resolveChartViewportWindow({ itemCount: safeItemCount });
  }

  const normalizedCurrentWindow = resolveChartViewportWindow({
    itemCount: safeItemCount,
    startIndex: currentWindow.startIndex,
    endIndex: currentWindow.endIndex
  });
  const normalizedMinVisibleCount = clamp(
    normalizePositiveInteger(minVisibleCount, minVisiblePoints),
    minVisiblePoints,
    safeItemCount
  );
  const normalizedMaxVisibleCount = clamp(
    normalizePositiveInteger(maxVisibleCount, safeItemCount),
    normalizedMinVisibleCount,
    safeItemCount
  );
  const safeZoomFactor =
    typeof zoomFactor === "number" && Number.isFinite(zoomFactor)
      ? Math.max(0.01, zoomFactor)
      : 1;
  const nextVisibleCount = clamp(
    Math.round(normalizedCurrentWindow.visibleCount / safeZoomFactor),
    normalizedMinVisibleCount,
    normalizedMaxVisibleCount
  );

  if (nextVisibleCount >= safeItemCount) {
    return resolveChartViewportWindow({ itemCount: safeItemCount });
  }

  const currentSpan = Math.max(1, normalizedCurrentWindow.visibleCount - 1);
  const fallbackAnchor =
    normalizedCurrentWindow.startIndex +
    (normalizedCurrentWindow.visibleCount - 1) / 2;
  const resolvedAnchor = clamp(
    typeof anchorIndex === "number" && Number.isFinite(anchorIndex)
      ? anchorIndex
      : fallbackAnchor,
    normalizedCurrentWindow.startIndex,
    normalizedCurrentWindow.endIndex - 1
  );
  const anchorRatio = clamp(
    (resolvedAnchor - normalizedCurrentWindow.startIndex) / currentSpan,
    0,
    1
  );
  const startIndex = clamp(
    Math.round(resolvedAnchor - (nextVisibleCount - 1) * anchorRatio),
    0,
    safeItemCount - nextVisibleCount
  );

  return resolveChartViewportWindow({
    itemCount: safeItemCount,
    startIndex,
    endIndex: startIndex + nextVisibleCount
  });
};

export const resolveChartViewportWindowFromPanDelta = ({
  currentWindow,
  deltaPoints,
  itemCount
}: ResolveChartViewportWindowFromPanDeltaOptions): ResolvedChartViewportWindow => {
  const safeItemCount = normalizePositiveInteger(itemCount, 0, 0);

  if (safeItemCount === 0) {
    return resolveChartViewportWindow({ itemCount: safeItemCount });
  }

  const normalizedCurrentWindow = resolveChartViewportWindow({
    itemCount: safeItemCount,
    startIndex: currentWindow.startIndex,
    endIndex: currentWindow.endIndex
  });

  if (normalizedCurrentWindow.visibleCount >= safeItemCount) {
    return normalizedCurrentWindow;
  }

  const delta =
    typeof deltaPoints === "number" && Number.isFinite(deltaPoints)
      ? Math.round(deltaPoints)
      : 0;
  const startIndex = clamp(
    normalizedCurrentWindow.startIndex + delta,
    0,
    safeItemCount - normalizedCurrentWindow.visibleCount
  );

  return resolveChartViewportWindow({
    itemCount: safeItemCount,
    startIndex,
    endIndex: startIndex + normalizedCurrentWindow.visibleCount
  });
};

import type { ChartBoxes, Padding, Rect, Size } from "./types";

export const normalizePadding = (padding: Partial<Padding> = {}): Padding => ({
  top: padding.top ?? 0,
  right: padding.right ?? 0,
  bottom: padding.bottom ?? 0,
  left: padding.left ?? 0
});

export const createRect = (
  x: number,
  y: number,
  width: number,
  height: number
): Rect => ({
  x,
  y,
  width: Math.max(0, width),
  height: Math.max(0, height)
});

export const solveChartBoxes = (
  size: Size,
  padding: Partial<Padding> = {}
): ChartBoxes => {
  const normalizedPadding = normalizePadding(padding);
  const outer = createRect(0, 0, size.width, size.height);
  const plot = createRect(
    normalizedPadding.left,
    normalizedPadding.top,
    size.width - normalizedPadding.left - normalizedPadding.right,
    size.height - normalizedPadding.top - normalizedPadding.bottom
  );

  return {
    outer,
    plot,
    padding: normalizedPadding
  };
};

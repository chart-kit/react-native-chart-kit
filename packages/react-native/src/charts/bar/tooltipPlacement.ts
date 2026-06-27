import type { BarChartTooltipModel } from "./tooltip";

export const offsetBarChartTooltipForViewport = <TData>({
  leftInset,
  rightInset = 4,
  tooltip,
  viewportOffsetX,
  viewportWidth
}: {
  leftInset: number;
  rightInset?: number;
  tooltip: BarChartTooltipModel<TData>;
  viewportOffsetX: number;
  viewportWidth: number;
}): BarChartTooltipModel<TData> => {
  const minX = Math.max(0, leftInset);
  const maxX = Math.max(minX, viewportWidth - tooltip.width - rightInset);
  const viewportX = tooltip.x - viewportOffsetX;

  return {
    ...tooltip,
    x: Math.max(minX, Math.min(maxX, viewportX))
  };
};

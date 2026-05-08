import type { BarChartBarModel, ResolvedBarChartTooltipConfig } from "./types";

export type BarChartTooltipModel<TData = unknown> = {
  bar: BarChartBarModel<TData>;
  height: number;
  width: number;
  x: number;
  y: number;
};

export type BarChartTooltipPointer = {
  key: string;
  x: number;
  y: number;
};

const tooltipLineHeight = 18;

const clamp = (value: number, min: number, max: number) => {
  if (max < min) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
};

export const getBarChartTooltipModel = <TData>({
  bar,
  boxes,
  config,
  pointer
}: {
  bar: BarChartBarModel<TData> | undefined;
  boxes: {
    outer: { x: number; y: number; width: number; height: number };
    plot: { x: number; y: number; width: number; height: number };
  };
  config: ResolvedBarChartTooltipConfig;
  pointer?: BarChartTooltipPointer | undefined;
}): BarChartTooltipModel<TData> | undefined => {
  if (!bar || !config.visible) {
    return undefined;
  }

  const height =
    config.padding * 2 + config.labelFontSize + tooltipLineHeight + 2;
  const pointerAnchor =
    config.anchor === "pointer" && pointer?.key === bar.key
      ? pointer
      : undefined;
  const anchorX = pointerAnchor?.x ?? bar.x + bar.width / 2;
  const anchorY = pointerAnchor?.y ?? bar.y;
  const belowAnchorY = pointerAnchor?.y ?? bar.y + bar.height;
  const minX = boxes.plot.x + config.edgePadding;
  const maxX =
    boxes.plot.x + boxes.plot.width - config.width - config.edgePadding;
  const x = clamp(anchorX - config.width / 2, minX, maxX);
  const minY = boxes.outer.y + config.edgePadding;
  const maxY = boxes.outer.y + boxes.outer.height - height - config.edgePadding;
  const aboveY = anchorY - height - config.offset;
  const belowY = belowAnchorY + config.offset;
  const y =
    config.placement === "above"
      ? clamp(aboveY, minY, maxY)
      : config.placement === "below"
        ? clamp(belowY, minY, maxY)
        : aboveY >= minY
          ? aboveY
          : clamp(belowY, minY, maxY);

  return {
    bar,
    height,
    width: config.width,
    x,
    y
  };
};

import type { LineChartInteractionBounds } from "./interaction";

export type LineChartOutsidePressSurface = {
  height: number;
  key: "top" | "left" | "right" | "bottom";
  left: number;
  top: number;
  width: number;
};

export const getLineChartOutsidePressSurfaces = ({
  enabled,
  mainHeight,
  visibleInteractionBounds,
  width
}: {
  enabled: boolean;
  mainHeight: number;
  visibleInteractionBounds: LineChartInteractionBounds;
  width: number;
}): LineChartOutsidePressSurface[] => {
  if (!enabled) {
    return [];
  }

  const surfaces: LineChartOutsidePressSurface[] = [
    {
      key: "top",
      height: visibleInteractionBounds.y,
      left: 0,
      top: 0,
      width
    },
    {
      key: "left",
      height: visibleInteractionBounds.height,
      left: 0,
      top: visibleInteractionBounds.y,
      width: visibleInteractionBounds.x
    },
    {
      key: "right",
      height: visibleInteractionBounds.height,
      left: visibleInteractionBounds.x + visibleInteractionBounds.width,
      top: visibleInteractionBounds.y,
      width:
        width - (visibleInteractionBounds.x + visibleInteractionBounds.width)
    },
    {
      key: "bottom",
      height:
        mainHeight -
        (visibleInteractionBounds.y + visibleInteractionBounds.height),
      left: 0,
      top: visibleInteractionBounds.y + visibleInteractionBounds.height,
      width
    }
  ];

  return surfaces.filter((surface) => surface.width > 0 && surface.height > 0);
};

import type { SvgHitRegionProps, SvgRectProps } from "./types";

export const createSvgHitRegionProps = ({
  disabled = false,
  fill = "#000",
  fillOpacity = 0.001,
  pointerEvents,
  ...props
}: SvgHitRegionProps): SvgRectProps => ({
  ...props,
  fill,
  fillOpacity,
  pointerEvents: pointerEvents ?? (disabled ? "none" : "auto")
});

import type { SvgClipPolicy, SvgClipPolicyInput, SvgSpacing } from "./types";

export const createClipPathRef = (id: string): string => `url(#${id})`;

const resolveSpacing = (spacing: SvgSpacing | undefined) => {
  if (typeof spacing === "number") {
    return {
      bottom: spacing,
      left: spacing,
      right: spacing,
      top: spacing
    };
  }

  return {
    bottom: spacing?.bottom ?? 0,
    left: spacing?.left ?? 0,
    right: spacing?.right ?? 0,
    top: spacing?.top ?? 0
  };
};

export const resolveSvgClipPolicy = ({
  enabled = true,
  id,
  inset,
  x,
  y,
  width,
  height
}: SvgClipPolicyInput): SvgClipPolicy => {
  if (!enabled) {
    return { enabled: false };
  }

  const spacing = resolveSpacing(inset);
  const clipRect = {
    height: Math.max(0, height - spacing.top - spacing.bottom),
    id,
    width: Math.max(0, width - spacing.left - spacing.right),
    x: x + spacing.left,
    y: y + spacing.top
  };

  return {
    clipPath: createClipPathRef(id),
    clipRect,
    enabled: true
  };
};

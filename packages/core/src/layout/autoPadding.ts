import { normalizePadding } from "./chartBox";
import type { AutoPaddingOptions, Padding, Size } from "./types";

const maxWidth = (sizes: Size[] = []): number => {
  return sizes.reduce((max, size) => Math.max(max, size.width), 0);
};

const maxHeight = (sizes: Size[] = []): number => {
  return sizes.reduce((max, size) => Math.max(max, size.height), 0);
};

export const calculateAutoPadding = ({
  base = {},
  leftLabels = [],
  rightLabels = [],
  topLabels = [],
  bottomLabels = [],
  legend,
  gap = 8
}: AutoPaddingOptions): Padding => {
  const padding = normalizePadding(base);
  const leftLabelWidth = maxWidth(leftLabels);
  const rightLabelWidth = maxWidth(rightLabels);
  const topLabelHeight = maxHeight(topLabels);
  const bottomLabelHeight = maxHeight(bottomLabels);

  padding.left += leftLabelWidth > 0 ? leftLabelWidth + gap : 0;
  padding.right += rightLabelWidth > 0 ? rightLabelWidth + gap : 0;
  padding.top += topLabelHeight > 0 ? topLabelHeight + gap : 0;
  padding.bottom += bottomLabelHeight > 0 ? bottomLabelHeight + gap : 0;

  if (legend) {
    if (legend.position === "top") {
      padding.top += legend.height + gap;
    } else if (legend.position === "bottom") {
      padding.bottom += legend.height + gap;
    } else if (legend.position === "left") {
      padding.left += legend.width + gap;
    } else {
      padding.right += legend.width + gap;
    }
  }

  return padding;
};

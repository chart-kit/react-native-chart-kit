type AxisLabelSize = {
  width: number;
  height: number;
};

export const resolveLineChartYAxisLabelSizes = ({
  sizes,
  width
}: {
  sizes: AxisLabelSize[];
  width?: number | undefined;
}) => {
  if (typeof width !== "number" || !Number.isFinite(width)) {
    return sizes;
  }

  const fixedWidth = Math.max(0, width);

  return sizes.map((size) => ({
    ...size,
    width: fixedWidth
  }));
};

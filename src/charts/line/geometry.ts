import type { Dataset } from "../../shared/types";

export const getLegacyLineChartXMax = (data: Dataset[]) =>
  data.reduce(
    (maxLength, dataset) => Math.max(maxLength, dataset.data.length),
    1
  );

export const getLegacyLineChartPointX = ({
  index,
  width,
  paddingRight,
  xMax
}: {
  index: number;
  width: number;
  paddingRight: number;
  xMax: number;
}) => paddingRight + (index * (width - paddingRight)) / Math.max(xMax, 1);

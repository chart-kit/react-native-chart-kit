import type { CombinedChartAxisId } from "./types";

export const getFormattedCombinedSeriesValue = ({
  axisId,
  formatLeftYLabel,
  formatRightYLabel,
  value
}: {
  axisId: CombinedChartAxisId;
  formatLeftYLabel: (value: number) => string;
  formatRightYLabel: (value: number) => string;
  value: number | null | undefined;
}) => {
  if (typeof value !== "number") {
    return "No data";
  }

  return axisId === "right"
    ? formatRightYLabel(value)
    : formatLeftYLabel(value);
};

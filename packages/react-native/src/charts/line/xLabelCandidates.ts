import type {
  ChartXValue,
  NormalizedSeries,
  ProjectScale,
  Size
} from "@chart-kit/core";

import type { LineChartLabelStrategy } from "./types";
import { dedupeXLabelCandidates, type XLabelCandidate } from "./xLabels";

export const buildXLabelCandidates = <TData>({
  dataIndexOffset,
  labelStrategy,
  series,
  xLabelSizes,
  xLabelTexts,
  xScale,
  xValues
}: {
  dataIndexOffset: number;
  labelStrategy: LineChartLabelStrategy;
  series: NormalizedSeries<TData> | undefined;
  xLabelSizes: Size[];
  xLabelTexts: string[];
  xScale: ProjectScale<TData>;
  xValues: ChartXValue[];
}): XLabelCandidate[] => {
  const candidates = xValues.flatMap((value, index) => {
    const point = series?.points[index];
    const x = point ? xScale(value, point) : undefined;
    const text = xLabelTexts[index];
    const size = xLabelSizes[index];

    if (x === undefined || text === undefined || size === undefined) {
      return [];
    }

    return [
      {
        index: index + dataIndexOffset,
        value,
        text,
        x,
        size
      }
    ];
  });
  const shouldDedupeLabels =
    labelStrategy === "auto" || labelStrategy === "skip";

  return shouldDedupeLabels ? dedupeXLabelCandidates(candidates) : candidates;
};

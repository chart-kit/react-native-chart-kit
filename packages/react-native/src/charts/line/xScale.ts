import {
  createLinearScale,
  createPointScale,
  createTimeScale,
  type ChartBoxes,
  type ChartXValue,
  type ProjectScale
} from "@chart-kit/core";

import { getXKey, getXScaleType, unique } from "./utils";

export const buildLineChartXScale = <TData>({
  boxes,
  xValues
}: {
  boxes: ChartBoxes;
  xValues: ChartXValue[];
}): ProjectScale<TData> => {
  const range: [number, number] = [
    boxes.plot.x,
    boxes.plot.x + boxes.plot.width
  ];
  const xScaleType = getXScaleType(xValues);

  if (xScaleType === "time") {
    const dates = xValues.filter(
      (value): value is Date => value instanceof Date
    );
    const scale = createTimeScale({ values: dates, range });

    return (value) => (value instanceof Date ? scale.scale(value) : undefined);
  }

  if (xScaleType === "linear") {
    const numbers = xValues.filter(
      (value): value is number => typeof value === "number"
    );
    const scale = createLinearScale({ values: numbers, range });

    return (value) =>
      typeof value === "number" ? scale.scale(value) : undefined;
  }

  const domain = unique(xValues.map(getXKey));
  const scale = createPointScale<ReturnType<typeof getXKey>>({
    domain,
    range
  });

  return (value) => scale.scale(getXKey(value));
};

import type { BandScale, PointScale } from "./types";

export type CreateBandScaleOptions<TValue extends string | number> = {
  domain: TValue[];
  range: [number, number];
  paddingInner?: number;
  paddingOuter?: number;
};

export type CreatePointScaleOptions<TValue extends string | number> = {
  domain: TValue[];
  range: [number, number];
  padding?: number;
};

export const createBandScale = <TValue extends string | number>({
  domain,
  range,
  paddingInner = 0,
  paddingOuter = 0
}: CreateBandScaleOptions<TValue>): BandScale<TValue> => {
  const count = domain.length;
  const rangeSpan = range[1] - range[0];
  const denominator = Math.max(1, count - paddingInner + paddingOuter * 2);
  const step = count === 0 ? 0 : rangeSpan / denominator;
  const bandwidth = step * Math.max(0, 1 - paddingInner);
  const positions = new Map<TValue, number>();

  domain.forEach((value, index) => {
    positions.set(value, range[0] + step * (paddingOuter + index));
  });

  return {
    domain,
    range,
    bandwidth,
    step,
    scale: (value: TValue) => positions.get(value)
  };
};

export const createPointScale = <TValue extends string | number>({
  domain,
  range,
  padding = 0
}: CreatePointScaleOptions<TValue>): PointScale<TValue> => {
  const count = domain.length;
  const rangeSpan = range[1] - range[0];
  const step =
    count <= 1 ? 0 : rangeSpan / Math.max(1, count - 1 + padding * 2);
  const offset = count <= 1 ? rangeSpan / 2 : step * padding;
  const positions = new Map<TValue, number>();

  domain.forEach((value, index) => {
    positions.set(value, range[0] + offset + step * index);
  });

  return {
    domain,
    range,
    step,
    scale: (value: TValue) => positions.get(value)
  };
};

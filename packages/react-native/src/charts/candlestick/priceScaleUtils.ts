export type CandlestickPriceDomain = readonly [number, number];

export const defaultCandlestickPriceScaleMin = 0.72;
export const defaultCandlestickPriceScaleMax = 2.1;
export const defaultCandlestickPriceScaleSensitivity = 190;
export const defaultCandlestickPriceScaleTickCount = 6;

const isFiniteNumber = (value: number) => Number.isFinite(value);

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const normalizeDomain = (domain: CandlestickPriceDomain): [number, number] => {
  const [rawMin, rawMax] = domain;
  const min = isFiniteNumber(rawMin) ? rawMin : 0;
  const max = isFiniteNumber(rawMax) ? rawMax : min + 1;

  return max > min ? [min, max] : [min - 0.5, min + 0.5];
};

const normalizeScaleBounds = ({
  maxScale,
  minScale
}: {
  maxScale?: number | undefined;
  minScale?: number | undefined;
}) => {
  const min = isFiniteNumber(minScale ?? Number.NaN)
    ? Math.max(0.1, minScale as number)
    : 0.1;
  const max = isFiniteNumber(maxScale ?? Number.NaN)
    ? Math.max(min, maxScale as number)
    : min;

  return { max, min };
};

export const getCandlestickPriceScaleDomain = ({
  baseDomain,
  maxScale = defaultCandlestickPriceScaleMax,
  minScale = defaultCandlestickPriceScaleMin,
  scale
}: {
  baseDomain: CandlestickPriceDomain;
  maxScale?: number | undefined;
  minScale?: number | undefined;
  scale: number;
}): [number, number] => {
  const [min, max] = normalizeDomain(baseDomain);
  const center = (min + max) / 2;
  const { max: resolvedMax, min: resolvedMin } = normalizeScaleBounds({
    maxScale,
    minScale
  });
  const resolvedScale = clamp(
    isFiniteNumber(scale) ? scale : 1,
    resolvedMin,
    resolvedMax
  );
  const span = (max - min) / resolvedScale;

  return [center - span / 2, center + span / 2];
};

export const getCandlestickPriceScaleTicks = ({
  domain,
  tickCount = defaultCandlestickPriceScaleTickCount
}: {
  domain: CandlestickPriceDomain;
  tickCount?: number;
}) => {
  const [min, max] = normalizeDomain(domain);
  const count = Math.max(2, Math.round(tickCount));
  const steps = count - 1;

  return Array.from({ length: count }, (_, index) => {
    const ratio = index / steps;

    return max - (max - min) * ratio;
  });
};

export const getCandlestickPriceScaleFromDrag = ({
  maxScale = defaultCandlestickPriceScaleMax,
  minScale = defaultCandlestickPriceScaleMin,
  sensitivity = defaultCandlestickPriceScaleSensitivity,
  startScale,
  translationY
}: {
  maxScale?: number | undefined;
  minScale?: number | undefined;
  sensitivity?: number;
  startScale: number;
  translationY: number;
}) => {
  const { max, min } = normalizeScaleBounds({ maxScale, minScale });
  const resolvedSensitivity =
    isFiniteNumber(sensitivity) && sensitivity > 0
      ? sensitivity
      : defaultCandlestickPriceScaleSensitivity;

  return clamp(
    startScale * Math.exp(-translationY / resolvedSensitivity),
    min,
    max
  );
};

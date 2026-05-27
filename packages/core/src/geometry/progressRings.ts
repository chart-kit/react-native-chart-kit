import type { NormalizedProgressRing } from "../data";

export type ProgressRingPoint = {
  x: number;
  y: number;
};

export type ProgressRingModel = {
  index: number;
  label?: string;
  value: number | null;
  clampedValue: number;
  defined: boolean;
  color?: string;
  radius: number;
  strokeWidth: number;
  startAngle: number;
  endAngle: number;
  backgroundPath: string;
  path: string;
};

export type BuildProgressRingsOptions = {
  rings: NormalizedProgressRing[];
  centerX: number;
  centerY: number;
  maxRadius: number;
  strokeWidth: number;
  ringGap?: number | undefined;
  startAngle?: number | undefined;
};

const fullCircle = Math.PI * 2;
const defaultStartAngle = -Math.PI / 2;

const clamp = (value: number, min: number, max: number) => {
  if (max < min) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
};

const formatNumber = (value: number) =>
  Number.isInteger(value) ? String(value) : Number(value.toFixed(4)).toString();

const polarToCartesian = ({
  angle,
  centerX,
  centerY,
  radius
}: {
  angle: number;
  centerX: number;
  centerY: number;
  radius: number;
}): ProgressRingPoint => ({
  x: centerX + radius * Math.cos(angle),
  y: centerY + radius * Math.sin(angle)
});

const moveTo = (point: ProgressRingPoint) =>
  `M ${formatNumber(point.x)} ${formatNumber(point.y)}`;

const arcTo = ({
  end,
  largeArc,
  radius,
  sweep
}: {
  end: ProgressRingPoint;
  largeArc: 0 | 1;
  radius: number;
  sweep: 0 | 1;
}) =>
  `A ${formatNumber(radius)} ${formatNumber(radius)} 0 ${largeArc} ${sweep} ${formatNumber(
    end.x
  )} ${formatNumber(end.y)}`;

const buildArcStrokePath = ({
  centerX,
  centerY,
  endAngle,
  radius,
  startAngle
}: {
  centerX: number;
  centerY: number;
  endAngle: number;
  radius: number;
  startAngle: number;
}) => {
  const span = Math.max(0, endAngle - startAngle);

  if (radius <= 0 || span <= 0) {
    return "";
  }

  const isFullCircle = span >= fullCircle - 0.0001;
  const start = polarToCartesian({
    angle: startAngle,
    centerX,
    centerY,
    radius
  });
  const mid = polarToCartesian({
    angle: startAngle + Math.PI,
    centerX,
    centerY,
    radius
  });
  const end = polarToCartesian({
    angle: isFullCircle ? startAngle + fullCircle : endAngle,
    centerX,
    centerY,
    radius
  });

  if (isFullCircle) {
    return [
      moveTo(start),
      arcTo({ end: mid, largeArc: 1, radius, sweep: 1 }),
      arcTo({ end: start, largeArc: 1, radius, sweep: 1 })
    ].join(" ");
  }

  return [
    moveTo(start),
    arcTo({
      end,
      largeArc: span > Math.PI ? 1 : 0,
      radius,
      sweep: 1
    })
  ].join(" ");
};

export const buildProgressRings = ({
  rings,
  centerX,
  centerY,
  maxRadius,
  strokeWidth,
  ringGap = 8,
  startAngle = defaultStartAngle
}: BuildProgressRingsOptions): ProgressRingModel[] => {
  const safeMaxRadius =
    Number.isFinite(maxRadius) && maxRadius > 0 ? maxRadius : 0;
  const safeStrokeWidth =
    Number.isFinite(strokeWidth) && strokeWidth > 0 ? strokeWidth : 0;
  const safeRingGap = Number.isFinite(ringGap) && ringGap > 0 ? ringGap : 0;
  const safeStartAngle = Number.isFinite(startAngle)
    ? startAngle
    : defaultStartAngle;

  return rings.map<ProgressRingModel>((ring, index) => {
    const radius = Math.max(
      0,
      safeMaxRadius - index * (safeStrokeWidth + safeRingGap)
    );
    const value = ring.defined ? ring.value : null;
    const clampedValue =
      value !== null && Number.isFinite(value) ? clamp(value, 0, 1) : 0;
    const endAngle = safeStartAngle + fullCircle * clampedValue;
    const backgroundPath = buildArcStrokePath({
      centerX,
      centerY,
      endAngle: safeStartAngle + fullCircle,
      radius,
      startAngle: safeStartAngle
    });
    const path = buildArcStrokePath({
      centerX,
      centerY,
      endAngle,
      radius,
      startAngle: safeStartAngle
    });
    const defined =
      ring.defined && safeStrokeWidth > 0 && radius > 0 && path.length > 0;
    const model: ProgressRingModel = {
      index: ring.index,
      value,
      clampedValue,
      defined,
      radius,
      strokeWidth: safeStrokeWidth,
      startAngle: safeStartAngle,
      endAngle,
      backgroundPath,
      path
    };

    if (ring.label !== undefined) {
      model.label = ring.label;
    }

    if (ring.color !== undefined) {
      model.color = ring.color;
    }

    return model;
  });
};

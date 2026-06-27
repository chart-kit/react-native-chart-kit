import type { NormalizedPieSlice } from "../data";

export type PieArcPoint = {
  x: number;
  y: number;
};

export type PieArcModel<TData = unknown> = {
  index: number;
  label: string;
  value: number | null;
  percentage: number;
  startAngle: number;
  endAngle: number;
  color?: string;
  centroid: PieArcPoint;
  defined: boolean;
  path: string;
  raw?: TData;
};

export type BuildPieArcsOptions<TData = unknown> = {
  slices: Array<NormalizedPieSlice<TData>>;
  centerX: number;
  centerY: number;
  radius: number;
  innerRadius?: number | undefined;
  startAngle?: number | undefined;
  endAngle?: number | undefined;
};

const fullCircle = Math.PI * 2;
const defaultStartAngle = -Math.PI / 2;

const clamp = (value: number, min: number, max: number) => {
  if (max < min) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
};

const isFinitePositive = (value: number) => Number.isFinite(value) && value > 0;

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
}): PieArcPoint => ({
  x: centerX + radius * Math.cos(angle),
  y: centerY + radius * Math.sin(angle)
});

const formatNumber = (value: number) =>
  Number.isInteger(value) ? String(value) : Number(value.toFixed(4)).toString();

const moveTo = (point: PieArcPoint) =>
  `M ${formatNumber(point.x)} ${formatNumber(point.y)}`;

const lineTo = (point: PieArcPoint) =>
  `L ${formatNumber(point.x)} ${formatNumber(point.y)}`;

const arcTo = ({
  end,
  largeArc,
  radius,
  sweep
}: {
  end: PieArcPoint;
  largeArc: 0 | 1;
  radius: number;
  sweep: 0 | 1;
}) =>
  `A ${formatNumber(radius)} ${formatNumber(radius)} 0 ${largeArc} ${sweep} ${formatNumber(
    end.x
  )} ${formatNumber(end.y)}`;

const getArcPath = ({
  centerX,
  centerY,
  endAngle,
  innerRadius,
  radius,
  startAngle
}: {
  centerX: number;
  centerY: number;
  endAngle: number;
  innerRadius: number;
  radius: number;
  startAngle: number;
}) => {
  const span = Math.max(0, endAngle - startAngle);
  const isFullCircle = span >= fullCircle - 0.0001;
  const outerStart = polarToCartesian({
    angle: startAngle,
    centerX,
    centerY,
    radius
  });
  const outerEnd = polarToCartesian({
    angle: isFullCircle ? startAngle + Math.PI : endAngle,
    centerX,
    centerY,
    radius
  });
  const largeArc: 0 | 1 = span > Math.PI ? 1 : 0;

  if (innerRadius <= 0) {
    const center = { x: centerX, y: centerY };

    if (isFullCircle) {
      return [
        moveTo(center),
        lineTo(outerStart),
        arcTo({ end: outerEnd, largeArc: 1, radius, sweep: 1 }),
        arcTo({ end: outerStart, largeArc: 1, radius, sweep: 1 }),
        "Z"
      ].join(" ");
    }

    return [
      moveTo(center),
      lineTo(outerStart),
      arcTo({
        end: outerEnd,
        largeArc,
        radius,
        sweep: 1
      }),
      "Z"
    ].join(" ");
  }

  const innerStart = polarToCartesian({
    angle: startAngle,
    centerX,
    centerY,
    radius: innerRadius
  });
  const innerEnd = polarToCartesian({
    angle: isFullCircle ? startAngle + Math.PI : endAngle,
    centerX,
    centerY,
    radius: innerRadius
  });

  if (isFullCircle) {
    return [
      moveTo(outerStart),
      arcTo({ end: outerEnd, largeArc: 1, radius, sweep: 1 }),
      arcTo({ end: outerStart, largeArc: 1, radius, sweep: 1 }),
      lineTo(innerStart),
      arcTo({ end: innerEnd, largeArc: 1, radius: innerRadius, sweep: 0 }),
      arcTo({ end: innerStart, largeArc: 1, radius: innerRadius, sweep: 0 }),
      "Z"
    ].join(" ");
  }

  return [
    moveTo(outerStart),
    arcTo({ end: outerEnd, largeArc, radius, sweep: 1 }),
    lineTo(innerEnd),
    arcTo({ end: innerStart, largeArc, radius: innerRadius, sweep: 0 }),
    "Z"
  ].join(" ");
};

export const buildPieArcs = <TData = unknown>({
  slices,
  centerX,
  centerY,
  radius,
  innerRadius = 0,
  startAngle = defaultStartAngle,
  endAngle = startAngle + fullCircle
}: BuildPieArcsOptions<TData>): Array<PieArcModel<TData>> => {
  const safeRadius = isFinitePositive(radius) ? radius : 0;
  const safeInnerRadius = clamp(
    Number.isFinite(innerRadius) ? innerRadius : 0,
    0,
    safeRadius
  );
  const safeStartAngle = Number.isFinite(startAngle)
    ? startAngle
    : defaultStartAngle;
  const safeEndAngle =
    Number.isFinite(endAngle) && endAngle > safeStartAngle
      ? endAngle
      : safeStartAngle + fullCircle;
  const total = slices.reduce(
    (sum, slice) =>
      slice.defined && isFinitePositive(slice.value ?? 0)
        ? sum + (slice.value ?? 0)
        : sum,
    0
  );
  let cursor = safeStartAngle;

  return slices.map<PieArcModel<TData>>((slice) => {
    const value =
      slice.defined && isFinitePositive(slice.value ?? 0)
        ? (slice.value ?? 0)
        : null;
    const percentage = total > 0 && value !== null ? value / total : 0;
    const span = (safeEndAngle - safeStartAngle) * percentage;
    const arcStartAngle = cursor;
    const arcEndAngle = cursor + span;
    const centroidAngle = arcStartAngle + span / 2;
    const centroidRadius = (safeInnerRadius + safeRadius) / 2;
    const centroid = polarToCartesian({
      angle: centroidAngle,
      centerX,
      centerY,
      radius: centroidRadius
    });
    const path =
      safeRadius > 0 && span > 0
        ? getArcPath({
            centerX,
            centerY,
            endAngle: arcEndAngle,
            innerRadius: safeInnerRadius,
            radius: safeRadius,
            startAngle: arcStartAngle
          })
        : "";

    cursor = arcEndAngle;

    return {
      index: slice.index,
      label: slice.label,
      value,
      percentage,
      startAngle: arcStartAngle,
      endAngle: arcEndAngle,
      ...(slice.color !== undefined ? { color: slice.color } : {}),
      centroid,
      defined: path.length > 0,
      path,
      raw: slice.raw
    };
  });
};

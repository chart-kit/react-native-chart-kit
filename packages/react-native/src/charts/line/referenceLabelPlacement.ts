import type { GeometryPoint, Rect } from "@chart-kit/core";

import type { LineChartReferenceLabelPlacement } from "./types";

const referenceLabelSeriesPadding = 10;
const referenceLabelSpacing = 3;

export type ReferenceCollisionGeometry = {
  line: {
    segments: Array<{
      points: GeometryPoint[];
    }>;
  };
};

type ResolvedReferenceLabelPlacement = Exclude<
  LineChartReferenceLabelPlacement,
  "auto"
>;

type ReferenceLabelBox = Rect;

type ReferenceLabelCandidate = {
  box: ReferenceLabelBox;
  score: number;
  y: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const estimateReferenceLabelWidth = (text: string, fontSize: number) =>
  Math.max(fontSize, text.length * fontSize * 0.56);

const getReferenceLabelBox = ({
  fontSize,
  text,
  textAnchor,
  x,
  y
}: {
  fontSize: number;
  text: string;
  textAnchor: "middle" | "start" | "end";
  x: number;
  y: number;
}) => {
  const width = estimateReferenceLabelWidth(text, fontSize);
  const left =
    textAnchor === "middle"
      ? x - width / 2
      : textAnchor === "end"
        ? x - width
        : x;

  return {
    x: left,
    y: y - fontSize,
    width,
    height: fontSize
  };
};

const expandBox = (box: ReferenceLabelBox, padding: number) => ({
  x: box.x - padding,
  y: box.y - padding,
  width: box.width + padding * 2,
  height: box.height + padding * 2
});

const containsPoint = (box: ReferenceLabelBox, point: GeometryPoint) =>
  point.x >= box.x &&
  point.x <= box.x + box.width &&
  point.y >= box.y &&
  point.y <= box.y + box.height;

const orientation = (
  a: Pick<GeometryPoint, "x" | "y">,
  b: Pick<GeometryPoint, "x" | "y">,
  c: Pick<GeometryPoint, "x" | "y">
) => (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);

const isBetween = (value: number, start: number, end: number) =>
  value >= Math.min(start, end) && value <= Math.max(start, end);

const segmentsIntersect = (
  a: Pick<GeometryPoint, "x" | "y">,
  b: Pick<GeometryPoint, "x" | "y">,
  c: Pick<GeometryPoint, "x" | "y">,
  d: Pick<GeometryPoint, "x" | "y">
) => {
  const first = orientation(a, b, c);
  const second = orientation(a, b, d);
  const third = orientation(c, d, a);
  const fourth = orientation(c, d, b);

  if (first === 0 && isBetween(c.x, a.x, b.x) && isBetween(c.y, a.y, b.y)) {
    return true;
  }

  if (second === 0 && isBetween(d.x, a.x, b.x) && isBetween(d.y, a.y, b.y)) {
    return true;
  }

  if (third === 0 && isBetween(a.x, c.x, d.x) && isBetween(a.y, c.y, d.y)) {
    return true;
  }

  if (fourth === 0 && isBetween(b.x, c.x, d.x) && isBetween(b.y, c.y, d.y)) {
    return true;
  }

  return first > 0 !== second > 0 && third > 0 !== fourth > 0;
};

const segmentIntersectsBox = (
  start: GeometryPoint,
  end: GeometryPoint,
  box: ReferenceLabelBox
) => {
  if (containsPoint(box, start) || containsPoint(box, end)) {
    return true;
  }

  const left = box.x;
  const right = box.x + box.width;
  const top = box.y;
  const bottom = box.y + box.height;
  const topLeft = { x: left, y: top };
  const topRight = { x: right, y: top };
  const bottomRight = { x: right, y: bottom };
  const bottomLeft = { x: left, y: bottom };

  return (
    segmentsIntersect(start, end, topLeft, topRight) ||
    segmentsIntersect(start, end, topRight, bottomRight) ||
    segmentsIntersect(start, end, bottomRight, bottomLeft) ||
    segmentsIntersect(start, end, bottomLeft, topLeft)
  );
};

const collidesWithSeries = (
  box: ReferenceLabelBox,
  geometries: ReferenceCollisionGeometry[] | undefined
) => {
  if (!geometries || geometries.length === 0) {
    return false;
  }

  const paddedBox = expandBox(box, referenceLabelSeriesPadding);

  return geometries.some((geometry) =>
    geometry.line.segments.some((segment) =>
      segment.points.some((point, index) => {
        const next = segment.points[index + 1];

        return next ? segmentIntersectsBox(point, next, paddedBox) : false;
      })
    )
  );
};

const getReferenceLabelCandidate = ({
  geometries,
  labelOffset,
  labelPlacement,
  lineY,
  plot,
  text,
  textAnchor,
  fontSize,
  x
}: {
  geometries: ReferenceCollisionGeometry[] | undefined;
  labelOffset: number;
  labelPlacement: ResolvedReferenceLabelPlacement;
  lineY: number;
  plot: Rect;
  text: string;
  textAnchor: "middle" | "start" | "end";
  fontSize: number;
  x: number;
}): ReferenceLabelCandidate => {
  const plotBottom = plot.y + plot.height;
  const desiredY =
    labelPlacement === "above"
      ? lineY - labelOffset
      : lineY + fontSize + labelOffset;
  const y = clamp(
    desiredY,
    plot.y + fontSize,
    plotBottom - referenceLabelSpacing
  );
  const box = getReferenceLabelBox({ fontSize, text, textAnchor, x, y });
  const overflow =
    Math.max(0, plot.y - box.y) + Math.max(0, box.y + box.height - plotBottom);
  const lineCollision =
    lineY >= box.y - referenceLabelSpacing &&
    lineY <= box.y + box.height + referenceLabelSpacing;
  const seriesCollision = collidesWithSeries(box, geometries);

  return {
    box,
    y,
    score:
      (labelPlacement === "below" ? 1 : 0) +
      overflow * 20 +
      (lineCollision ? 200 : 0) +
      (seriesCollision ? 100 : 0)
  };
};

export const resolveReferenceLineLabelY = ({
  geometries,
  labelOffset,
  labelPlacement,
  lineY,
  plot,
  text,
  textAnchor,
  fontSize,
  x
}: {
  geometries: ReferenceCollisionGeometry[] | undefined;
  labelOffset: number;
  labelPlacement: LineChartReferenceLabelPlacement | undefined;
  lineY: number;
  plot: Rect;
  text: string;
  textAnchor: "middle" | "start" | "end";
  fontSize: number;
  x: number;
}) => {
  const placements: ResolvedReferenceLabelPlacement[] =
    labelPlacement === "above" || labelPlacement === "below"
      ? [labelPlacement]
      : ["above", "below"];
  const candidates = placements.map((placement) =>
    getReferenceLabelCandidate({
      geometries,
      labelOffset,
      labelPlacement: placement,
      lineY,
      plot,
      text,
      textAnchor,
      fontSize,
      x
    })
  );

  return candidates.sort((a, b) => a.score - b.score)[0]?.y ?? lineY;
};

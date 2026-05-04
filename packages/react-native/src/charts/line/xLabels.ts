import {
  solveLabelCollision,
  type ChartXValue,
  type Size
} from "@chart-kit/core";

import type {
  LineChartEdgeLabelPolicy,
  LineChartLabelStrategy,
  LineChartResolvedLabelStrategy
} from "./types";
import { clamp } from "./utils";

export const defaultLabelRotation = -35;
export const xLabelRowGap = 6;
export const xLabelBaselineOffset = 20;
const rotatedLabelClearance = 10;

export type XLabelCandidate = {
  index: number;
  value: ChartXValue;
  text: string;
  x: number;
  size: Size;
};

export type XLabelLayoutItem = XLabelCandidate & {
  gridX: number;
  y: number;
  row: number;
  rotation: number;
  textAnchor: "start" | "middle" | "end";
};

export type XLabelLayout = {
  strategy: LineChartResolvedLabelStrategy;
  items: XLabelLayoutItem[];
  height: number;
  rotation: number;
  rows: number;
};

export const dedupeXLabelCandidates = (candidates: XLabelCandidate[]) => {
  const seen = new Set<string>();

  return candidates.filter((candidate) => {
    if (seen.has(candidate.text)) {
      return false;
    }

    seen.add(candidate.text);
    return true;
  });
};

export const getMaxSize = (sizes: Size[]) => {
  return sizes.reduce(
    (max, size) => ({
      width: Math.max(max.width, size.width),
      height: Math.max(max.height, size.height)
    }),
    { width: 0, height: 0 }
  );
};

const getRotatedLabelHeight = (sizes: Size[], rotation: number) => {
  const maxSize = getMaxSize(sizes);
  const radians = (Math.abs(rotation) * Math.PI) / 180;

  return (
    maxSize.width * Math.sin(radians) +
    maxSize.height * Math.cos(radians) +
    rotatedLabelClearance
  );
};

const getXLabelHeight = ({
  strategy,
  sizes,
  rotation,
  rows
}: {
  strategy: LineChartResolvedLabelStrategy;
  sizes: Size[];
  rotation: number;
  rows: number;
}) => {
  if (strategy === "hide" || sizes.length === 0) {
    return 0;
  }

  if (strategy === "rotate") {
    return getRotatedLabelHeight(sizes, rotation);
  }

  const maxHeight = getMaxSize(sizes).height;

  if (strategy === "stagger") {
    return maxHeight * rows + xLabelRowGap * Math.max(0, rows - 1);
  }

  return maxHeight;
};

const getExplicitXLabelCollision = ({
  labels,
  strategy,
  availableWidth,
  minGap,
  rotation
}: {
  labels: Array<{
    id: string;
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  strategy: Exclude<LineChartLabelStrategy, "auto">;
  availableWidth: number;
  minGap: number;
  rotation: number;
}) => {
  const allIndexes = labels.map((_, index) => index);

  if (strategy === "hide") {
    return {
      strategy,
      visibleIndexes: [],
      rotation: 0,
      rows: 0
    };
  }

  if (strategy === "skip") {
    const result = solveLabelCollision({
      labels,
      availableWidth,
      allowRotate: false,
      allowStagger: false,
      minGap
    });

    return {
      strategy: result.strategy === "hide" ? "hide" : result.strategy,
      visibleIndexes: result.visibleIndexes,
      rotation: 0,
      rows: 1
    };
  }

  return {
    strategy,
    visibleIndexes: allIndexes,
    rotation: strategy === "rotate" ? rotation : 0,
    rows: strategy === "stagger" ? 2 : 1
  };
};

const getShiftedXLabel = ({
  candidate,
  chartWidth,
  edgeLabelPolicy,
  rotation,
  textAnchor
}: {
  candidate: XLabelCandidate;
  chartWidth: number;
  edgeLabelPolicy: LineChartEdgeLabelPolicy;
  rotation: number;
  textAnchor: XLabelLayoutItem["textAnchor"];
}) => {
  if (edgeLabelPolicy === "show") {
    return candidate.x;
  }

  const margin = 4;
  const width =
    rotation === 0
      ? candidate.size.width
      : candidate.size.width * Math.cos((Math.abs(rotation) * Math.PI) / 180);
  const leftExtent =
    textAnchor === "start" ? 0 : textAnchor === "end" ? width : width / 2;
  const rightExtent =
    textAnchor === "start" ? width : textAnchor === "end" ? 0 : width / 2;
  const min = margin + leftExtent;
  const max = chartWidth - margin - rightExtent;

  return clamp(candidate.x, min, max);
};

const getXLabelTextAnchor = ({
  candidate,
  candidates,
  rotation
}: {
  candidate: XLabelCandidate;
  candidates: XLabelCandidate[];
  rotation: number;
}): XLabelLayoutItem["textAnchor"] => {
  if (rotation === 0) {
    return "middle";
  }

  if (rotation < 0) {
    return candidate.index === candidates[0]?.index ? "start" : "end";
  }

  return candidate.index === candidates[candidates.length - 1]?.index
    ? "end"
    : "start";
};

const getRotatedBaselineOffset = ({
  rotation,
  size,
  textAnchor
}: {
  rotation: number;
  size: Size;
  textAnchor: XLabelLayoutItem["textAnchor"];
}) => {
  if (rotation === 0) {
    return 0;
  }

  const radians = (Math.abs(rotation) * Math.PI) / 180;
  const widthProjection = size.width * Math.sin(radians);

  if (rotation < 0 && textAnchor === "start") {
    return widthProjection;
  }

  if (rotation > 0 && textAnchor === "end") {
    return widthProjection;
  }

  return 0;
};

const getXLabelHorizontalBounds = (label: XLabelLayoutItem) => {
  if (label.rotation === 0) {
    const leftExtent =
      label.textAnchor === "start"
        ? 0
        : label.textAnchor === "end"
          ? label.size.width
          : label.size.width / 2;
    const rightExtent =
      label.textAnchor === "start"
        ? label.size.width
        : label.textAnchor === "end"
          ? 0
          : label.size.width / 2;

    return {
      left: label.x - leftExtent,
      right: label.x + rightExtent
    };
  }

  const radians = (Math.abs(label.rotation) * Math.PI) / 180;
  const projectedWidth =
    label.size.width * Math.cos(radians) +
    label.size.height * Math.sin(radians);
  const leftExtent =
    label.textAnchor === "start"
      ? 0
      : label.textAnchor === "end"
        ? projectedWidth
        : projectedWidth / 2;
  const rightExtent =
    label.textAnchor === "start"
      ? projectedWidth
      : label.textAnchor === "end"
        ? 0
        : projectedWidth / 2;

  return {
    left: label.x - leftExtent,
    right: label.x + rightExtent
  };
};

const filterOverlappingRotatedLabels = (
  items: XLabelLayoutItem[],
  minGap: number
) => {
  if (items.length <= 1) {
    return items;
  }

  const accepted: Array<{
    bounds: ReturnType<typeof getXLabelHorizontalBounds>;
    item: XLabelLayoutItem;
  }> = [];
  const lastIndex = items.length - 1;

  items.forEach((item, index) => {
    const bounds = getXLabelHorizontalBounds(item);
    const overlapsPrevious = () => {
      const previous = accepted[accepted.length - 1];

      return previous ? previous.bounds.right + minGap > bounds.left : false;
    };

    if (index === lastIndex) {
      while (overlapsPrevious()) {
        accepted.pop();
      }

      accepted.push({ bounds, item });
      return;
    }

    if (!overlapsPrevious()) {
      accepted.push({ bounds, item });
    }
  });

  return accepted.map(({ item }) => item);
};

const isXLabelInsideChart = ({
  candidate,
  chartWidth,
  x,
  textAnchor
}: {
  candidate: XLabelCandidate;
  chartWidth: number;
  x: number;
  textAnchor: XLabelLayoutItem["textAnchor"];
}) => {
  const margin = 4;
  const leftExtent =
    textAnchor === "start"
      ? 0
      : textAnchor === "end"
        ? candidate.size.width
        : candidate.size.width / 2;
  const rightExtent =
    textAnchor === "start"
      ? candidate.size.width
      : textAnchor === "end"
        ? 0
        : candidate.size.width / 2;

  return x - leftExtent >= margin && x + rightExtent <= chartWidth - margin;
};

export const resolveXLabelLayout = ({
  candidates,
  plotWidth,
  chartWidth,
  strategy,
  rotation,
  edgeLabelPolicy,
  minGap,
  baseY
}: {
  candidates: XLabelCandidate[];
  plotWidth: number;
  chartWidth: number;
  strategy: LineChartLabelStrategy;
  rotation: number;
  edgeLabelPolicy: LineChartEdgeLabelPolicy;
  minGap: number;
  baseY: number;
}): XLabelLayout => {
  const labels = candidates.map((candidate) => ({
    id: String(candidate.index),
    text: candidate.text,
    x: candidate.x - candidate.size.width / 2,
    y: 0,
    width: candidate.size.width,
    height: candidate.size.height
  }));
  const getAutoCollision = () => {
    return solveLabelCollision({
      labels,
      availableWidth: plotWidth,
      allowRotate: false,
      allowStagger: false,
      minGap
    });
  };
  const collision =
    strategy === "auto"
      ? getAutoCollision()
      : getExplicitXLabelCollision({
          labels,
          strategy,
          availableWidth: plotWidth,
          minGap,
          rotation
        });
  const resolvedStrategy = collision.strategy as LineChartResolvedLabelStrategy;
  const resolvedRotation =
    resolvedStrategy === "rotate"
      ? rotation < 0
        ? rotation
        : -Math.abs(rotation)
      : 0;
  const rows = resolvedStrategy === "stagger" ? 2 : collision.rows;
  const sizes = collision.visibleIndexes.flatMap((candidateIndex) => {
    const candidate = candidates[candidateIndex];

    return candidate ? [candidate.size] : [];
  });
  const height = getXLabelHeight({
    strategy: resolvedStrategy,
    sizes,
    rotation: resolvedRotation,
    rows
  });
  const items = collision.visibleIndexes.flatMap<XLabelLayoutItem>(
    (candidateIndex) => {
      const candidate = candidates[candidateIndex];

      if (!candidate) {
        return [];
      }

      const row = resolvedStrategy === "stagger" ? candidate.index % rows : 0;
      const textAnchor = getXLabelTextAnchor({
        candidate,
        candidates,
        rotation: resolvedRotation
      });
      const baselineOffset =
        resolvedStrategy === "rotate"
          ? getRotatedBaselineOffset({
              rotation: resolvedRotation,
              size: candidate.size,
              textAnchor
            })
          : 0;
      const y =
        baseY + row * (candidate.size.height + xLabelRowGap) + baselineOffset;
      const x = getShiftedXLabel({
        candidate,
        chartWidth,
        edgeLabelPolicy,
        rotation: resolvedRotation,
        textAnchor
      });

      if (
        edgeLabelPolicy === "hide" &&
        !isXLabelInsideChart({
          candidate,
          chartWidth,
          x,
          textAnchor
        })
      ) {
        return [];
      }

      return [
        {
          ...candidate,
          gridX: candidate.x,
          x,
          y,
          row,
          rotation: resolvedRotation,
          textAnchor
        }
      ];
    }
  );
  const visibleItems =
    resolvedStrategy === "rotate"
      ? filterOverlappingRotatedLabels(items, minGap)
      : items;

  return {
    strategy: resolvedStrategy,
    items: visibleItems,
    height,
    rotation: resolvedRotation,
    rows
  };
};

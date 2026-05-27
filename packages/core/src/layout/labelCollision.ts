import type {
  LabelBox,
  LabelCollisionOptions,
  LabelCollisionResult
} from "./types";

const boxesOverlap = (
  left: LabelBox,
  right: LabelBox,
  gap: number
): boolean => {
  return left.x + left.width + gap > right.x;
};

const hasOverlap = (labels: LabelBox[], indexes: number[], gap: number) => {
  for (let i = 1; i < indexes.length; i++) {
    const previousIndex = indexes[i - 1];
    const currentIndex = indexes[i];

    if (previousIndex === undefined || currentIndex === undefined) {
      continue;
    }

    const previous = labels[previousIndex];
    const current = labels[currentIndex];

    if (previous && current && boxesOverlap(previous, current, gap)) {
      return true;
    }
  }

  return false;
};

const visibleIndexesForInterval = (
  count: number,
  interval: number
): number[] => {
  return Array.from({ length: count }, (_, index) => index).filter((index) => {
    return index === 0 || index === count - 1 || index % interval === 0;
  });
};

export const solveLabelCollision = ({
  labels,
  availableWidth,
  allowRotate = true,
  allowStagger = true,
  minGap = 4,
  maxRotation = 45
}: LabelCollisionOptions): LabelCollisionResult => {
  if (labels.length === 0) {
    return {
      strategy: "show",
      visibleIndexes: [],
      interval: 1,
      rotation: 0,
      rows: 1
    };
  }

  const allIndexes = visibleIndexesForInterval(labels.length, 1);

  if (!hasOverlap(labels, allIndexes, minGap)) {
    return {
      strategy: "show",
      visibleIndexes: allIndexes,
      interval: 1,
      rotation: 0,
      rows: 1
    };
  }

  if (allowStagger) {
    const rowWidth = labels.reduce(
      (max, label) => Math.max(max, label.width),
      0
    );
    const approximateSlot = availableWidth / Math.max(1, labels.length);

    if (rowWidth + minGap <= approximateSlot * 2) {
      return {
        strategy: "stagger",
        visibleIndexes: allIndexes,
        interval: 1,
        rotation: 0,
        rows: 2
      };
    }
  }

  if (allowRotate) {
    const widest = labels.reduce((max, label) => Math.max(max, label.width), 0);
    const rotatedWidth =
      widest * Math.cos((Math.abs(maxRotation) * Math.PI) / 180);
    const approximateSlot = availableWidth / Math.max(1, labels.length);

    if (rotatedWidth + minGap <= approximateSlot) {
      return {
        strategy: "rotate",
        visibleIndexes: allIndexes,
        interval: 1,
        rotation: maxRotation,
        rows: 1
      };
    }
  }

  for (let interval = 2; interval <= labels.length; interval++) {
    const visibleIndexes = visibleIndexesForInterval(labels.length, interval);

    if (!hasOverlap(labels, visibleIndexes, minGap)) {
      return {
        strategy: "skip",
        visibleIndexes,
        interval,
        rotation: 0,
        rows: 1
      };
    }
  }

  return {
    strategy: "hide",
    visibleIndexes: [],
    interval: labels.length,
    rotation: 0,
    rows: 0
  };
};

import type { LinearScale } from "@chart-kit/core";

type AxisLabelSize = {
  width: number;
  height: number;
};

export type LineChartAxisLabelAnimationStrategy = "crossfade";
export type LineChartYAxisLabelWidth = number | "auto" | "stable";

export type LineChartAxisLabelAnimationConfig = {
  duration?: number;
  strategy?: LineChartAxisLabelAnimationStrategy;
};

export type ResolvedLineChartAxisLabelAnimationConfig = {
  enabled: boolean;
  duration: number;
  strategy: LineChartAxisLabelAnimationStrategy;
};

export type LineChartYAxisLabelModel = {
  key: string;
  text: string;
  y: number;
  opacity: number;
};

export const defaultLineChartAxisLabelAnimationDuration = 160;

const getMaxWidth = (sizes: AxisLabelSize[]) =>
  sizes.reduce((max, size) => Math.max(max, size.width), 0);

export const resolveLineChartYAxisLabelSizes = ({
  sizes,
  stableSizes,
  width
}: {
  sizes: AxisLabelSize[];
  stableSizes?: AxisLabelSize[] | undefined;
  width?: LineChartYAxisLabelWidth | undefined;
}) => {
  const fixedWidth =
    typeof width === "number" && Number.isFinite(width)
      ? Math.max(0, width)
      : width === "stable"
        ? getMaxWidth(stableSizes ?? sizes)
        : undefined;

  if (fixedWidth === undefined) {
    return sizes;
  }

  return sizes.map((size) => ({
    ...size,
    width: fixedWidth
  }));
};

export const resolveLineChartAxisLabelAnimationConfig = (
  animation?: boolean | LineChartAxisLabelAnimationConfig
): ResolvedLineChartAxisLabelAnimationConfig => {
  if (!animation) {
    return {
      enabled: false,
      duration: 0,
      strategy: "crossfade"
    };
  }

  if (animation === true) {
    return {
      enabled: true,
      duration: defaultLineChartAxisLabelAnimationDuration,
      strategy: "crossfade"
    };
  }

  return {
    enabled: true,
    duration:
      typeof animation.duration === "number" &&
      Number.isFinite(animation.duration)
        ? Math.max(0, animation.duration)
        : defaultLineChartAxisLabelAnimationDuration,
    strategy: animation.strategy ?? "crossfade"
  };
};

export const buildLineChartYAxisLabels = ({
  formatYLabel,
  labelOffset,
  ticks,
  yScale
}: {
  formatYLabel: (value: number) => string;
  labelOffset: number;
  ticks: readonly number[];
  yScale: LinearScale;
}): LineChartYAxisLabelModel[] => {
  const keyCounts = new Map<string, number>();

  return ticks.map((tick) => {
    const text = formatYLabel(tick);
    const baseKey = `${tick}:${text}`;
    const duplicateCount = keyCounts.get(baseKey) ?? 0;

    keyCounts.set(baseKey, duplicateCount + 1);

    return {
      key: duplicateCount === 0 ? baseKey : `${baseKey}:${duplicateCount}`,
      text,
      y: yScale.scale(tick) + labelOffset,
      opacity: 1
    };
  });
};

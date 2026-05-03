import { useEffect, useMemo, useRef, useState } from "react";

import {
  buildLineChartYAxisLabels,
  resolveLineChartAxisLabelAnimationConfig,
  type LineChartAxisLabelAnimationConfig,
  type LineChartYAxisLabelModel
} from "./axisLabels";
import type { LineChartModel } from "./useChartModel";

const axisLabelPositionThreshold = 0.5;
const axisLabelOpacityThreshold = 0.01;

const getAxisLabelSignature = (labels: readonly LineChartYAxisLabelModel[]) =>
  labels
    .map((label) => `${label.key}:${label.text}:${label.y.toFixed(2)}`)
    .join("|");

const interpolateValue = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

const easeAxisLabelTransition = (progress: number) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return 1 - Math.pow(1 - clampedProgress, 3);
};

const getInterpolatedLabels = ({
  from,
  progress,
  to
}: {
  from: readonly LineChartYAxisLabelModel[];
  progress: number;
  to: readonly LineChartYAxisLabelModel[];
}) => {
  const fromByKey = new Map(from.map((label) => [label.key, label]));
  const toByKey = new Map(to.map((label) => [label.key, label]));
  const orderedKeys = [
    ...to.map((label) => label.key),
    ...from.map((label) => label.key).filter((key) => !toByKey.has(key))
  ];

  return orderedKeys
    .map((key) => {
      const fromLabel = fromByKey.get(key);
      const toLabel = toByKey.get(key);

      if (fromLabel && toLabel) {
        return {
          ...toLabel,
          y: interpolateValue(fromLabel.y, toLabel.y, progress),
          opacity: interpolateValue(
            fromLabel.opacity,
            toLabel.opacity,
            progress
          )
        };
      }

      if (toLabel) {
        return {
          ...toLabel,
          opacity: progress
        };
      }

      if (fromLabel) {
        return {
          ...fromLabel,
          opacity: interpolateValue(fromLabel.opacity, 0, progress)
        };
      }

      return undefined;
    })
    .filter(
      (label): label is LineChartYAxisLabelModel =>
        label !== undefined && label.opacity > axisLabelOpacityThreshold
    );
};

const hasMeaningfulAxisLabelDelta = ({
  from,
  to
}: {
  from: readonly LineChartYAxisLabelModel[];
  to: readonly LineChartYAxisLabelModel[];
}) => {
  if (from.length !== to.length) {
    return true;
  }

  return to.some((label, index) => {
    const previousLabel = from[index];

    return (
      !previousLabel ||
      previousLabel.key !== label.key ||
      previousLabel.text !== label.text ||
      Math.abs(previousLabel.y - label.y) > axisLabelPositionThreshold ||
      Math.abs(previousLabel.opacity - label.opacity) >
        axisLabelOpacityThreshold
    );
  });
};

export const useAnimatedYAxisLabels = (
  labels: LineChartYAxisLabelModel[],
  animation?: boolean | LineChartAxisLabelAnimationConfig
) => {
  const resolvedAnimation = useMemo(
    () => resolveLineChartAxisLabelAnimationConfig(animation),
    [animation]
  );
  const latestLabelsRef = useRef(labels);
  const hasInitialLabelsRef = useRef(false);
  const [animatedLabels, setAnimatedLabels] = useState(labels);

  useEffect(() => {
    let animationFrame = 0;
    const targetLabels = labels;
    const currentLabels = latestLabelsRef.current;
    const targetSignature = getAxisLabelSignature(targetLabels);
    const currentSignature = getAxisLabelSignature(currentLabels);

    if (!hasInitialLabelsRef.current) {
      hasInitialLabelsRef.current = true;
      latestLabelsRef.current = targetLabels;
      setAnimatedLabels(targetLabels);

      return () => {
        cancelAnimationFrame(animationFrame);
      };
    }

    if (
      currentSignature === targetSignature ||
      !hasMeaningfulAxisLabelDelta({ from: currentLabels, to: targetLabels })
    ) {
      latestLabelsRef.current = targetLabels;

      return () => {
        cancelAnimationFrame(animationFrame);
      };
    }

    if (!resolvedAnimation.enabled || resolvedAnimation.duration <= 0) {
      latestLabelsRef.current = targetLabels;
      animationFrame = requestAnimationFrame(() => {
        setAnimatedLabels(targetLabels);
      });

      return () => {
        cancelAnimationFrame(animationFrame);
      };
    }

    let startTime: number | undefined;

    const tick = (timestamp: number) => {
      startTime ??= timestamp;

      const progress = Math.min(
        (timestamp - startTime) / resolvedAnimation.duration,
        1
      );
      const easedProgress = easeAxisLabelTransition(progress);
      const nextLabels = getInterpolatedLabels({
        from: currentLabels,
        progress: easedProgress,
        to: targetLabels
      });

      latestLabelsRef.current = nextLabels;
      setAnimatedLabels(nextLabels);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(tick);
      } else {
        latestLabelsRef.current = targetLabels;
        setAnimatedLabels(targetLabels);
      }
    };

    animationFrame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [
    labels,
    resolvedAnimation.duration,
    resolvedAnimation.enabled,
    resolvedAnimation.strategy
  ]);

  return animatedLabels;
};

export const useLineChartYAxisLabels = <TData extends Record<string, unknown>>(
  model: LineChartModel<TData>,
  animation?: boolean | LineChartAxisLabelAnimationConfig
) => {
  const labels = useMemo(
    () =>
      buildLineChartYAxisLabels({
        formatYLabel: model.formatYLabel,
        labelOffset: model.resolvedTheme.typography.axisLabelSize * 0.36,
        ticks: model.yTicks,
        yScale: model.yScale
      }),
    [
      model.formatYLabel,
      model.resolvedTheme.typography.axisLabelSize,
      model.yScale,
      model.yTicks
    ]
  );

  return useAnimatedYAxisLabels(labels, animation);
};

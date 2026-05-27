import { useEffect, useMemo, useState } from "react";

import { buildProgressRings } from "@chart-kit/core";
import type { ProgressRingModel } from "@chart-kit/core";

import type { ProgressChartAnimationConfig } from "./types";

const defaultProgressAnimationDuration = 1200;
const defaultProgressAnimationStagger = 0.08;

export type ResolvedProgressChartAnimationConfig = {
  duration: number;
  enabled: boolean;
  stagger: number;
};

export const resolveProgressChartAnimationConfig = (
  animation: boolean | ProgressChartAnimationConfig | undefined
): ResolvedProgressChartAnimationConfig => {
  if (!animation) {
    return { duration: 0, enabled: false, stagger: 0 };
  }

  const config = typeof animation === "object" ? animation : {};
  const duration =
    typeof config.duration === "number" && Number.isFinite(config.duration)
      ? Math.max(0, config.duration)
      : defaultProgressAnimationDuration;
  const stagger =
    typeof config.stagger === "number" && Number.isFinite(config.stagger)
      ? Math.max(0, Math.min(0.5, config.stagger))
      : defaultProgressAnimationStagger;

  return { duration, enabled: true, stagger };
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const easeOutCubic = (progress: number) => {
  const clampedProgress = clamp01(progress);

  return 1 - Math.pow(1 - clampedProgress, 3);
};

export const getProgressRingAnimationProgress = ({
  index,
  progress,
  stagger
}: {
  index: number;
  progress: number;
  stagger: number;
}) => {
  const delay = Math.min(0.92, index * stagger);

  return easeOutCubic((progress - delay) / Math.max(0.01, 1 - delay));
};

export const getAnimatedProgressRing = ({
  centerX,
  centerY,
  progress,
  ring
}: {
  centerX: number;
  centerY: number;
  progress: number;
  ring: ProgressRingModel;
}): ProgressRingModel => {
  if (!ring.defined || progress >= 0.999) {
    return ring;
  }

  const animatedValue = ring.clampedValue * clamp01(progress);
  const animatedInput = {
    defined: ring.defined,
    index: ring.index,
    value: animatedValue,
    ...(ring.color !== undefined ? { color: ring.color } : {}),
    ...(ring.label !== undefined ? { label: ring.label } : {})
  };
  const animatedRing = buildProgressRings({
    centerX,
    centerY,
    maxRadius: ring.radius,
    ringGap: 0,
    rings: [animatedInput],
    startAngle: ring.startAngle,
    strokeWidth: ring.strokeWidth
  })[0];

  if (!animatedRing) {
    return ring;
  }

  return {
    ...ring,
    clampedValue: animatedRing.clampedValue,
    defined: animatedRing.defined,
    endAngle: animatedRing.endAngle,
    path: animatedRing.path
  };
};

export const getAnimatedProgressRings = ({
  centerX,
  centerY,
  progress,
  rings,
  stagger
}: {
  centerX: number;
  centerY: number;
  progress: number;
  rings: ProgressRingModel[];
  stagger: number;
}) =>
  rings.map((ring, index) =>
    getAnimatedProgressRing({
      centerX,
      centerY,
      progress: getProgressRingAnimationProgress({ index, progress, stagger }),
      ring
    })
  );

export const getAverageProgress = (rings: ProgressRingModel[]) => {
  const definedRings = rings.filter((ring) => ring.value !== null);

  return definedRings.length > 0
    ? definedRings.reduce((sum, ring) => sum + ring.clampedValue, 0) /
        definedRings.length
    : 0;
};

export const getProgressChartAnimationTargetKey = (
  rings: ProgressRingModel[]
) =>
  rings
    .map((ring) => `${ring.index}:${ring.defined}:${ring.clampedValue}`)
    .join("|");

export const useProgressChartAnimation = ({
  animation,
  targetKey
}: {
  animation: boolean | ProgressChartAnimationConfig | undefined;
  targetKey: string;
}) => {
  const config = useMemo(
    () => resolveProgressChartAnimationConfig(animation),
    [animation]
  );
  const [progress, setProgress] = useState(config.enabled ? 0 : 1);

  useEffect(() => {
    if (!config.enabled || config.duration <= 0) {
      const frame = requestAnimationFrame(() => setProgress(1));

      return () => cancelAnimationFrame(frame);
    }

    let animationFrame = 0;
    let startTime: number | undefined;

    const tick = (timestamp: number) => {
      startTime ??= timestamp;

      const nextProgress = clamp01((timestamp - startTime) / config.duration);

      setProgress(nextProgress);

      if (nextProgress < 1) {
        animationFrame = requestAnimationFrame(tick);
      }
    };

    animationFrame = requestAnimationFrame((timestamp) => {
      setProgress(0);
      tick(timestamp);
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [config.duration, config.enabled, targetKey]);

  return {
    progress,
    stagger: config.stagger
  };
};

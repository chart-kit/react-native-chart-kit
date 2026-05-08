import { useEffect, useRef, useState } from "react";

import { buildPieArcs, type PieArcModel } from "@chart-kit/core";

import type { PieChartSelectionAnimationConfig } from "./types";

const defaultSelectionAnimationDuration = 180;

export type PieChartSelectionAnimationState = {
  fromIndex: number | undefined;
  toIndex: number | undefined;
  progress: number;
};

export type ResolvedPieChartSelectionAnimationConfig = {
  enabled: boolean;
  duration: number;
};

export const resolvePieChartSelectionAnimationConfig = (
  animation: boolean | PieChartSelectionAnimationConfig | undefined
): ResolvedPieChartSelectionAnimationConfig => {
  if (animation === false) {
    return { enabled: false, duration: 0 };
  }

  const config = typeof animation === "object" ? animation : {};
  const duration =
    typeof config.duration === "number" && Number.isFinite(config.duration)
      ? Math.max(0, config.duration)
      : defaultSelectionAnimationDuration;

  return {
    enabled: true,
    duration
  };
};

const easeOutCubic = (progress: number) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return 1 - Math.pow(1 - clampedProgress, 3);
};

const interpolate = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

const getSliceSelectedAmount = ({
  index,
  selectedIndex
}: {
  index: number;
  selectedIndex: number | undefined;
}) => (selectedIndex === index ? 1 : 0);

const getSliceOpacity = ({
  activeOpacity,
  inactiveOpacity,
  index,
  selectedIndex
}: {
  activeOpacity: number;
  inactiveOpacity: number;
  index: number;
  selectedIndex: number | undefined;
}) => {
  if (selectedIndex === undefined) {
    return 1;
  }

  return selectedIndex === index ? activeOpacity : inactiveOpacity;
};

export const getAnimatedPieSliceOpacity = ({
  activeOpacity,
  inactiveOpacity,
  index,
  state
}: {
  activeOpacity: number;
  inactiveOpacity: number;
  index: number;
  state: PieChartSelectionAnimationState;
}) =>
  interpolate(
    getSliceOpacity({
      activeOpacity,
      inactiveOpacity,
      index,
      selectedIndex: state.fromIndex
    }),
    getSliceOpacity({
      activeOpacity,
      inactiveOpacity,
      index,
      selectedIndex: state.toIndex
    }),
    state.progress
  );

export const getAnimatedPieSlicePath = <TData>({
  activeOffset,
  activeScale,
  arc,
  centerX,
  centerY,
  innerRadius,
  radius,
  state
}: {
  activeOffset: number;
  activeScale: number;
  arc: PieArcModel<TData>;
  centerX: number;
  centerY: number;
  innerRadius: number;
  radius: number;
  state: PieChartSelectionAnimationState;
}) => {
  const selectedAmount = interpolate(
    getSliceSelectedAmount({
      index: arc.index,
      selectedIndex: state.fromIndex
    }),
    getSliceSelectedAmount({ index: arc.index, selectedIndex: state.toIndex }),
    state.progress
  );

  if (selectedAmount <= 0.001) {
    return arc.path;
  }

  const vectorX = arc.centroid.x - centerX;
  const vectorY = arc.centroid.y - centerY;
  const length = Math.hypot(vectorX, vectorY);

  if (length <= 0) {
    return arc.path;
  }

  const offset = activeOffset * selectedAmount;
  const scale = interpolate(1, activeScale, selectedAmount);
  const dx = (vectorX / length) * offset;
  const dy = (vectorY / length) * offset;
  const shiftedArc = buildPieArcs({
    centerX: centerX + dx,
    centerY: centerY + dy,
    endAngle: arc.endAngle,
    innerRadius: innerRadius * scale,
    radius: radius * scale,
    slices: [
      {
        defined: true,
        index: arc.index,
        label: arc.label,
        raw: arc.raw as TData,
        value: 1
      }
    ],
    startAngle: arc.startAngle
  })[0];

  return shiftedArc?.path ?? arc.path;
};

export const usePieChartSelectionAnimation = ({
  animation,
  selectedIndex
}: {
  animation: boolean | PieChartSelectionAnimationConfig | undefined;
  selectedIndex: number | undefined;
}): PieChartSelectionAnimationState => {
  const config = resolvePieChartSelectionAnimationConfig(animation);
  const previousTargetRef = useRef(selectedIndex);
  const [state, setState] = useState<PieChartSelectionAnimationState>({
    fromIndex: selectedIndex,
    toIndex: selectedIndex,
    progress: 1
  });

  useEffect(() => {
    const fromIndex = previousTargetRef.current;

    if (fromIndex === selectedIndex) {
      return undefined;
    }

    previousTargetRef.current = selectedIndex;

    if (!config.enabled || config.duration <= 0) {
      const animationFrame = requestAnimationFrame(() => {
        setState({
          fromIndex: selectedIndex,
          toIndex: selectedIndex,
          progress: 1
        });
      });

      return () => cancelAnimationFrame(animationFrame);
    }

    let animationFrame = 0;
    let startTime: number | undefined;

    const tick = (timestamp: number) => {
      startTime ??= timestamp;

      const rawProgress = Math.min(
        (timestamp - startTime) / config.duration,
        1
      );
      const progress = easeOutCubic(rawProgress);

      setState(
        rawProgress >= 1
          ? { fromIndex: selectedIndex, toIndex: selectedIndex, progress: 1 }
          : { fromIndex, toIndex: selectedIndex, progress }
      );

      if (rawProgress < 1) {
        animationFrame = requestAnimationFrame(tick);
      }
    };

    animationFrame = requestAnimationFrame((timestamp) => {
      setState({ fromIndex, toIndex: selectedIndex, progress: 0 });
      tick(timestamp);
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [config.duration, config.enabled, selectedIndex]);

  return state;
};

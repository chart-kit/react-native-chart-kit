import { useEffect, useRef, useState } from "react";

import type { BarChartSelectionAnimationConfig } from "./types";

const defaultSelectionAnimationDuration = 180;
const dimmedBarOpacity = 0.42;
const selectedStrokeOpacity = 0.32;

export type ResolvedBarChartSelectionAnimationConfig = {
  enabled: boolean;
  duration: number;
};

export type BarChartSelectionAnimationState = {
  fromKey: string | undefined;
  toKey: string | undefined;
  progress: number;
};

export const resolveBarChartSelectionAnimationConfig = (
  animation: boolean | BarChartSelectionAnimationConfig | undefined
): ResolvedBarChartSelectionAnimationConfig => {
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

const getOpacityForSelectionKey = ({
  barKey,
  selectedKey
}: {
  barKey: string;
  selectedKey: string | undefined;
}) =>
  selectedKey === undefined || selectedKey === barKey ? 1 : dimmedBarOpacity;

const getStrokeOpacityForSelectionKey = ({
  barKey,
  selectedKey
}: {
  barKey: string;
  selectedKey: string | undefined;
}) => (selectedKey === barKey ? selectedStrokeOpacity : 0);

export const getAnimatedBarSelectionOpacity = ({
  barKey,
  state
}: {
  barKey: string;
  state: BarChartSelectionAnimationState;
}) =>
  interpolate(
    getOpacityForSelectionKey({ barKey, selectedKey: state.fromKey }),
    getOpacityForSelectionKey({ barKey, selectedKey: state.toKey }),
    state.progress
  );

export const getAnimatedBarSelectionStrokeOpacity = ({
  barKey,
  state
}: {
  barKey: string;
  state: BarChartSelectionAnimationState;
}) =>
  interpolate(
    getStrokeOpacityForSelectionKey({ barKey, selectedKey: state.fromKey }),
    getStrokeOpacityForSelectionKey({ barKey, selectedKey: state.toKey }),
    state.progress
  );

export const useBarChartSelectionAnimation = ({
  animation,
  selectedBarKey
}: {
  animation: boolean | BarChartSelectionAnimationConfig | undefined;
  selectedBarKey: string | undefined;
}): BarChartSelectionAnimationState => {
  const config = resolveBarChartSelectionAnimationConfig(animation);
  const previousTargetRef = useRef(selectedBarKey);
  const [state, setState] = useState<BarChartSelectionAnimationState>({
    fromKey: selectedBarKey,
    toKey: selectedBarKey,
    progress: 1
  });

  useEffect(() => {
    const fromKey = previousTargetRef.current;

    if (fromKey === selectedBarKey) {
      return undefined;
    }

    previousTargetRef.current = selectedBarKey;

    if (!config.enabled || config.duration <= 0) {
      const animationFrame = requestAnimationFrame(() => {
        setState({
          fromKey: selectedBarKey,
          toKey: selectedBarKey,
          progress: 1
        });
      });

      return () => {
        cancelAnimationFrame(animationFrame);
      };
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

      setState({
        fromKey,
        toKey: selectedBarKey,
        progress
      });

      if (rawProgress < 1) {
        animationFrame = requestAnimationFrame(tick);
      }
    };

    animationFrame = requestAnimationFrame((timestamp) => {
      setState({ fromKey, toKey: selectedBarKey, progress: 0 });
      tick(timestamp);
    });

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [config.duration, config.enabled, selectedBarKey]);

  return state;
};

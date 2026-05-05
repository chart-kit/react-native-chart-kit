import { useEffect, useRef, useState } from "react";

import type { BarChartTooltipModel } from "./tooltip";

const tooltipPositionThreshold = 0.5;

const easeOutCubic = (progress: number) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return 1 - Math.pow(1 - clampedProgress, 3);
};

const interpolate = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

export const useAnimatedBarChartTooltipModel = <TData>(
  tooltip: BarChartTooltipModel<TData> | undefined,
  positionAnimationDuration: number
) => {
  const latestPositionRef = useRef<{ x: number; y: number } | undefined>(
    undefined
  );
  const previousTooltipRef = useRef<BarChartTooltipModel<TData> | undefined>(
    undefined
  );
  const [animatedPosition, setAnimatedPosition] = useState<
    { x: number; y: number } | undefined
  >(undefined);

  useEffect(() => {
    let animationFrame = 0;

    if (!tooltip) {
      latestPositionRef.current = undefined;
      previousTooltipRef.current = undefined;
      animationFrame = requestAnimationFrame(() => {
        setAnimatedPosition(undefined);
      });

      return () => {
        cancelAnimationFrame(animationFrame);
      };
    }

    const targetPosition = { x: tooltip.x, y: tooltip.y };
    const currentPosition = latestPositionRef.current ?? targetPosition;
    const hasPreviousTooltip = previousTooltipRef.current !== undefined;
    const duration = positionAnimationDuration;

    previousTooltipRef.current = tooltip;

    if (!hasPreviousTooltip || duration <= 0) {
      latestPositionRef.current = targetPosition;
      animationFrame = requestAnimationFrame(() => {
        setAnimatedPosition(targetPosition);
      });

      return () => {
        cancelAnimationFrame(animationFrame);
      };
    }

    const deltaX = Math.abs(currentPosition.x - targetPosition.x);
    const deltaY = Math.abs(currentPosition.y - targetPosition.y);

    if (
      deltaX < tooltipPositionThreshold &&
      deltaY < tooltipPositionThreshold
    ) {
      latestPositionRef.current = targetPosition;
      animationFrame = requestAnimationFrame(() => {
        setAnimatedPosition(targetPosition);
      });

      return () => {
        cancelAnimationFrame(animationFrame);
      };
    }

    let startTime: number | undefined;

    const tick = (timestamp: number) => {
      startTime ??= timestamp;

      const rawProgress = Math.min((timestamp - startTime) / duration, 1);
      const progress = easeOutCubic(rawProgress);
      const nextPosition = {
        x: interpolate(currentPosition.x, targetPosition.x, progress),
        y: interpolate(currentPosition.y, targetPosition.y, progress)
      };

      latestPositionRef.current = nextPosition;
      setAnimatedPosition(nextPosition);

      if (rawProgress < 1) {
        animationFrame = requestAnimationFrame(tick);
      }
    };

    animationFrame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [positionAnimationDuration, tooltip]);

  if (!tooltip) {
    return undefined;
  }

  const position = animatedPosition ?? { x: tooltip.x, y: tooltip.y };

  return {
    ...tooltip,
    x: position.x,
    y: position.y
  };
};

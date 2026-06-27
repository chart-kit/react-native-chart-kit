import { useEffect, useRef, useState } from "react";

import { interpolateLineChartTooltipPosition } from "./tooltip";
import type { LineChartTooltipRenderProps } from "./types";

const tooltipPositionThreshold = 0.5;

export const useAnimatedTooltipModel = <TData>(
  tooltip: LineChartTooltipRenderProps<TData> | undefined
) => {
  const latestPositionRef = useRef<{ x: number; y: number } | undefined>(
    undefined
  );
  const previousTooltipRef = useRef<
    LineChartTooltipRenderProps<TData> | undefined
  >(undefined);
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
    const positionAnimationDuration = tooltip.config.positionAnimationDuration;

    previousTooltipRef.current = tooltip;

    if (!hasPreviousTooltip) {
      latestPositionRef.current = targetPosition;
      animationFrame = requestAnimationFrame(() => {
        setAnimatedPosition(targetPosition);
      });

      return () => {
        cancelAnimationFrame(animationFrame);
      };
    }

    if (positionAnimationDuration <= 0) {
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

      const progress = Math.min(
        (timestamp - startTime) / positionAnimationDuration,
        1
      );
      const nextPosition = interpolateLineChartTooltipPosition({
        from: currentPosition,
        progress,
        to: targetPosition
      });

      latestPositionRef.current = nextPosition;
      setAnimatedPosition(nextPosition);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(tick);
      }
    };

    animationFrame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [tooltip]);

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

import { useEffect, useRef, useState } from "react";

import { getFontFamilyProps } from "../line/text";
import {
  interpolateLineChartTooltipPosition,
  lineChartTooltipLineHeight
} from "../line/tooltip";
import type {
  CombinedChartRenderer,
  CombinedChartTooltipRenderProps
} from "./types";

const tooltipPositionThreshold = 0.5;

export const getCombinedChartTooltipAnimationTargetKey = <TData,>(
  tooltip: CombinedChartTooltipRenderProps<TData>
) => `${tooltip.index}:${tooltip.x}:${tooltip.y}`;

export const useAnimatedCombinedChartTooltipModel = <TData,>(
  tooltip: CombinedChartTooltipRenderProps<TData> | undefined
) => {
  const latestPositionRef = useRef<{ x: number; y: number } | undefined>(
    undefined
  );
  const previousTooltipKeyRef = useRef<string | undefined>(undefined);
  const [animatedPosition, setAnimatedPosition] = useState<
    { x: number; y: number } | undefined
  >(undefined);
  const duration = tooltip?.config.positionAnimationDuration ?? 0;
  const targetKey = tooltip
    ? getCombinedChartTooltipAnimationTargetKey(tooltip)
    : undefined;
  const targetX = tooltip?.x;
  const targetY = tooltip?.y;

  useEffect(() => {
    let animationFrame = 0;

    if (
      targetKey === undefined ||
      targetX === undefined ||
      targetY === undefined
    ) {
      latestPositionRef.current = undefined;
      previousTooltipKeyRef.current = undefined;
      animationFrame = requestAnimationFrame(() => {
        setAnimatedPosition(undefined);
      });

      return () => {
        cancelAnimationFrame(animationFrame);
      };
    }

    const targetPosition = { x: targetX, y: targetY };
    const currentPosition = latestPositionRef.current ?? targetPosition;
    const hasPreviousTooltip = previousTooltipKeyRef.current !== undefined;

    previousTooltipKeyRef.current = targetKey;

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

      const progress = Math.min((timestamp - startTime) / duration, 1);
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
  }, [duration, targetKey, targetX, targetY]);

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

export const renderDefaultCombinedChartTooltip = <TData,>(
  {
    config,
    height,
    series,
    width,
    x,
    xLabel,
    y
  }: CombinedChartTooltipRenderProps<TData>,
  renderer: CombinedChartRenderer
) => {
  if (renderer.capabilities?.text === false) {
    return null;
  }

  const contentX = x + config.padding;
  const labelY = y + config.padding + config.labelFontSize;
  const firstItemY = labelY + lineChartTooltipLineHeight;
  const hasShadow = config.shadowOpacity > 0;
  const { Circle, Group, Rect, Text } = renderer;

  return (
    <Group>
      {hasShadow ? (
        <Rect
          fill={config.shadowColor}
          height={height}
          opacity={config.shadowOpacity}
          rx={config.borderRadius}
          width={width}
          x={x + config.shadowOffsetX}
          y={y + config.shadowOffsetY}
        />
      ) : null}
      <Rect
        fill={config.backgroundColor}
        height={height}
        rx={config.borderRadius}
        stroke={config.borderColor}
        strokeOpacity={0.2}
        strokeWidth={1}
        width={width}
        x={x}
        y={y}
      />
      <Text
        fill={config.labelColor}
        fontSize={config.labelFontSize}
        fontWeight="600"
        text={xLabel}
        x={contentX}
        y={labelY}
        {...getFontFamilyProps(config.fontFamily)}
      >
        {xLabel}
      </Text>
      {series.map((item, index) => {
        const itemY = firstItemY + index * lineChartTooltipLineHeight;
        const valueText = `${item.label}: ${item.formattedValue}`;

        return (
          <Group key={`combined-tooltip-${item.key}`}>
            <Circle
              cx={contentX + 3}
              cy={itemY - config.fontSize * 0.32}
              fill={item.color}
              r={3}
            />
            <Text
              fill={config.textColor}
              fontSize={config.fontSize}
              text={valueText}
              x={contentX + 12}
              y={itemY}
              {...getFontFamilyProps(config.fontFamily)}
            >
              {valueText}
            </Text>
          </Group>
        );
      })}
    </Group>
  );
};

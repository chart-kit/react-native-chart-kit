import { useEffect, useRef, useState } from "react";

import { SvgCircle, SvgGroup, SvgRect, SvgText } from "@chart-kit/svg-renderer";

import { getFontFamilyProps } from "../line/text";
import {
  interpolateLineChartTooltipPosition,
  lineChartTooltipLineHeight
} from "../line/tooltip";
import type { CombinedChartTooltipRenderProps } from "./types";

const tooltipPositionThreshold = 0.5;

export const useAnimatedCombinedChartTooltipModel = <TData,>(
  tooltip: CombinedChartTooltipRenderProps<TData> | undefined
) => {
  const latestPositionRef = useRef<{ x: number; y: number } | undefined>(
    undefined
  );
  const previousTooltipRef = useRef<
    CombinedChartTooltipRenderProps<TData> | undefined
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
    const duration = tooltip.config.positionAnimationDuration;

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

export const renderDefaultCombinedChartTooltip = <TData,>({
  config,
  height,
  series,
  width,
  x,
  xLabel,
  y
}: CombinedChartTooltipRenderProps<TData>) => {
  const contentX = x + config.padding;
  const labelY = y + config.padding + config.labelFontSize;
  const firstItemY = labelY + lineChartTooltipLineHeight;
  const hasShadow = config.shadowOpacity > 0;

  return (
    <SvgGroup>
      {hasShadow ? (
        <SvgRect
          fill={config.shadowColor}
          height={height}
          opacity={config.shadowOpacity}
          rx={config.borderRadius}
          width={width}
          x={x + config.shadowOffsetX}
          y={y + config.shadowOffsetY}
        />
      ) : null}
      <SvgRect
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
      <SvgText
        fill={config.labelColor}
        fontSize={config.labelFontSize}
        fontWeight="600"
        x={contentX}
        y={labelY}
        {...getFontFamilyProps(config.fontFamily)}
      >
        {xLabel}
      </SvgText>
      {series.map((item, index) => {
        const itemY = firstItemY + index * lineChartTooltipLineHeight;

        return (
          <SvgGroup key={`combined-tooltip-${item.key}`}>
            <SvgCircle
              cx={contentX + 3}
              cy={itemY - config.fontSize * 0.32}
              fill={item.color}
              r={3}
            />
            <SvgText
              fill={config.textColor}
              fontSize={config.fontSize}
              x={contentX + 12}
              y={itemY}
              {...getFontFamilyProps(config.fontFamily)}
            >
              {`${item.label}: ${item.formattedValue}`}
            </SvgText>
          </SvgGroup>
        );
      })}
    </SvgGroup>
  );
};

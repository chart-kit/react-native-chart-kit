import { SvgCircle, SvgGroup, SvgRect, SvgText } from "@chart-kit/svg-renderer";

import { getFontFamilyProps } from "../line/text";
import type { BarChartBarModel, ResolvedBarChartTooltipConfig } from "./types";

const tooltipLineHeight = 18;
const tooltipGap = 8;

export type BarChartTooltipModel<TData = unknown> = {
  bar: BarChartBarModel<TData>;
  height: number;
  width: number;
  x: number;
  y: number;
};

export const getBarChartTooltipModel = <TData,>({
  bar,
  boxes,
  config
}: {
  bar: BarChartBarModel<TData> | undefined;
  boxes: { plot: { x: number; y: number; width: number; height: number } };
  config: ResolvedBarChartTooltipConfig;
}): BarChartTooltipModel<TData> | undefined => {
  if (!bar || !config.visible) {
    return undefined;
  }

  const height =
    config.padding * 2 + config.labelFontSize + tooltipLineHeight + 2;
  const preferredX = bar.x + bar.width / 2 - config.width / 2;
  const minX = boxes.plot.x + 4;
  const maxX = boxes.plot.x + boxes.plot.width - config.width - 4;
  const x = Math.max(minX, Math.min(maxX, preferredX));
  const aboveY = bar.y - height - tooltipGap;
  const belowY = bar.y + bar.height + tooltipGap;
  const y =
    aboveY >= boxes.plot.y + 2
      ? aboveY
      : Math.min(
          boxes.plot.y + boxes.plot.height - height - 2,
          Math.max(boxes.plot.y + 2, belowY)
        );

  return {
    bar,
    height,
    width: config.width,
    x,
    y
  };
};

export const renderDefaultBarChartTooltip = <TData,>({
  config,
  height,
  width,
  x,
  y,
  bar
}: {
  bar: BarChartBarModel<TData>;
  config: ResolvedBarChartTooltipConfig;
  height: number;
  width: number;
  x: number;
  y: number;
}) => {
  const contentX = x + config.padding;
  const labelY = y + config.padding + config.labelFontSize;
  const valueY = labelY + tooltipLineHeight;
  const hasShadow = config.shadowOpacity > 0;

  return (
    <SvgGroup>
      {hasShadow ? (
        <SvgRect
          x={x + config.shadowOffsetX}
          y={y + config.shadowOffsetY}
          width={width}
          height={height}
          rx={config.borderRadius}
          fill={config.shadowColor}
          opacity={config.shadowOpacity}
        />
      ) : null}
      <SvgRect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={config.borderRadius}
        fill={config.backgroundColor}
        stroke={config.borderColor}
        strokeOpacity={0.2}
        strokeWidth={1}
      />
      <SvgText
        x={contentX}
        y={labelY}
        fill={config.labelColor}
        fontSize={config.labelFontSize}
        fontWeight="600"
        {...getFontFamilyProps(config.fontFamily)}
      >
        {bar.xLabel}
      </SvgText>
      <SvgCircle
        cx={contentX + 3}
        cy={valueY - config.fontSize * 0.32}
        r={3}
        fill={bar.color}
      />
      <SvgText
        x={contentX + 12}
        y={valueY}
        fill={config.textColor}
        fontSize={config.fontSize}
        {...getFontFamilyProps(config.fontFamily)}
      >
        {`${bar.seriesLabel}: ${bar.formattedValue}`}
      </SvgText>
    </SvgGroup>
  );
};

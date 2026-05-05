import { SvgGroup, SvgRect, SvgText } from "@chart-kit/svg-renderer";

import { getFontFamilyProps } from "../line/text";
import type { ResolvedCandlestickChartTooltipConfig } from "./types";
import type { CandlestickChartTooltipModel } from "./tooltipModel";

const tooltipLineHeight = 16;

export const renderDefaultCandlestickTooltip = <TData,>({
  config,
  height,
  lines,
  width,
  x,
  xLabel,
  y
}: CandlestickChartTooltipModel<TData> & {
  config: ResolvedCandlestickChartTooltipConfig;
}) => {
  const contentX = x + config.padding;
  const labelY = y + config.padding + config.labelFontSize;
  const firstLineY = labelY + tooltipLineHeight;
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
      {lines.map((line, index) => (
        <SvgText
          key={`candlestick-tooltip-${line.label}`}
          fill={config.textColor}
          fontSize={config.fontSize}
          x={contentX}
          y={firstLineY + index * tooltipLineHeight}
          {...getFontFamilyProps(config.fontFamily)}
        >
          {`${line.label} ${line.value}`}
        </SvgText>
      ))}
    </SvgGroup>
  );
};

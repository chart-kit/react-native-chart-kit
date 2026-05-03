import { SvgCircle, SvgGroup, SvgRect, SvgText } from "@chart-kit/svg-renderer";

import { getFontFamilyProps } from "./text";
import { lineChartTooltipLineHeight } from "./tooltip";
import type { LineChartTooltipRenderProps } from "./types";

export const renderDefaultTooltip = <TData,>({
  config,
  height,
  series,
  width,
  x,
  xLabel,
  y
}: LineChartTooltipRenderProps<TData>) => {
  const contentX = x + config.padding;
  const labelY = y + config.padding + config.labelFontSize;
  const firstItemY = labelY + lineChartTooltipLineHeight;
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
        {xLabel}
      </SvgText>
      {series.map((item, index) => {
        const itemY = firstItemY + index * lineChartTooltipLineHeight;

        return (
          <SvgGroup key={`tooltip-${item.key}`}>
            <SvgCircle
              cx={contentX + 3}
              cy={itemY - config.fontSize * 0.32}
              r={3}
              fill={item.color}
            />
            <SvgText
              x={contentX + 12}
              y={itemY}
              fill={config.textColor}
              fontSize={config.fontSize}
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

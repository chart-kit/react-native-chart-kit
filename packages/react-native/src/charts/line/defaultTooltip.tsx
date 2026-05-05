import { getFontFamilyProps } from "./text";
import { lineChartTooltipLineHeight } from "./tooltip";
import type { LineChartRenderer, LineChartTooltipRenderProps } from "./types";

export const renderDefaultTooltip = <TData,>(
  {
    config,
    height,
    series,
    width,
    x,
    xLabel,
    y
  }: LineChartTooltipRenderProps<TData>,
  renderer: LineChartRenderer
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
          x={x + config.shadowOffsetX}
          y={y + config.shadowOffsetY}
          width={width}
          height={height}
          rx={config.borderRadius}
          fill={config.shadowColor}
          opacity={config.shadowOpacity}
        />
      ) : null}
      <Rect
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
      <Text
        x={contentX}
        y={labelY}
        fill={config.labelColor}
        fontSize={config.labelFontSize}
        fontWeight="600"
        text={xLabel}
        {...getFontFamilyProps(config.fontFamily)}
      >
        {xLabel}
      </Text>
      {series.map((item, index) => {
        const itemY = firstItemY + index * lineChartTooltipLineHeight;

        return (
          <Group key={`tooltip-${item.key}`}>
            <Circle
              cx={contentX + 3}
              cy={itemY - config.fontSize * 0.32}
              r={3}
              fill={item.color}
            />
            <Text
              x={contentX + 12}
              y={itemY}
              fill={config.textColor}
              fontSize={config.fontSize}
              text={`${item.label}: ${item.formattedValue}`}
              {...getFontFamilyProps(config.fontFamily)}
            >
              {`${item.label}: ${item.formattedValue}`}
            </Text>
          </Group>
        );
      })}
    </Group>
  );
};

import { getFontFamilyProps } from "../line/text";
import type {
  BarChartBarModel,
  BarChartRenderer,
  ResolvedBarChartTooltipConfig
} from "./types";

export type { BarChartTooltipModel } from "./tooltipModel";

const tooltipLineHeight = 18;

export const renderDefaultBarChartTooltip = <TData,>(
  {
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
  },
  renderer: BarChartRenderer
) => {
  if (renderer.capabilities?.text === false) {
    return null;
  }

  const contentX = x + config.padding;
  const hasLabel = bar.xLabel.trim().length > 0;
  const labelY = y + config.padding + config.labelFontSize;
  const valueY = hasLabel
    ? labelY + tooltipLineHeight
    : y + config.padding + config.fontSize;
  const hasShadow = config.shadowOpacity > 0;
  const { Circle, Group, Rect, Text } = renderer;
  const valueText = `${bar.seriesLabel}: ${bar.formattedValue}`;

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
      {hasLabel ? (
        <Text
          x={contentX}
          y={labelY}
          fill={config.labelColor}
          fontSize={config.labelFontSize}
          fontWeight="600"
          text={bar.xLabel}
          {...getFontFamilyProps(config.fontFamily)}
        >
          {bar.xLabel}
        </Text>
      ) : null}
      <Circle
        cx={contentX + 3}
        cy={valueY - config.fontSize * 0.32}
        r={3}
        fill={bar.color}
      />
      <Text
        x={contentX + 12}
        y={valueY}
        fill={config.textColor}
        fontSize={config.fontSize}
        text={valueText}
        {...getFontFamilyProps(config.fontFamily)}
      >
        {valueText}
      </Text>
    </Group>
  );
};

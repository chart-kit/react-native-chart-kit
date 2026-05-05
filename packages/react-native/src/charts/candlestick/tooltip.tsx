import { getFontFamilyProps } from "../line/text";
import type {
  CandlestickChartRenderer,
  ResolvedCandlestickChartTooltipConfig
} from "./types";
import type { CandlestickChartTooltipModel } from "./tooltipModel";

const tooltipLineHeight = 16;

export const renderDefaultCandlestickTooltip = <TData,>(
  {
    config,
    height,
    lines,
    width,
    x,
    xLabel,
    y
  }: CandlestickChartTooltipModel<TData> & {
    config: ResolvedCandlestickChartTooltipConfig;
  },
  renderer: CandlestickChartRenderer
) => {
  if (renderer.capabilities?.text === false) {
    return null;
  }

  const contentX = x + config.padding;
  const labelY = y + config.padding + config.labelFontSize;
  const firstLineY = labelY + tooltipLineHeight;
  const hasShadow = config.shadowOpacity > 0;
  const { Group, Rect, Text } = renderer;

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
      {lines.map((line, index) => {
        const text = `${line.label} ${line.value}`;

        return (
          <Text
            key={`candlestick-tooltip-${line.label}`}
            fill={config.textColor}
            fontSize={config.fontSize}
            text={text}
            x={contentX}
            y={firstLineY + index * tooltipLineHeight}
            {...getFontFamilyProps(config.fontFamily)}
          >
            {text}
          </Text>
        );
      })}
    </Group>
  );
};

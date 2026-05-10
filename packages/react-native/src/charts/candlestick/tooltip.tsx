import { getFontFamilyProps } from "../line/text";
import type {
  CandlestickChartRenderer,
  ResolvedCandlestickChartTooltipConfig
} from "./types";
import type { CandlestickChartTooltipModel } from "./tooltipModel";

const tooltipLineHeight = 16;
const tooltipHeaderGap = 8;

const candlestickMetricLabels: Record<string, string> = {
  C: "Close",
  H: "High",
  L: "Low",
  O: "Open"
};

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
  const contentWidth = width - config.padding * 2;
  const columnGap = 12;
  const columnWidth = (contentWidth - columnGap) / 2;
  const rightColumnX = contentX + columnWidth + columnGap;
  const labelY = y + config.padding + config.labelFontSize;
  const firstLineY = labelY + tooltipHeaderGap + tooltipLineHeight;
  const hasShadow = config.shadowOpacity > 0;
  const { Group, Rect, Text } = renderer;
  const metricRows = [
    [lines[0], lines[1]],
    [lines[2], lines[3]]
  ];

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
      {metricRows.flatMap((row, rowIndex) =>
        row.flatMap((line, columnIndex) => {
          if (!line) {
            return [];
          }

          const columnX = columnIndex === 0 ? contentX : rightColumnX;
          const valueX = columnX + columnWidth;
          const metricLabel = candlestickMetricLabels[line.label] ?? line.label;
          const rowY = firstLineY + rowIndex * tooltipLineHeight;

          return [
            <Text
              key={`candlestick-tooltip-label-${line.label}`}
              fill={config.labelColor}
              fontSize={config.labelFontSize}
              text={metricLabel}
              x={columnX}
              y={rowY}
              {...getFontFamilyProps(config.fontFamily)}
            >
              {metricLabel}
            </Text>,
            <Text
              key={`candlestick-tooltip-value-${line.label}`}
              fill={config.textColor}
              fontSize={config.fontSize}
              fontWeight="600"
              text={line.value}
              textAnchor="end"
              x={valueX}
              y={rowY}
              {...getFontFamilyProps(config.fontFamily)}
            >
              {line.value}
            </Text>
          ];
        })
      )}
    </Group>
  );
};

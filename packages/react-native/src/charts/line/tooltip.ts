import type { ResolvedLineChartTooltipConfig } from "./options";

export const lineChartTooltipLineHeight = 18;
export const lineChartTooltipLabelLineHeight = 16;

export type LineChartTooltipSeriesItem<TPoint = unknown> = {
  key: string;
  label: string;
  color: string;
  value: number | null | undefined;
  formattedValue: string;
  point: TPoint;
};

export type LineChartTooltipRenderProps<TPoint = unknown, TTheme = unknown> = {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  xLabel: string;
  series: Array<LineChartTooltipSeriesItem<TPoint>>;
  config: ResolvedLineChartTooltipConfig;
  theme: TTheme;
};

type TextMeasurer = (
  text: string,
  options?: { fontSize?: number }
) => {
  width: number;
  height: number;
};

const clamp = (value: number, min: number, max: number) => {
  if (max < min) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
};

export const easeLineChartTooltipPosition = (progress: number) => {
  const clampedProgress = clamp(progress, 0, 1);

  return 1 - Math.pow(1 - clampedProgress, 3);
};

export const interpolateLineChartTooltipPosition = ({
  from,
  progress,
  to
}: {
  from: { x: number; y: number };
  progress: number;
  to: { x: number; y: number };
}) => {
  const easedProgress = easeLineChartTooltipPosition(progress);

  return {
    x: from.x + (to.x - from.x) * easedProgress,
    y: from.y + (to.y - from.y) * easedProgress
  };
};

const getTooltipX = ({
  chartWidth,
  leftInset = 4,
  selectionX,
  width
}: {
  chartWidth: number;
  leftInset?: number | undefined;
  selectionX: number;
  width: number;
}) => clamp(selectionX - width / 2, leftInset, chartWidth - width - 4);

export const clampLineChartTooltipToViewport = <TPoint, TTheme>(
  tooltip: LineChartTooltipRenderProps<TPoint, TTheme>,
  {
    leftInset = 4,
    scrollOffset,
    viewportWidth
  }: {
    leftInset?: number | undefined;
    scrollOffset: number;
    viewportWidth: number;
  }
): LineChartTooltipRenderProps<TPoint, TTheme> => ({
  ...tooltip,
  x: clamp(
    tooltip.x,
    scrollOffset + leftInset,
    scrollOffset + viewportWidth - tooltip.width - 4
  )
});

export const getLineChartTooltipModel = <TPoint, TTheme>({
  chartHeight,
  chartWidth,
  config,
  measureText,
  plotX,
  plotY,
  selection,
  theme
}: {
  chartHeight: number;
  chartWidth: number;
  config: ResolvedLineChartTooltipConfig;
  measureText: TextMeasurer;
  plotX?: number | undefined;
  plotY: number;
  selection: {
    index: number;
    x: number;
    y: number;
    xLabel: string;
    series: Array<LineChartTooltipSeriesItem<TPoint>>;
  };
  theme: TTheme;
}): LineChartTooltipRenderProps<TPoint, TTheme> | undefined => {
  if (!config.visible || selection.series.length === 0) {
    return undefined;
  }

  const series = config.shared
    ? selection.series
    : selection.series.slice(0, 1);
  const labelWidth = measureText(selection.xLabel, {
    fontSize: config.labelFontSize
  }).width;
  const seriesTextWidths = series.map(
    (item) =>
      measureText(`${item.label}: ${item.formattedValue}`, {
        fontSize: config.fontSize
      }).width
  );
  const markerWidth = 12;
  const contentWidth = Math.max(labelWidth, ...seriesTextWidths) + markerWidth;
  const width = config.width ?? contentWidth + config.padding * 2;
  const height =
    config.padding * 2 +
    lineChartTooltipLabelLineHeight +
    series.length * lineChartTooltipLineHeight;
  const x = getTooltipX({
    chartWidth,
    leftInset: plotX === undefined ? 4 : Math.max(4, plotX + 4),
    selectionX: selection.x,
    width
  });
  const aboveY = selection.y - height - 12;
  const belowY = selection.y + 12;
  const y =
    aboveY >= plotY ? aboveY : clamp(belowY, 4, chartHeight - height - 4);

  return {
    index: selection.index,
    x,
    y,
    width,
    height,
    xLabel: selection.xLabel,
    series,
    config,
    theme
  };
};

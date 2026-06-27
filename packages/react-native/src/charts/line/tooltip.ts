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
  edgePadding,
  anchorX,
  leftInset = edgePadding,
  width
}: {
  chartWidth: number;
  edgePadding: number;
  anchorX: number;
  leftInset?: number | undefined;
  width: number;
}) => clamp(anchorX - width / 2, leftInset, chartWidth - width - edgePadding);

const getTooltipY = ({
  anchorY,
  chartHeight,
  config,
  height,
  plotY
}: {
  anchorY: number;
  chartHeight: number;
  config: ResolvedLineChartTooltipConfig;
  height: number;
  plotY: number;
}) => {
  const minY = config.edgePadding;
  const maxY = chartHeight - height - config.edgePadding;
  const aboveY = anchorY - height - config.offset;
  const belowY = anchorY + config.offset;

  if (config.placement === "above") {
    return clamp(aboveY, minY, maxY);
  }

  if (config.placement === "below") {
    return clamp(belowY, minY, maxY);
  }

  return aboveY >= plotY ? aboveY : clamp(belowY, minY, maxY);
};

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
    scrollOffset + viewportWidth - tooltip.width - tooltip.config.edgePadding
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
    pointer?: { x: number; y: number } | undefined;
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
  const anchor =
    config.anchor === "pointer" && selection.pointer
      ? selection.pointer
      : selection;
  const x = getTooltipX({
    chartWidth,
    edgePadding: config.edgePadding,
    leftInset:
      plotX === undefined
        ? config.edgePadding
        : Math.max(config.edgePadding, plotX + config.edgePadding),
    anchorX: anchor.x,
    width
  });
  const y = getTooltipY({
    anchorY: anchor.y,
    chartHeight,
    config,
    height,
    plotY
  });

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

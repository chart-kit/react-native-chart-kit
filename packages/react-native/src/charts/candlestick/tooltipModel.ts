import { getBarChartTooltipConfig } from "../bar/options";
import type { ResolvedCartesianChartTheme } from "../../theme";
import type {
  CandlestickChartCandleModel,
  CandlestickChartTooltipConfig,
  ResolvedCandlestickChartTooltipConfig
} from "./types";

const tooltipGap = 8;
const tooltipLineHeight = 16;

export type CandlestickChartTooltipModel<TData = unknown> = {
  candle: CandlestickChartCandleModel<TData>;
  height: number;
  lines: Array<{ label: string; value: string }>;
  width: number;
  x: number;
  xLabel: string;
  y: number;
};

export const getCandlestickChartTooltipConfig = ({
  themeTooltip,
  tooltip
}: {
  themeTooltip: ResolvedCartesianChartTheme["tooltip"];
  tooltip: boolean | CandlestickChartTooltipConfig | undefined;
}): ResolvedCandlestickChartTooltipConfig =>
  getBarChartTooltipConfig({ themeTooltip, tooltip });

export const getCandlestickChartTooltipModel = <TData>({
  candle,
  boxes,
  config,
  formatXLabel,
  formatYLabel
}: {
  boxes: { plot: { x: number; y: number; width: number; height: number } };
  candle: CandlestickChartCandleModel<TData> | undefined;
  config: ResolvedCandlestickChartTooltipConfig;
  formatXLabel: (
    value: CandlestickChartCandleModel<TData>["xValue"],
    index: number
  ) => string;
  formatYLabel: (value: number) => string;
}): CandlestickChartTooltipModel<TData> | undefined => {
  if (!candle || !config.visible) {
    return undefined;
  }

  const lines = [
    { label: "O", value: formatYLabel(candle.open) },
    { label: "H", value: formatYLabel(candle.high) },
    { label: "L", value: formatYLabel(candle.low) },
    { label: "C", value: formatYLabel(candle.close) }
  ];
  const height =
    config.padding * 2 +
    config.labelFontSize +
    tooltipLineHeight * lines.length +
    4;
  const width = Math.max(config.width, 150);
  const preferredX = candle.wickX - width / 2;
  const minX = boxes.plot.x + 4;
  const maxX = boxes.plot.x + boxes.plot.width - width - 4;
  const x = Math.max(minX, Math.min(maxX, preferredX));
  const aboveY = candle.highY - height - tooltipGap;
  const belowY = candle.lowY + tooltipGap;
  const y =
    aboveY >= boxes.plot.y + 2
      ? aboveY
      : Math.min(
          boxes.plot.y + boxes.plot.height - height - 2,
          Math.max(boxes.plot.y + 2, belowY)
        );

  return {
    candle,
    height,
    lines,
    width,
    x,
    xLabel: formatXLabel(candle.xValue, candle.dataIndex),
    y
  };
};

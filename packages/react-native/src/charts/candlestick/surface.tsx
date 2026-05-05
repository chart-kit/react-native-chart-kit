import {
  SvgGroup,
  SvgLayer,
  SvgLine,
  SvgRect,
  SvgSurface,
  SvgText
} from "@chart-kit/svg-renderer";

import { getFontFamilyProps } from "../line/text";
import { renderDefaultCandlestickTooltip } from "./tooltip";
import type { CandlestickChartTooltipModel } from "./tooltipModel";
import type {
  CandlestickChartCandleModel,
  CandlestickChartModel,
  ResolvedCandlestickChartTooltipConfig
} from "./types";

export const CandlestickChartSurface = <TData,>({
  chartHeight,
  chartWidth,
  formatYLabel,
  model,
  selectedCandle,
  testID,
  tooltipConfig,
  tooltipModel
}: {
  chartHeight: number;
  chartWidth: number;
  formatYLabel: (value: number) => string;
  model: CandlestickChartModel<TData>;
  selectedCandle: CandlestickChartCandleModel<TData> | undefined;
  testID?: string | undefined;
  tooltipConfig: ResolvedCandlestickChartTooltipConfig;
  tooltipModel: CandlestickChartTooltipModel<TData> | undefined;
}) => {
  const {
    boxes,
    candles,
    resolvedTheme,
    sessionEvents,
    sessionGaps,
    showHorizontalGridLines,
    showXAxisLabels,
    showYAxisLabels,
    volumeBars,
    xLabels,
    yLabels,
    yTicks
  } = model;
  const fontProps = getFontFamilyProps(resolvedTheme.typography.fontFamily);

  return (
    <SvgSurface height={chartHeight} width={chartWidth}>
      <SvgLayer name="background">
        <SvgRect
          fill={resolvedTheme.background}
          height={chartHeight}
          rx={8}
          width={chartWidth}
          x={0}
          y={0}
        />
        <SvgRect
          fill={resolvedTheme.plotBackground}
          height={boxes.plot.height}
          rx={6}
          width={boxes.plot.width}
          x={boxes.plot.x}
          y={boxes.plot.y}
        />
      </SvgLayer>
      <SvgLayer name="grid">
        {sessionGaps.map((gap) => (
          <SvgGroup key={gap.key}>
            <SvgRect
              fill={gap.fill}
              height={gap.height}
              opacity={gap.fillOpacity}
              width={gap.width}
              x={gap.x}
              y={gap.y}
            />
            <SvgLine
              stroke={gap.stroke}
              strokeOpacity={gap.strokeOpacity}
              strokeWidth={gap.strokeWidth}
              x1={gap.x + gap.width / 2}
              x2={gap.x + gap.width / 2}
              y1={gap.y}
              y2={gap.y + gap.height}
              {...(gap.strokeDasharray
                ? { strokeDasharray: gap.strokeDasharray }
                : {})}
            />
          </SvgGroup>
        ))}
        {sessionEvents.map((event) => (
          <SvgGroup key={event.key}>
            <SvgRect
              fill={event.fill}
              height={event.height}
              opacity={event.fillOpacity}
              width={event.width}
              x={event.x}
              y={event.y}
            />
            <SvgLine
              stroke={event.stroke}
              strokeOpacity={event.strokeOpacity}
              strokeWidth={event.strokeWidth}
              x1={event.x + event.width / 2}
              x2={event.x + event.width / 2}
              y1={event.y}
              y2={event.y + event.height}
              {...(event.strokeDasharray
                ? { strokeDasharray: event.strokeDasharray }
                : {})}
            />
          </SvgGroup>
        ))}
        {showHorizontalGridLines
          ? yTicks.map((tick) => {
              const label = yLabels.find((item) => item.key === `tick-${tick}`);

              return label ? (
                <SvgLine
                  key={`grid-y-${tick}`}
                  stroke={resolvedTheme.grid}
                  strokeOpacity={0.64}
                  strokeWidth={1}
                  x1={boxes.plot.x}
                  x2={boxes.plot.x + boxes.plot.width}
                  y1={label.y - resolvedTheme.typography.axisLabelSize / 2 + 2}
                  y2={label.y - resolvedTheme.typography.axisLabelSize / 2 + 2}
                />
              ) : null;
            })
          : null}
      </SvgLayer>
      <SvgLayer name="data">
        {volumeBars.map((bar) => (
          <SvgRect
            key={bar.key}
            fill={bar.color}
            height={bar.height}
            opacity={bar.opacity}
            width={bar.width}
            x={bar.x}
            y={bar.y}
          />
        ))}
        {candles.map((candle) => (
          <SvgLine
            key={`wick-${candle.key}`}
            stroke={candle.color}
            strokeLinecap="round"
            strokeWidth={1.5}
            testID={`${testID ?? "candlestick-chart"}-wick.${candle.dataIndex}`}
            x1={candle.wickX}
            x2={candle.wickX}
            y1={candle.highY}
            y2={candle.lowY}
          />
        ))}
        {candles.map((candle) => (
          <SvgRect
            key={`body-${candle.key}`}
            fill={candle.color}
            height={candle.bodyHeight}
            rx={Math.min(2, candle.bodyWidth / 4)}
            testID={`${testID ?? "candlestick-chart"}-candle.${
              candle.dataIndex
            }`}
            width={candle.bodyWidth}
            x={candle.bodyX}
            y={candle.bodyY}
            {...(selectedCandle?.dataIndex === candle.dataIndex
              ? {
                  stroke: resolvedTheme.text,
                  strokeOpacity: 0.36,
                  strokeWidth: 1.5
                }
              : {})}
          />
        ))}
      </SvgLayer>
      <SvgLayer name="axes">
        {showYAxisLabels
          ? yLabels.map((label) => (
              <SvgText
                key={`label-y-${label.key}`}
                fill={resolvedTheme.mutedText}
                fontSize={resolvedTheme.typography.axisLabelSize}
                textAnchor="end"
                x={label.x}
                y={label.y}
                {...fontProps}
              >
                {label.text}
              </SvgText>
            ))
          : null}
        {showXAxisLabels
          ? xLabels.map((label) => (
              <SvgText
                key={`label-x-${label.index}`}
                fill={resolvedTheme.mutedText}
                fontSize={resolvedTheme.typography.axisLabelSize}
                textAnchor="middle"
                x={label.x}
                y={label.y}
                {...fontProps}
              >
                {label.text}
              </SvgText>
            ))
          : null}
        {sessionGaps.map((gap) =>
          gap.label ? (
            <SvgText
              key={`label-${gap.key}`}
              fill={resolvedTheme.mutedText}
              fontSize={Math.max(9, resolvedTheme.typography.axisLabelSize - 1)}
              textAnchor="middle"
              x={gap.labelX}
              y={gap.labelY}
              {...fontProps}
            >
              {gap.label}
            </SvgText>
          ) : null
        )}
        {sessionEvents.map((event) =>
          event.label ? (
            <SvgText
              key={`label-${event.key}`}
              fill={resolvedTheme.mutedText}
              fontSize={Math.max(9, resolvedTheme.typography.axisLabelSize - 1)}
              textAnchor="middle"
              x={event.labelX}
              y={event.labelY}
              {...fontProps}
            >
              {event.label}
            </SvgText>
          ) : null
        )}
      </SvgLayer>
      <SvgLayer name="interaction">
        {selectedCandle ? (
          <SvgGroup key="candlestick-selection">
            <SvgLine
              stroke={resolvedTheme.axis}
              strokeDasharray={[4, 4]}
              strokeOpacity={0.42}
              strokeWidth={1}
              x1={selectedCandle.wickX}
              x2={selectedCandle.wickX}
              y1={boxes.plot.y}
              y2={boxes.plot.y + boxes.plot.height}
            />
            <SvgRect
              fill={selectedCandle.color}
              height={20}
              rx={5}
              width={58}
              x={boxes.plot.x + boxes.plot.width - 58}
              y={Math.max(
                boxes.plot.y + 2,
                Math.min(
                  boxes.plot.y + boxes.plot.height - 22,
                  selectedCandle.closeY - 10
                )
              )}
            />
            <SvgText
              fill={resolvedTheme.background}
              fontSize={resolvedTheme.typography.axisLabelSize}
              fontWeight="600"
              textAnchor="middle"
              x={boxes.plot.x + boxes.plot.width - 29}
              y={Math.max(
                boxes.plot.y + 16,
                Math.min(
                  boxes.plot.y + boxes.plot.height - 8,
                  selectedCandle.closeY + 4
                )
              )}
              {...fontProps}
            >
              {formatYLabel(selectedCandle.close)}
            </SvgText>
          </SvgGroup>
        ) : null}
        {tooltipModel
          ? renderDefaultCandlestickTooltip({
              ...tooltipModel,
              config: tooltipConfig
            })
          : null}
      </SvgLayer>
    </SvgSurface>
  );
};

import type { ReactNode } from "react";

import { getLineChartRenderer as getCandlestickChartRenderer } from "../line/renderer";
import { getFontFamilyProps } from "../line/text";
import { renderDefaultCandlestickTooltip } from "./tooltip";
import type { CandlestickChartTooltipModel } from "./tooltipModel";
import type {
  CandlestickChartCandleModel,
  CandlestickChartModel,
  CandlestickChartRenderer,
  ResolvedCandlestickChartTooltipConfig
} from "./types";

const RendererLayer = ({
  children
}: {
  children?: ReactNode;
  name?: string;
}) => <>{children}</>;

export const CandlestickChartSurface = <TData,>({
  chartHeight,
  chartWidth,
  crosshairY,
  formatYLabel,
  model,
  renderer: rendererProp,
  selectedCandle,
  selectionPriceLabel = true,
  testID,
  tooltipConfig,
  tooltipModel
}: {
  chartHeight: number;
  chartWidth: number;
  crosshairY?: number | undefined;
  formatYLabel: (value: number) => string;
  model: CandlestickChartModel<TData>;
  renderer?: CandlestickChartRenderer | undefined;
  selectedCandle: CandlestickChartCandleModel<TData> | undefined;
  selectionPriceLabel?: boolean | undefined;
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
  const renderer = getCandlestickChartRenderer(rendererProp);
  const Group = renderer.Group;
  const Layer = renderer.Layer ?? RendererLayer;
  const Circle = renderer.Circle;
  const Line = renderer.Line;
  const Rect = renderer.Rect;
  const Surface = renderer.Surface;
  const SvgText = renderer.Text;
  const canRenderText = renderer.capabilities?.text !== false;
  const selectedCloseLabel = selectedCandle
    ? formatYLabel(selectedCandle.close)
    : "";
  const isCrosshairVisible = selectedCandle && crosshairY !== undefined;
  const markerY = selectedCandle
    ? Math.max(boxes.plot.y + 6, selectedCandle.highY - 8)
    : boxes.plot.y;

  return (
    <Surface height={chartHeight} width={chartWidth}>
      <Layer name="background">
        <Rect
          fill={resolvedTheme.background}
          height={chartHeight}
          rx={8}
          width={chartWidth}
          x={0}
          y={0}
        />
        <Rect
          fill={resolvedTheme.plotBackground}
          height={boxes.plot.height}
          rx={6}
          width={boxes.plot.width}
          x={boxes.plot.x}
          y={boxes.plot.y}
        />
      </Layer>
      <Layer name="grid">
        {sessionGaps.map((gap) => (
          <Group key={gap.key}>
            <Rect
              fill={gap.fill}
              height={gap.height}
              opacity={gap.fillOpacity}
              width={gap.width}
              x={gap.x}
              y={gap.y}
            />
            <Line
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
          </Group>
        ))}
        {sessionEvents.map((event) => (
          <Group key={event.key}>
            <Rect
              fill={event.fill}
              height={event.height}
              opacity={event.fillOpacity}
              width={event.width}
              x={event.x}
              y={event.y}
            />
            <Line
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
          </Group>
        ))}
        {showHorizontalGridLines
          ? yTicks.map((tick) => {
              const label = yLabels.find((item) => item.key === `tick-${tick}`);

              return label ? (
                <Line
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
      </Layer>
      <Layer name="data">
        {volumeBars.map((bar) => (
          <Rect
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
          <Line
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
          <Rect
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
          />
        ))}
      </Layer>
      <Layer name="axes">
        {showYAxisLabels && canRenderText
          ? yLabels.map((label) => (
              <SvgText
                key={`label-y-${label.key}`}
                fill={resolvedTheme.mutedText}
                fontSize={resolvedTheme.typography.axisLabelSize}
                text={label.text}
                textAnchor="end"
                x={label.x}
                y={label.y}
                {...fontProps}
              >
                {label.text}
              </SvgText>
            ))
          : null}
        {showXAxisLabels && canRenderText
          ? xLabels.map((label) => (
              <SvgText
                key={`label-x-${label.index}`}
                fill={resolvedTheme.mutedText}
                fontSize={resolvedTheme.typography.axisLabelSize}
                text={label.text}
                textAnchor="middle"
                x={label.x}
                y={label.y}
                {...fontProps}
              >
                {label.text}
              </SvgText>
            ))
          : null}
        {canRenderText
          ? sessionGaps.map((gap) =>
              gap.label ? (
                <SvgText
                  key={`label-${gap.key}`}
                  fill={resolvedTheme.mutedText}
                  fontSize={Math.max(
                    9,
                    resolvedTheme.typography.axisLabelSize - 1
                  )}
                  text={gap.label}
                  textAnchor="middle"
                  x={gap.labelX}
                  y={gap.labelY}
                  {...fontProps}
                >
                  {gap.label}
                </SvgText>
              ) : null
            )
          : null}
        {canRenderText
          ? sessionEvents.map((event) =>
              event.label ? (
                <SvgText
                  key={`label-${event.key}`}
                  fill={resolvedTheme.mutedText}
                  fontSize={Math.max(
                    9,
                    resolvedTheme.typography.axisLabelSize - 1
                  )}
                  text={event.label}
                  textAnchor="middle"
                  x={event.labelX}
                  y={event.labelY}
                  {...fontProps}
                >
                  {event.label}
                </SvgText>
              ) : null
            )
          : null}
      </Layer>
      <Layer name="interaction">
        {selectedCandle ? (
          <Group key="candlestick-selection">
            <Line
              stroke={
                isCrosshairVisible ? resolvedTheme.text : resolvedTheme.axis
              }
              strokeDasharray={[4, 4]}
              strokeOpacity={isCrosshairVisible ? 0.54 : 0.42}
              strokeWidth={1}
              x1={selectedCandle.wickX}
              x2={selectedCandle.wickX}
              y1={boxes.plot.y}
              y2={boxes.plot.y + boxes.plot.height}
            />
            {isCrosshairVisible ? (
              <Line
                stroke={resolvedTheme.text}
                strokeDasharray={[4, 4]}
                strokeOpacity={0.42}
                strokeWidth={1}
                x1={boxes.plot.x}
                x2={boxes.plot.x + boxes.plot.width}
                y1={crosshairY}
                y2={crosshairY}
              />
            ) : null}
            {isCrosshairVisible ? (
              <Circle
                cx={selectedCandle.wickX}
                cy={markerY}
                fill={resolvedTheme.background}
                r={4.5}
                stroke={selectedCandle.color}
                strokeWidth={2}
              />
            ) : null}
            {selectionPriceLabel && !isCrosshairVisible ? (
              <Rect
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
            ) : null}
            {selectionPriceLabel && !isCrosshairVisible && canRenderText ? (
              <SvgText
                fill={resolvedTheme.background}
                fontSize={resolvedTheme.typography.axisLabelSize}
                fontWeight="600"
                text={selectedCloseLabel}
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
                {selectedCloseLabel}
              </SvgText>
            ) : null}
          </Group>
        ) : null}
        {tooltipModel
          ? renderDefaultCandlestickTooltip(
              {
                ...tooltipModel,
                config: tooltipConfig
              },
              renderer
            )
          : null}
      </Layer>
    </Surface>
  );
};

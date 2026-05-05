import { View, type ViewProps } from "react-native";

import {
  SvgDefs,
  SvgGroup,
  SvgLayer,
  SvgLine,
  SvgLinearGradientDef,
  SvgRect,
  SvgSurface,
  SvgText
} from "@chart-kit/svg-renderer";

import { renderDefaultTooltip } from "./defaultTooltip";
import { renderLineChartDebugLayout } from "./debugOverlay";
import { renderConfiguredLegend } from "./legend";
import { renderDefaultDot } from "./markers";
import { getFontFamilyProps } from "./text";
import {
  getLineChartAreaGradientId,
  LineChartAreaPaths,
  LineChartLinePaths,
  LineChartThresholdClipDefs
} from "./thresholdRendering";
import { useLineChartDebugLayout } from "./useDebugLayout";
import type { LineChartModel } from "./useChartModel";
import type {
  LineChartDotRenderProps,
  LineChartProps,
  LineChartYAxisLabelModel
} from "./types";

export const LineChartSurface = <TData extends Record<string, unknown>>({
  animatedTooltip,
  chartId,
  chartWidth,
  isScrollable,
  mainHeight,
  model,
  props,
  responderProps,
  yAxisLabels
}: {
  animatedTooltip: NonNullable<
    LineChartModel<TData>["selectionModel"]
  >["tooltip"];
  chartWidth: number;
  chartId: string;
  isScrollable: boolean;
  mainHeight: number;
  model: LineChartModel<TData>;
  props: LineChartProps<TData>;
  responderProps: ViewProps;
  yAxisLabels: LineChartYAxisLabelModel[];
}) => {
  const {
    boxes,
    geometries,
    legendModel,
    referenceBandModels,
    referenceLineModels,
    resolvedTheme,
    showHorizontalGridLines,
    showVerticalGridLines,
    crosshairConfig,
    selectionModel,
    xLabelLayout,
    yScale,
    yTicks
  } = model;
  const { debugLayout, onLayoutDebug } = props;
  const debugLayoutModel = useLineChartDebugLayout({
    enabled: Boolean(debugLayout || onLayoutDebug),
    model,
    onLayoutDebug,
    tooltip: animatedTooltip,
    yAxisLabels
  });

  return (
    <View
      collapsable={false}
      style={{ width: chartWidth, height: mainHeight }}
      {...responderProps}
    >
      <SvgSurface width={chartWidth} height={mainHeight}>
        <SvgLayer name="background">
          <SvgRect
            x={0}
            y={0}
            width={chartWidth}
            height={mainHeight}
            rx={8}
            fill={resolvedTheme.background}
          />
        </SvgLayer>
        <SvgLayer name="plot">
          <SvgRect
            x={boxes.plot.x}
            y={boxes.plot.y}
            width={boxes.plot.width}
            height={boxes.plot.height}
            rx={6}
            fill={resolvedTheme.plotBackground}
          />
        </SvgLayer>
        <SvgDefs>
          {geometries.map(({ style }, index) => (
            <SvgLinearGradientDef
              key={`area-gradient-${index}`}
              id={getLineChartAreaGradientId(chartId, index)}
              x1="0%"
              x2="0%"
              y1="0%"
              y2="100%"
              stops={[
                {
                  offset: "0%",
                  color: style.areaFill.fromColor,
                  opacity: style.areaFill.fromOpacity
                },
                {
                  offset: "100%",
                  color: style.areaFill.toColor,
                  opacity: style.areaFill.toOpacity
                }
              ]}
            />
          ))}
          <LineChartThresholdClipDefs
            chartId={chartId}
            geometries={geometries}
            plot={boxes.plot}
            yScale={yScale}
          />
        </SvgDefs>
        <SvgLayer name="grid">
          {showVerticalGridLines
            ? xLabelLayout.items.map((label) => (
                <SvgLine
                  key={`grid-x-${label.index}`}
                  x1={label.gridX}
                  x2={label.gridX}
                  y1={boxes.plot.y}
                  y2={boxes.plot.y + boxes.plot.height}
                  stroke={resolvedTheme.grid}
                  strokeOpacity={0.72}
                  strokeWidth={1}
                />
              ))
            : null}
          {showHorizontalGridLines
            ? yTicks.map((tick) => {
                const y = yScale.scale(tick);

                return (
                  <SvgLine
                    key={`grid-y-${tick}`}
                    x1={boxes.plot.x}
                    x2={boxes.plot.x + boxes.plot.width}
                    y1={y}
                    y2={y}
                    stroke={resolvedTheme.grid}
                    strokeOpacity={0.78}
                    strokeWidth={1}
                  />
                );
              })
            : null}
        </SvgLayer>
        <SvgLayer name="axes">
          {yAxisLabels.map((label) => {
            if (isScrollable) {
              return null;
            }

            return (
              <SvgText
                key={`label-y-${label.key}`}
                x={boxes.plot.x - 8}
                y={label.y}
                fill={resolvedTheme.mutedText}
                fontSize={resolvedTheme.typography.axisLabelSize}
                opacity={label.opacity}
                textAnchor="end"
                {...getFontFamilyProps(resolvedTheme.typography.fontFamily)}
              >
                {label.text}
              </SvgText>
            );
          })}
          {xLabelLayout.items.map((label) => (
            <SvgGroup
              key={`label-x-${label.index}`}
              transform={
                label.rotation !== 0
                  ? `rotate(${label.rotation} ${label.x} ${label.y})`
                  : undefined
              }
            >
              <SvgText
                x={label.x}
                y={label.y}
                fill={resolvedTheme.mutedText}
                fontSize={resolvedTheme.typography.axisLabelSize}
                textAnchor={label.textAnchor}
                {...getFontFamilyProps(resolvedTheme.typography.fontFamily)}
              >
                {label.text}
              </SvgText>
            </SvgGroup>
          ))}
        </SvgLayer>
        <SvgLayer name="referenceBands">
          {referenceBandModels.map((band) => (
            <SvgGroup key={band.key}>
              <SvgRect
                x={band.x}
                y={band.y}
                width={band.width}
                height={band.height}
                fill={band.color}
                opacity={band.opacity}
              />
              {band.label ? (
                <SvgText
                  x={band.label.x}
                  y={band.label.y}
                  fill={band.label.color}
                  fontSize={band.label.fontSize}
                  textAnchor={band.label.textAnchor}
                  {...getFontFamilyProps(resolvedTheme.typography.fontFamily)}
                >
                  {band.label.text}
                </SvgText>
              ) : null}
            </SvgGroup>
          ))}
        </SvgLayer>
        <SvgLayer name="dataArea">
          <LineChartAreaPaths chartId={chartId} geometries={geometries} />
        </SvgLayer>
        <SvgLayer name="data">
          <LineChartLinePaths chartId={chartId} geometries={geometries} />
        </SvgLayer>
        <SvgLayer name="referenceLines">
          {referenceLineModels.map((line) => (
            <SvgGroup key={line.key}>
              <SvgLine
                x1={line.x1}
                x2={line.x2}
                y1={line.y}
                y2={line.y}
                stroke={line.color}
                strokeOpacity={line.opacity}
                strokeWidth={line.strokeWidth}
                {...(line.strokeDasharray
                  ? { strokeDasharray: line.strokeDasharray }
                  : {})}
              />
              {line.label ? (
                <SvgText
                  x={line.label.x}
                  y={line.label.y}
                  fill={line.label.color}
                  fontSize={line.label.fontSize}
                  textAnchor={line.label.textAnchor}
                  {...getFontFamilyProps(resolvedTheme.typography.fontFamily)}
                >
                  {line.label.text}
                </SvgText>
              ) : null}
            </SvgGroup>
          ))}
        </SvgLayer>
        <SvgLayer name="markers">
          {geometries.flatMap(({ geometry, style }) =>
            geometry.points
              .filter((point) => point.defined && style.dot.visible)
              .map((point) => {
                const dotProps: LineChartDotRenderProps<TData> = {
                  point,
                  seriesKey: geometry.key,
                  seriesLabel: geometry.label,
                  color: style.color,
                  x: point.x,
                  y: point.y,
                  value: point.value,
                  dataIndex: point.dataIndex,
                  config: style.dot,
                  theme: resolvedTheme
                };
                const renderedDot = props.renderDot
                  ? props.renderDot(dotProps)
                  : renderDefaultDot(dotProps);

                return renderedDot ? (
                  <SvgGroup key={`dot-${geometry.key}-${point.index}`}>
                    {renderedDot}
                  </SvgGroup>
                ) : null;
              })
          )}
        </SvgLayer>
        <SvgLayer name="overlays">
          {selectionModel && crosshairConfig.visible ? (
            props.renderCrosshair ? (
              props.renderCrosshair({
                chartHeight: mainHeight,
                chartWidth,
                config: crosshairConfig,
                plot: boxes.plot,
                series: selectionModel.series,
                theme: resolvedTheme,
                x: selectionModel.x,
                xLabel: selectionModel.xLabel,
                y: selectionModel.y
              })
            ) : (
              <SvgLine
                key="selection-crosshair"
                x1={selectionModel.x}
                x2={selectionModel.x}
                y1={boxes.plot.y}
                y2={boxes.plot.y + boxes.plot.height}
                stroke={crosshairConfig.color}
                strokeOpacity={crosshairConfig.opacity}
                strokeWidth={crosshairConfig.strokeWidth}
                {...(crosshairConfig.strokeDasharray
                  ? { strokeDasharray: crosshairConfig.strokeDasharray }
                  : {})}
              />
            )
          ) : null}
          {legendModel
            ? renderConfiguredLegend({
                legend: legendModel.renderProps,
                config: legendModel.config
              })
            : null}
        </SvgLayer>
        <SvgLayer name="interaction">
          {selectionModel
            ? selectionModel.series
                .filter((item) => item.activeDot.visible)
                .map((item) => {
                  const dotProps: LineChartDotRenderProps<TData> = {
                    point: item.point,
                    seriesKey: item.key,
                    seriesLabel: item.label,
                    color: item.color,
                    x: item.point.x,
                    y: item.point.y,
                    value: item.value,
                    dataIndex: item.point.dataIndex,
                    config: item.activeDot,
                    theme: resolvedTheme
                  };
                  const renderedDot = props.renderActiveDot
                    ? props.renderActiveDot(dotProps)
                    : renderDefaultDot(dotProps);

                  return renderedDot ? (
                    <SvgGroup key={`active-dot-${item.key}`}>
                      {renderedDot}
                    </SvgGroup>
                  ) : null;
                })
            : null}
          {animatedTooltip
            ? props.renderTooltip
              ? props.renderTooltip(animatedTooltip)
              : renderDefaultTooltip(animatedTooltip)
            : null}
        </SvgLayer>
        {debugLayout && debugLayoutModel ? (
          <SvgLayer name="debug">
            {renderLineChartDebugLayout({
              fontFamily: resolvedTheme.typography.fontFamily,
              model: debugLayoutModel
            })}
          </SvgLayer>
        ) : null}
      </SvgSurface>
    </View>
  );
};

export const StickyYAxis = <TData extends Record<string, unknown>>({
  fadeHeight,
  fadeWidth,
  fadeY,
  gradientId,
  mainHeight,
  model,
  width,
  yAxisLabels
}: {
  fadeHeight: number;
  fadeWidth: number;
  fadeY: number;
  gradientId: string;
  mainHeight: number;
  model: LineChartModel<TData>;
  width: number;
  yAxisLabels: LineChartYAxisLabelModel[];
}) => {
  const { boxes, resolvedTheme } = model;

  return (
    <View
      pointerEvents="none"
      style={{
        left: 0,
        position: "absolute",
        top: 0,
        width,
        height: mainHeight
      }}
    >
      <SvgSurface width={width} height={mainHeight}>
        <SvgDefs>
          <SvgLinearGradientDef
            id={gradientId}
            x1="0%"
            x2="100%"
            y1="0%"
            y2="0%"
            stops={[
              { offset: "0%", color: resolvedTheme.background, opacity: 1 },
              { offset: "100%", color: resolvedTheme.background, opacity: 0 }
            ]}
          />
        </SvgDefs>
        <SvgLayer name="background">
          <SvgRect
            x={0}
            y={0}
            width={boxes.plot.x}
            height={mainHeight}
            fill={resolvedTheme.background}
          />
          {fadeWidth > 0 ? (
            <SvgRect
              x={boxes.plot.x}
              y={fadeY}
              width={fadeWidth}
              height={fadeHeight}
              fill={`url(#${gradientId})`}
            />
          ) : null}
        </SvgLayer>
        <SvgLayer name="axes">
          {yAxisLabels.map((label) => (
            <SvgText
              key={`sticky-label-y-${label.key}`}
              x={boxes.plot.x - 8}
              y={label.y}
              fill={resolvedTheme.mutedText}
              fontSize={resolvedTheme.typography.axisLabelSize}
              opacity={label.opacity}
              textAnchor="end"
              {...getFontFamilyProps(resolvedTheme.typography.fontFamily)}
            >
              {label.text}
            </SvgText>
          ))}
        </SvgLayer>
      </SvgSurface>
    </View>
  );
};

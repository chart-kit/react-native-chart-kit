import { View, type ViewProps } from "react-native";
import { renderDefaultTooltip } from "./defaultTooltip";
import { renderLineChartDebugLayout } from "./debugOverlay";
import { renderConfiguredLegend } from "./legend";
import { renderDefaultDot } from "./markers";
import { getLineChartRenderer } from "./renderer";
import { getFontFamilyProps, measureLineChartText } from "./text";
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
  LineChartRenderer,
  LineChartYAxisLabelModel
} from "./types";

type ReferenceOverlayLabelModel = {
  text: string;
  x: number;
  y: number;
  color: string;
  container?: {
    backgroundColor: string;
    borderRadius: number;
    opacity: number;
    paddingX: number;
    paddingY: number;
  };
  fontSize: number;
  textAnchor: "middle" | "start" | "end";
};

export const LineChartSurface = <TData extends Record<string, unknown>>({
  animatedTooltip,
  chartId,
  chartWidth,
  isScrollable,
  mainHeight,
  model,
  props,
  renderer: rendererProp,
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
  renderer?: LineChartRenderer | undefined;
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
  const renderer = getLineChartRenderer(rendererProp);
  const { Defs, Group, Line, Rect, Surface, Text } = renderer;
  const Layer = renderer.Layer ?? Group;
  const LinearGradient = renderer.LinearGradient;
  const canRenderText = renderer.capabilities?.text !== false;
  const supportsGradientDefs =
    renderer.capabilities?.gradients !== false &&
    renderer.capabilities?.pathGradients !== true &&
    Boolean(LinearGradient);
  const renderReferenceLabel = (
    key: string,
    label: ReferenceOverlayLabelModel
  ) => {
    const fontFamilyProps = getFontFamilyProps(
      resolvedTheme.typography.fontFamily
    );

    if (!label.container) {
      return (
        <Text
          key={key}
          x={label.x}
          y={label.y}
          fill={label.color}
          fontSize={label.fontSize}
          textAnchor={label.textAnchor}
          {...fontFamilyProps}
        >
          {label.text}
        </Text>
      );
    }

    const labelSize = measureLineChartText(label.text, {
      fontFamily: resolvedTheme.typography.fontFamily,
      fontSize: label.fontSize
    });
    const backgroundWidth = labelSize.width + label.container.paddingX * 2;
    const backgroundHeight = labelSize.height + label.container.paddingY * 2;
    const backgroundX =
      label.textAnchor === "end"
        ? label.x - backgroundWidth
        : label.textAnchor === "middle"
          ? label.x - backgroundWidth / 2
          : label.x;
    const backgroundY =
      label.y - labelSize.height + 2 - label.container.paddingY;
    const textX = backgroundX + backgroundWidth / 2;

    return (
      <Group key={key}>
        <Rect
          x={backgroundX}
          y={backgroundY}
          width={backgroundWidth}
          height={backgroundHeight}
          rx={label.container.borderRadius}
          fill={label.container.backgroundColor}
          opacity={label.container.opacity}
        />
        <Text
          x={textX}
          y={label.y}
          fill={label.color}
          fontSize={label.fontSize}
          textAnchor="middle"
          {...fontFamilyProps}
        >
          {label.text}
        </Text>
      </Group>
    );
  };

  return (
    <View
      collapsable={false}
      style={{ width: chartWidth, height: mainHeight }}
      {...responderProps}
    >
      <Surface width={chartWidth} height={mainHeight}>
        <Layer name="background">
          <Rect
            x={0}
            y={0}
            width={chartWidth}
            height={mainHeight}
            rx={8}
            fill={resolvedTheme.background}
          />
        </Layer>
        <Layer name="plot">
          <Rect
            x={boxes.plot.x}
            y={boxes.plot.y}
            width={boxes.plot.width}
            height={boxes.plot.height}
            rx={6}
            fill={resolvedTheme.plotBackground}
          />
        </Layer>
        <Defs>
          {supportsGradientDefs && LinearGradient
            ? geometries.map(({ style }, index) => (
                <LinearGradient
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
              ))
            : null}
          <LineChartThresholdClipDefs
            chartId={chartId}
            geometries={geometries}
            plot={boxes.plot}
            renderer={renderer}
            yScale={yScale}
          />
        </Defs>
        <Layer name="grid">
          {showVerticalGridLines
            ? xLabelLayout.items.map((label) => (
                <Line
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
                  <Line
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
        </Layer>
        <Layer name="axes">
          {yAxisLabels.map((label) => {
            if (isScrollable || !canRenderText) {
              return null;
            }

            return (
              <Text
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
              </Text>
            );
          })}
          {canRenderText
            ? xLabelLayout.items.map((label) => (
                <Group
                  key={`label-x-${label.index}`}
                  transform={
                    label.rotation !== 0
                      ? `rotate(${label.rotation} ${label.x} ${label.y})`
                      : undefined
                  }
                >
                  <Text
                    x={label.x}
                    y={label.y}
                    fill={resolvedTheme.mutedText}
                    fontSize={resolvedTheme.typography.axisLabelSize}
                    textAnchor={label.textAnchor}
                    {...getFontFamilyProps(resolvedTheme.typography.fontFamily)}
                  >
                    {label.text}
                  </Text>
                </Group>
              ))
            : null}
        </Layer>
        <Layer name="referenceBands">
          {referenceBandModels.map((band) => (
            <Rect
              key={band.key}
              x={band.x}
              y={band.y}
              width={band.width}
              height={band.height}
              fill={band.color}
              opacity={band.opacity}
            />
          ))}
        </Layer>
        <Layer name="referenceLines">
          {referenceLineModels.map((line) => (
            <Line
              key={line.key}
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
          ))}
        </Layer>
        <Layer name="dataArea">
          <LineChartAreaPaths
            chartId={chartId}
            geometries={geometries}
            plot={boxes.plot}
            renderer={renderer}
            yScale={yScale}
          />
        </Layer>
        <Layer name="data">
          <LineChartLinePaths
            chartId={chartId}
            geometries={geometries}
            plot={boxes.plot}
            renderer={renderer}
            yScale={yScale}
          />
        </Layer>
        <Layer name="markers">
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
                  : renderDefaultDot(dotProps, renderer);

                return renderedDot ? (
                  <Group key={`dot-${geometry.key}-${point.index}`}>
                    {renderedDot}
                  </Group>
                ) : null;
              })
          )}
        </Layer>
        <Layer name="referenceLabels">
          {referenceBandModels.map((band) =>
            band.label && canRenderText
              ? renderReferenceLabel(`${band.key}-label`, band.label)
              : null
          )}
          {referenceLineModels.map((line) =>
            line.label && canRenderText
              ? renderReferenceLabel(`${line.key}-label`, line.label)
              : null
          )}
        </Layer>
        <Layer name="overlays">
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
              <Line
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
                config: legendModel.config,
                renderer
              })
            : null}
        </Layer>
        <Layer name="interaction">
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
                    : renderDefaultDot(dotProps, renderer);

                  return renderedDot ? (
                    <Group key={`active-dot-${item.key}`}>{renderedDot}</Group>
                  ) : null;
                })
            : null}
          {animatedTooltip
            ? props.renderTooltip
              ? props.renderTooltip(animatedTooltip)
              : renderDefaultTooltip(animatedTooltip, renderer)
            : null}
        </Layer>
        {debugLayout && debugLayoutModel ? (
          <Layer name="debug">
            {renderLineChartDebugLayout({
              fontFamily: resolvedTheme.typography.fontFamily,
              model: debugLayoutModel,
              renderer
            })}
          </Layer>
        ) : null}
      </Surface>
    </View>
  );
};

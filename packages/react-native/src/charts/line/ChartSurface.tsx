import { View, type ViewProps } from "react-native";

import {
  SvgDefs,
  SvgGroup,
  SvgLayer,
  SvgLine,
  SvgLinearGradientDef,
  SvgPath,
  SvgRect,
  SvgSurface,
  SvgText
} from "@chart-kit/svg-renderer";

import { renderDefaultTooltip } from "./defaultTooltip";
import { renderConfiguredLegend } from "./legend";
import { renderDefaultDot } from "./markers";
import { getFontFamilyProps } from "./text";
import type { LineChartModel } from "./useChartModel";
import type { LineChartDotRenderProps, LineChartProps } from "./types";

export const LineChartSurface = <TData extends Record<string, unknown>>({
  animatedTooltip,
  chartWidth,
  isScrollable,
  mainHeight,
  model,
  props,
  responderProps
}: {
  animatedTooltip: NonNullable<
    LineChartModel<TData>["selectionModel"]
  >["tooltip"];
  chartWidth: number;
  isScrollable: boolean;
  mainHeight: number;
  model: LineChartModel<TData>;
  props: LineChartProps<TData>;
  responderProps: ViewProps;
}) => {
  const {
    boxes,
    geometries,
    legendModel,
    resolvedTheme,
    showHorizontalGridLines,
    showVerticalGridLines,
    crosshairConfig,
    selectionModel,
    xLabelLayout,
    yScale,
    yTicks,
    formatYLabel
  } = model;

  return (
    <View style={{ width: chartWidth, height: mainHeight }} {...responderProps}>
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
              id={`area-gradient-${index}`}
              x1="0%"
              x2="0%"
              y1="0%"
              y2="100%"
              stops={[
                { offset: "0%", color: style.color, opacity: 0.22 },
                { offset: "100%", color: style.color, opacity: 0.02 }
              ]}
            />
          ))}
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
          {model.yTicks.map((tick) => {
            if (isScrollable) {
              return null;
            }

            const y = yScale.scale(tick);

            return (
              <SvgText
                key={`label-y-${tick}`}
                x={boxes.plot.x - 8}
                y={y + resolvedTheme.typography.axisLabelSize * 0.36}
                fill={resolvedTheme.mutedText}
                fontSize={resolvedTheme.typography.axisLabelSize}
                textAnchor="end"
                {...getFontFamilyProps(resolvedTheme.typography.fontFamily)}
              >
                {formatYLabel(tick)}
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
        <SvgLayer name="dataArea">
          {geometries.map(({ geometry }, index) =>
            geometry.area ? (
              <SvgPath
                key={`area-${geometry.key}`}
                d={geometry.area.path}
                fill={`url(#area-gradient-${index})`}
              />
            ) : null
          )}
        </SvgLayer>
        <SvgLayer name="data">
          {geometries.map(({ geometry, style }) => (
            <SvgPath
              key={`line-${geometry.key}`}
              d={geometry.line.path}
              fill="none"
              stroke={style.color}
              strokeWidth={style.strokeWidth}
              strokeLinecap={style.strokeStyle.strokeLinecap}
              strokeLinejoin={style.strokeStyle.strokeLinejoin}
              strokeOpacity={style.strokeStyle.strokeOpacity}
              {...(style.strokeStyle.strokeDasharray
                ? { strokeDasharray: style.strokeStyle.strokeDasharray }
                : {})}
            />
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
  width
}: {
  fadeHeight: number;
  fadeWidth: number;
  fadeY: number;
  gradientId: string;
  mainHeight: number;
  model: LineChartModel<TData>;
  width: number;
}) => {
  const { boxes, resolvedTheme, yScale, yTicks, formatYLabel } = model;

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
          {yTicks.map((tick) => {
            const y = yScale.scale(tick);

            return (
              <SvgText
                key={`sticky-label-y-${tick}`}
                x={boxes.plot.x - 8}
                y={y + resolvedTheme.typography.axisLabelSize * 0.36}
                fill={resolvedTheme.mutedText}
                fontSize={resolvedTheme.typography.axisLabelSize}
                textAnchor="end"
                {...getFontFamilyProps(resolvedTheme.typography.fontFamily)}
              >
                {formatYLabel(tick)}
              </SvgText>
            );
          })}
        </SvgLayer>
      </SvgSurface>
    </View>
  );
};

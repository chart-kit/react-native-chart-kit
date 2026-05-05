import { createClipPathRef } from "@chart-kit/svg-renderer";

import type { LineChartModel } from "./useChartModel";
import type { LineChartRenderer } from "./types";

type LineChartGeometryModel<TData extends Record<string, unknown>> =
  LineChartModel<TData>["geometries"][number];

const getAreaGradientId = (chartId: string, index: number) =>
  `${chartId}-area-gradient-${index}`;

const getThresholdClipId = (
  chartId: string,
  index: number,
  side: "above" | "below"
) => `${chartId}-threshold-${index}-${side}`;

export const getLineChartAreaGradientRef = (chartId: string, index: number) =>
  `url(#${getAreaGradientId(chartId, index)})`;

export const getLineChartAreaGradientId = getAreaGradientId;

export const LineChartThresholdClipDefs = <
  TData extends Record<string, unknown>
>({
  chartId,
  geometries,
  plot,
  renderer,
  yScale
}: {
  chartId: string;
  geometries: Array<LineChartGeometryModel<TData>>;
  plot: LineChartModel<TData>["boxes"]["plot"];
  renderer: LineChartRenderer;
  yScale: LineChartModel<TData>["yScale"];
}) => {
  const ClipRect = renderer.ClipRect;

  if (!ClipRect || renderer.capabilities?.clipPaths !== true) {
    return null;
  }

  const plotBottom = plot.y + plot.height;
  const getThresholdY = (y: number) =>
    Math.min(Math.max(yScale.scale(y), plot.y), plotBottom);

  return (
    <>
      {geometries.flatMap(({ style }, index) => {
        if (!style.threshold) {
          return [];
        }

        const thresholdY = getThresholdY(style.threshold.y);

        return [
          <ClipRect
            key={`threshold-above-${index}`}
            id={getThresholdClipId(chartId, index, "above")}
            x={plot.x}
            y={plot.y}
            width={plot.width}
            height={Math.max(0, thresholdY - plot.y)}
          />,
          <ClipRect
            key={`threshold-below-${index}`}
            id={getThresholdClipId(chartId, index, "below")}
            x={plot.x}
            y={thresholdY}
            width={plot.width}
            height={Math.max(0, plotBottom - thresholdY)}
          />
        ];
      })}
    </>
  );
};

export const LineChartAreaPaths = <TData extends Record<string, unknown>>({
  chartId,
  geometries,
  renderer
}: {
  chartId: string;
  geometries: Array<LineChartGeometryModel<TData>>;
  renderer: LineChartRenderer;
}) => {
  const Path = renderer.Path;
  const supportsClipPaths = renderer.capabilities?.clipPaths === true;
  const supportsGradientDefs =
    renderer.capabilities?.gradients !== false &&
    renderer.capabilities?.pathGradients !== true;
  const supportsPathGradients = renderer.capabilities?.pathGradients === true;

  return (
    <>
      {geometries.flatMap(({ geometry, style }, index) => {
        if (!geometry.area) {
          return [];
        }

        const paths = [
          <Path
            key={`area-${geometry.key}`}
            d={geometry.area.path}
            fill={
              supportsGradientDefs
                ? getLineChartAreaGradientRef(chartId, index)
                : style.areaFill.fromColor
            }
            {...(supportsPathGradients
              ? {
                  fillGradient: {
                    x1: "0%",
                    x2: "0%",
                    y1: "0%",
                    y2: "100%",
                    stops: [
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
                    ]
                  }
                }
              : {})}
            {...(!supportsGradientDefs && !supportsPathGradients
              ? { opacity: style.areaFill.fromOpacity }
              : {})}
          />
        ];

        if (style.threshold && supportsClipPaths) {
          paths.push(
            <Path
              key={`area-${geometry.key}-above`}
              d={geometry.area.path}
              fill={style.threshold.areaAboveColor}
              opacity={style.threshold.areaOpacity}
              clipPath={createClipPathRef(
                getThresholdClipId(chartId, index, "above")
              )}
            />,
            <Path
              key={`area-${geometry.key}-below`}
              d={geometry.area.path}
              fill={style.threshold.areaBelowColor}
              opacity={style.threshold.areaOpacity}
              clipPath={createClipPathRef(
                getThresholdClipId(chartId, index, "below")
              )}
            />
          );
        }

        return paths;
      })}
    </>
  );
};

export const LineChartLinePaths = <TData extends Record<string, unknown>>({
  chartId,
  geometries,
  renderer
}: {
  chartId: string;
  geometries: Array<LineChartGeometryModel<TData>>;
  renderer: LineChartRenderer;
}) => {
  const Path = renderer.Path;
  const supportsClipPaths = renderer.capabilities?.clipPaths === true;

  return (
    <>
      {geometries.flatMap(({ geometry, style }, index) => {
        const commonLineProps = {
          d: geometry.line.path,
          fill: "none",
          strokeWidth: style.strokeWidth,
          strokeLinecap: style.strokeStyle.strokeLinecap,
          strokeLinejoin: style.strokeStyle.strokeLinejoin,
          ...(style.strokeStyle.strokeDasharray
            ? { strokeDasharray: style.strokeStyle.strokeDasharray }
            : {})
        };

        if (!style.threshold || !supportsClipPaths) {
          return [
            <Path
              key={`line-${geometry.key}`}
              {...commonLineProps}
              stroke={style.color}
              strokeOpacity={style.strokeStyle.strokeOpacity}
            />
          ];
        }

        return [
          <Path
            key={`line-${geometry.key}-above`}
            {...commonLineProps}
            stroke={style.threshold.aboveColor}
            strokeOpacity={style.threshold.aboveOpacity}
            clipPath={createClipPathRef(
              getThresholdClipId(chartId, index, "above")
            )}
          />,
          <Path
            key={`line-${geometry.key}-below`}
            {...commonLineProps}
            stroke={style.threshold.belowColor}
            strokeOpacity={style.threshold.belowOpacity}
            clipPath={createClipPathRef(
              getThresholdClipId(chartId, index, "below")
            )}
          />
        ];
      })}
    </>
  );
};

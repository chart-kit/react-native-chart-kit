import { createClipPathRef } from "@chart-kit/svg-renderer";

import type { LineChartModel } from "./useChartModel";
import type { LineChartRenderer } from "./types";

type LineChartGeometryModel<TData extends Record<string, unknown>> =
  LineChartModel<TData>["geometries"][number];

type RectClip = {
  height: number;
  width: number;
  x: number;
  y: number;
};

type PlotBox = {
  height: number;
  width: number;
  x: number;
  y: number;
};

type NumericScaleLike = {
  scale: (value: number) => number;
};

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

const getThresholdRectClips = ({
  plot,
  thresholdY
}: {
  plot: PlotBox;
  thresholdY: number;
}): { above: RectClip; below: RectClip } => {
  const plotBottom = plot.y + plot.height;

  return {
    above: {
      height: Math.max(0, thresholdY - plot.y),
      width: plot.width,
      x: plot.x,
      y: plot.y
    },
    below: {
      height: Math.max(0, plotBottom - thresholdY),
      width: plot.width,
      x: plot.x,
      y: thresholdY
    }
  };
};

const getThresholdY = ({
  plot,
  threshold,
  yScale
}: {
  plot: PlotBox;
  threshold: number;
  yScale: NumericScaleLike;
}) => {
  const plotBottom = plot.y + plot.height;

  return Math.min(Math.max(yScale.scale(threshold), plot.y), plotBottom);
};

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

  return (
    <>
      {geometries.flatMap(({ style }, index) => {
        if (!style.threshold) {
          return [];
        }

        const thresholdY = getThresholdY({
          plot,
          threshold: style.threshold.y,
          yScale
        });
        const rectClips = getThresholdRectClips({ plot, thresholdY });

        return [
          <ClipRect
            key={`threshold-above-${index}`}
            id={getThresholdClipId(chartId, index, "above")}
            {...rectClips.above}
          />,
          <ClipRect
            key={`threshold-below-${index}`}
            id={getThresholdClipId(chartId, index, "below")}
            {...rectClips.below}
          />
        ];
      })}
    </>
  );
};

export const LineChartAreaPaths = <TData extends Record<string, unknown>>({
  chartId,
  geometries,
  plot,
  yScale,
  renderer
}: {
  chartId: string;
  geometries: Array<LineChartGeometryModel<TData>>;
  plot?: LineChartModel<TData>["boxes"]["plot"] | undefined;
  renderer: LineChartRenderer;
  yScale?: LineChartModel<TData>["yScale"] | undefined;
}) => {
  const Path = renderer.Path;
  const supportsClipPaths = renderer.capabilities?.clipPaths === true;
  const supportsGradientDefs =
    renderer.capabilities?.gradients !== false &&
    renderer.capabilities?.pathGradients !== true;
  const supportsPathGradients = renderer.capabilities?.pathGradients === true;
  const supportsRectClips = renderer.capabilities?.rectClips === true;

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
        } else if (style.threshold && supportsRectClips && plot && yScale) {
          const thresholdY = getThresholdY({
            plot,
            threshold: style.threshold.y,
            yScale
          });
          const rectClips = getThresholdRectClips({ plot, thresholdY });

          paths.push(
            <Path
              key={`area-${geometry.key}-above`}
              d={geometry.area.path}
              fill={style.threshold.areaAboveColor}
              opacity={style.threshold.areaOpacity}
              clipRect={rectClips.above}
            />,
            <Path
              key={`area-${geometry.key}-below`}
              d={geometry.area.path}
              fill={style.threshold.areaBelowColor}
              opacity={style.threshold.areaOpacity}
              clipRect={rectClips.below}
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
  plot,
  yScale,
  renderer
}: {
  chartId: string;
  geometries: Array<LineChartGeometryModel<TData>>;
  plot?: LineChartModel<TData>["boxes"]["plot"] | undefined;
  renderer: LineChartRenderer;
  yScale?: LineChartModel<TData>["yScale"] | undefined;
}) => {
  const Path = renderer.Path;
  const supportsClipPaths = renderer.capabilities?.clipPaths === true;
  const supportsRectClips = renderer.capabilities?.rectClips === true;

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

        if (!style.threshold) {
          return [
            <Path
              key={`line-${geometry.key}`}
              {...commonLineProps}
              stroke={style.color}
              strokeOpacity={style.strokeStyle.strokeOpacity}
            />
          ];
        }

        if (supportsRectClips && plot && yScale) {
          const thresholdY = getThresholdY({
            plot,
            threshold: style.threshold.y,
            yScale
          });
          const rectClips = getThresholdRectClips({ plot, thresholdY });

          return [
            <Path
              key={`line-${geometry.key}-above`}
              {...commonLineProps}
              stroke={style.threshold.aboveColor}
              strokeOpacity={style.threshold.aboveOpacity}
              clipRect={rectClips.above}
            />,
            <Path
              key={`line-${geometry.key}-below`}
              {...commonLineProps}
              stroke={style.threshold.belowColor}
              strokeOpacity={style.threshold.belowOpacity}
              clipRect={rectClips.below}
            />
          ];
        }

        if (!supportsClipPaths) {
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

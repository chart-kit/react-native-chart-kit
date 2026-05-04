import {
  createClipPathRef,
  SvgClipRect,
  SvgPath
} from "@chart-kit/svg-renderer";

import type { LineChartModel } from "./useChartModel";

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
  yScale
}: {
  chartId: string;
  geometries: Array<LineChartGeometryModel<TData>>;
  plot: LineChartModel<TData>["boxes"]["plot"];
  yScale: LineChartModel<TData>["yScale"];
}) => {
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
          <SvgClipRect
            key={`threshold-above-${index}`}
            id={getThresholdClipId(chartId, index, "above")}
            x={plot.x}
            y={plot.y}
            width={plot.width}
            height={Math.max(0, thresholdY - plot.y)}
          />,
          <SvgClipRect
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
  geometries
}: {
  chartId: string;
  geometries: Array<LineChartGeometryModel<TData>>;
}) => (
  <>
    {geometries.flatMap(({ geometry, style }, index) => {
      if (!geometry.area) {
        return [];
      }

      const paths = [
        <SvgPath
          key={`area-${geometry.key}`}
          d={geometry.area.path}
          fill={getLineChartAreaGradientRef(chartId, index)}
        />
      ];

      if (style.threshold) {
        paths.push(
          <SvgPath
            key={`area-${geometry.key}-above`}
            d={geometry.area.path}
            fill={style.threshold.areaAboveColor}
            opacity={style.threshold.areaOpacity}
            clipPath={createClipPathRef(
              getThresholdClipId(chartId, index, "above")
            )}
          />,
          <SvgPath
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

export const LineChartLinePaths = <TData extends Record<string, unknown>>({
  chartId,
  geometries
}: {
  chartId: string;
  geometries: Array<LineChartGeometryModel<TData>>;
}) => (
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
          <SvgPath
            key={`line-${geometry.key}`}
            {...commonLineProps}
            stroke={style.color}
            strokeOpacity={style.strokeStyle.strokeOpacity}
          />
        ];
      }

      return [
        <SvgPath
          key={`line-${geometry.key}-above`}
          {...commonLineProps}
          stroke={style.threshold.aboveColor}
          strokeOpacity={style.threshold.aboveOpacity}
          clipPath={createClipPathRef(
            getThresholdClipId(chartId, index, "above")
          )}
        />,
        <SvgPath
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

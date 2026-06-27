import type { ResolvedCartesianChartTheme } from "../../theme";
import {
  getLineChartAreaFillConfig,
  getLineChartDotConfig,
  getLineChartStrokeStyle,
  getLineChartThresholdStyle,
  type LineChartAreaFillConfig,
  type LineChartDotConfig
} from "./options";
import type { LineChartSeries } from "./types";
import { getSeriesColor } from "./utils";

export const buildLineChartSeriesStyleMap = <
  TData extends Record<string, unknown>
>({
  areaFill,
  dots,
  resolvedTheme,
  seriesInput,
  showDots
}: {
  areaFill: LineChartAreaFillConfig | undefined;
  dots: boolean | LineChartDotConfig | undefined;
  resolvedTheme: ResolvedCartesianChartTheme;
  seriesInput: Array<LineChartSeries<TData>>;
  showDots: boolean;
}) =>
  new Map(
    seriesInput.map((item, index) => {
      const color = item.color ?? getSeriesColor(resolvedTheme, index);

      return [
        String(item.key ?? item.yKey),
        {
          strokeWidth: item.strokeWidth ?? 3,
          strokeStyle: getLineChartStrokeStyle({
            strokeDasharray: item.strokeDasharray,
            strokeLinecap: item.strokeLinecap,
            strokeLinejoin: item.strokeLinejoin,
            strokeOpacity: item.strokeOpacity
          }),
          area: item.area,
          areaFill: getLineChartAreaFillConfig({
            areaFill: item.areaFill ?? areaFill,
            seriesColor: color
          }),
          curve: item.curve,
          color,
          threshold: getLineChartThresholdStyle({
            seriesColor: color,
            threshold: item.threshold
          }),
          dot: getLineChartDotConfig({
            dots,
            seriesDot: item.dot,
            showDots
          })
        }
      ];
    })
  );

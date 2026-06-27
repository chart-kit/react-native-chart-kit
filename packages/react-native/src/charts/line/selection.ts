import {
  getLineChartActiveDotConfig,
  type LineChartDotConfig,
  type ResolvedLineChartDotConfig
} from "./options";
import type { LineChartTooltipSeriesItem } from "./tooltip";

export type LineChartSelectablePoint = {
  dataIndex: number;
  defined: boolean;
  index: number;
  value?: number | null;
  x: number;
  y: number;
};

export type LineChartSelectableGeometry<
  TPoint extends LineChartSelectablePoint
> = {
  geometry: {
    key: string;
    label: string;
    points: TPoint[];
  };
  style: {
    color: string;
    dot: ResolvedLineChartDotConfig;
  };
};

export type LineChartSelectedSeriesItem<
  TPoint extends LineChartSelectablePoint
> = LineChartTooltipSeriesItem<TPoint> & {
  activeDot: ResolvedLineChartDotConfig;
};

export const getSelectedLineSeries = <TPoint extends LineChartSelectablePoint>({
  activeDot,
  formatYLabel,
  geometries,
  selectedDataIndex
}: {
  activeDot: boolean | LineChartDotConfig | undefined;
  formatYLabel: (value: number) => string;
  geometries: Array<LineChartSelectableGeometry<TPoint>>;
  selectedDataIndex: number | undefined;
}): Array<LineChartSelectedSeriesItem<TPoint>> => {
  if (selectedDataIndex === undefined) {
    return [];
  }

  return geometries.flatMap<LineChartSelectedSeriesItem<TPoint>>(
    ({ geometry, style }) => {
      const point = geometry.points.find(
        (item) => item.dataIndex === selectedDataIndex
      );

      if (!point || !point.defined) {
        return [];
      }

      return [
        {
          key: geometry.key,
          label: geometry.label,
          color: style.color,
          value: point.value,
          formattedValue:
            typeof point.value === "number" ? formatYLabel(point.value) : "—",
          point,
          activeDot: getLineChartActiveDotConfig({
            activeDot,
            baseDot: style.dot
          })
        }
      ];
    }
  );
};

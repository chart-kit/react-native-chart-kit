import type { ChartXValue } from "@chart-kit/core";

import type {
  LineChartSelectablePoint,
  LineChartSelectedSeriesItem
} from "./selection";

export type LineChartInteractionMode = "none" | "tap" | "scrub";
export type LineChartSelectionPersistence = "persist" | "whileActive" | "none";

export type LineChartSelectSeriesItem<
  TPoint extends LineChartSelectablePoint = LineChartSelectablePoint
> = {
  key: string;
  label: string;
  color: string;
  value: number | null | undefined;
  formattedValue: string;
  point: TPoint;
};

export type LineChartSelectEvent<
  TData = unknown,
  TPoint extends LineChartSelectablePoint = LineChartSelectablePoint
> = {
  index: number;
  x: ChartXValue;
  xLabel: string;
  position: {
    x: number;
    y: number;
  };
  series: Array<LineChartSelectSeriesItem<TPoint>>;
  raw?: TData;
};

export type LineChartDeselectEvent = {
  reason: "outsidePress" | "gestureEnd" | "programmatic";
};

export type LineChartInteractionConfig<TData = unknown> = {
  mode?: LineChartInteractionMode;
  selectionPersistence?: LineChartSelectionPersistence;
  deselectOnOutsidePress?: boolean;
  onSelect?: (event: LineChartSelectEvent<TData>) => void;
  onDeselect?: (event: LineChartDeselectEvent) => void;
  onGestureStart?: () => void;
  onGestureEnd?: () => void;
};

export type LineChartInteraction<TData = unknown> =
  | LineChartInteractionMode
  | LineChartInteractionConfig<TData>;

export type ResolvedLineChartInteractionConfig<TData = unknown> = {
  mode: LineChartInteractionMode;
  selectionPersistence: LineChartSelectionPersistence;
  deselectOnOutsidePress: boolean;
  onSelect?: (event: LineChartSelectEvent<TData>) => void;
  onDeselect?: (event: LineChartDeselectEvent) => void;
  onGestureStart?: () => void;
  onGestureEnd?: () => void;
};

export type LineChartInteractionPoint<TData = unknown> = {
  dataIndex: number;
  x: number;
  xValue: ChartXValue;
  xLabel: string;
  raw?: TData;
};

export type LineChartInteractionBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const normalizeLineChartSelectedIndex = (
  selectedIndex: number | undefined
) => {
  return typeof selectedIndex === "number" && Number.isFinite(selectedIndex)
    ? Math.round(selectedIndex)
    : undefined;
};

export const getLineChartInteractionConfig = <TData>(
  interaction: LineChartInteraction<TData> | undefined
): ResolvedLineChartInteractionConfig<TData> => {
  if (!interaction) {
    return {
      mode: "none",
      selectionPersistence: "persist",
      deselectOnOutsidePress: false
    };
  }

  if (typeof interaction === "string") {
    return {
      mode: interaction,
      selectionPersistence: "persist",
      deselectOnOutsidePress: true
    };
  }

  const mode = interaction.mode ?? "tap";

  return {
    mode,
    selectionPersistence: interaction.selectionPersistence ?? "persist",
    deselectOnOutsidePress: interaction.deselectOnOutsidePress ?? true,
    ...(interaction.onSelect ? { onSelect: interaction.onSelect } : {}),
    ...(interaction.onDeselect ? { onDeselect: interaction.onDeselect } : {}),
    ...(interaction.onGestureStart
      ? { onGestureStart: interaction.onGestureStart }
      : {}),
    ...(interaction.onGestureEnd
      ? { onGestureEnd: interaction.onGestureEnd }
      : {})
  };
};

export const isLineChartInteractionEnabled = <TData>(
  config: ResolvedLineChartInteractionConfig<TData>
) => config.mode !== "none";

export const isLineChartInteractionInBounds = ({
  bounds,
  locationX,
  locationY,
  touchSlop = 16
}: {
  bounds: LineChartInteractionBounds;
  locationX: number;
  locationY: number;
  touchSlop?: number;
}) => {
  return (
    locationX >= bounds.x - touchSlop &&
    locationX <= bounds.x + bounds.width + touchSlop &&
    locationY >= bounds.y - touchSlop &&
    locationY <= bounds.y + bounds.height + touchSlop
  );
};

export const getNearestLineChartInteractionIndex = ({
  locationX,
  points
}: {
  locationX: number;
  points: Array<LineChartInteractionPoint>;
}) => {
  let nearest:
    | {
        dataIndex: number;
        distance: number;
      }
    | undefined;

  points.forEach((point) => {
    if (!Number.isFinite(point.x)) {
      return;
    }

    const distance = Math.abs(point.x - locationX);

    if (!nearest || distance < nearest.distance) {
      nearest = {
        dataIndex: point.dataIndex,
        distance
      };
    }
  });

  return nearest?.dataIndex;
};

export const buildLineChartSelectEvent = <
  TData,
  TPoint extends LineChartSelectablePoint
>({
  interactionPoints,
  selectedDataIndex,
  selectedSeries
}: {
  interactionPoints: Array<LineChartInteractionPoint<TData>>;
  selectedDataIndex: number;
  selectedSeries: Array<LineChartSelectedSeriesItem<TPoint>>;
}): LineChartSelectEvent<TData, TPoint> | undefined => {
  const interactionPoint = interactionPoints.find(
    (point) => point.dataIndex === selectedDataIndex
  );

  if (!interactionPoint || selectedSeries.length === 0) {
    return undefined;
  }

  const y = Math.min(...selectedSeries.map((item) => item.point.y));
  const event = {
    index: selectedDataIndex,
    x: interactionPoint.xValue,
    xLabel: interactionPoint.xLabel,
    position: {
      x: interactionPoint.x,
      y
    },
    series: selectedSeries.map((item) => ({
      key: item.key,
      label: item.label,
      color: item.color,
      value: item.value,
      formattedValue: item.formattedValue,
      point: item.point
    }))
  };

  return interactionPoint.raw !== undefined
    ? { ...event, raw: interactionPoint.raw }
    : event;
};

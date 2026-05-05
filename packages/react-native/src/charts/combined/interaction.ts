import type {
  CombinedChartInteraction,
  CombinedChartInteractionConfig,
  CombinedChartInteractionPoint,
  CombinedChartModel,
  CombinedChartSelectEvent,
  CombinedChartTooltipPoint,
  CombinedChartTooltipSeriesItem
} from "./types";

export type ResolvedCombinedChartInteractionConfig<TData = unknown> = {
  deselectOnOutsidePress: boolean;
  mode: "none" | "tap";
  onDeselect?: CombinedChartInteractionConfig<TData>["onDeselect"];
  onSelect?: CombinedChartInteractionConfig<TData>["onSelect"];
};

export const normalizeCombinedChartSelectedIndex = (
  selectedIndex: number | undefined
) =>
  typeof selectedIndex === "number" && Number.isFinite(selectedIndex)
    ? Math.round(selectedIndex)
    : undefined;

export const getCombinedChartInteractionConfig = <TData>(
  interaction: CombinedChartInteraction<TData> | undefined
): ResolvedCombinedChartInteractionConfig<TData> => {
  if (!interaction) {
    return {
      deselectOnOutsidePress: false,
      mode: "none"
    };
  }

  if (typeof interaction === "string") {
    return {
      deselectOnOutsidePress: true,
      mode: interaction
    };
  }

  return {
    deselectOnOutsidePress: interaction.deselectOnOutsidePress ?? true,
    mode: interaction.mode ?? "tap",
    ...(interaction.onDeselect ? { onDeselect: interaction.onDeselect } : {}),
    ...(interaction.onSelect ? { onSelect: interaction.onSelect } : {})
  };
};

export const isCombinedChartInteractionEnabled = <TData>(
  config: ResolvedCombinedChartInteractionConfig<TData>
) => config.mode !== "none";

export const isCombinedChartInteractionInBounds = ({
  bounds,
  locationX,
  locationY,
  touchSlop = 16
}: {
  bounds: { height: number; width: number; x: number; y: number };
  locationX: number;
  locationY: number;
  touchSlop?: number;
}) =>
  locationX >= bounds.x - touchSlop &&
  locationX <= bounds.x + bounds.width + touchSlop &&
  locationY >= bounds.y - touchSlop &&
  locationY <= bounds.y + bounds.height + touchSlop;

export const getNearestCombinedChartInteractionIndex = ({
  locationX,
  points
}: {
  locationX: number;
  points: Array<CombinedChartInteractionPoint>;
}) => {
  let nearest: { dataIndex: number; distance: number } | undefined;

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

const getBarTooltipPoint = <TData>(
  bar: CombinedChartModel<TData>["bars"][number]
): CombinedChartTooltipPoint<TData> => {
  const point = {
    dataIndex: bar.dataIndex,
    kind: "bar" as const,
    seriesKey: bar.seriesKey,
    value: bar.value,
    x: bar.x + bar.width / 2,
    xValue: bar.xValue,
    y: bar.y
  };

  return bar.raw === undefined ? point : { ...point, raw: bar.raw };
};

const getLineTooltipPoint = <TData>(
  line: CombinedChartModel<TData>["lines"][number],
  dataIndex: number
): CombinedChartTooltipPoint<TData> | undefined => {
  const point = line.geometry.points.find(
    (item) => item.dataIndex === dataIndex
  );

  if (!point || !point.defined) {
    return undefined;
  }

  const tooltipPoint = {
    dataIndex: point.dataIndex,
    kind: "line" as const,
    seriesKey: line.key,
    value: point.value,
    x: point.x,
    xValue: point.xValue,
    y: point.y
  };

  return point.raw === undefined
    ? tooltipPoint
    : { ...tooltipPoint, raw: point.raw };
};

export const getSelectedCombinedSeries = <TData>({
  model,
  selectedIndex
}: {
  model: CombinedChartModel<TData>;
  selectedIndex: number | undefined;
}): Array<CombinedChartTooltipSeriesItem<TData>> => {
  if (selectedIndex === undefined) {
    return [];
  }

  const selectedBars = new Map(
    model.bars
      .filter((bar) => bar.dataIndex === selectedIndex)
      .map((bar) => [bar.seriesKey, bar])
  );
  const selectedLines = new Map(
    model.lines.map((line) => [
      line.key,
      getLineTooltipPoint(line, selectedIndex)
    ])
  );

  return model.series.flatMap((series) => {
    if (series.kind === "bar") {
      const bar = selectedBars.get(series.key);

      return bar
        ? [
            {
              color: series.color,
              formattedValue: bar.formattedValue,
              key: series.key,
              label: series.label,
              point: getBarTooltipPoint(bar),
              value: bar.value
            }
          ]
        : [];
    }

    const point = selectedLines.get(series.key);
    const line = model.lines.find((item) => item.key === series.key);
    const linePoint = line?.geometry.points.find(
      (item) => item.dataIndex === selectedIndex
    );

    return point && linePoint
      ? [
          {
            color: series.color,
            formattedValue: linePoint.formattedValue,
            key: series.key,
            label: series.label,
            point,
            value: point.value
          }
        ]
      : [];
  });
};

export const buildCombinedChartSelectEvent = <TData>({
  interactionPoints,
  selectedIndex,
  selectedSeries
}: {
  interactionPoints: Array<CombinedChartInteractionPoint<TData>>;
  selectedIndex: number;
  selectedSeries: Array<CombinedChartTooltipSeriesItem<TData>>;
}): CombinedChartSelectEvent<TData> | undefined => {
  const interactionPoint = interactionPoints.find(
    (point) => point.dataIndex === selectedIndex
  );

  if (!interactionPoint || selectedSeries.length === 0) {
    return undefined;
  }

  const y = Math.min(...selectedSeries.map((item) => item.point.y));
  const event = {
    index: selectedIndex,
    position: {
      x: interactionPoint.x,
      y
    },
    series: selectedSeries,
    x: interactionPoint.xValue,
    xLabel: interactionPoint.xLabel
  };

  return interactionPoint.raw === undefined
    ? event
    : { ...event, raw: interactionPoint.raw };
};

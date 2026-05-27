import type {
  BarChartBarModel,
  BarChartDeselectEvent,
  BarChartInteraction,
  BarChartSelectEvent,
  BarChartSelectedBar
} from "./types";

export type ResolvedBarChartInteractionConfig<TData = unknown> = {
  mode: "none" | "tap";
  deselectOnOutsidePress: boolean;
  onSelect?: (event: BarChartSelectEvent<TData>) => void;
  onDeselect?: (event: BarChartDeselectEvent) => void;
};

export const getBarChartBarKey = (
  selectedBar: BarChartSelectedBar | undefined
) =>
  selectedBar ? `${selectedBar.seriesKey}-${selectedBar.dataIndex}` : undefined;

export const getBarChartInteractionConfig = <TData>(
  interaction: BarChartInteraction<TData> | undefined
): ResolvedBarChartInteractionConfig<TData> => {
  if (!interaction) {
    return {
      mode: "none",
      deselectOnOutsidePress: false
    };
  }

  if (typeof interaction === "string") {
    return {
      mode: interaction,
      deselectOnOutsidePress: interaction !== "none"
    };
  }

  return {
    mode: interaction.mode ?? "tap",
    deselectOnOutsidePress: interaction.deselectOnOutsidePress ?? true,
    ...(interaction.onSelect ? { onSelect: interaction.onSelect } : {}),
    ...(interaction.onDeselect ? { onDeselect: interaction.onDeselect } : {})
  };
};

export const isBarChartInteractionEnabled = <TData>(
  config: ResolvedBarChartInteractionConfig<TData>
) => config.mode !== "none";

export const getBarChartBarAtPoint = <TData>({
  bars,
  hitSlop = 6,
  locationX,
  locationY
}: {
  bars: Array<BarChartBarModel<TData>>;
  hitSlop?: number;
  locationX: number;
  locationY: number;
}) => {
  const candidates = bars.filter((bar) => {
    const top = bar.y;
    const bottom = bar.y + bar.height;

    return (
      locationX >= bar.x - hitSlop &&
      locationX <= bar.x + bar.width + hitSlop &&
      locationY >= top - hitSlop &&
      locationY <= bottom + hitSlop
    );
  });

  if (candidates.length <= 1) {
    return candidates[0];
  }

  return candidates
    .map((bar) => ({
      bar,
      distance:
        Math.abs(locationX - (bar.x + bar.width / 2)) +
        Math.abs(locationY - (bar.y + bar.height / 2))
    }))
    .sort((a, b) => a.distance - b.distance)[0]?.bar;
};

export const buildBarChartSelectEvent = <TData>(
  bar: BarChartBarModel<TData> | undefined
): BarChartSelectEvent<TData> | undefined => {
  if (!bar) {
    return undefined;
  }

  return {
    color: bar.color,
    dataIndex: bar.dataIndex,
    formattedValue: bar.formattedValue,
    position: {
      x: bar.x + bar.width / 2,
      y: bar.y
    },
    raw: bar.raw,
    seriesKey: bar.seriesKey,
    seriesLabel: bar.seriesLabel,
    value: bar.value,
    x: bar.xValue,
    xLabel: bar.xLabel
  };
};

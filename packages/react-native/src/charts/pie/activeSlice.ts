import type {
  PieChartActiveSliceConfig,
  PieChartInteraction,
  PieChartProps
} from "./types";

export type ResolvedPieChartActiveSliceConfig =
  Required<PieChartActiveSliceConfig>;

export const resolvePieChartActiveSliceConfig = ({
  activeSlice,
  backgroundColor
}: {
  activeSlice: PieChartActiveSliceConfig | undefined;
  backgroundColor: string;
}): ResolvedPieChartActiveSliceConfig => ({
  activeOpacity: activeSlice?.activeOpacity ?? 1,
  inactiveOpacity: activeSlice?.inactiveOpacity ?? 0.62,
  activeOffset: activeSlice?.activeOffset ?? 5,
  activeScale: activeSlice?.activeScale ?? 1.025,
  strokeColor: activeSlice?.strokeColor ?? backgroundColor,
  strokeWidth: activeSlice?.strokeWidth ?? 0
});

const hasTapInteraction = <TData>(
  interaction: PieChartInteraction<TData> | undefined
) => {
  if (interaction === "tap") {
    return true;
  }

  if (!interaction || interaction === "none") {
    return false;
  }

  return interaction.mode === undefined || interaction.mode === "tap";
};

export const shouldReservePieChartActiveSliceGutter = <
  TData extends Record<string, unknown>
>({
  props,
  selectedIndex
}: {
  props: PieChartProps<TData>;
  selectedIndex: number | undefined;
}) =>
  props.activeSlice !== undefined ||
  selectedIndex !== undefined ||
  props.defaultSelectedIndex !== undefined ||
  props.selectedIndex !== undefined ||
  hasTapInteraction(props.interaction);

export const getPieChartActiveSliceGutter = ({
  activeSlice,
  radius
}: {
  activeSlice: ResolvedPieChartActiveSliceConfig;
  radius: number;
}) =>
  Math.ceil(
    activeSlice.activeOffset +
      radius * Math.max(0, activeSlice.activeScale - 1) +
      Math.max(0, activeSlice.strokeWidth) / 2 +
      2
  );

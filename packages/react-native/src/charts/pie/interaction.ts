import type { PieArcModel } from "@chart-kit/core";

import type {
  PieChartInteraction,
  PieChartInteractionConfig,
  PieChartSelectEvent
} from "./types";

type PieChartPoint = {
  locationX: number;
  locationY: number;
};

type PieChartHitTestOptions<TData = unknown> = PieChartPoint & {
  arcs: Array<PieArcModel<TData>>;
  centerX: number;
  centerY: number;
  innerRadius: number;
  radius: number;
};

export type ResolvedPieChartInteractionConfig<TData = unknown> = {
  mode: "none" | "tap";
  deselectOnOutsidePress: boolean;
  onDeselect: PieChartInteractionConfig<TData>["onDeselect"] | undefined;
  onSelect: PieChartInteractionConfig<TData>["onSelect"] | undefined;
};

const fullCircle = Math.PI * 2;

const normalizeAngleFromStart = (angle: number, startAngle: number) => {
  let normalizedAngle = angle;

  while (normalizedAngle < startAngle) {
    normalizedAngle += fullCircle;
  }

  while (normalizedAngle >= startAngle + fullCircle) {
    normalizedAngle -= fullCircle;
  }

  return normalizedAngle;
};

export const getPieChartInteractionConfig = <TData>(
  interaction?: PieChartInteraction<TData> | undefined
): ResolvedPieChartInteractionConfig<TData> => {
  if (!interaction) {
    return {
      mode: "none",
      deselectOnOutsidePress: true,
      onDeselect: undefined,
      onSelect: undefined
    };
  }

  if (interaction === "tap" || interaction === "none") {
    return {
      mode: interaction,
      deselectOnOutsidePress: true,
      onDeselect: undefined,
      onSelect: undefined
    };
  }

  return {
    mode: interaction.mode ?? "tap",
    deselectOnOutsidePress: interaction.deselectOnOutsidePress !== false,
    onDeselect: interaction.onDeselect,
    onSelect: interaction.onSelect
  };
};

export const isPieChartInteractionEnabled = <TData>(
  config: ResolvedPieChartInteractionConfig<TData>
) => config.mode === "tap";

export const normalizePieChartSelectedIndex = (
  selectedIndex: number | undefined
) =>
  typeof selectedIndex === "number" && Number.isFinite(selectedIndex)
    ? Math.max(0, Math.floor(selectedIndex))
    : undefined;

export const getPieChartSliceAtPoint = <TData>({
  arcs,
  centerX,
  centerY,
  innerRadius,
  locationX,
  locationY,
  radius
}: PieChartHitTestOptions<TData>) => {
  const dx = locationX - centerX;
  const dy = locationY - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < innerRadius || distance > radius) {
    return undefined;
  }

  const firstDefinedArc = arcs.find((arc) => arc.defined);

  if (!firstDefinedArc) {
    return undefined;
  }

  const angle = normalizeAngleFromStart(
    Math.atan2(dy, dx),
    firstDefinedArc.startAngle
  );

  return arcs.find(
    (arc) => arc.defined && angle >= arc.startAngle && angle <= arc.endAngle
  );
};

export const buildPieChartSelectEvent = <TData>(
  arc: PieArcModel<TData> | undefined
): PieChartSelectEvent<TData> | undefined => {
  if (!arc || !arc.defined) {
    return undefined;
  }

  return {
    index: arc.index,
    label: arc.label,
    value: arc.value,
    percentage: arc.percentage,
    ...(arc.color !== undefined ? { color: arc.color } : {}),
    ...(arc.raw !== undefined ? { raw: arc.raw } : {})
  };
};

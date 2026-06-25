import type { LegacyContributionValue } from "@chart-kit/core";

import type {
  ContributionGraphCellModel,
  ContributionGraphDayPressEvent,
  ContributionGraphInteraction,
  ContributionGraphInteractionConfig,
  ContributionGraphInteractionMode
} from "./types";

export type ResolvedContributionGraphInteractionConfig<
  TData = LegacyContributionValue
> = {
  mode: ContributionGraphInteractionMode;
  hitSlop: number;
  pointerOffset: {
    x: number;
    y: number;
  };
  onSelect: ContributionGraphInteractionConfig<TData>["onSelect"] | undefined;
};

type ContributionGraphHitTestOptions<TData extends LegacyContributionValue> = {
  cells: Array<ContributionGraphCellModel<TData>>;
  locationX: number;
  locationY: number;
  hitSlop: number;
};

const defaultCellHitSlop = 3;
const defaultPointerOffset = { x: 0, y: 0 };

const normalizeHitSlop = (hitSlop: number | undefined) =>
  typeof hitSlop === "number" && Number.isFinite(hitSlop) && hitSlop >= 0
    ? hitSlop
    : defaultCellHitSlop;

const normalizePointerOffset = (
  pointerOffset: ContributionGraphInteractionConfig["pointerOffset"]
) => ({
  x:
    typeof pointerOffset?.x === "number" && Number.isFinite(pointerOffset.x)
      ? pointerOffset.x
      : defaultPointerOffset.x,
  y:
    typeof pointerOffset?.y === "number" && Number.isFinite(pointerOffset.y)
      ? pointerOffset.y
      : defaultPointerOffset.y
});

export const getContributionGraphInteractionConfig = <
  TData extends LegacyContributionValue
>(
  interaction: ContributionGraphInteraction<TData> | undefined
): ResolvedContributionGraphInteractionConfig<TData> => {
  if (!interaction) {
    return {
      mode: "tap",
      hitSlop: defaultCellHitSlop,
      pointerOffset: defaultPointerOffset,
      onSelect: undefined
    };
  }

  if (
    interaction === "none" ||
    interaction === "tap" ||
    interaction === "pressAndDrag"
  ) {
    return {
      mode: interaction,
      hitSlop: defaultCellHitSlop,
      pointerOffset: defaultPointerOffset,
      onSelect: undefined
    };
  }

  return {
    mode: interaction.mode ?? "tap",
    hitSlop: normalizeHitSlop(interaction.hitSlop),
    pointerOffset: normalizePointerOffset(interaction.pointerOffset),
    onSelect: interaction.onSelect
  };
};

export const getContributionGraphCellKey = <
  TData extends LegacyContributionValue
>(
  cell: ContributionGraphCellModel<TData>
) => `${cell.index}:${cell.date.toISOString()}`;

export const buildContributionGraphDayPressEvent = <
  TData extends LegacyContributionValue
>(
  cell: ContributionGraphCellModel<TData>
): ContributionGraphDayPressEvent<TData> => ({
  index: cell.index,
  date: cell.date,
  value: cell.value,
  ...(cell.raw !== undefined ? { raw: cell.raw } : {})
});

export const getContributionGraphCellAtPoint = <
  TData extends LegacyContributionValue
>({
  cells,
  hitSlop,
  locationX,
  locationY
}: ContributionGraphHitTestOptions<TData>) => {
  let nearestCell: ContributionGraphCellModel<TData> | undefined;
  let nearestDistance = Number.POSITIVE_INFINITY;

  cells.forEach((cell) => {
    if (!Number.isFinite(cell.size) || cell.size <= 0) {
      return;
    }

    const minX = cell.x - hitSlop;
    const maxX = cell.x + cell.size + hitSlop;
    const minY = cell.y - hitSlop;
    const maxY = cell.y + cell.size + hitSlop;

    if (
      locationX < minX ||
      locationX > maxX ||
      locationY < minY ||
      locationY > maxY
    ) {
      return;
    }

    const centerX = cell.x + cell.size / 2;
    const centerY = cell.y + cell.size / 2;
    const dx = locationX - centerX;
    const dy = locationY - centerY;
    const distance = dx * dx + dy * dy;

    if (distance < nearestDistance) {
      nearestCell = cell;
      nearestDistance = distance;
    }
  });

  return nearestCell;
};

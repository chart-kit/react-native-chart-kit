import type { NormalizedContributionData } from "../data";

export type ContributionHeatmapCell<TData = unknown> = {
  index: number;
  date: Date;
  value: number | null;
  defined: boolean;
  outOfRange: boolean;
  weekIndex: number;
  weekdayIndex: number;
  x: number;
  y: number;
  size: number;
  raw?: TData;
};

export type ContributionHeatmapMonthLabel = {
  key: string;
  date: Date;
  monthIndex: number;
  x: number;
  y: number;
};

export type ContributionHeatmapWeekdayLabel = {
  key: string;
  weekdayIndex: number;
  dayIndex: number;
  x: number;
  y: number;
};

export type ContributionHeatmapModel<TData = unknown> = {
  cells: Array<ContributionHeatmapCell<TData>>;
  monthLabels: ContributionHeatmapMonthLabel[];
  weekdayLabels: ContributionHeatmapWeekdayLabel[];
  width: number;
  height: number;
  weekCount: number;
  valueMin: number;
  valueMax: number;
};

export type BuildContributionHeatmapOptions<TData = unknown> = {
  data: NormalizedContributionData<TData>;
  cellSize: number;
  gutterSize?: number | undefined;
  weekStartsOn?: number | undefined;
  showOutOfRangeDays?: boolean | undefined;
  monthLabelHeight?: number | undefined;
  weekdayLabelWidth?: number | undefined;
};

const daysInWeek = 7;
const defaultMonthLabelHeight = 18;
const defaultWeekdayLabelWidth = 28;
const millisecondsInOneDay = 24 * 60 * 60 * 1000;

const clampInteger = (value: number, min: number, max: number) => {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(Math.max(Math.floor(value), min), max);
};

const shiftDate = (date: Date, numDays: number) => {
  const shiftedDate = new Date(date);
  shiftedDate.setDate(shiftedDate.getDate() + numDays);
  return shiftedDate;
};

const getDayOffset = (date: Date, weekStartsOn: number) =>
  (date.getDay() - weekStartsOn + daysInWeek) % daysInWeek;

const getDayIndex = (date: Date, startDate: Date) =>
  Math.round((date.valueOf() - startDate.valueOf()) / millisecondsInOneDay);

export const buildContributionHeatmap = <TData = unknown>({
  data,
  cellSize,
  gutterSize = 3,
  weekStartsOn = 0,
  showOutOfRangeDays = false,
  monthLabelHeight = defaultMonthLabelHeight,
  weekdayLabelWidth = defaultWeekdayLabelWidth
}: BuildContributionHeatmapOptions<TData>): ContributionHeatmapModel<TData> => {
  const safeCellSize = Number.isFinite(cellSize) && cellSize > 0 ? cellSize : 0;
  const safeGutterSize =
    Number.isFinite(gutterSize) && gutterSize >= 0 ? gutterSize : 0;
  const safeWeekStartsOn = clampInteger(weekStartsOn, 0, daysInWeek - 1);
  const safeMonthLabelHeight =
    Number.isFinite(monthLabelHeight) && monthLabelHeight > 0
      ? monthLabelHeight
      : 0;
  const safeWeekdayLabelWidth =
    Number.isFinite(weekdayLabelWidth) && weekdayLabelWidth > 0
      ? weekdayLabelWidth
      : 0;
  const startOffset = getDayOffset(data.startDate, safeWeekStartsOn);
  const totalSlots = startOffset + data.days.length;
  const endOffset =
    totalSlots % daysInWeek === 0 ? 0 : daysInWeek - (totalSlots % daysInWeek);
  const weekCount = Math.ceil((totalSlots + endOffset) / daysInWeek);
  const step = safeCellSize + safeGutterSize;
  const firstSlotDate = shiftDate(data.startDate, -startOffset);
  const daysByIndex = new Map(data.days.map((day) => [day.index, day]));
  const cells = Array.from<unknown, ContributionHeatmapCell<TData>>(
    { length: weekCount * daysInWeek },
    (_, slotIndex) => {
      const weekIndex = Math.floor(slotIndex / daysInWeek);
      const weekdayIndex = slotIndex % daysInWeek;
      const date = shiftDate(firstSlotDate, slotIndex);
      const inRangeIndex = getDayIndex(date, data.startDate);
      const day =
        inRangeIndex >= 0 && inRangeIndex < data.days.length
          ? daysByIndex.get(inRangeIndex)
          : undefined;
      const outOfRange = day === undefined;
      const cell: ContributionHeatmapCell<TData> = {
        index: day?.index ?? -1,
        date,
        value: day?.value ?? null,
        defined: day?.defined ?? false,
        outOfRange,
        weekIndex,
        weekdayIndex,
        x: safeWeekdayLabelWidth + weekIndex * step,
        y: safeMonthLabelHeight + weekdayIndex * step,
        size: safeCellSize
      };

      if (day?.raw !== undefined) {
        cell.raw = day.raw;
      }

      return cell;
    }
  ).filter((cell) => showOutOfRangeDays || !cell.outOfRange);
  const visibleValues = cells
    .map((cell) => cell.value)
    .filter(
      (value): value is number => value !== null && Number.isFinite(value)
    );
  const valueMin = visibleValues.length > 0 ? Math.min(...visibleValues) : 0;
  const valueMax = visibleValues.length > 0 ? Math.max(...visibleValues) : 0;
  const monthLabels: ContributionHeatmapMonthLabel[] = [];
  const seenMonths = new Set<string>();

  data.days.forEach((day) => {
    if (day.date.getDate() !== 1 && day.index !== 0) {
      return;
    }

    const slotIndex = startOffset + day.index;
    const weekIndex = Math.floor(slotIndex / daysInWeek);
    const key = `${day.date.getFullYear()}-${day.date.getMonth()}`;

    if (seenMonths.has(key)) {
      return;
    }

    seenMonths.add(key);
    monthLabels.push({
      key,
      date: day.date,
      monthIndex: day.date.getMonth(),
      x: safeWeekdayLabelWidth + weekIndex * step,
      y: Math.max(10, safeMonthLabelHeight - 6)
    });
  });

  const weekdayLabels = [1, 3, 5].map<ContributionHeatmapWeekdayLabel>(
    (weekdayIndex) => {
      const dayIndex = (safeWeekStartsOn + weekdayIndex) % daysInWeek;

      return {
        key: `weekday-${weekdayIndex}`,
        weekdayIndex,
        dayIndex,
        x: 0,
        y: safeMonthLabelHeight + weekdayIndex * step + safeCellSize * 0.75
      };
    }
  );

  return {
    cells,
    monthLabels,
    weekdayLabels,
    width:
      safeWeekdayLabelWidth + Math.max(0, weekCount * step - safeGutterSize),
    height:
      safeMonthLabelHeight + Math.max(0, daysInWeek * step - safeGutterSize),
    weekCount,
    valueMin,
    valueMax
  };
};

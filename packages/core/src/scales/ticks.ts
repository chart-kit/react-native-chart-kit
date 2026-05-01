import { tickStep } from "./domain";
import type { LinearTickOptions, TimeTickOptions, TimeTickUnit } from "./types";

export const generateLinearTicks = ({
  count = 5,
  domain = [0, 1]
}: LinearTickOptions = {}): number[] => {
  const [start, stop] = domain;
  const reverse = stop < start;
  const min = reverse ? stop : start;
  const max = reverse ? start : stop;
  const step = tickStep(min, max, Math.max(1, count));

  if (step === 0) {
    return [start];
  }

  const first = Math.ceil(min / step) * step;
  const ticks: number[] = [];

  const epsilon = step * 1e-10;

  for (let value = first; value <= max + epsilon; value += step) {
    ticks.push(Number(value.toPrecision(12)));
  }

  return reverse ? ticks.reverse() : ticks;
};

const timeUnitMs: Record<TimeTickUnit, number> = {
  millisecond: 1,
  second: 1_000,
  minute: 60_000,
  hour: 3_600_000,
  day: 86_400_000,
  week: 604_800_000,
  month: 2_592_000_000,
  year: 31_536_000_000
};

const chooseTimeUnit = (span: number, count: number): TimeTickUnit => {
  const target = span / Math.max(1, count);

  if (target <= timeUnitMs.second) return "second";
  if (target <= timeUnitMs.minute) return "minute";
  if (target <= timeUnitMs.hour) return "hour";
  if (target <= timeUnitMs.day) return "day";
  if (target <= timeUnitMs.week * 2) return "week";
  if (target <= timeUnitMs.year) return "month";
  return "year";
};

const floorDateToUnit = (date: Date, unit: TimeTickUnit): Date => {
  const next = new Date(date);

  if (unit === "year") {
    return new Date(next.getFullYear(), 0, 1);
  }

  if (unit === "month") {
    return new Date(next.getFullYear(), next.getMonth(), 1);
  }

  if (unit === "week") {
    const start = new Date(next.getFullYear(), next.getMonth(), next.getDate());
    start.setDate(start.getDate() - start.getDay());
    return start;
  }

  if (unit === "day") {
    return new Date(next.getFullYear(), next.getMonth(), next.getDate());
  }

  if (unit === "hour") {
    next.setMinutes(0, 0, 0);
    return next;
  }

  if (unit === "minute") {
    next.setSeconds(0, 0);
    return next;
  }

  if (unit === "second") {
    next.setMilliseconds(0);
    return next;
  }

  return next;
};

const addTimeUnit = (date: Date, unit: TimeTickUnit): Date => {
  const next = new Date(date);

  if (unit === "year") next.setFullYear(next.getFullYear() + 1);
  else if (unit === "month") next.setMonth(next.getMonth() + 1);
  else if (unit === "week") next.setDate(next.getDate() + 7);
  else if (unit === "day") next.setDate(next.getDate() + 1);
  else if (unit === "hour") next.setHours(next.getHours() + 1);
  else if (unit === "minute") next.setMinutes(next.getMinutes() + 1);
  else if (unit === "second") next.setSeconds(next.getSeconds() + 1);
  else next.setMilliseconds(next.getMilliseconds() + 1);

  return next;
};

export const generateTimeTicks = ({
  count = 5,
  domain = [new Date(0), new Date(1)],
  unit
}: TimeTickOptions = {}): Date[] => {
  const [start, stop] = domain;
  const reverse = stop.valueOf() < start.valueOf();
  const min = reverse ? stop : start;
  const max = reverse ? start : stop;
  const resolvedUnit =
    unit ?? chooseTimeUnit(max.valueOf() - min.valueOf(), count);
  const ticks: Date[] = [];

  let cursor = floorDateToUnit(min, resolvedUnit);

  if (cursor.valueOf() < min.valueOf()) {
    cursor = addTimeUnit(cursor, resolvedUnit);
  }

  while (cursor.valueOf() <= max.valueOf()) {
    ticks.push(cursor);
    cursor = addTimeUnit(cursor, resolvedUnit);
  }

  return reverse ? ticks.reverse() : ticks;
};

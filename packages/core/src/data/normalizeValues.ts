import type {
  ChartKitWarning,
  ChartXValue,
  ChartYValue,
  NormalizeOptions
} from "./types";

export const millisecondsInOneDay = 24 * 60 * 60 * 1000;

export type WarningCollector = {
  warnings: ChartKitWarning[];
  warn: (warning: ChartKitWarning) => void;
};

export const createWarningCollector = (options: NormalizeOptions = {}) => {
  const warnings: ChartKitWarning[] = [];

  return {
    warnings,
    warn: (warning: ChartKitWarning) => {
      warnings.push(warning);
      options.onWarning?.(warning);
    }
  } satisfies WarningCollector;
};

const isChartXValue = (value: unknown): value is ChartXValue => {
  return (
    typeof value === "string" ||
    (typeof value === "number" && Number.isFinite(value)) ||
    (value instanceof Date && Number.isFinite(value.valueOf()))
  );
};

export const normalizeXValue = (
  value: unknown,
  fallback: number,
  path: string,
  collector: WarningCollector
): ChartXValue => {
  if (isChartXValue(value)) {
    return value;
  }

  collector.warn({
    code: "invalid-x-value",
    message: `Expected x value at ${path} to be a string, number, or Date.`,
    path
  });

  return fallback;
};

export const normalizeNumberValue = (
  value: unknown,
  path: string,
  collector: WarningCollector
): ChartYValue => {
  if (value === null) {
    return null;
  }

  if (value === undefined) {
    collector.warn({
      code: "missing-value",
      message: `Missing numeric value at ${path}; normalized to null.`,
      path
    });

    return null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  collector.warn({
    code: "invalid-number",
    message: `Expected finite number or null at ${path}; normalized to null.`,
    path
  });

  return null;
};

export const shiftDate = (date: Date, numDays: number): Date => {
  const shiftedDate = new Date(date);
  shiftedDate.setDate(shiftedDate.getDate() + numDays);
  return shiftedDate;
};

const isUtcMidnightDate = (date: Date): boolean => {
  return (
    date.getUTCHours() === 0 &&
    date.getUTCMinutes() === 0 &&
    date.getUTCSeconds() === 0 &&
    date.getUTCMilliseconds() === 0
  );
};

export const getBeginningTimeForDate = (date: Date): Date => {
  if (isUtcMidnightDate(date)) {
    return new Date(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate()
    );
  }

  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const normalizeDateValue = (
  value: unknown,
  path: string,
  collector: WarningCollector
): Date | null => {
  if (
    !(
      typeof value === "string" ||
      typeof value === "number" ||
      value instanceof Date
    )
  ) {
    collector.warn({
      code: "invalid-date",
      message: `Expected date value at ${path} to be a string, number, or Date.`,
      path
    });

    return null;
  }

  const localDateMatch =
    typeof value === "string" ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(value) : null;
  const date =
    localDateMatch &&
    localDateMatch[1] &&
    localDateMatch[2] &&
    localDateMatch[3]
      ? new Date(
          Number(localDateMatch[1]),
          Number(localDateMatch[2]) - 1,
          Number(localDateMatch[3])
        )
      : value instanceof Date
        ? value
        : new Date(value);

  if (!Number.isFinite(date.valueOf())) {
    collector.warn({
      code: "invalid-date",
      message: `Expected parseable date value at ${path}.`,
      path
    });

    return null;
  }

  return getBeginningTimeForDate(date);
};

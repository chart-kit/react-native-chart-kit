import type {
  NumericDomainInput,
  NumericDomainValue,
  TimeDomainInput,
  TimeDomainValue
} from "./types";

const finiteValues = (values: readonly number[]): number[] => {
  return values.filter((value) => Number.isFinite(value));
};

const expandDegenerateDomain = ([min, max]: [number, number]): [
  number,
  number
] => {
  if (min !== max) {
    return [min, max];
  }

  if (min === 0) {
    return [-1, 1];
  }

  const padding = Math.abs(min) * 0.5;
  return [min - padding, max + padding];
};

const resolveNumericDomainValue = (
  value: NumericDomainValue | undefined,
  dataMin: number,
  dataMax: number,
  fallback: number
): number => {
  if (value === "dataMin") {
    return dataMin;
  }

  if (value === "dataMax") {
    return dataMax;
  }

  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
};

export const resolveNumericDomain = (
  values: readonly number[],
  input: NumericDomainInput = "auto"
): [number, number] => {
  const finite = finiteValues(values);
  const dataMin = finite.length > 0 ? Math.min(...finite) : 0;
  const dataMax = finite.length > 0 ? Math.max(...finite) : 0;

  if (input === "auto") {
    return expandDegenerateDomain([dataMin, dataMax]);
  }

  if (Array.isArray(input)) {
    return expandDegenerateDomain([
      resolveNumericDomainValue(input[0], dataMin, dataMax, dataMin),
      resolveNumericDomainValue(input[1], dataMin, dataMax, dataMax)
    ]);
  }

  let min = resolveNumericDomainValue(input.min, dataMin, dataMax, dataMin);
  let max = resolveNumericDomainValue(input.max, dataMin, dataMax, dataMax);

  if (input.includeZero) {
    min = Math.min(min, 0);
    max = Math.max(max, 0);
  }

  const domain = expandDegenerateDomain([min, max]);
  return input.nice ? niceNumericDomain(domain) : domain;
};

const resolveTimeInput = (
  value: TimeDomainValue | undefined,
  dataMin: Date,
  dataMax: Date,
  fallback: Date
): Date => {
  if (value === "dataMin") {
    return dataMin;
  }

  if (value === "dataMax") {
    return dataMax;
  }

  if (value === undefined) {
    return fallback;
  }

  const date = value instanceof Date ? value : new Date(value);

  return Number.isFinite(date.valueOf()) ? date : fallback;
};

export const resolveTimeDomain = (
  values: readonly Date[],
  input: TimeDomainInput = "auto"
): [Date, Date] => {
  const validTimes = values
    .map((value) => value.valueOf())
    .filter((value) => Number.isFinite(value));
  const dataMin = new Date(validTimes.length > 0 ? Math.min(...validTimes) : 0);
  const dataMax = new Date(validTimes.length > 0 ? Math.max(...validTimes) : 0);

  let domain: [Date, Date];

  if (input === "auto") {
    domain = [dataMin, dataMax];
  } else if (Array.isArray(input)) {
    domain = [
      resolveTimeInput(input[0], dataMin, dataMax, dataMin),
      resolveTimeInput(input[1], dataMin, dataMax, dataMax)
    ];
  } else {
    domain = [
      resolveTimeInput(input.min, dataMin, dataMax, dataMin),
      resolveTimeInput(input.max, dataMin, dataMax, dataMax)
    ];
  }

  if (domain[0].valueOf() === domain[1].valueOf()) {
    const center = domain[0].valueOf();
    return [new Date(center - 1), new Date(center + 1)];
  }

  return domain;
};

export const tickStep = (
  start: number,
  stop: number,
  count: number
): number => {
  const rawStep = Math.abs(stop - start) / Math.max(0, count);

  if (!Number.isFinite(rawStep) || rawStep === 0) {
    return 0;
  }

  const power = Math.floor(Math.log10(rawStep));
  const error = rawStep / Math.pow(10, power);
  const factor =
    error >= Math.sqrt(50)
      ? 10
      : error >= Math.sqrt(10)
        ? 5
        : error >= Math.sqrt(2)
          ? 2
          : 1;

  return factor * Math.pow(10, power);
};

export const niceNumericDomain = (
  domain: [number, number],
  count = 5
): [number, number] => {
  const [min, max] = domain;
  const step = tickStep(min, max, count);

  if (step === 0) {
    return expandDegenerateDomain(domain);
  }

  return [Math.floor(min / step) * step, Math.ceil(max / step) * step];
};

export type DomainKeyword = "dataMin" | "dataMax";

export type NumericDomainValue = number | DomainKeyword;
export type TimeDomainValue = Date | number | string | DomainKeyword;

export type NumericDomainInput =
  | "auto"
  | [NumericDomainValue, NumericDomainValue]
  | {
      min?: NumericDomainValue;
      max?: NumericDomainValue;
      includeZero?: boolean;
      nice?: boolean;
    };

export type TimeDomainInput =
  | "auto"
  | [TimeDomainValue, TimeDomainValue]
  | {
      min?: TimeDomainValue;
      max?: TimeDomainValue;
      nice?: boolean;
    };

export type ContinuousScale<TInput> = {
  domain: [TInput, TInput];
  range: [number, number];
  scale: (value: TInput) => number;
  invert: (value: number) => TInput;
};

export type LinearScale = ContinuousScale<number>;
export type TimeScale = ContinuousScale<Date>;

export type BandScale<TValue extends string | number = string | number> = {
  domain: TValue[];
  range: [number, number];
  bandwidth: number;
  step: number;
  scale: (value: TValue) => number | undefined;
};

export type PointScale<TValue extends string | number = string | number> = {
  domain: TValue[];
  range: [number, number];
  step: number;
  scale: (value: TValue) => number | undefined;
};

export type LinearTickOptions = {
  count?: number;
  domain?: [number, number];
};

export type TimeTickUnit =
  | "millisecond"
  | "second"
  | "minute"
  | "hour"
  | "day"
  | "week"
  | "month"
  | "year";

export type TimeTickOptions = {
  count?: number;
  domain?: [Date, Date];
  unit?: TimeTickUnit;
};

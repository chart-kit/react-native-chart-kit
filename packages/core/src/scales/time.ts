import { resolveTimeDomain } from "./domain";
import type { TimeDomainInput, TimeScale } from "./types";

export type CreateTimeScaleOptions = {
  domain?: TimeDomainInput;
  values?: readonly Date[];
  range: [number, number];
};

export const createTimeScale = ({
  domain = "auto",
  values = [],
  range
}: CreateTimeScaleOptions): TimeScale => {
  const resolvedDomain = resolveTimeDomain(values, domain);
  const domainMin = resolvedDomain[0].valueOf();
  const domainSpan = resolvedDomain[1].valueOf() - domainMin;
  const rangeSpan = range[1] - range[0];

  return {
    domain: resolvedDomain,
    range,
    scale: (value: Date) => {
      if (domainSpan === 0) {
        return range[0];
      }

      return (
        range[0] + ((value.valueOf() - domainMin) / domainSpan) * rangeSpan
      );
    },
    invert: (value: number) => {
      if (rangeSpan === 0) {
        return new Date(domainMin);
      }

      return new Date(
        domainMin + ((value - range[0]) / rangeSpan) * domainSpan
      );
    }
  };
};

import { resolveNumericDomain } from "./domain";
import type { LinearScale, NumericDomainInput } from "./types";

export type CreateLinearScaleOptions = {
  domain?: NumericDomainInput;
  values?: readonly number[];
  range: [number, number];
};

export const createLinearScale = ({
  domain = "auto",
  values = [],
  range
}: CreateLinearScaleOptions): LinearScale => {
  const resolvedDomain = resolveNumericDomain(values, domain);
  const domainSpan = resolvedDomain[1] - resolvedDomain[0];
  const rangeSpan = range[1] - range[0];

  return {
    domain: resolvedDomain,
    range,
    scale: (value: number) => {
      if (domainSpan === 0) {
        return range[0];
      }

      return range[0] + ((value - resolvedDomain[0]) / domainSpan) * rangeSpan;
    },
    invert: (value: number) => {
      if (rangeSpan === 0) {
        return resolvedDomain[0];
      }

      return resolvedDomain[0] + ((value - range[0]) / rangeSpan) * domainSpan;
    }
  };
};

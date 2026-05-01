import { describe, expect, it } from "vitest";

import {
  createBandScale,
  createLinearScale,
  createPointScale,
  createTimeScale,
  generateLinearTicks,
  generateTimeTicks,
  niceNumericDomain,
  resolveNumericDomain,
  resolveTimeDomain
} from "../src";

describe("numeric domains", () => {
  it("resolves auto and explicit numeric domains", () => {
    expect(resolveNumericDomain([10, -5, 20], "auto")).toEqual([-5, 20]);
    expect(resolveNumericDomain([10, -5, 20], [0, "dataMax"])).toEqual([0, 20]);
    expect(
      resolveNumericDomain([10, 15], {
        min: "dataMin",
        max: 20,
        includeZero: true
      })
    ).toEqual([0, 20]);
  });

  it("expands degenerate domains", () => {
    expect(resolveNumericDomain([0, 0], "auto")).toEqual([-1, 1]);
    expect(resolveNumericDomain([10, 10], "auto")).toEqual([5, 15]);
  });

  it("nices numeric domains", () => {
    expect(niceNumericDomain([3, 97], 5)).toEqual([0, 100]);
    expect(resolveNumericDomain([3, 97], { nice: true })).toEqual([0, 100]);
  });
});

describe("linear scale", () => {
  it("maps and inverts values across the configured range", () => {
    const scale = createLinearScale({
      values: [-10, 30],
      domain: { includeZero: true },
      range: [200, 0]
    });

    expect(scale.domain).toEqual([-10, 30]);
    expect(scale.scale(-10)).toBe(200);
    expect(scale.scale(30)).toBe(0);
    expect(scale.scale(10)).toBe(100);
    expect(scale.invert(100)).toBe(10);
  });
});

describe("linear ticks", () => {
  it("generates deterministic nice ticks", () => {
    expect(generateLinearTicks({ domain: [0, 100], count: 5 })).toEqual([
      0, 20, 40, 60, 80, 100
    ]);
    expect(generateLinearTicks({ domain: [-3, 7], count: 4 })).toEqual([
      -2, 0, 2, 4, 6
    ]);
  });
});

describe("time domains and scales", () => {
  it("resolves explicit time domains", () => {
    const values = [new Date(2026, 0, 5), new Date(2026, 0, 10)];

    expect(resolveTimeDomain(values, "auto")).toEqual([
      new Date(2026, 0, 5),
      new Date(2026, 0, 10)
    ]);
    expect(resolveTimeDomain(values, ["dataMin", "2026-01-15"])).toEqual([
      new Date(2026, 0, 5),
      new Date("2026-01-15")
    ]);
  });

  it("spaces irregular timestamps proportionally", () => {
    const scale = createTimeScale({
      values: [
        new Date("2026-01-01T00:00:00Z"),
        new Date("2026-01-11T00:00:00Z")
      ],
      range: [0, 100]
    });

    expect(scale.scale(new Date("2026-01-01T00:00:00Z"))).toBe(0);
    expect(scale.scale(new Date("2026-01-06T00:00:00Z"))).toBe(50);
    expect(scale.scale(new Date("2026-01-11T00:00:00Z"))).toBe(100);
    expect(scale.invert(50)).toEqual(new Date("2026-01-06T00:00:00Z"));
  });
});

describe("time ticks", () => {
  it("generates day ticks across a date domain", () => {
    expect(
      generateTimeTicks({
        domain: [new Date(2026, 0, 1), new Date(2026, 0, 4)],
        unit: "day"
      })
    ).toEqual([
      new Date(2026, 0, 1),
      new Date(2026, 0, 2),
      new Date(2026, 0, 3),
      new Date(2026, 0, 4)
    ]);
  });

  it("generates month ticks across a date domain", () => {
    expect(
      generateTimeTicks({
        domain: [new Date(2026, 0, 15), new Date(2026, 3, 2)],
        unit: "month"
      })
    ).toEqual([
      new Date(2026, 1, 1),
      new Date(2026, 2, 1),
      new Date(2026, 3, 1)
    ]);
  });
});

describe("band and point scales", () => {
  it("positions band categories with bandwidth", () => {
    const scale = createBandScale<string>({
      domain: ["Jan", "Feb", "Mar"],
      range: [0, 300],
      paddingInner: 0.1,
      paddingOuter: 0.2
    });

    expect(scale.step).toBeCloseTo(90.909, 3);
    expect(scale.bandwidth).toBeCloseTo(81.818, 3);
    expect(scale.scale("Jan")).toBeCloseTo(18.182, 3);
    expect(scale.scale("Mar")).toBeCloseTo(200, 3);
    expect(scale.scale("Missing")).toBeUndefined();
  });

  it("positions point categories", () => {
    const scale = createPointScale({
      domain: ["A", "B", "C"],
      range: [0, 100]
    });

    expect(scale.step).toBe(50);
    expect(scale.scale("A")).toBe(0);
    expect(scale.scale("B")).toBe(50);
    expect(scale.scale("C")).toBe(100);
  });
});

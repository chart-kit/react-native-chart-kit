import { describe, expect, it } from "vitest";

import { buildPieArcs, normalizeLegacyPieData } from "../../src";

describe("pie and donut arc geometry", () => {
  it("builds proportional pie sectors from normalized slices", () => {
    const normalized = normalizeLegacyPieData([
      { name: "Stocks", population: 60, color: "#2563eb" },
      { name: "Bonds", population: 30, color: "#16a34a" },
      { name: "Cash", population: 10, color: "#f59e0b" }
    ]);

    const arcs = buildPieArcs({
      slices: normalized.slices,
      centerX: 100,
      centerY: 100,
      radius: 80
    });

    expect(arcs.map((arc) => arc.percentage)).toEqual([0.6, 0.3, 0.1]);
    expect(arcs[0]).toMatchObject({
      color: "#2563eb",
      defined: true,
      label: "Stocks",
      value: 60
    });
    expect(arcs[0]?.path).toContain("A 80 80 0 1 1");
    expect(arcs[1]?.startAngle).toBeCloseTo(arcs[0]?.endAngle ?? 0);
    expect(arcs[2]?.endAngle).toBeCloseTo((Math.PI * 3) / 2);
  });

  it("builds donut sectors with reversed inner arcs", () => {
    const normalized = normalizeLegacyPieData([
      { name: "Used", population: 75 },
      { name: "Remaining", population: 25 }
    ]);

    const arcs = buildPieArcs({
      slices: normalized.slices,
      centerX: 120,
      centerY: 120,
      innerRadius: 44,
      radius: 88
    });

    expect(arcs[0]?.path).toContain("A 88 88 0 1 1");
    expect(arcs[0]?.path).toContain("A 44 44 0 1 0");
    expect(arcs[0]?.centroid).toMatchObject({
      x: expect.any(Number),
      y: expect.any(Number)
    });
  });

  it("handles zero and invalid slices without producing broken paths", () => {
    const normalized = normalizeLegacyPieData([
      { name: "Zero", population: 0 },
      { name: "Negative", population: -10 },
      { name: "Invalid", population: Number.NaN }
    ]);

    const arcs = buildPieArcs({
      slices: normalized.slices,
      centerX: 50,
      centerY: 50,
      radius: 40
    });

    expect(arcs).toHaveLength(3);
    expect(arcs.map((arc) => arc.defined)).toEqual([false, false, false]);
    expect(arcs.map((arc) => arc.path)).toEqual(["", "", ""]);
    expect(arcs.map((arc) => arc.percentage)).toEqual([0, 0, 0]);
  });

  it("renders a single full-circle slice with two SVG arc commands", () => {
    const normalized = normalizeLegacyPieData([
      { name: "All", population: 100 }
    ]);

    const arcs = buildPieArcs({
      slices: normalized.slices,
      centerX: 50,
      centerY: 50,
      radius: 40
    });

    expect(arcs[0]?.defined).toBe(true);
    expect(arcs[0]?.path.match(/A 40 40/g)).toHaveLength(2);
    expect(arcs[0]?.percentage).toBe(1);
  });
});

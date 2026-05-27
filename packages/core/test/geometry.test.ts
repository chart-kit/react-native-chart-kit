import { describe, expect, it } from "vitest";

import {
  buildAreaPath,
  buildLinePath,
  formatPathNumber,
  splitDefinedSegments
} from "../src";
import type { GeometryPoint } from "../src";

const point = (
  index: number,
  x: number,
  y: number,
  defined = true
): GeometryPoint => ({
  index,
  x,
  y,
  defined,
  value: defined ? y : null
});

describe("line path geometry", () => {
  it("builds a linear path for defined points", () => {
    expect(
      buildLinePath({
        points: [point(0, 0, 10), point(1, 50, 20), point(2, 100, 0)]
      }).path
    ).toBe("M 0 10 L 50 20 L 100 0");
  });

  it("does not connect across null gaps by default", () => {
    const result = buildLinePath({
      points: [
        point(0, 0, 10),
        point(1, 50, 20, false),
        point(2, 100, 0),
        point(3, 150, 30)
      ]
    });

    expect(result.segments).toHaveLength(2);
    expect(result.path).toBe("M 0 10 M 100 0 L 150 30");
  });

  it("supports leading and trailing nulls", () => {
    expect(
      splitDefinedSegments([
        point(0, 0, 0, false),
        point(1, 10, 10),
        point(2, 20, 20),
        point(3, 30, 30, false)
      ])
    ).toEqual([[point(1, 10, 10), point(2, 20, 20)]]);
  });

  it("connects defined points across gaps when requested", () => {
    expect(
      buildLinePath({
        connectNulls: true,
        points: [point(0, 0, 10), point(1, 50, 20, false), point(2, 100, 0)]
      }).path
    ).toBe("M 0 10 L 100 0");
  });

  it("builds a step path", () => {
    expect(
      buildLinePath({
        curve: "step",
        points: [point(0, 0, 10), point(1, 100, 30)]
      }).path
    ).toBe("M 0 10 H 50 V 30 H 100");
  });

  it("builds a monotone cubic path for increasing x values", () => {
    expect(
      buildLinePath({
        curve: "monotone",
        points: [point(0, 0, 10), point(1, 50, 20), point(2, 100, 0)]
      }).path
    ).toBe(
      "M 0 10 C 16.666667 13.333333 33.333333 20 50 20 C 66.666667 20 83.333333 6.666667 100 0"
    );
  });

  it("limits monotone tangents when neighboring slopes share a sign", () => {
    expect(
      buildLinePath({
        curve: "monotone",
        points: [point(0, 0, 0), point(1, 50, 50), point(2, 100, 100)]
      }).path
    ).toBe(
      "M 0 0 C 16.666667 16.666667 33.333333 33.333333 50 50 C 66.666667 66.666667 83.333333 83.333333 100 100"
    );
  });
});

describe("area path geometry", () => {
  it("closes each defined segment to a constant baseline", () => {
    expect(
      buildAreaPath({
        baselineY: 40,
        points: [point(0, 0, 10), point(1, 50, 20), point(2, 100, 0)]
      }).path
    ).toBe("M 0 10 L 50 20 L 100 0 L 100 40 L 0 40 Z");
  });

  it("supports per-point baselines", () => {
    expect(
      buildAreaPath({
        baselineY: (geometryPoint) => geometryPoint.x / 2,
        points: [point(0, 0, 10), point(1, 50, 20)]
      }).path
    ).toBe("M 0 10 L 50 20 L 50 25 L 0 0 Z");
  });
});

describe("path number formatting", () => {
  it("keeps path output compact and stable", () => {
    expect(formatPathNumber(1 / 3)).toBe("0.333333");
    expect(formatPathNumber(-0)).toBe("0");
    expect(formatPathNumber(10)).toBe("10");
  });
});

import { describe, expect, it } from "vitest";

import { buildProgressRings, normalizeLegacyProgressData } from "../../src";

describe("progress ring geometry", () => {
  it("builds concentric progress arcs from normalized rings", () => {
    const normalized = normalizeLegacyProgressData({
      labels: ["Move", "Exercise", "Stand"],
      colors: ["#ef4444", "#22c55e", "#2563eb"],
      data: [0.72, 0.48, 0.9]
    });

    const rings = buildProgressRings({
      rings: normalized.rings,
      centerX: 100,
      centerY: 100,
      maxRadius: 74,
      strokeWidth: 12,
      ringGap: 6
    });

    expect(rings).toHaveLength(3);
    expect(rings.map((ring) => ring.radius)).toEqual([74, 56, 38]);
    expect(rings[0]).toMatchObject({
      color: "#ef4444",
      defined: true,
      label: "Move",
      value: 0.72,
      clampedValue: 0.72,
      strokeWidth: 12
    });
    expect(rings[0]?.backgroundPath.match(/A 74 74/g)).toHaveLength(2);
    expect(rings[0]?.path).toContain("A 74 74");
  });

  it("clamps out-of-range values for geometry while preserving raw value", () => {
    const normalized = normalizeLegacyProgressData([1.5, -0.25]);
    const rings = buildProgressRings({
      rings: normalized.rings,
      centerX: 80,
      centerY: 80,
      maxRadius: 50,
      strokeWidth: 10
    });

    expect(normalized.warnings.map((warning) => warning.code)).toEqual([
      "progress-out-of-range",
      "progress-out-of-range"
    ]);
    expect(rings[0]).toMatchObject({
      value: 1.5,
      clampedValue: 1,
      defined: true
    });
    expect(rings[0]?.path.match(/A 50 50/g)).toHaveLength(2);
    expect(rings[1]).toMatchObject({
      value: -0.25,
      clampedValue: 0,
      defined: false
    });
    expect(rings[1]?.path).toBe("");
  });

  it("keeps missing values undefined visually but still returns backgrounds", () => {
    const normalized = normalizeLegacyProgressData([0.4, undefined]);
    const rings = buildProgressRings({
      rings: normalized.rings,
      centerX: 60,
      centerY: 60,
      maxRadius: 40,
      strokeWidth: 8
    });

    expect(rings[1]).toMatchObject({
      value: null,
      clampedValue: 0,
      defined: false
    });
    expect(rings[1]?.backgroundPath).toContain("A 24 24");
  });
});

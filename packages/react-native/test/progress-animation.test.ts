import { describe, expect, it } from "vitest";

import {
  getAnimatedProgressRing,
  getAnimatedProgressRings,
  getAverageProgress,
  getProgressChartAnimationTargetKey,
  getProgressRingAnimationProgress,
  resolveProgressChartAnimationConfig
} from "../src/charts/progress/animation";
import { buildProgressChartModel } from "../src/charts/progress/model";

const chartKitTheme = {
  mode: "light" as const,
  preset: "default" as const,
  presets: {},
  theme: undefined
};

const model = buildProgressChartModel({
  chartKitTheme,
  props: {
    data: [
      { label: "Move", value: 0.72 },
      { label: "Exercise", value: 0.48 },
      { label: "Stand", value: 0.9 }
    ],
    valueKey: "value",
    labelKey: "label",
    width: 320,
    height: 260
  }
});

describe("ProgressChart animation helpers", () => {
  it("resolves disabled and configured animation options", () => {
    expect(resolveProgressChartAnimationConfig(undefined)).toEqual({
      duration: 0,
      enabled: false,
      stagger: 0
    });
    expect(resolveProgressChartAnimationConfig(true)).toMatchObject({
      duration: 1200,
      enabled: true,
      stagger: 0.08
    });
    expect(
      resolveProgressChartAnimationConfig({ duration: 900, stagger: 0.12 })
    ).toEqual({
      duration: 900,
      enabled: true,
      stagger: 0.12
    });
  });

  it("staggers ring progress deterministically", () => {
    expect(
      getProgressRingAnimationProgress({
        index: 0,
        progress: 0.5,
        stagger: 0.1
      })
    ).toBeGreaterThan(0.5);
    expect(
      getProgressRingAnimationProgress({
        index: 2,
        progress: 0.1,
        stagger: 0.1
      })
    ).toBe(0);
  });

  it("builds animated partial ring paths from final ring geometry", () => {
    const ring = model.rings[0]!;
    const animatedRing = getAnimatedProgressRing({
      centerX: model.centerX,
      centerY: model.centerY,
      progress: 0.5,
      ring
    });

    expect(animatedRing.path).not.toBe(ring.path);
    expect(animatedRing.clampedValue).toBeCloseTo(ring.clampedValue * 0.5);
    expect(animatedRing.radius).toBe(ring.radius);
    expect(animatedRing.strokeWidth).toBe(ring.strokeWidth);
  });

  it("animates all rings and derives animated average", () => {
    const animatedRings = getAnimatedProgressRings({
      centerX: model.centerX,
      centerY: model.centerY,
      progress: 1,
      rings: model.rings,
      stagger: 0.08
    });

    expect(animatedRings.map((ring) => ring.path)).toEqual(
      model.rings.map((ring) => ring.path)
    );
    expect(getAverageProgress(animatedRings)).toBeCloseTo(model.average);
    expect(getProgressChartAnimationTargetKey(model.rings)).toContain(
      "0:true:0.72"
    );
  });
});

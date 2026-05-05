import { describe, expect, it } from "vitest";

import type { ProgressChartRenderer } from "../src/charts/progress/types";
import type { SkiaRenderer } from "../../skia-renderer/src/types";

type SkiaRendererAssignable = SkiaRenderer extends ProgressChartRenderer
  ? true
  : false;

const skiaRendererAssignable: SkiaRendererAssignable = true;

describe("ProgressChart renderer parity contract", () => {
  it("accepts the shared Skia renderer primitive contract", () => {
    expect(skiaRendererAssignable).toBe(true);
  });
});

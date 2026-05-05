import { describe, expect, it } from "vitest";

import type { PieChartRenderer } from "../src/charts/pie/types";
import type { SkiaRenderer } from "../../skia-renderer/src/types";

type SkiaRendererAssignable = SkiaRenderer extends PieChartRenderer
  ? true
  : false;

const skiaRendererAssignable: SkiaRendererAssignable = true;

describe("PieChart renderer parity contract", () => {
  it("accepts the shared Skia renderer primitive contract", () => {
    expect(skiaRendererAssignable).toBe(true);
  });
});

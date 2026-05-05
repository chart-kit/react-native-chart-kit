import { describe, expect, it } from "vitest";

import type { ContributionGraphRenderer } from "../src/charts/contribution/types";
import type { SkiaRenderer } from "../../skia-renderer/src/types";

type SkiaRendererAssignable = SkiaRenderer extends ContributionGraphRenderer
  ? true
  : false;

const skiaRendererAssignable: SkiaRendererAssignable = true;

describe("ContributionGraph renderer parity contract", () => {
  it("accepts the shared Skia renderer primitive contract", () => {
    expect(skiaRendererAssignable).toBe(true);
  });
});

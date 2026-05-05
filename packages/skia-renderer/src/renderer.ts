import { createSkiaRendererCapabilities } from "./capabilities";
import { createSkiaPrimitives } from "./primitives";
import { createSkiaTextMeasurer } from "./textMeasurement";
import type { SkiaRenderer, SkiaRendererOptions } from "./types";

export const createSkiaRenderer = ({
  capabilities,
  font,
  measureText,
  skia
}: SkiaRendererOptions): SkiaRenderer => {
  const primitives = createSkiaPrimitives({ font, skia });

  return {
    ...primitives,
    capabilities: createSkiaRendererCapabilities({
      gradients: Boolean(skia.LinearGradient && skia.vec),
      textMeasurement:
        measureText || font?.measureText ? "skia" : "unavailable",
      ...capabilities
    }),
    measureText: measureText ?? createSkiaTextMeasurer(font)
  };
};

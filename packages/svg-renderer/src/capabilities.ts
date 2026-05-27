import type { SvgRendererCapabilities, SvgRendererOptions } from "./types";

export const createSvgRendererCapabilities = (
  options: SvgRendererOptions = {}
): SvgRendererCapabilities => ({
  animation: "reactNative",
  clipPaths: true,
  gradients: true,
  hitRegions: true,
  layers: true,
  shadows: false,
  symbols: true,
  testIds: true,
  textMeasurement: options.measureText ? "custom" : "fallback",
  ...options.capabilities
});

import { describe, expect, it } from "vitest";

import {
  createSkiaRendererCapabilities,
  createSkiaRendererDescriptor,
  skiaRendererPreview
} from "../src";

describe("Skia renderer preview boundary", () => {
  it("exposes default capability metadata without loading Skia", () => {
    expect(createSkiaRendererCapabilities()).toEqual({
      animation: "uiThread",
      clipPaths: true,
      decimation: true,
      gradients: true,
      hitRegions: true,
      layers: true,
      shadows: true,
      textMeasurement: "unavailable",
      viewportWindowing: true
    });
  });

  it("creates preview descriptors with install guidance", () => {
    expect(skiaRendererPreview).toMatchObject({
      packageName: "@chart-kit/skia-renderer",
      peerDependency: "@shopify/react-native-skia",
      status: "preview"
    });
    expect(
      createSkiaRendererDescriptor({
        capabilities: { textMeasurement: "skia" },
        status: "available"
      })
    ).toMatchObject({
      capabilities: { textMeasurement: "skia" },
      status: "available"
    });
  });
});

import type {
  SkiaRendererCapabilities,
  SkiaRendererDescriptor,
  SkiaRendererDescriptorOptions
} from "./types";

export const createSkiaRendererCapabilities = (
  overrides: Partial<SkiaRendererCapabilities> = {}
): SkiaRendererCapabilities => ({
  animation: "uiThread",
  clipPaths: false,
  decimation: true,
  gradients: true,
  hitRegions: false,
  layers: true,
  shadows: false,
  symbols: false,
  testIds: true,
  textMeasurement: "unavailable",
  viewportWindowing: true,
  ...overrides
});

export const createSkiaRendererDescriptor = ({
  capabilities,
  installHint = "Install @shopify/react-native-skia before enabling the Skia renderer.",
  status = "preview"
}: SkiaRendererDescriptorOptions = {}): SkiaRendererDescriptor => ({
  capabilities: createSkiaRendererCapabilities(capabilities),
  installHint,
  packageName: "@chart-kit/skia-renderer",
  peerDependency: "@shopify/react-native-skia",
  status
});

export const skiaRendererPreview = createSkiaRendererDescriptor();

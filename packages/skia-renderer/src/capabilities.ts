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
  maxSurfaceWidth: 2730,
  pathGradients: false,
  rectClips: false,
  shadows: false,
  symbols: false,
  testIds: true,
  text: false,
  textMeasurement: "unavailable",
  viewportWindowing: false,
  ...overrides
});

export const createSkiaRendererDescriptor = ({
  capabilities,
  evidence,
  installHint = "Install @shopify/react-native-skia before enabling the Skia renderer.",
  status = "preview"
}: SkiaRendererDescriptorOptions = {}): SkiaRendererDescriptor => ({
  capabilities: createSkiaRendererCapabilities(capabilities),
  evidence: {
    localParity: "partial",
    nativeInstall: "partial",
    nativeParity: "partial",
    ...evidence
  },
  installHint,
  packageName: "@chart-kit/skia-renderer",
  peerDependency: "@shopify/react-native-skia",
  status
});

export const skiaRendererPreview = createSkiaRendererDescriptor();

export type SkiaRendererStatus = "preview" | "available";

export type SkiaRendererCapabilities = {
  animation: "uiThread";
  clipPaths: boolean;
  decimation: boolean;
  gradients: boolean;
  hitRegions: boolean;
  layers: boolean;
  shadows: boolean;
  textMeasurement: "skia" | "unavailable";
  viewportWindowing: boolean;
};

export type SkiaRendererDescriptor = {
  capabilities: SkiaRendererCapabilities;
  installHint: string;
  packageName: "@chart-kit/skia-renderer";
  peerDependency: "@shopify/react-native-skia";
  status: SkiaRendererStatus;
};

export type SkiaRendererDescriptorOptions = {
  capabilities?: Partial<SkiaRendererCapabilities>;
  installHint?: string;
  status?: SkiaRendererStatus;
};

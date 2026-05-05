import type { ChartKitProFeature, ChartKitProFeatureRegistry } from "./types";

export const chartKitProPreviewFeatures = [
  {
    category: "renderer",
    description: "Optional Skia renderer and renderer parity checks.",
    id: "skia-renderer",
    status: "preview"
  },
  {
    category: "performance",
    description: "Large dataset decimation, windowing, and native benchmarks.",
    id: "large-data",
    status: "preview"
  },
  {
    category: "interaction",
    description: "Advanced pan, pinch zoom, shared cursors, and haptics.",
    id: "advanced-interactions",
    status: "preview"
  },
  {
    category: "finance",
    description: "Financial workflows, exchange sessions, and OHLC overlays.",
    id: "financial-charts",
    status: "preview"
  },
  {
    category: "accessibility",
    description: "Enterprise accessibility reports and exportable narratives.",
    id: "accessibility-reports",
    status: "planned"
  },
  {
    category: "theming",
    description: "Design-system token adapters and preset governance.",
    id: "design-system-tokens",
    status: "planned"
  },
  {
    category: "export",
    description: "PNG/SVG export helpers where platform support is reliable.",
    id: "chart-export",
    status: "planned"
  }
] as const satisfies readonly ChartKitProFeature[];

export const createChartKitProFeatureRegistry = (
  features: readonly ChartKitProFeature[] = chartKitProPreviewFeatures
): ChartKitProFeatureRegistry => ({
  features,
  packageName: "@chart-kit/pro",
  status: "preview"
});

export const getChartKitProFeature = (
  id: string,
  features: readonly ChartKitProFeature[] = chartKitProPreviewFeatures
) => features.find((feature) => feature.id === id);

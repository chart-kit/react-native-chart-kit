import type { ChartKitProFeature, ChartKitProFeatureRegistry } from "./types";

export const chartKitProPreviewFeatures = [
  {
    category: "layout",
    description:
      "Production layout engine: measured axes, dense labels, smart tick density, safe small-screen plotting, and advanced formatting.",
    id: "pro-layout-engine",
    status: "preview"
  },
  {
    category: "interaction",
    description:
      "Production touch workflows: crosshair, scrub, nearest-point selection, long press, highlight states, zoom, pan, sticky axes, and range selection.",
    id: "pro-interactions",
    status: "preview"
  },
  {
    category: "charts",
    description:
      "Commercial chart families: candlestick/OHLC, financial presets, combo and dual-axis charts, grouped bars, horizontal stacked bars, gauges, radar, treemap, and advanced donut/heatmap workflows.",
    id: "pro-chart-types",
    status: "preview"
  },
  {
    category: "export",
    description:
      "Chart export workflows: PNG/SVG export, snapshot API, share sheet integration, and future headless image generation.",
    id: "pro-export",
    status: "planned"
  },
  {
    category: "templates",
    description:
      "Premium presets and templates: Apple Health, Linear-style, fintech dark, analytics dashboard, minimal SaaS, fitness, crypto, accessibility-safe palettes, and animated transitions.",
    id: "pro-theme-templates",
    status: "planned"
  },
  {
    category: "performance",
    description:
      "Large dataset mode: decimation, downsampling, virtualized rendering, memoized paths, native benchmarks, and optional Skia acceleration.",
    id: "pro-performance",
    status: "planned"
  },
  {
    category: "renderer",
    description:
      "Optional Skia renderer package with native install guidance, renderer parity tests, and renderer-specific performance tuning.",
    id: "skia-renderer",
    status: "planned"
  },
  {
    category: "accessibility",
    description: "Enterprise accessibility reports and exportable narratives.",
    id: "accessibility-reports",
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

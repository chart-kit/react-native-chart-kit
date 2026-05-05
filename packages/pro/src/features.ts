import type { ChartKitProFeature, ChartKitProFeatureRegistry } from "./types";

export const chartKitProPreviewFeatures = [
  {
    category: "layout",
    commercialRationale:
      "Production apps lose time on cut labels, unstable axis widths, dense mobile screens, and formatting edge cases.",
    description:
      "Production layout engine: measured axes, dense labels, smart tick density, safe small-screen plotting, and advanced formatting.",
    freeGuardrail:
      "Free charts must still have safe default padding, responsive sizing, explicit domains, and no obvious clipping.",
    id: "pro-layout-engine",
    includes: [
      "smart Y-axis width measurement",
      "no clipped labels under dense data",
      "multiline, rotated, and ellipsized X labels",
      "auto tick density",
      "custom ticks",
      "axis titles",
      "fixed min/max ranges",
      "nice numeric formatting",
      "currency, percent, and compact formatting",
      "true full-width plotting",
      "responsive chart area",
      "safe-area and small-screen handling"
    ],
    status: "preview"
  },
  {
    category: "interaction",
    commercialRationale:
      "Fintech, analytics, health, and business dashboards need touch inspection rather than static screenshots.",
    description:
      "Production touch workflows: crosshair, scrub, nearest-point selection, long press, highlight states, zoom, pan, sticky axes, and range selection.",
    freeGuardrail:
      "Free charts may expose simple press callbacks and basic selected-value examples, but production touch workflows are Pro candidates.",
    id: "pro-interactions",
    includes: [
      "tooltips",
      "crosshair",
      "scrubbing",
      "nearest-point selection",
      "click and press handlers",
      "long press",
      "highlight selected series",
      "shared tooltip across multiple series",
      "zoom and pan",
      "scrollable charts with fixed Y-axis",
      "brush and range selection"
    ],
    status: "preview"
  },
  {
    category: "charts",
    commercialRationale:
      "Specialized commercial chart families map directly to paid product workflows and are expensive for teams to build well.",
    description:
      "Commercial chart families: candlestick/OHLC, financial presets, combo and dual-axis charts, grouped bars, horizontal stacked bars, gauges, radar, treemap, and advanced donut/heatmap workflows.",
    freeGuardrail:
      "Free v2 keeps the common chart set strong: line, area, bar, stacked bar, pie, donut, progress, and baseline contribution heatmaps.",
    id: "pro-chart-types",
    includes: [
      "candlestick and OHLC",
      "financial line chart presets",
      "combo bar plus line",
      "dual-axis charts",
      "grouped bars",
      "horizontal stacked bars",
      "advanced donut",
      "gauge",
      "radar",
      "treemap",
      "advanced contribution graph and calendar heatmap"
    ],
    status: "preview"
  },
  {
    category: "export",
    commercialRationale:
      "Reports, PDFs, investor updates, health summaries, receipts, and dashboards need shareable chart images.",
    description:
      "Chart export workflows: PNG/SVG export, snapshot API, share sheet integration, and future headless image generation.",
    freeGuardrail:
      "Free charts should render normally in-app; image generation and report workflows are paid business features.",
    id: "pro-export",
    includes: [
      "export chart as PNG",
      "export chart as SVG where feasible",
      "share sheet integration",
      "snapshot API",
      "server-side or headless chart image generation"
    ],
    status: "planned"
  },
  {
    category: "templates",
    commercialRationale:
      "Premium presets make Pro feel immediately valuable and reduce design implementation time for product teams.",
    description:
      "Premium presets and templates: Apple Health, Linear-style, fintech dark, analytics dashboard, minimal SaaS, fitness, crypto, accessibility-safe palettes, and animated transitions.",
    freeGuardrail:
      "Free v2 keeps good default, dark, high-contrast, and custom preset creation support.",
    id: "pro-theme-templates",
    includes: [
      "Apple Health style",
      "Linear-style",
      "fintech dark mode",
      "analytics dashboard style",
      "minimal SaaS style",
      "fitness app style",
      "crypto style",
      "accessibility-safe palettes",
      "animated transitions"
    ],
    status: "planned"
  },
  {
    category: "performance",
    commercialRationale:
      "Large datasets, release-build jank, and native renderer complexity are high-value problems teams pay to avoid.",
    description:
      "Large dataset mode: decimation, downsampling, virtualized rendering, memoized paths, native benchmarks, and optional Skia acceleration.",
    freeGuardrail:
      "Free SVG charts should remain performant for common datasets and expose conservative decimation hooks where they protect baseline UX.",
    id: "pro-performance",
    includes: [
      "large dataset mode",
      "decimation and downsampling",
      "virtualized or scrolling chart rendering",
      "memoized path generation",
      "optional Skia renderer",
      "benchmarks in docs"
    ],
    status: "planned"
  },
  {
    category: "renderer",
    commercialRationale:
      "Native high-performance rendering is valuable only if install guidance, parity, and benchmarks are maintained.",
    description:
      "Optional Skia renderer package with native install guidance, renderer parity tests, and renderer-specific performance tuning.",
    freeGuardrail:
      "SVG remains the default renderer so Expo and baseline React Native installs stay simple.",
    id: "skia-renderer",
    includes: [
      "optional Skia renderer adapter",
      "native install guidance",
      "renderer parity tests",
      "renderer-specific performance tuning"
    ],
    status: "planned"
  },
  {
    category: "accessibility",
    commercialRationale:
      "Enterprise buyers need auditable accessibility evidence beyond baseline screen-reader summaries.",
    description: "Enterprise accessibility reports and exportable narratives.",
    freeGuardrail:
      "Free v2 keeps generated summaries, table fallback helpers, and high-contrast themes.",
    id: "accessibility-reports",
    includes: [
      "downloadable accessibility report",
      "configurable narrative summaries",
      "table export",
      "keyboard and web navigation patterns",
      "enterprise design-system compliance helpers"
    ],
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

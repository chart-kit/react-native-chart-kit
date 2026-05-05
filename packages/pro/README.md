# @chart-kit/pro

Preview package boundary for future Chart Kit v2 Pro workflows.

This package intentionally contains no license checks, network activation, or gated chart implementations yet. It only publishes typed feature metadata so the free package can stay clean while H4 reviews the future Pro split.

The current monetization thesis is:

- free charts should be useful and not obviously broken
- Pro should sell production depth: layout confidence, advanced touch workflows, commercial chart types, export, premium templates, and large-data performance
- paid behavior should live in a separate package or optional renderer package, not in `packages/core`

Current exports:

- `chartKitProPreviewFeatures`
- `createChartKitProFeatureRegistry`
- `getChartKitProFeature`

Status:

- preview scaffold only
- no license gating
- no runtime activation
- no chart components consume this package yet

Preview feature buckets:

- `pro-layout-engine`: measured axes, dense labels, smart tick density, safe small-screen plotting, and advanced numeric formatting
- `pro-interactions`: crosshair, scrub, nearest-point selection, long press, highlight states, zoom, pan, sticky axes, and range selection
- `pro-chart-types`: candlestick/OHLC, financial presets, combo and dual-axis charts, grouped bars, horizontal stacked bars, gauges, radar, treemap, and advanced donut/heatmap workflows
- `pro-export`: PNG/SVG export, snapshot API, share sheet integration, and future headless image generation
- `pro-theme-templates`: premium app-style presets and animated transitions
- `pro-performance`: large dataset mode, decimation, virtualized rendering, memoized paths, native benchmarks, and optional Skia acceleration

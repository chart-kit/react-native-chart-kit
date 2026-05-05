# @chart-kit/pro

Preview package boundary for future Chart Kit v2 Pro workflows.

This package intentionally contains no license checks, network activation, or gated chart implementations yet. It only publishes typed feature metadata so the free package can stay clean while H4 reviews the future Pro split.

The current monetization thesis is:

- free charts should be useful and not obviously broken
- Pro should sell production depth: layout confidence, advanced touch workflows, commercial chart types, export, premium templates, and large-data performance
- paid behavior should live in a separate package or optional renderer package, not in `packages/core`

Current exports:

- `chartKitProPreviewFeatures`
- `chartKitProReactNativePreviewExports`
- `chartKitCompatibilitySurface`
- `chartKitFreeBaselineSurface`
- `chartKitPackageBoundarySurface`
- `chartKitProCandidateCapabilities`
- `chartKitProCandidateSurface`
- `createChartKitProReactNativePreview`
- `createChartKitProFeatureRegistry`
- `getChartKitProCandidateCapabilities`
- `getChartKitSurfaceExport`
- `getChartKitProFeature`

Status:

- preview scaffold only
- no license gating
- no runtime activation
- no chart components consume this package yet
- package-boundary metadata classifies current free baseline, compatibility, and Pro-candidate surfaces without moving chart implementations
- React Native preview composition is injection-based, so `@chart-kit/pro` can expose Pro-candidate workflows without statically importing the free runtime package before H4
- `@chart-kit/react-native/pro-preview` exists as the package-local preview entrypoint for current Pro-candidate components, hooks, and advanced interaction types

Preview feature buckets:

- `pro-layout-engine`: measured axes, dense labels, smart tick density, safe small-screen plotting, and advanced numeric formatting
- `pro-interactions`: crosshair, scrub, nearest-point selection, long press, highlight states, zoom, pan, sticky axes, and range selection
- `pro-chart-types`: candlestick/OHLC, financial presets, combo and dual-axis charts, grouped bars, horizontal stacked bars, gauges, radar, treemap, and advanced donut/heatmap workflows
- `pro-export`: PNG/SVG export, snapshot API, share sheet integration, and future headless image generation
- `pro-theme-templates`: premium app-style presets and animated transitions
- `pro-performance`: large dataset mode, decimation, virtualized rendering, memoized paths, native benchmarks, and optional Skia acceleration

The surface-boundary metadata is intentionally descriptive. It lets release docs, tests, and future package refactors agree that current preview features such as `CombinedChart`, `CandlestickChart`, advanced `LineChart` interactions, grouped/scrollable/selectable bars, and active donut selection are Pro candidates until H4 is finalized.

React Native preview composition:

```ts
import * as ChartKit from "@chart-kit/react-native/pro-preview";
import { createChartKitProReactNativePreview } from "@chart-kit/pro";

const ProPreview = createChartKitProReactNativePreview(ChartKit);

ProPreview.LineChart;
ProPreview.BarChart;
ProPreview.CombinedChart;
ProPreview.CandlestickChart;
```

This is not license gating. It is a temporary package-boundary review aid until H4 decides which current previews move into final free exports, Pro exports, or separate packages.

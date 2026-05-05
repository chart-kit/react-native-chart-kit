# @chart-kit/skia-renderer

Preview package boundary for Chart Kit v2 Skia rendering.

This package intentionally avoids a static import of `@shopify/react-native-skia`. Apps that install Skia can pass the Skia module into `createSkiaRenderer({ skia })`, keeping the native dependency optional for SVG-only users.

Current exports:

- `createSkiaRendererCapabilities`
- `createSkiaRendererDescriptor`
- `createSkiaRenderer`
- `createSkiaTextMeasurer`
- `skiaRendererPreview`

Status:

- injected Skia primitive adapter for Canvas, Group, Path, Rect, Circle, Line, Text, LinearGradient, and rect-clipped Groups
- public descriptor evidence reports `localParity: "partial"`, `nativeInstall: "missing"`, and `nativeParity: "missing"` until device evidence exists
- `LineChart` can accept the injected renderer through its experimental `renderer` prop for the main plot, range selector, sticky-axis, path-local area gradients, threshold rect clips, default marker, default legend, default tooltip, and debug-layout surfaces
- `BarChart` can accept the injected renderer through its experimental `renderer` prop for its chart body, sticky Y-axis, and default tooltip overlay
- `PieChart` and `DonutChart` can accept the injected renderer through their experimental `renderer` prop for slices, connector lines, and SVG text labels
- `ProgressChart`, `ProgressRing`, `ContributionGraph`, and `CalendarHeatmap` can accept the injected renderer through their experimental `renderer` prop for their chart primitives and SVG text labels
- `CombinedChart` can accept the injected renderer through its experimental `renderer` prop for its bars, lines, axes, legend, selection overlay, and default tooltip
- `CandlestickChart` can accept the injected renderer through its experimental `renderer` prop for its OHLC body, volume bars, session markers, selection overlay, default tooltip, and range selector
- sticky-axis labels require a Skia font through `createSkiaRenderer({ skia, font })`
- text primitives support measured `textAnchor` alignment when the supplied Skia font exposes `measureText`
- path-local area gradients are used when `skia.LinearGradient` and `skia.vec` are available; SVG-style gradient defs remain disabled for Skia
- threshold line and area overlays use path-level rect clips when `skia.rect` is available; SVG URL clip-path refs remain disabled for Skia
- no license gating
- local LineChart renderer contract coverage lives in `packages/react-native/test/line-renderer.test.ts`
- local BarChart renderer contract coverage lives in `packages/react-native/test/bar-renderer.test.ts`
- local PieChart renderer contract coverage lives in `packages/react-native/test/pie-renderer.test.ts`
- local ProgressChart renderer contract coverage lives in `packages/react-native/test/progress-renderer.test.ts`
- local ContributionGraph renderer contract coverage lives in `packages/react-native/test/contribution-renderer.test.ts`
- local CombinedChart renderer contract coverage lives in `packages/react-native/test/combined-renderer.test.ts`
- local CandlestickChart renderer contract coverage lives in `packages/react-native/test/candlestick-renderer.test.ts`
- `npm run skia:parity` runs the local Skia primitive tests plus LineChart, BarChart, PieChart, ProgressChart, ContributionGraph, CombinedChart, and CandlestickChart renderer contract tests together
- native install verification and native renderer parity coverage are still pending

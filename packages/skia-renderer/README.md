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
- `LineChart` can accept the injected renderer through its experimental `renderer` prop for the main plot, range selector, sticky-axis, path-local area gradients, threshold rect clips, default marker, default legend, default tooltip, and debug-layout surfaces
- sticky-axis labels require a Skia font through `createSkiaRenderer({ skia, font })`
- path-local area gradients are used when `skia.LinearGradient` and `skia.vec` are available; SVG-style gradient defs remain disabled for Skia
- threshold line and area overlays use path-level rect clips when `skia.rect` is available; SVG URL clip-path refs remain disabled for Skia
- no license gating
- local LineChart renderer contract coverage lives in `packages/react-native/test/line-renderer.test.ts`
- native install verification and native renderer parity coverage are still pending

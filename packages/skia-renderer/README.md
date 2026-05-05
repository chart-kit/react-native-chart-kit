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

- injected Skia primitive adapter for Canvas, Group, Path, Rect, Circle, Line, Text, and LinearGradient
- `LineChart` can accept the injected renderer through its experimental `renderer` prop for the main plot, range selector, sticky-axis, path-local area gradients, default marker, default legend, default tooltip, and debug-layout surfaces
- sticky-axis labels require a Skia font through `createSkiaRenderer({ skia, font })`
- path-local area gradients are used when `skia.LinearGradient` and `skia.vec` are available; SVG-style gradient defs remain disabled for Skia
- no license gating
- local LineChart renderer contract coverage lives in `packages/react-native/test/line-renderer.test.ts`
- native install verification and native renderer parity coverage are still pending

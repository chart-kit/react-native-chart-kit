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
- `LineChart` can accept the injected renderer through its experimental `renderer` prop for the main plot, range selector, sticky-axis, default marker, default legend, default tooltip, and debug-layout surfaces
- sticky-axis labels require a Skia font through `createSkiaRenderer({ skia, font })`
- gradient capability is disabled for chart consumption until SVG-style gradient defs have Skia parity
- no license gating
- native install verification and renderer parity coverage are still pending
- no renderer parity suite yet

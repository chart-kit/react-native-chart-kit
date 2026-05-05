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
- no license gating
- no chart components consume this package yet
- no renderer parity suite yet

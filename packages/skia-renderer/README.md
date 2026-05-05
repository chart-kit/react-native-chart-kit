# @chart-kit/skia-renderer

Preview package boundary for future Chart Kit v2 Skia rendering.

This package intentionally does not import `@shopify/react-native-skia` yet. It provides the typed package boundary, capability metadata, and install guidance needed to keep future Skia work optional and separate from the free SVG renderer.

Current exports:

- `createSkiaRendererCapabilities`
- `createSkiaRendererDescriptor`
- `skiaRendererPreview`

Status:

- preview scaffold only
- no license gating
- no runtime Skia dependency
- no chart components consume this package yet

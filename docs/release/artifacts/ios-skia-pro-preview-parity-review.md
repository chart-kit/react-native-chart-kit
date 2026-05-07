# iOS Skia Pro Preview Parity Review

Date: 2026-05-06
Commit reviewed: `aa44323`
Build surface: booted iOS simulator with renderer-injected Skia showcase app

This artifact records a partial iOS Skia renderer parity review for current
Pro-preview chart surfaces. The screenshots were captured from the installed
native showcase app via `npm run release:qa:capture`.

## Captured Screens

- `docs/release/artifacts/ios-skia-pro-preview-parity-1-combined.png`
- `docs/release/artifacts/ios-skia-pro-preview-parity-2-candlestick.png`
- `docs/release/artifacts/ios-skia-pro-preview-parity-3-range-selector.png`
- `docs/release/artifacts/ios-skia-pro-preview-parity-4-crosshair.png`
- `docs/release/artifacts/ios-skia-pro-preview-parity-5-debug-layout.png`

## Result

- Combined, Candlestick, range selector, custom crosshair, and debug-layout
  surfaces rendered nonblank native chart content with visible chart geometry,
  labels, legends, and overlay elements.
- Native logs captured for each screen did not include renderer errors,
  invariant failures, fatal exceptions, or missing native dependency failures.
- The evidence uses the temporary Skia renderer-injected showcase build from
  `docs/release/artifacts/ios-skia-renderer-build.md`.

## Status

Partial. This evidence narrows the remaining iOS Skia Pro-preview parity work to:

- complete manual interaction parity review for gestures and selection overlays
- capture or explicitly defer Android Skia Pro-preview parity
- capture Skia performance comparison evidence before release-candidate approval

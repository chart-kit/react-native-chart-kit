# iOS Skia Pro Preview Parity Review

Date: 2026-05-07
Commit reviewed: `dcd83b8`
Build surface: booted iOS simulator with renderer-injected Skia showcase app

This artifact records an iOS Skia renderer parity review for current Pro-preview
chart surfaces. The screenshots were captured from the installed native showcase
app through the native screenshot capture workflow.

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

Pass for iOS simulator visual parity. This artifact does not cover Android Skia
parity or Skia performance comparison, which remain separate release risks.

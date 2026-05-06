# iOS Skia Free Chart Parity Review

Date: 2026-05-06
Commit reviewed: `e02a767`
Build surface: booted iOS simulator with previously installed renderer-injected showcase app

This artifact records a partial iOS Skia renderer parity review for the free chart
surface. The screenshots were captured from the installed native showcase app via
`npm run release:qa:capture`.

## Captured Screens

- `docs/release/artifacts/ios-skia-free-chart-parity-1-line-and-area.png`
- `docs/release/artifacts/ios-skia-free-chart-parity-2-bar-and-stackedbar.png`
- `docs/release/artifacts/ios-skia-free-chart-parity-3-pie-and-donut.png`
- `docs/release/artifacts/ios-skia-free-chart-parity-4-progress.png`
- `docs/release/artifacts/ios-skia-free-chart-parity-5-contribution.png`
- `docs/release/artifacts/ios-skia-free-chart-parity-6-compatibility.png`

## Result

- Line/Area, Bar/StackedBar, Pie/Donut, Progress, and Heatmap pages rendered
  nonblank native chart surfaces with visible text, legends, labels, and chart
  geometry.
- Native logs captured for each page did not include renderer errors, invariant
  failures, fatal exceptions, or warnings.
- The Compatibility page capture exposed clipped left-side legacy Y-axis labels.
  The root cause was the showcase compatibility wrapper forcing legacy
  `paddingRight` too low, which acts as the left Y-axis gutter in the old v1
  chart implementation.
- The source fix was committed in `e02a767` by raising the showcase compatibility
  gutter floor. A rebuilt renderer-injected native showcase app and refreshed
  compatibility screenshot are still required before this row can be marked pass.

## Status

Partial. This evidence narrows the remaining iOS Skia free-chart parity work to:

- rebuild/install the renderer-injected iOS showcase app from `e02a767` or later
- recapture the Compatibility page
- perform final visible clipping/legend/tooltip/interaction review

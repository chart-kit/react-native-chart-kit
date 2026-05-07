# iOS Skia Free Chart Parity Review

Date: 2026-05-07
Commit reviewed: `dcd83b8`
Build surface: booted iOS simulator with renderer-injected Skia showcase app

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
- `docs/release/artifacts/ios-skia-free-chart-parity-7-compat-bar-basic.png`
- `docs/release/artifacts/ios-skia-free-chart-parity-8-line-tooltip.png`
- `docs/release/artifacts/ios-skia-free-chart-parity-9-bar-tooltip.png`

## Result

- Line/Area, Bar/StackedBar, Pie/Donut, Progress, Heatmap, and Compatibility
  pages rendered nonblank native chart surfaces with visible text, legends,
  labels, and chart geometry.
- Native logs captured for each page did not include renderer errors, invariant
  failures, fatal exceptions, or missing native dependency failures.
- The refreshed Compatibility page capture verifies the legacy LineChart gutter
  fix against the rebuilt renderer-injected app.
- Focused compat BarChart, LineChart tooltip, and BarChart tooltip captures cover
  the row's label, legend, and tooltip requirements without page-scroll crop
  ambiguity.

## Status

Pass for iOS simulator visual parity. This row does not cover Android Skia
parity or Skia performance comparison, which remain separate matrix rows.

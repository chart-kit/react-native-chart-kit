# CKV2-013 Performance Benchmark Notes

Date: May 4, 2026

## Current Slice

Expanded the benchmark command from line-only geometry to a core geometry benchmark suite.

Covered by `npm run benchmark`:

- line chart, 100 points
- line chart, 1,000 points
- line chart, 10,000 points with path decimation
- multi-series line chart, 5 x 1,000 points with path decimation
- line chart, 10,000 total points with a 2,000-point visible viewport window
- range-selector overview, 2 x 10,000 total points with decimated overview paths and move/resize window calculations
- scrollable grouped bar chart, 500 x-axis groups
- scrollable stacked bar chart, 500 x-axis groups

The benchmark reports Node version, platform, iteration count, total point counts, geometry point counts, visible viewport counts, rendered path point counts, bar counts, path string size, median runtime, p95 runtime, RSS, and heap usage.

## Remaining Work

- Add native release-build timing once iOS and Android example apps are available.
- Add interaction scrub frame timing for the showcase app.
- Add Skia renderer benchmark coverage after the optional renderer/pro package is introduced.
- Add candlestick benchmark scenarios once the financial chart visual implementation is deeper than the current foundation slice.

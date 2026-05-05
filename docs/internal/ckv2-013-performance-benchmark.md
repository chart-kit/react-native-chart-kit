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
- browser showcase line-chart scrub frame timing
- candlestick chart, 1,000 OHLC candles

The core geometry benchmark reports Node version, platform, iteration count, total point counts, geometry point counts, visible viewport counts, rendered path point counts, bar counts, path string size, median runtime, p95 runtime, RSS, and heap usage. The browser interaction benchmark reports frame sample count, median frame interval, p95 frame interval, and max frame interval for a synthetic scrub.

## Remaining Work

- Add native release-build timing once iOS and Android example apps are available.
- Add Skia renderer benchmark coverage after the optional renderer/pro package is introduced.

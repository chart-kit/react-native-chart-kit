# Android Skia Free Chart Parity Review

Date: 2026-05-07
Commit reviewed: `a064922`
Package version: `7.0.0-next.0`
Platform: Android emulator
Build surface: Release APK with injected Skia renderer
Device: `chartkit_api36` emulator / Android 16 API 36

This artifact records Android Skia renderer parity evidence for the free chart
surface. The screenshots were captured from the installed release showcase app
via `npm run release:qa:capture`.

## Build Evidence

- [android-skia-renderer-build.md](android-skia-renderer-build.md)

## Captured Screens

| Surface                 | Screenshot                                                                                                         | Log                                                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Line and Area page      | [android-skia-free-chart-parity-1-line-and-area.png](android-skia-free-chart-parity-1-line-and-area.png)           | [android-skia-free-chart-parity-1-line-and-area.log](android-skia-free-chart-parity-1-line-and-area.log)           |
| Bar and StackedBar page | [android-skia-free-chart-parity-2-bar-and-stackedbar.png](android-skia-free-chart-parity-2-bar-and-stackedbar.png) | [android-skia-free-chart-parity-2-bar-and-stackedbar.log](android-skia-free-chart-parity-2-bar-and-stackedbar.log) |
| Pie and Donut page      | [android-skia-free-chart-parity-3-pie-and-donut.png](android-skia-free-chart-parity-3-pie-and-donut.png)           | [android-skia-free-chart-parity-3-pie-and-donut.log](android-skia-free-chart-parity-3-pie-and-donut.log)           |
| Progress page           | [android-skia-free-chart-parity-4-progress.png](android-skia-free-chart-parity-4-progress.png)                     | [android-skia-free-chart-parity-4-progress.log](android-skia-free-chart-parity-4-progress.log)                     |
| Heatmaps page           | [android-skia-free-chart-parity-5-contribution.png](android-skia-free-chart-parity-5-contribution.png)             | [android-skia-free-chart-parity-5-contribution.log](android-skia-free-chart-parity-5-contribution.log)             |
| Compatibility page      | [android-skia-free-chart-parity-6-compatibility.png](android-skia-free-chart-parity-6-compatibility.png)           | [android-skia-free-chart-parity-6-compatibility.log](android-skia-free-chart-parity-6-compatibility.log)           |
| Compat BarChart focus   | [android-skia-free-chart-parity-7-compat-bar-basic.png](android-skia-free-chart-parity-7-compat-bar-basic.png)     | [android-skia-free-chart-parity-7-compat-bar-basic.log](android-skia-free-chart-parity-7-compat-bar-basic.log)     |
| Line tooltip focus      | [android-skia-free-chart-parity-8-line-tooltip.png](android-skia-free-chart-parity-8-line-tooltip.png)             | [android-skia-free-chart-parity-8-line-tooltip.log](android-skia-free-chart-parity-8-line-tooltip.log)             |
| Bar tooltip focus       | [android-skia-free-chart-parity-9-bar-tooltip.png](android-skia-free-chart-parity-9-bar-tooltip.png)               | [android-skia-free-chart-parity-9-bar-tooltip.log](android-skia-free-chart-parity-9-bar-tooltip.log)               |

## Result

- Line/Area, Bar/StackedBar, Pie/Donut, Progress, Heatmap, and Compatibility
  pages rendered nonblank native chart surfaces with visible text, labels,
  legends, gradients, and chart geometry.
- Focused compat BarChart, LineChart tooltip, and BarChart tooltip captures
  verify the row's label, legend, selected-marker, and tooltip layering
  requirements without page-scroll crop ambiguity.
- A strict log scan found no `AndroidRuntime`, `FATAL EXCEPTION`, fatal signal,
  ANR, failed activity start, or React Native JavaScript error.

## Caveats

- Emulator logs include Skia/EGL surface warnings such as
  `eglQueryContext(2159): error 0x3004` and RNSkia `updateAndRelease()` lines
  that the native module logs as safely ignorable.
- This is Android emulator visual parity evidence. Physical-device performance
  and final Skia-vs-SVG performance acceptance are tracked by separate rows.

## Status

Pass for Android emulator visual parity of the free chart surface.

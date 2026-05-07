# Android Skia Performance Comparison Review

Date: 2026-05-07
Commit: `aab853c`
Package version: `7.0.0-next.0`
Platform: Android emulator
Build surface: Release APK with injected Skia renderer
Device: `chartkit_api36` emulator / Android 16 API 36
Renderer under review: Skia preview renderer

This artifact records emulator screenshot and log evidence for the Android Skia
performance-comparison checklist row. It mirrors the iOS Skia and Android SVG
performance scenarios, but it is not final physical-device or profiler evidence.

## Build Evidence

- [android-skia-renderer-build.md](android-skia-renderer-build.md)

## Captured Skia Scenarios

| Scenario                  | Story                         | Screenshot                                                                                                               | Log                                                                                                                      |
| ------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Dense line overview       | `v2-perf-line-10000-overview` | [android-skia-performance-comparison-1-dense-line.png](android-skia-performance-comparison-1-dense-line.png)             | [android-skia-performance-comparison-1-dense-line.log](android-skia-performance-comparison-1-dense-line.log)             |
| Multi-line shared tooltip | `v2-perf-line-5x1000-tooltip` | [android-skia-performance-comparison-2-multi-line-scrub.png](android-skia-performance-comparison-2-multi-line-scrub.png) | [android-skia-performance-comparison-2-multi-line-scrub.log](android-skia-performance-comparison-2-multi-line-scrub.log) |
| Range selector            | `v2-perf-range-2x10000`       | [android-skia-performance-comparison-3-range-selector.png](android-skia-performance-comparison-3-range-selector.png)     | [android-skia-performance-comparison-3-range-selector.log](android-skia-performance-comparison-3-range-selector.log)     |
| Scrollable bar selection  | `v2-perf-bar-500-selection`   | [android-skia-performance-comparison-4-scrollable-bar.png](android-skia-performance-comparison-4-scrollable-bar.png)     | [android-skia-performance-comparison-4-scrollable-bar.log](android-skia-performance-comparison-4-scrollable-bar.log)     |
| Combined shared tooltip   | `v2-perf-combined-tooltip`    | [android-skia-performance-comparison-5-combined-tooltip.png](android-skia-performance-comparison-5-combined-tooltip.png) | [android-skia-performance-comparison-5-combined-tooltip.log](android-skia-performance-comparison-5-combined-tooltip.log) |
| Candlestick inspection    | `v2-perf-candlestick-1000`    | [android-skia-performance-comparison-6-candlestick.png](android-skia-performance-comparison-6-candlestick.png)           | [android-skia-performance-comparison-6-candlestick.log](android-skia-performance-comparison-6-candlestick.log)           |

## SVG Baseline References

- [android-svg-dense-line-decimated-overview-performance.md](android-svg-dense-line-decimated-overview-performance.md)
- [android-svg-multi-line-shared-tooltip-scrub-performance.md](android-svg-multi-line-shared-tooltip-scrub-performance.md)
- [android-svg-range-selector-drag-and-thumb-resize-performance.md](android-svg-range-selector-drag-and-thumb-resize-performance.md)
- [android-svg-scrollable-bar-horizontal-scroll-and-selection-performance.md](android-svg-scrollable-bar-horizontal-scroll-and-selection-performance.md)
- [android-svg-combined-chart-shared-tooltip-and-legend-performance.md](android-svg-combined-chart-shared-tooltip-and-legend-performance.md)
- [android-svg-candlestick-pan-pinch-and-tap-inspection-performance.md](android-svg-candlestick-pan-pinch-and-tap-inspection-performance.md)

## Review Notes

- All six Android Skia screenshots rendered visible chart content from the
  freshly installed release APK.
- The release APK was built from the current committed state and installed on
  the `chartkit_api36` emulator before capture.
- A strict log scan found no `AndroidRuntime`, `FATAL EXCEPTION`, fatal signal,
  ANR, failed activity start, or React Native JavaScript error.
- Emulator logs include Skia/EGL surface warnings such as
  `eglQueryContext(2159): error 0x3004` and RNSkia `updateAndRelease()` lines
  that the native module logs as safely ignorable.

## Caveats

- This is Android emulator screenshot/log evidence, not final physical-device
  performance evidence.
- This does not include Perfetto, Android Studio profiler data, frame timing,
  GPU counters, memory pressure checks, or scripted gesture latency.
- The row should remain `partial` until device-level timing and final
  Skia-vs-SVG performance acceptance are completed.

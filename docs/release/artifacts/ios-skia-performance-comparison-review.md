# iOS Skia Performance Comparison Review

Date: 2026-05-07
Commit: `ab7f7bb`
Package version: `7.0.0-next.0`
Platform: iOS simulator
Build surface: Release simulator build with injected Skia renderer
Device: iPhone 17 simulator / iOS 26.0
Renderer under review: Skia preview renderer

This artifact records simulator screenshot and log evidence for the iOS Skia
performance-comparison checklist row. It compares the same showcase scenarios
used for the iOS SVG performance samples, but it is not final device or
Instruments frame-timing evidence.

## Build Evidence

- [ios-skia-renderer-build.md](ios-skia-renderer-build.md)

## Captured Skia Scenarios

| Scenario                  | Story                         | Screenshot                                                                                     | Log                                                                                            |
| ------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Dense line overview       | `v2-perf-line-10000-overview` | [ios-skia-performance-1-dense-line.png](ios-skia-performance-1-dense-line.png)                 | [ios-skia-performance-1-dense-line.log](ios-skia-performance-1-dense-line.log)                 |
| Multi-line shared tooltip | `v2-perf-line-5x1000-tooltip` | [ios-skia-performance-2-multi-line-tooltip.png](ios-skia-performance-2-multi-line-tooltip.png) | [ios-skia-performance-2-multi-line-tooltip.log](ios-skia-performance-2-multi-line-tooltip.log) |
| Range selector            | `v2-perf-range-2x10000`       | [ios-skia-performance-3-range-selector.png](ios-skia-performance-3-range-selector.png)         | [ios-skia-performance-3-range-selector.log](ios-skia-performance-3-range-selector.log)         |
| Scrollable bar selection  | `v2-perf-bar-500-selection`   | [ios-skia-performance-4-scrollable-bar.png](ios-skia-performance-4-scrollable-bar.png)         | [ios-skia-performance-4-scrollable-bar.log](ios-skia-performance-4-scrollable-bar.log)         |
| Combined shared tooltip   | `v2-perf-combined-tooltip`    | [ios-skia-performance-5-combined-tooltip.png](ios-skia-performance-5-combined-tooltip.png)     | [ios-skia-performance-5-combined-tooltip.log](ios-skia-performance-5-combined-tooltip.log)     |
| Candlestick inspection    | `v2-perf-candlestick-1000`    | [ios-skia-performance-6-candlestick.png](ios-skia-performance-6-candlestick.png)               | [ios-skia-performance-6-candlestick.log](ios-skia-performance-6-candlestick.log)               |

## SVG Baseline References

- [ios-svg-dense-line-decimated-overview-performance.md](ios-svg-dense-line-decimated-overview-performance.md)
- [ios-svg-multi-line-shared-tooltip-scrub-performance.md](ios-svg-multi-line-shared-tooltip-scrub-performance.md)
- [ios-svg-range-selector-drag-and-thumb-resize-performance.md](ios-svg-range-selector-drag-and-thumb-resize-performance.md)
- [ios-svg-scrollable-bar-horizontal-scroll-and-selection-performance.md](ios-svg-scrollable-bar-horizontal-scroll-and-selection-performance.md)
- [ios-svg-combined-chart-shared-tooltip-and-legend-performance.md](ios-svg-combined-chart-shared-tooltip-and-legend-performance.md)
- [ios-svg-candlestick-pan-pinch-and-tap-inspection-performance.md](ios-svg-candlestick-pan-pinch-and-tap-inspection-performance.md)

## Review Notes

- All six Skia screenshots rendered visible chart content in the release
  simulator build.
- The previous oversized Skia bar surface crash was mitigated by capping unsafe
  native bar-chart content surfaces and falling back when the renderer cannot
  window scrollable content.
- The refreshed logs do not contain the previous `CAMetalLayer` drawable-size
  failure. The only matched high-severity line is Apple's future `UIScene`
  lifecycle warning.
- Scrollable bar Skia remains a partial parity item: it is stable in the
  simulator evidence, but true Skia bar viewport windowing is still required
  before this row should be considered complete.

## Caveats

- This is simulator screenshot/log evidence, not final physical-device
  performance evidence.
- This does not include Instruments frame timing, GPU counters, memory pressure
  checks, or scripted gesture latency.
- The row should remain `partial` until native device timing and Android Skia
  comparison evidence are completed.

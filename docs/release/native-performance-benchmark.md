# Native Performance Benchmark Protocol

Status on May 5, 2026: protocol ready, release-device performance evidence missing.

This protocol defines the native benchmark evidence required before H5/H6 can claim production performance confidence. The current `npm run benchmark` command covers core geometry and web showcase scrub timing. It does not measure native render time, native gesture frame pacing, release-build memory, or renderer-specific device behavior.

## Automated Baseline

Run:

```sh
npm run benchmark
npm run test:visual
npm run native:release:ios
npm run native:release:android
```

Current automated benchmark coverage:

- line chart 100 points
- line chart 1,000 points
- line chart 10,000 points with decimation
- multi-series line chart 5 x 1,000 points with decimation
- 10,000-point line chart with a 2,000-point visible window
- range selector overview with 2 x 10,000 points
- scrollable grouped and stacked bar chart geometry
- candlestick chart 1,000 candles
- web showcase line scrub frame timing

This baseline is useful for regression detection, but native release-device evidence must be collected separately.

## Device Matrix

Collect release-build data on:

| Tier              | iOS target                           | Android target                         |
| ----------------- | ------------------------------------ | -------------------------------------- |
| Current reference | recent iPhone or simulator           | recent Pixel or emulator               |
| Mid-range         | older supported iPhone if available  | mid-range physical Android if possible |
| Stress            | lowest supported device if available | older Android device if available      |

Record unavailable devices explicitly instead of substituting web results.

## Required Scenarios

Measure these scenarios:

| Scenario        | Required data size        | Interaction                     | Target evidence                           |
| --------------- | ------------------------- | ------------------------------- | ----------------------------------------- |
| Small line      | 100 points                | initial render                  | render time, memory                       |
| Standard line   | 1,000 points              | initial render and scrub        | p50/p95 frame time, dropped frames        |
| Dense line      | 10,000 total points       | decimated overview              | decimation time, rendered points, memory  |
| Multi-line      | 5 series x 1,000 points   | shared tooltip scrub            | p50/p95 frame time, tooltip correctness   |
| Scrollable line | 10,000 total, 2,000 shown | one-finger pan                  | p50/p95 frame time, scroll conflict notes |
| Range selector  | 2 series x 10,000 points  | drag and thumb resize           | p50/p95 frame time, viewport correctness  |
| Scrollable bar  | 500 bars                  | horizontal scroll and selection | p50/p95 frame time, hit-test correctness  |
| Combined chart  | bars plus line            | shared tooltip and legend       | p50/p95 frame time, domain recalculation  |
| Candlestick     | 1,000 candles             | pan, pinch, tap inspection      | p50/p95 frame time, overlay alignment     |

When the Skia renderer exists, run the same scenarios for both `svg` and `skia` where supported.

## Metrics To Capture

For every run, capture:

- commit SHA
- package version
- platform, OS version, device model, and simulator/emulator/physical flag
- build type: release, debug, Expo Go, or dev client
- renderer: `svg`, `skia`, or other
- chart type and scenario
- total data points, visible points, rendered points, and series count
- initial render time
- median frame time during interaction
- p95 frame time during interaction
- max frame time during interaction
- dropped frames or frames over 16.7 ms, if available
- memory before and after scenario, if available
- visible correctness notes for clipping, tooltip stacking, and gesture conflicts

## Measurement Guidance

Use release builds for publish-gate numbers. Expo Go and debug builds are useful for development, but they should not be used as final H5/H6 performance evidence.

Recommended tools:

- iOS Instruments for time profiler, allocations, and animation hitches
- Xcode organizer or device logs for release-build runtime issues
- Android Studio Profiler for CPU, memory, and frame rendering
- Android `adb shell dumpsys gfxinfo` for frame timing where applicable
- screen recording for visible stutter or gesture conflict evidence

## Evidence Log Template

Before H5/H6, capture a completed log:

| Date | Commit | Platform | Device | Build | Renderer | Scenario | p50 frame | p95 frame | Memory | Result  | Notes |
| ---- | ------ | -------- | ------ | ----- | -------- | -------- | --------- | --------- | ------ | ------- | ----- |
| TBD  | TBD    | iOS      | TBD    | TBD   | svg      | TBD      | TBD       | TBD       | TBD    | Pending |       |
| TBD  | TBD    | Android  | TBD    | TBD   | svg      | TBD      | TBD       | TBD       | TBD    | Pending |       |

Attach profiler screenshots, logs, or recordings for any scenario that fails target expectations.

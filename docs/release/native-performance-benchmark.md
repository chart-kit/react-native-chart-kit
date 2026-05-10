# Native Performance Benchmark Protocol

Status on May 7, 2026: protocol ready, release simulator/emulator samples captured for all iOS and Android SVG performance rows; Instruments/device acceptance and final performance review are still missing. Structured gate evidence lives in [native-performance-benchmark.json](evidence/native-performance-benchmark.json), with the scenario matrix in [native-performance-matrix.json](evidence/native-performance-matrix.json). Use the generated [native QA evidence backlog](native-qa-signoff-worksheet.md) only when release engineering or an agent is collecting stable-RC evidence.

This protocol defines the native benchmark evidence required before production beta/RC can claim production performance confidence. The current `npm run benchmark` command covers core geometry and web showcase scrub timing. It does not measure native render time, native gesture frame pacing, release-build memory, or renderer-specific device behavior.

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

## Local Sample Evidence

The Android release APK was profiled on the `chartkit_api36` emulator for one visible Line Charts scenario on May 5 and all nine Android SVG performance matrix rows on May 6. The iOS release app was sampled on the iPhone 17 simulator for all nine iOS SVG performance matrix rows on May 6. Android matrix-row samples launch each showcase fixture by deep link, collect Android `am start -W`, `dumpsys gfxinfo`, before/after `dumpsys meminfo`, gesture or tap input where applicable, and a screenshot. iOS matrix-row samples launch each showcase fixture by deep link and collect simulator launch command timing, process RSS, and a screenshot.

Artifact:

- [Android line animation performance sample](artifacts/android-line-animation-performance.md)
- [Android SVG small line initial render](artifacts/android-svg-small-line-initial-render-performance.md)
- [Android SVG standard line scrub](artifacts/android-svg-standard-line-scrub-performance.md)
- [Android SVG dense line decimated overview](artifacts/android-svg-dense-line-decimated-overview-performance.md)
- [Android SVG multi-line shared tooltip scrub](artifacts/android-svg-multi-line-shared-tooltip-scrub-performance.md)
- [Android SVG scrollable line one-finger pan](artifacts/android-svg-scrollable-line-one-finger-pan-performance.md)
- [Android SVG range selector drag and thumb resize](artifacts/android-svg-range-selector-drag-and-thumb-resize-performance.md)
- [Android SVG scrollable bar horizontal scroll and selection](artifacts/android-svg-scrollable-bar-horizontal-scroll-and-selection-performance.md)
- [Android SVG combined chart shared tooltip and legend](artifacts/android-svg-combined-chart-shared-tooltip-and-legend-performance.md)
- [Android SVG candlestick pan, pinch, and tap inspection](artifacts/android-svg-candlestick-pan-pinch-and-tap-inspection-performance.md)
- [iOS SVG small line initial render](artifacts/ios-svg-small-line-initial-render-performance.md)
- [iOS SVG standard line scrub](artifacts/ios-svg-standard-line-scrub-performance.md)
- [iOS SVG dense line decimated overview](artifacts/ios-svg-dense-line-decimated-overview-performance.md)
- [iOS SVG multi-line shared tooltip scrub](artifacts/ios-svg-multi-line-shared-tooltip-scrub-performance.md)
- [iOS SVG scrollable line one-finger pan](artifacts/ios-svg-scrollable-line-one-finger-pan-performance.md)
- [iOS SVG range selector drag and thumb resize](artifacts/ios-svg-range-selector-drag-and-thumb-resize-performance.md)
- [iOS SVG scrollable bar horizontal scroll and selection](artifacts/ios-svg-scrollable-bar-horizontal-scroll-and-selection-performance.md)
- [iOS SVG combined chart shared tooltip and legend](artifacts/ios-svg-combined-chart-shared-tooltip-and-legend-performance.md)
- [iOS SVG candlestick pan, pinch, and tap inspection](artifacts/ios-svg-candlestick-pan-pinch-and-tap-inspection-performance.md)

Observed result:

| Date        | Commit    | Platform | Device/OS                      | Build       | Renderer | Scenario                | p50 frame | p95 frame | Memory PSS | Result       |
| ----------- | --------- | -------- | ------------------------------ | ----------- | -------- | ----------------------- | --------- | --------- | ---------- | ------------ |
| May 5, 2026 | `4dd219e` | Android  | `chartkit_api36` emulator / 36 | Release APK | SVG      | Line animation `Replay` | 16 ms     | 18 ms     | 277,137 KB | Partial pass |
| May 6, 2026 | `07b27db` | Android  | `sdk_gphone64_arm64` / 16      | Release APK | SVG      | Android SVG matrix rows | Per row   | Per row   | Per row    | Partial pass |
| May 6, 2026 | `b8b0545` | iOS      | iPhone 17 simulator / 26.0     | Release app | SVG      | iOS SVG matrix rows     | Pending   | Pending   | Per row    | Partial pass |

These samples are intentionally not counted as full production beta/RC performance evidence. The remaining required matrix still needs Instruments frame timing on iOS, physical-device or explicitly accepted simulator/emulator sign-off, manual visible-correctness review, and Skia parity where supported.

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

When Skia chart integration exists, run the same scenarios for both `svg` and `skia` where supported.

The machine-readable matrix in [native-performance-matrix.json](evidence/native-performance-matrix.json) expands the required scenarios across iOS and Android for the SVG renderer. Each scenario maps to a current showcase story, and the generated [native QA checklist](native-qa-checklists.md) includes native deep links for opening the relevant story during manual profiling. Dedicated QA fixture sizes are recorded in the showcase [performance story metadata](../../apps/expo-showcase/src/stories/performanceStoryMetadata.json), and `npm run release:gate:report` checks that the matrix expected metrics match that metadata. Skia performance comparison evidence is tracked separately in [skia-renderer-matrix.json](evidence/skia-renderer-matrix.json).

To open and capture a specific performance fixture before attaching profiler output, use the same row metadata:

```sh
npm run release:qa:status -- --matrix performance --status partial --details

npm run release:qa:capture -- \
  --matrix performance \
  --row android-svg-standard-line-scrub \
  --platform android \
  --output docs/release/artifacts/android-svg-standard-line-scrub.png
```

Use `--dry-run` to print the `adb` or `xcrun` commands, and use `--no-launch` if Instruments, Android Studio Profiler, or a screen recording is already focused on the target scenario. A screenshot alone is not enough for a performance row; attach timing and memory evidence with `npm run release:qa:record -- --matrix performance --row <row-id> --status pass --evidence <artifact> --reviewed-by <name> --device "<device/os>" --build-surface "<build>" --notes "<performance criteria accepted>"`.

For Android release-emulator samples, the helper below opens the matrix row, captures launch timing, `dumpsys gfxinfo`, before/after `dumpsys meminfo`, and a screenshot into one markdown artifact:

```sh
npm run release:performance:android -- \
  --row android-svg-standard-line-scrub \
  --output docs/release/artifacts/android-svg-standard-line-scrub-performance.md
```

Use the generated record command with `--status partial` unless the row-specific criteria were reviewed on an accepted release target. These samples are useful for trend evidence, but they do not replace full physical-device or accepted simulator/emulator performance sign-off.

For iOS release-simulator samples, the helper below opens the matrix row, captures simulator launch command timing, process RSS, and a screenshot into one markdown artifact:

```sh
npm run release:performance:ios -- \
  --row ios-svg-standard-line-scrub \
  --output docs/release/artifacts/ios-svg-standard-line-scrub-performance.md
```

Use the generated record command with `--status partial`. This helper does not replace Instruments frame timing, synthetic gesture profiling, or physical-device sign-off.

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

Use release builds for publish-gate numbers. Expo Go and debug builds are useful for development, but they should not be used as final production beta/RC performance evidence.

Recommended tools:

- iOS Instruments for time profiler, allocations, and animation hitches
- Xcode organizer or device logs for release-build runtime issues
- Android Studio Profiler for CPU, memory, and frame rendering
- Android `adb shell dumpsys gfxinfo` for frame timing where applicable
- screen recording for visible stutter or gesture conflict evidence

## Evidence Log Template

Before production beta/RC, capture a completed log:

| Date        | Commit    | Platform | Device                                       | Build       | Renderer | Scenario                | p50 frame | p95 frame | Memory         | Result       | Notes                                                            |
| ----------- | --------- | -------- | -------------------------------------------- | ----------- | -------- | ----------------------- | --------- | --------- | -------------- | ------------ | ---------------------------------------------------------------- |
| May 5, 2026 | `4dd219e` | Android  | `chartkit_api36` emulator / Android 36 ARM64 | Release APK | svg      | Line animation `Replay` | 16 ms     | 18 ms     | 277,137 KB PSS | Partial pass | Single visible animation sample only; full matrix still pending. |
| TBD         | TBD       | iOS      | TBD                                          | TBD         | svg      | TBD                     | TBD       | TBD       | TBD            | Pending      |                                                                  |
| TBD         | TBD       | Android  | TBD                                          | TBD         | svg      | Gesture matrix          | TBD       | TBD       | TBD            | Pending      |                                                                  |

Attach profiler screenshots, logs, or recordings for any scenario that fails target expectations.

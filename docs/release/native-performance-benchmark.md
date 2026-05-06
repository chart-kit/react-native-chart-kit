# Native Performance Benchmark Protocol

Status on May 5, 2026: protocol ready, partial Android release-emulator evidence captured; full release-device performance evidence missing. Structured gate evidence lives in [native-performance-benchmark.json](evidence/native-performance-benchmark.json), with the scenario matrix in [native-performance-matrix.json](evidence/native-performance-matrix.json). Use the generated [native QA checklist](native-qa-checklists.md) for row-by-row execution.

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

The Android release APK was profiled on the `chartkit_api36` Android 36 ARM64 emulator for one visible Line Charts scenario. The app launched from the release APK, the Pro Animation Preview `Replay` button was tapped through `adb shell input tap`, and Android `dumpsys gfxinfo` / `dumpsys meminfo` were captured afterward.

Artifact:

- [Android line animation performance sample](artifacts/android-line-animation-performance.md)

Observed result:

| Date        | Commit    | Platform | Device/OS                      | Build       | Renderer | Scenario                | p50 frame | p95 frame | Memory PSS | Result       |
| ----------- | --------- | -------- | ------------------------------ | ----------- | -------- | ----------------------- | --------- | --------- | ---------- | ------------ |
| May 5, 2026 | `4dd219e` | Android  | `chartkit_api36` emulator / 36 | Release APK | SVG      | Line animation `Replay` | 16 ms     | 18 ms     | 277,137 KB | Partial pass |

This sample is intentionally not counted as full production beta/RC performance evidence because it covers only one Android emulator scenario. The remaining required matrix still needs iOS, physical-device or accepted simulator/emulator targets, gesture-heavy scenarios, memory before/after per scenario, and Skia parity where supported.

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

The machine-readable matrix in [native-performance-matrix.json](evidence/native-performance-matrix.json) expands the required scenarios across iOS and Android for the SVG renderer. Each scenario maps to a current showcase story, and the generated [native QA checklist](native-qa-checklists.md) includes native deep links for opening the relevant story during manual profiling. Dedicated QA fixture sizes are recorded in the showcase [performance story metadata](../../apps/expo-showcase/src/stories/performanceStoryMetadata.json), and `npm run release:gate:report` checks that the matrix expected metrics match that metadata. Skia rows remain deferred until native Skia install and renderer parity evidence exist.

To open and capture a specific performance fixture before attaching profiler output, use the same row metadata:

```sh
npm run release:qa:capture -- \
  --matrix performance \
  --row android-svg-standard-line-scrub \
  --platform android \
  --output docs/release/artifacts/android-svg-standard-line-scrub.png
```

Use `--dry-run` to print the `adb` or `xcrun` commands, and use `--no-launch` if Instruments, Android Studio Profiler, or a screen recording is already focused on the target scenario. A screenshot alone is not enough for a performance row; attach timing and memory evidence with `npm run release:qa:record -- --matrix performance --row <row-id> --status pass --evidence <artifact>`.

For Android release-emulator samples, the helper below opens the matrix row, captures launch timing, `dumpsys gfxinfo`, before/after `dumpsys meminfo`, and a screenshot into one markdown artifact:

```sh
npm run release:performance:android -- \
  --row android-svg-standard-line-scrub \
  --output docs/release/artifacts/android-svg-standard-line-scrub-performance.md
```

Use the generated record command with `--status partial` unless the row-specific criteria were reviewed on an accepted release target. These samples are useful for trend evidence, but they do not replace full physical-device or accepted simulator/emulator performance sign-off.

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

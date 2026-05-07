# android-svg-range-selector-drag-and-thumb-resize Android Performance Sample

Date: 2026-05-07
Commit: `dc413c1`
Package version: `7.0.0-next.0`
Platform: Android emulator
Build: release APK, `io.chartkit.showcase`
Renderer: skia through @shopify/react-native-skia
Scenario: Android / Range selector drag and thumb resize
Showcase story: `v2-perf-range-2x10000`
Deep link: `chartkitshowcase://showcase?story=v2-perf-range-2x10000&visual=1`

Expected fixture:

- Chart type: line
- Total points: 10,000
- Visible points: 1,500
- Series count: 2

Device:

- Model: sdk_gphone64_arm64
- Android: 16
- Screen: 1080x2400

Commands used:

```sh
adb shell am force-stop io.chartkit.showcase
adb shell dumpsys gfxinfo io.chartkit.showcase reset
adb shell am start -W -a android.intent.action.VIEW -d 'chartkitshowcase://showcase?story=v2-perf-range-2x10000&visual=1' io.chartkit.showcase
adb shell dumpsys meminfo io.chartkit.showcase
adb shell dumpsys gfxinfo io.chartkit.showcase reset
adb shell input swipe 900 1180 180 1180 1200
adb shell dumpsys gfxinfo io.chartkit.showcase
adb shell dumpsys meminfo io.chartkit.showcase
adb exec-out screencap -p
```

Launch output:

```text
Starting: Intent { act=android.intent.action.VIEW dat=chartkitshowcase://showcase/... pkg=io.chartkit.showcase }
Status: ok
LaunchState: COLD
Activity: io.chartkit.showcase/.MainActivity
TotalTime: 197
WaitTime: 198
Complete
```

Launch timing:

| Metric    | Result |
| --------- | -----: |
| TotalTime | 197 ms |
| WaitTime  | 198 ms |

Frame timing:

| Metric                |   Result |
| --------------------- | -------: |
| Total frames rendered |        0 |
| Janky frames          |        0 |
| p50 frame time        | 4,950 ms |
| p90 frame time        | 4,950 ms |
| p95 frame time        | 4,950 ms |
| p99 frame time        | 4,950 ms |
| Frame deadline missed |        0 |

Memory:

| Metric          | Before scenario | After scenario |
| --------------- | --------------: | -------------: |
| Total PSS       |      143,198 KB |     150,641 KB |
| Total RSS       |      224,384 KB |     233,000 KB |
| Native heap PSS |       30,231 KB |      29,075 KB |

Artifact:

- Screenshot: [android-skia-performance-comparison-metric-3-range-selector.png](android-skia-performance-comparison-metric-3-range-selector.png)

Notes:

- This is Android release-emulator evidence for one native performance matrix row.
- It does not replace physical-device performance, iOS performance, Skia parity, or manual visible-correctness review.

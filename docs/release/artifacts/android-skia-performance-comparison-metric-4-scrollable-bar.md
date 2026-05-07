# android-svg-scrollable-bar-horizontal-scroll-and-selection Android Performance Sample

Date: 2026-05-07
Commit: `dc413c1`
Package version: `7.0.0-next.0`
Platform: Android emulator
Build: release APK, `io.chartkit.showcase`
Renderer: skia through @shopify/react-native-skia
Scenario: Android / Scrollable bar horizontal scroll and selection
Showcase story: `v2-perf-bar-500-selection`
Deep link: `chartkitshowcase://showcase?story=v2-perf-bar-500-selection&visual=1`

Expected fixture:

- Chart type: bar
- Total points: 500
- Visible points: 24
- Series count: 1

Device:

- Model: sdk_gphone64_arm64
- Android: 16
- Screen: 1080x2400

Commands used:

```sh
adb shell am force-stop io.chartkit.showcase
adb shell dumpsys gfxinfo io.chartkit.showcase reset
adb shell am start -W -a android.intent.action.VIEW -d 'chartkitshowcase://showcase?story=v2-perf-bar-500-selection&visual=1' io.chartkit.showcase
adb shell dumpsys meminfo io.chartkit.showcase
adb shell dumpsys gfxinfo io.chartkit.showcase reset
adb shell input swipe 850 1450 240 1450 900
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
TotalTime: 318
WaitTime: 319
Complete
```

Launch timing:

| Metric    | Result |
| --------- | -----: |
| TotalTime | 318 ms |
| WaitTime  | 319 ms |

Frame timing:

| Metric                | Result |
| --------------------- | -----: |
| Total frames rendered |     70 |
| Janky frames          |      2 |
| p50 frame time        |  23 ms |
| p90 frame time        |  26 ms |
| p95 frame time        |  31 ms |
| p99 frame time        |  42 ms |
| Frame deadline missed |      2 |

Memory:

| Metric          | Before scenario | After scenario |
| --------------- | --------------: | -------------: |
| Total PSS       |      366,515 KB |     229,703 KB |
| Total RSS       |      447,852 KB |     312,664 KB |
| Native heap PSS |      108,423 KB |     104,357 KB |

Artifact:

- Screenshot: [android-skia-performance-comparison-metric-4-scrollable-bar.png](android-skia-performance-comparison-metric-4-scrollable-bar.png)

Notes:

- This is Android release-emulator evidence for one native performance matrix row.
- It does not replace physical-device performance, iOS performance, Skia parity, or manual visible-correctness review.

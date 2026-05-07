# android-svg-multi-line-shared-tooltip-scrub Android Performance Sample

Date: 2026-05-07
Commit: `dc413c1`
Package version: `7.0.0-next.0`
Platform: Android emulator
Build: release APK, `io.chartkit.showcase`
Renderer: skia through @shopify/react-native-skia
Scenario: Android / Multi-line shared tooltip scrub
Showcase story: `v2-perf-line-5x1000-tooltip`
Deep link: `chartkitshowcase://showcase?story=v2-perf-line-5x1000-tooltip&visual=1`

Expected fixture:

- Chart type: line
- Total points: 1,000
- Visible points: 1,000
- Series count: 5

Device:

- Model: sdk_gphone64_arm64
- Android: 16
- Screen: 1080x2400

Commands used:

```sh
adb shell am force-stop io.chartkit.showcase
adb shell dumpsys gfxinfo io.chartkit.showcase reset
adb shell am start -W -a android.intent.action.VIEW -d 'chartkitshowcase://showcase?story=v2-perf-line-5x1000-tooltip&visual=1' io.chartkit.showcase
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
TotalTime: 220
WaitTime: 221
Complete
```

Launch timing:

| Metric    | Result |
| --------- | -----: |
| TotalTime | 220 ms |
| WaitTime  | 221 ms |

Frame timing:

| Metric                | Result |
| --------------------- | -----: |
| Total frames rendered |     42 |
| Janky frames          |     23 |
| p50 frame time        |  16 ms |
| p90 frame time        |  31 ms |
| p95 frame time        |  32 ms |
| p99 frame time        |  34 ms |
| Frame deadline missed |     23 |

Memory:

| Metric          | Before scenario | After scenario |
| --------------- | --------------: | -------------: |
| Total PSS       |      285,163 KB |     154,155 KB |
| Total RSS       |      365,504 KB |     236,552 KB |
| Native heap PSS |       38,359 KB |      41,951 KB |

Artifact:

- Screenshot: [android-skia-performance-comparison-metric-2-multi-line-scrub.png](android-skia-performance-comparison-metric-2-multi-line-scrub.png)

Notes:

- This is Android release-emulator evidence for one native performance matrix row.
- It does not replace physical-device performance, iOS performance, Skia parity, or manual visible-correctness review.

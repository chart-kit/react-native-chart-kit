# android-svg-scrollable-bar-horizontal-scroll-and-selection Android Performance Sample

Date: 2026-05-06
Commit: `07b27db`
Package version: `7.0.0-next.0`
Platform: Android emulator
Build: release APK, `io.chartkit.showcase`
Renderer: svg through React Native SVG
Scenario: Android / Scrollable bar horizontal scroll and selection
Showcase story: `v2-perf-bar-500-selection`
Deep link: `chartkitshowcase://showcase?view=charts&story=v2-perf-bar-500-selection`

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
adb shell am start -W -a android.intent.action.VIEW -d 'chartkitshowcase://showcase?view=charts&story=v2-perf-bar-500-selection' io.chartkit.showcase
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
TotalTime: 249
WaitTime: 251
Complete
```

Launch timing:

| Metric    | Result |
| --------- | -----: |
| TotalTime | 249 ms |
| WaitTime  | 251 ms |

Frame timing:

| Metric                | Result |
| --------------------- | -----: |
| Total frames rendered |     28 |
| Janky frames          |      1 |
| p50 frame time        |  23 ms |
| p90 frame time        |  30 ms |
| p95 frame time        |  32 ms |
| p99 frame time        |  38 ms |
| Frame deadline missed |      1 |

Memory:

| Metric          | Before scenario | After scenario |
| --------------- | --------------: | -------------: |
| Total PSS       |      265,450 KB |     259,673 KB |
| Total RSS       |      344,140 KB |     339,256 KB |
| Native heap PSS |      177,603 KB |     163,045 KB |

Artifact:

- Screenshot: [android-svg-scrollable-bar-horizontal-scroll-and-selection-performance.png](android-svg-scrollable-bar-horizontal-scroll-and-selection-performance.png)

Notes:

- This is Android release-emulator evidence for one native performance matrix row.
- It does not replace physical-device performance, iOS performance, Skia parity, or manual visible-correctness review.

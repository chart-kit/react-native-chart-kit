# android-svg-range-selector-drag-and-thumb-resize Android Performance Sample

Date: 2026-05-06
Commit: `07b27db`
Package version: `7.0.0-next.0`
Platform: Android emulator
Build: release APK, `io.chartkit.showcase`
Renderer: svg through React Native SVG
Scenario: Android / Range selector drag and thumb resize
Showcase story: `v2-perf-range-2x10000`
Deep link: `chartkitshowcase://showcase?view=charts&story=v2-perf-range-2x10000`

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
adb shell am start -W -a android.intent.action.VIEW -d 'chartkitshowcase://showcase?view=charts&story=v2-perf-range-2x10000' io.chartkit.showcase
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
TotalTime: 200
WaitTime: 201
Complete
```

Launch timing:

| Metric    | Result |
| --------- | -----: |
| TotalTime | 200 ms |
| WaitTime  | 201 ms |

Frame timing:

| Metric                | Result |
| --------------------- | -----: |
| Total frames rendered |     40 |
| Janky frames          |      0 |
| p50 frame time        |  16 ms |
| p90 frame time        |  17 ms |
| p95 frame time        |  18 ms |
| p99 frame time        |  18 ms |
| Frame deadline missed |      0 |

Memory:

| Metric          | Before scenario | After scenario |
| --------------- | --------------: | -------------: |
| Total PSS       |      257,748 KB |     239,566 KB |
| Total RSS       |      336,452 KB |     319,148 KB |
| Native heap PSS |      170,107 KB |     143,193 KB |

Artifact:

- Screenshot: [android-svg-range-selector-drag-and-thumb-resize-performance.png](android-svg-range-selector-drag-and-thumb-resize-performance.png)

Notes:

- This is Android release-emulator evidence for one native performance matrix row.
- It does not replace physical-device performance, iOS performance, Skia parity, or manual visible-correctness review.

# android-svg-small-line-initial-render Android Performance Sample

Date: 2026-05-06
Commit: `07b27db`
Package version: `7.0.0-next.0`
Platform: Android emulator
Build: release APK, `io.chartkit.showcase`
Renderer: svg through React Native SVG
Scenario: Android / Small line initial render
Showcase story: `v2-perf-line-100`
Deep link: `chartkitshowcase://showcase?view=charts&story=v2-perf-line-100`

Expected fixture:

- Chart type: line
- Total points: 100
- Visible points: 100
- Series count: 1

Device:

- Model: sdk_gphone64_arm64
- Android: 16
- Screen: 1080x2400

Commands used:

```sh
adb shell am force-stop io.chartkit.showcase
adb shell dumpsys gfxinfo io.chartkit.showcase reset
adb shell am start -W -a android.intent.action.VIEW -d 'chartkitshowcase://showcase?view=charts&story=v2-perf-line-100' io.chartkit.showcase
adb shell dumpsys meminfo io.chartkit.showcase
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
TotalTime: 378
WaitTime: 380
Complete
```

Launch timing:

| Metric    | Result |
| --------- | -----: |
| TotalTime | 378 ms |
| WaitTime  | 380 ms |

Frame timing:

| Metric                | Result |
| --------------------- | -----: |
| Total frames rendered |     72 |
| Janky frames          |      2 |
| p50 frame time        |  23 ms |
| p90 frame time        |  28 ms |
| p95 frame time        |  48 ms |
| p99 frame time        | 250 ms |
| Frame deadline missed |      2 |

Memory:

| Metric          | Before scenario | After scenario |
| --------------- | --------------: | -------------: |
| Total PSS       |      251,801 KB |     249,372 KB |
| Total RSS       |      330,116 KB |     328,472 KB |
| Native heap PSS |      165,121 KB |     155,237 KB |

Artifact:

- Screenshot: [android-svg-small-line-initial-render-performance.png](android-svg-small-line-initial-render-performance.png)

Notes:

- This is Android release-emulator evidence for one native performance matrix row.
- It does not replace physical-device performance, iOS performance, Skia parity, or manual visible-correctness review.

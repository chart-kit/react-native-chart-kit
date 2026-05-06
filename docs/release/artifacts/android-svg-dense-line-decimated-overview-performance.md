# android-svg-dense-line-decimated-overview Android Performance Sample

Date: 2026-05-06
Commit: `07b27db`
Package version: `7.0.0-next.0`
Platform: Android emulator
Build: release APK, `io.chartkit.showcase`
Renderer: svg through React Native SVG
Scenario: Android / Dense line decimated overview
Showcase story: `v2-perf-line-10000-overview`
Deep link: `chartkitshowcase://showcase?view=charts&story=v2-perf-line-10000-overview`

Expected fixture:

- Chart type: line
- Total points: 10,000
- Visible points: 10,000
- Series count: 1

Device:

- Model: sdk_gphone64_arm64
- Android: 16
- Screen: 1080x2400

Commands used:

```sh
adb shell am force-stop io.chartkit.showcase
adb shell dumpsys gfxinfo io.chartkit.showcase reset
adb shell am start -W -a android.intent.action.VIEW -d 'chartkitshowcase://showcase?view=charts&story=v2-perf-line-10000-overview' io.chartkit.showcase
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
TotalTime: 427
WaitTime: 444
Complete
```

Launch timing:

| Metric    | Result |
| --------- | -----: |
| TotalTime | 427 ms |
| WaitTime  | 444 ms |

Frame timing:

| Metric                | Result |
| --------------------- | -----: |
| Total frames rendered |     84 |
| Janky frames          |      2 |
| p50 frame time        |  28 ms |
| p90 frame time        |  32 ms |
| p95 frame time        |  36 ms |
| p99 frame time        | 250 ms |
| Frame deadline missed |      2 |

Memory:

| Metric          | Before scenario | After scenario |
| --------------- | --------------: | -------------: |
| Total PSS       |      244,782 KB |     249,079 KB |
| Total RSS       |      323,336 KB |     328,248 KB |
| Native heap PSS |      157,348 KB |     153,064 KB |

Artifact:

- Screenshot: [android-svg-dense-line-decimated-overview-performance.png](android-svg-dense-line-decimated-overview-performance.png)

Notes:

- This is Android release-emulator evidence for one native performance matrix row.
- It does not replace physical-device performance, iOS performance, Skia parity, or manual visible-correctness review.

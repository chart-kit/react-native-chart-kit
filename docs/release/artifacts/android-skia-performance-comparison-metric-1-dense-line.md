# android-svg-dense-line-decimated-overview Android Performance Sample

Date: 2026-05-07
Commit: `dc413c1`
Package version: `7.0.0-next.0`
Platform: Android emulator
Build: release APK, `io.chartkit.showcase`
Renderer: skia through @shopify/react-native-skia
Scenario: Android / Dense line decimated overview
Showcase story: `v2-perf-line-10000-overview`
Deep link: `chartkitshowcase://showcase?story=v2-perf-line-10000-overview&visual=1`

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
adb shell am start -W -a android.intent.action.VIEW -d 'chartkitshowcase://showcase?story=v2-perf-line-10000-overview&visual=1' io.chartkit.showcase
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
TotalTime: 468
WaitTime: 473
Complete
```

Launch timing:

| Metric    | Result |
| --------- | -----: |
| TotalTime | 468 ms |
| WaitTime  | 473 ms |

Frame timing:

| Metric                | Result |
| --------------------- | -----: |
| Total frames rendered |      5 |
| Janky frames          |      4 |
| p50 frame time        |  53 ms |
| p90 frame time        | 400 ms |
| p95 frame time        | 400 ms |
| p99 frame time        | 400 ms |
| Frame deadline missed |      4 |

Memory:

| Metric          | Before scenario | After scenario |
| --------------- | --------------: | -------------: |
| Total PSS       |      141,929 KB |     150,123 KB |
| Total RSS       |      222,792 KB |     232,140 KB |
| Native heap PSS |       34,459 KB |      34,367 KB |

Artifact:

- Screenshot: [android-skia-performance-comparison-metric-1-dense-line.png](android-skia-performance-comparison-metric-1-dense-line.png)

Notes:

- This is Android release-emulator evidence for one native performance matrix row.
- It does not replace physical-device performance, iOS performance, Skia parity, or manual visible-correctness review.

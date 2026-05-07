# android-svg-combined-chart-shared-tooltip-and-legend Android Performance Sample

Date: 2026-05-07
Commit: `dc413c1`
Package version: `7.0.0-next.0`
Platform: Android emulator
Build: release APK, `io.chartkit.showcase`
Renderer: skia through @shopify/react-native-skia
Scenario: Android / Combined chart shared tooltip and legend
Showcase story: `v2-perf-combined-tooltip`
Deep link: `chartkitshowcase://showcase?story=v2-perf-combined-tooltip&visual=1`

Expected fixture:

- Chart type: combined
- Total points: 36
- Visible points: 36
- Series count: 2

Device:

- Model: sdk_gphone64_arm64
- Android: 16
- Screen: 1080x2400

Commands used:

```sh
adb shell am force-stop io.chartkit.showcase
adb shell dumpsys gfxinfo io.chartkit.showcase reset
adb shell am start -W -a android.intent.action.VIEW -d 'chartkitshowcase://showcase?story=v2-perf-combined-tooltip&visual=1' io.chartkit.showcase
adb shell dumpsys meminfo io.chartkit.showcase
adb shell dumpsys gfxinfo io.chartkit.showcase reset
adb shell input tap 540 1180
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
TotalTime: 209
WaitTime: 212
Complete
```

Launch timing:

| Metric    | Result |
| --------- | -----: |
| TotalTime | 209 ms |
| WaitTime  | 212 ms |

Frame timing:

| Metric                | Result |
| --------------------- | -----: |
| Total frames rendered |     40 |
| Janky frames          |      1 |
| p50 frame time        |  11 ms |
| p90 frame time        |  17 ms |
| p95 frame time        |  21 ms |
| p99 frame time        |  25 ms |
| Frame deadline missed |      1 |

Memory:

| Metric          | Before scenario | After scenario |
| --------------- | --------------: | -------------: |
| Total PSS       |      135,000 KB |     141,701 KB |
| Total RSS       |      216,272 KB |     224,152 KB |
| Native heap PSS |       37,891 KB |      36,187 KB |

Artifact:

- Screenshot: [android-skia-performance-comparison-metric-5-combined-tooltip.png](android-skia-performance-comparison-metric-5-combined-tooltip.png)

Notes:

- This is Android release-emulator evidence for one native performance matrix row.
- It does not replace physical-device performance, iOS performance, Skia parity, or manual visible-correctness review.

# android-svg-combined-chart-shared-tooltip-and-legend Android Performance Sample

Date: 2026-05-06
Commit: `07b27db`
Package version: `7.0.0-next.0`
Platform: Android emulator
Build: release APK, `io.chartkit.showcase`
Renderer: svg through React Native SVG
Scenario: Android / Combined chart shared tooltip and legend
Showcase story: `v2-perf-combined-tooltip`
Deep link: `chartkitshowcase://showcase?view=charts&story=v2-perf-combined-tooltip`

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
adb shell am start -W -a android.intent.action.VIEW -d 'chartkitshowcase://showcase?view=charts&story=v2-perf-combined-tooltip' io.chartkit.showcase
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
TotalTime: 248
WaitTime: 249
Complete
```

Launch timing:

| Metric    | Result |
| --------- | -----: |
| TotalTime | 248 ms |
| WaitTime  | 249 ms |

Frame timing:

| Metric                | Result |
| --------------------- | -----: |
| Total frames rendered |     32 |
| Janky frames          |      1 |
| p50 frame time        |  23 ms |
| p90 frame time        |  26 ms |
| p95 frame time        |  26 ms |
| p99 frame time        |  32 ms |
| Frame deadline missed |      1 |

Memory:

| Metric          | Before scenario | After scenario |
| --------------- | --------------: | -------------: |
| Total PSS       |      267,480 KB |     269,964 KB |
| Total RSS       |      346,308 KB |     349,628 KB |
| Native heap PSS |      179,831 KB |     172,993 KB |

Artifact:

- Screenshot: [android-svg-combined-chart-shared-tooltip-and-legend-performance.png](android-svg-combined-chart-shared-tooltip-and-legend-performance.png)

Notes:

- This is Android release-emulator evidence for one native performance matrix row.
- It does not replace physical-device performance, iOS performance, Skia parity, or manual visible-correctness review.

# android-svg-standard-line-scrub Android Performance Sample

Date: 2026-05-06
Commit: `07b27db`
Package version: `7.0.0-next.0`
Platform: Android emulator
Build: release APK, `io.chartkit.showcase`
Renderer: svg through React Native SVG
Scenario: Android / Standard line scrub
Showcase story: `v2-perf-line-1000-scrub`
Deep link: `chartkitshowcase://showcase?view=charts&story=v2-perf-line-1000-scrub`

Expected fixture:

- Chart type: line
- Total points: 1,000
- Visible points: 1,000
- Series count: 1

Device:

- Model: sdk_gphone64_arm64
- Android: 16
- Screen: 1080x2400

Commands used:

```sh
adb shell am force-stop io.chartkit.showcase
adb shell dumpsys gfxinfo io.chartkit.showcase reset
adb shell am start -W -a android.intent.action.VIEW -d 'chartkitshowcase://showcase?view=charts&story=v2-perf-line-1000-scrub' io.chartkit.showcase
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
TotalTime: 375
WaitTime: 378
Complete
```

Launch timing:

| Metric    | Result |
| --------- | -----: |
| TotalTime | 375 ms |
| WaitTime  | 378 ms |

Frame timing:

| Metric                | Result |
| --------------------- | -----: |
| Total frames rendered |     28 |
| Janky frames          |      0 |
| p50 frame time        |  23 ms |
| p90 frame time        |  25 ms |
| p95 frame time        |  25 ms |
| p99 frame time        |  32 ms |
| Frame deadline missed |      0 |

Memory:

| Metric          | Before scenario | After scenario |
| --------------- | --------------: | -------------: |
| Total PSS       |      267,827 KB |     259,470 KB |
| Total RSS       |      346,292 KB |     338,792 KB |
| Native heap PSS |      180,016 KB |     163,006 KB |

Artifact:

- Screenshot: [android-svg-standard-line-scrub-performance.png](android-svg-standard-line-scrub-performance.png)

Notes:

- This is Android release-emulator evidence for one native performance matrix row.
- It does not replace physical-device performance, iOS performance, Skia parity, or manual visible-correctness review.

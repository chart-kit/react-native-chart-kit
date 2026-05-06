# android-svg-candlestick-pan-pinch-and-tap-inspection Android Performance Sample

Date: 2026-05-06
Commit: `07b27db`
Package version: `7.0.0-next.0`
Platform: Android emulator
Build: release APK, `io.chartkit.showcase`
Renderer: svg through React Native SVG
Scenario: Android / Candlestick pan, pinch, and tap inspection
Showcase story: `v2-perf-candlestick-1000`
Deep link: `chartkitshowcase://showcase?view=charts&story=v2-perf-candlestick-1000`

Expected fixture:

- Chart type: candlestick
- Total points: 1,000
- Visible points: 80
- Series count: 1

Device:

- Model: sdk_gphone64_arm64
- Android: 16
- Screen: 1080x2400

Commands used:

```sh
adb shell am force-stop io.chartkit.showcase
adb shell dumpsys gfxinfo io.chartkit.showcase reset
adb shell am start -W -a android.intent.action.VIEW -d 'chartkitshowcase://showcase?view=charts&story=v2-perf-candlestick-1000' io.chartkit.showcase
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
TotalTime: 366
WaitTime: 368
Complete
```

Launch timing:

| Metric    | Result |
| --------- | -----: |
| TotalTime | 366 ms |
| WaitTime  | 368 ms |

Frame timing:

| Metric                | Result |
| --------------------- | -----: |
| Total frames rendered |     36 |
| Janky frames          |      0 |
| p50 frame time        |  23 ms |
| p90 frame time        |  24 ms |
| p95 frame time        |  26 ms |
| p99 frame time        |  32 ms |
| Frame deadline missed |      0 |

Memory:

| Metric          | Before scenario | After scenario |
| --------------- | --------------: | -------------: |
| Total PSS       |      270,498 KB |     280,414 KB |
| Total RSS       |      349,272 KB |     360,044 KB |
| Native heap PSS |      182,403 KB |     182,717 KB |

Artifact:

- Screenshot: [android-svg-candlestick-pan-pinch-and-tap-inspection-performance.png](android-svg-candlestick-pan-pinch-and-tap-inspection-performance.png)

Notes:

- This is Android release-emulator evidence for one native performance matrix row.
- It does not replace physical-device performance, iOS performance, Skia parity, or manual visible-correctness review.

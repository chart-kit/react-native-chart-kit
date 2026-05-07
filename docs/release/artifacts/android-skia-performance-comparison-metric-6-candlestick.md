# android-svg-candlestick-pan-pinch-and-tap-inspection Android Performance Sample

Date: 2026-05-07
Commit: `dc413c1`
Package version: `7.0.0-next.0`
Platform: Android emulator
Build: release APK, `io.chartkit.showcase`
Renderer: skia through @shopify/react-native-skia
Scenario: Android / Candlestick pan, pinch, and tap inspection
Showcase story: `v2-perf-candlestick-1000`
Deep link: `chartkitshowcase://showcase?story=v2-perf-candlestick-1000&visual=1`

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
adb shell am start -W -a android.intent.action.VIEW -d 'chartkitshowcase://showcase?story=v2-perf-candlestick-1000&visual=1' io.chartkit.showcase
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
TotalTime: 227
WaitTime: 231
Complete
```

Launch timing:

| Metric    | Result |
| --------- | -----: |
| TotalTime | 227 ms |
| WaitTime  | 231 ms |

Frame timing:

| Metric                | Result |
| --------------------- | -----: |
| Total frames rendered |      3 |
| Janky frames          |      3 |
| p50 frame time        |  34 ms |
| p90 frame time        |  48 ms |
| p95 frame time        |  48 ms |
| p99 frame time        |  48 ms |
| Frame deadline missed |      3 |

Memory:

| Metric          | Before scenario | After scenario |
| --------------- | --------------: | -------------: |
| Total PSS       |      286,451 KB |     156,331 KB |
| Total RSS       |      367,140 KB |     238,728 KB |
| Native heap PSS |       41,951 KB |      40,291 KB |

Artifact:

- Screenshot: [android-skia-performance-comparison-metric-6-candlestick.png](android-skia-performance-comparison-metric-6-candlestick.png)

Notes:

- This is Android release-emulator evidence for one native performance matrix row.
- It does not replace physical-device performance, iOS performance, Skia parity, or manual visible-correctness review.

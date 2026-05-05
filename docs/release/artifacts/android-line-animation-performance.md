# Android Line Animation Performance Sample

Date: May 5, 2026
Commit: `4dd219e`
Platform: Android emulator
Device: `chartkit_api36`, Android 36 Google APIs ARM64, 1080 x 2400
Build: release APK, `io.chartkit.showcase`
Renderer: SVG through React Native SVG
Scenario: Line Charts page, Pro Animation Preview, tap `Replay`

Commands used:

```sh
ANDROID_HOME=/opt/homebrew/share/android-commandlinetools adb install -r apps/expo-showcase/android/app/build/outputs/apk/release/app-release.apk
ANDROID_HOME=/opt/homebrew/share/android-commandlinetools adb shell am start -W -n io.chartkit.showcase/.MainActivity
ANDROID_HOME=/opt/homebrew/share/android-commandlinetools adb shell dumpsys gfxinfo io.chartkit.showcase reset
ANDROID_HOME=/opt/homebrew/share/android-commandlinetools adb shell input tap 540 1875
ANDROID_HOME=/opt/homebrew/share/android-commandlinetools adb shell dumpsys gfxinfo io.chartkit.showcase
ANDROID_HOME=/opt/homebrew/share/android-commandlinetools adb shell dumpsys meminfo io.chartkit.showcase
```

Frame timing:

| Metric                | Result         |
| --------------------- | -------------- |
| Total frames rendered | 109            |
| Janky frames          | 2 / 109, 1.83% |
| p50 frame time        | 16 ms          |
| p90 frame time        | 17 ms          |
| p95 frame time        | 18 ms          |
| p99 frame time        | 18 ms          |
| Missed vsync          | 0              |
| Slow UI thread frames | 0              |
| Frame deadline missed | 2              |
| GPU p50               | 11 ms          |
| GPU p95               | 12 ms          |

Memory after the sample:

| Metric          | Result     |
| --------------- | ---------- |
| Total PSS       | 277,137 KB |
| Total RSS       | 366,780 KB |
| Total swap PSS  | 247 KB     |
| Java heap PSS   | 19,244 KB  |
| Native heap PSS | 193,788 KB |

Notes:

- This is useful Android release-emulator evidence for one visible line-animation scenario.
- It is not a full native performance pass. It does not cover physical devices, iOS, scrub, pan, pinch, range selector, bar scroll, combined charts, candlestick, or Skia parity.

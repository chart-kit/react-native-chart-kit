# ios-svg-candlestick-pan-pinch-and-tap-inspection iOS Performance Sample

Date: 2026-05-06
Commit: `b8b0545`
Package version: `7.0.0-next.0`
Platform: iOS simulator
Build: release app, `io.chartkit.showcase`
Executable: `ChartKitShowcase`
Renderer: svg through React Native SVG
Scenario: iOS / Candlestick pan, pinch, and tap inspection
Showcase story: `v2-perf-candlestick-1000`
Deep link: `chartkitshowcase://showcase?view=charts&story=v2-perf-candlestick-1000`

Expected fixture:

- Chart type: candlestick
- Total points: 1,000
- Visible points: 80
- Series count: 1

Device:

- Target: A706C6A5-26A2-499F-B24A-A9FB574888B0
- Booted devices: == Devices == -- iOS 26.0 -- iPhone 17 (A706C6A5-26A2-499F-B24A-A9FB574888B0) (Booted)

Commands used:

```sh
xcrun simctl terminate A706C6A5-26A2-499F-B24A-A9FB574888B0 io.chartkit.showcase
xcrun simctl openurl A706C6A5-26A2-499F-B24A-A9FB574888B0 chartkitshowcase://showcase?view=charts&story=v2-perf-candlestick-1000
xcrun simctl spawn A706C6A5-26A2-499F-B24A-A9FB574888B0 /bin/ps -axo 'pid,rss,comm'
xcrun simctl spawn A706C6A5-26A2-499F-B24A-A9FB574888B0 /bin/ps -axo 'pid,rss,comm'
xcrun simctl io A706C6A5-26A2-499F-B24A-A9FB574888B0 screenshot /Users/berman/Documents/react-native-chart-kit/docs/release/artifacts/ios-svg-candlestick-pan-pinch-and-tap-inspection-performance.png
xcrun simctl list devices booted
```

Launch timing:

| Metric                         | Result |
| ------------------------------ | -----: |
| simctl openurl command elapsed | 206 ms |

Memory:

| Metric | After launch | After scenario wait |
| ------ | -----------: | ------------------: |
| PID    |       26,634 |              26,634 |
| RSS    |   368,800 KB |          370,528 KB |

Artifact:

- Screenshot: [ios-svg-candlestick-pan-pinch-and-tap-inspection-performance.png](ios-svg-candlestick-pan-pinch-and-tap-inspection-performance.png)

Notes:

- This is iOS release-simulator evidence for one native performance matrix row.
- It captures launch command timing, process RSS, and a screenshot only.
- It does not replace Instruments frame timing, physical-device performance, synthetic gesture coverage, Skia parity, or manual visible-correctness review.

# ios-svg-scrollable-bar-horizontal-scroll-and-selection iOS Performance Sample

Date: 2026-05-07
Commit: `dc413c1`
Package version: `7.0.0-next.0`
Platform: iOS simulator
Build: release app, `io.chartkit.showcase`
Executable: `ChartKitShowcase`
Renderer: skia through @shopify/react-native-skia
Scenario: iOS / Scrollable bar horizontal scroll and selection
Showcase story: `v2-perf-bar-500-selection`
Deep link: `chartkitshowcase://showcase?story=v2-perf-bar-500-selection&visual=1`

Expected fixture:

- Chart type: bar
- Total points: 500
- Visible points: 24
- Series count: 1

Device:

- Target: A706C6A5-26A2-499F-B24A-A9FB574888B0
- Booted devices: == Devices == -- iOS 26.0 -- iPhone 17 (A706C6A5-26A2-499F-B24A-A9FB574888B0) (Booted)

Commands used:

```sh
xcrun simctl terminate A706C6A5-26A2-499F-B24A-A9FB574888B0 io.chartkit.showcase
xcrun simctl openurl A706C6A5-26A2-499F-B24A-A9FB574888B0 chartkitshowcase://showcase?story=v2-perf-bar-500-selection&visual=1
xcrun simctl spawn A706C6A5-26A2-499F-B24A-A9FB574888B0 /bin/ps -axo 'pid,rss,comm'
xcrun simctl spawn A706C6A5-26A2-499F-B24A-A9FB574888B0 /bin/ps -axo 'pid,rss,comm'
xcrun simctl io A706C6A5-26A2-499F-B24A-A9FB574888B0 screenshot /Users/berman/Documents/react-native-chart-kit/docs/release/artifacts/ios-skia-performance-comparison-metric-4-scrollable-bar.png
xcrun simctl list devices booted
```

Launch timing:

| Metric                         | Result |
| ------------------------------ | -----: |
| simctl openurl command elapsed | 211 ms |

Memory:

| Metric | After launch | After scenario wait |
| ------ | -----------: | ------------------: |
| PID    |       20,984 |              20,984 |
| RSS    |   370,800 KB |          370,800 KB |

Artifact:

- Screenshot: [ios-skia-performance-comparison-metric-4-scrollable-bar.png](ios-skia-performance-comparison-metric-4-scrollable-bar.png)

Notes:

- This is iOS release-simulator evidence for one native performance matrix row.
- It captures launch command timing, process RSS, and a screenshot only.
- It does not replace Instruments frame timing, physical-device performance, synthetic gesture coverage, Skia parity, or manual visible-correctness review.

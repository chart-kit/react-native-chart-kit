# ios-svg-dense-line-decimated-overview iOS Performance Sample

Date: 2026-05-07
Commit: `dc413c1`
Package version: `7.0.0-next.0`
Platform: iOS simulator
Build: release app, `io.chartkit.showcase`
Executable: `ChartKitShowcase`
Renderer: skia through @shopify/react-native-skia
Scenario: iOS / Dense line decimated overview
Showcase story: `v2-perf-line-10000-overview`
Deep link: `chartkitshowcase://showcase?story=v2-perf-line-10000-overview&visual=1`

Expected fixture:

- Chart type: line
- Total points: 10,000
- Visible points: 10,000
- Series count: 1

Device:

- Target: A706C6A5-26A2-499F-B24A-A9FB574888B0
- Booted devices: == Devices == -- iOS 26.0 -- iPhone 17 (A706C6A5-26A2-499F-B24A-A9FB574888B0) (Booted)

Commands used:

```sh
xcrun simctl terminate A706C6A5-26A2-499F-B24A-A9FB574888B0 io.chartkit.showcase
xcrun simctl openurl A706C6A5-26A2-499F-B24A-A9FB574888B0 chartkitshowcase://showcase?story=v2-perf-line-10000-overview&visual=1
xcrun simctl spawn A706C6A5-26A2-499F-B24A-A9FB574888B0 /bin/ps -axo 'pid,rss,comm'
xcrun simctl spawn A706C6A5-26A2-499F-B24A-A9FB574888B0 /bin/ps -axo 'pid,rss,comm'
xcrun simctl io A706C6A5-26A2-499F-B24A-A9FB574888B0 screenshot /Users/berman/Documents/react-native-chart-kit/docs/release/artifacts/ios-skia-performance-comparison-metric-1-dense-line.png
xcrun simctl list devices booted
```

Launch timing:

| Metric                         | Result |
| ------------------------------ | -----: |
| simctl openurl command elapsed | 497 ms |

Memory:

| Metric | After launch | After scenario wait |
| ------ | -----------: | ------------------: |
| PID    |       19,826 |              19,826 |
| RSS    |   305,264 KB |          306,176 KB |

Artifact:

- Screenshot: [ios-skia-performance-comparison-metric-1-dense-line.png](ios-skia-performance-comparison-metric-1-dense-line.png)

Notes:

- This is iOS release-simulator evidence for one native performance matrix row.
- It captures launch command timing, process RSS, and a screenshot only.
- It does not replace Instruments frame timing, physical-device performance, synthetic gesture coverage, Skia parity, or manual visible-correctness review.

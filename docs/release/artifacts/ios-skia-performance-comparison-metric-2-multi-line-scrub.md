# ios-svg-multi-line-shared-tooltip-scrub iOS Performance Sample

Date: 2026-05-07
Commit: `dc413c1`
Package version: `7.0.0-next.0`
Platform: iOS simulator
Build: release app, `io.chartkit.showcase`
Executable: `ChartKitShowcase`
Renderer: skia through @shopify/react-native-skia
Scenario: iOS / Multi-line shared tooltip scrub
Showcase story: `v2-perf-line-5x1000-tooltip`
Deep link: `chartkitshowcase://showcase?story=v2-perf-line-5x1000-tooltip&visual=1`

Expected fixture:

- Chart type: line
- Total points: 1,000
- Visible points: 1,000
- Series count: 5

Device:

- Target: A706C6A5-26A2-499F-B24A-A9FB574888B0
- Booted devices: == Devices == -- iOS 26.0 -- iPhone 17 (A706C6A5-26A2-499F-B24A-A9FB574888B0) (Booted)

Commands used:

```sh
xcrun simctl terminate A706C6A5-26A2-499F-B24A-A9FB574888B0 io.chartkit.showcase
xcrun simctl openurl A706C6A5-26A2-499F-B24A-A9FB574888B0 chartkitshowcase://showcase?story=v2-perf-line-5x1000-tooltip&visual=1
xcrun simctl spawn A706C6A5-26A2-499F-B24A-A9FB574888B0 /bin/ps -axo 'pid,rss,comm'
xcrun simctl spawn A706C6A5-26A2-499F-B24A-A9FB574888B0 /bin/ps -axo 'pid,rss,comm'
xcrun simctl io A706C6A5-26A2-499F-B24A-A9FB574888B0 screenshot /Users/berman/Documents/react-native-chart-kit/docs/release/artifacts/ios-skia-performance-comparison-metric-2-multi-line-scrub.png
xcrun simctl list devices booted
```

Launch timing:

| Metric                         | Result |
| ------------------------------ | -----: |
| simctl openurl command elapsed | 211 ms |

Memory:

| Metric | After launch | After scenario wait |
| ------ | -----------: | ------------------: |
| PID    |       20,293 |              20,293 |
| RSS    |   304,752 KB |          304,768 KB |

Artifact:

- Screenshot: [ios-skia-performance-comparison-metric-2-multi-line-scrub.png](ios-skia-performance-comparison-metric-2-multi-line-scrub.png)

Notes:

- This is iOS release-simulator evidence for one native performance matrix row.
- It captures launch command timing, process RSS, and a screenshot only.
- It does not replace Instruments frame timing, physical-device performance, synthetic gesture coverage, Skia parity, or manual visible-correctness review.

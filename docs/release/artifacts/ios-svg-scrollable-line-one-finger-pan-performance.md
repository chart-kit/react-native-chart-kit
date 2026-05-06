# ios-svg-scrollable-line-one-finger-pan iOS Performance Sample

Date: 2026-05-06
Commit: `b8b0545`
Package version: `7.0.0-next.0`
Platform: iOS simulator
Build: release app, `io.chartkit.showcase`
Executable: `ChartKitShowcase`
Renderer: svg through React Native SVG
Scenario: iOS / Scrollable line one-finger pan
Showcase story: `v2-perf-line-10000-pan`
Deep link: `chartkitshowcase://showcase?view=charts&story=v2-perf-line-10000-pan`

Expected fixture:

- Chart type: line
- Total points: 10,000
- Visible points: 2,000
- Series count: 1

Device:

- Target: A706C6A5-26A2-499F-B24A-A9FB574888B0
- Booted devices: == Devices == -- iOS 26.0 -- iPhone 17 (A706C6A5-26A2-499F-B24A-A9FB574888B0) (Booted)

Commands used:

```sh
xcrun simctl terminate A706C6A5-26A2-499F-B24A-A9FB574888B0 io.chartkit.showcase
xcrun simctl openurl A706C6A5-26A2-499F-B24A-A9FB574888B0 chartkitshowcase://showcase?view=charts&story=v2-perf-line-10000-pan
xcrun simctl spawn A706C6A5-26A2-499F-B24A-A9FB574888B0 /bin/ps -axo 'pid,rss,comm'
xcrun simctl spawn A706C6A5-26A2-499F-B24A-A9FB574888B0 /bin/ps -axo 'pid,rss,comm'
xcrun simctl io A706C6A5-26A2-499F-B24A-A9FB574888B0 screenshot /Users/berman/Documents/react-native-chart-kit/docs/release/artifacts/ios-svg-scrollable-line-one-finger-pan-performance.png
xcrun simctl list devices booted
```

Launch timing:

| Metric                         | Result |
| ------------------------------ | -----: |
| simctl openurl command elapsed | 206 ms |

Memory:

| Metric | After launch | After scenario wait |
| ------ | -----------: | ------------------: |
| PID    |       25,507 |              25,507 |
| RSS    |   366,464 KB |          367,504 KB |

Artifact:

- Screenshot: [ios-svg-scrollable-line-one-finger-pan-performance.png](ios-svg-scrollable-line-one-finger-pan-performance.png)

Notes:

- This is iOS release-simulator evidence for one native performance matrix row.
- It captures launch command timing, process RSS, and a screenshot only.
- It does not replace Instruments frame timing, physical-device performance, synthetic gesture coverage, Skia parity, or manual visible-correctness review.

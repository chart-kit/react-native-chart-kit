# ios-svg-multi-line-shared-tooltip-scrub iOS Performance Sample

Date: 2026-05-06
Commit: `b8b0545`
Package version: `7.0.0-next.0`
Platform: iOS simulator
Build: release app, `io.chartkit.showcase`
Executable: `ChartKitShowcase`
Renderer: svg through React Native SVG
Scenario: iOS / Multi-line shared tooltip scrub
Showcase story: `v2-perf-line-5x1000-tooltip`
Deep link: `chartkitshowcase://showcase?view=charts&story=v2-perf-line-5x1000-tooltip`

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
xcrun simctl openurl A706C6A5-26A2-499F-B24A-A9FB574888B0 chartkitshowcase://showcase?view=charts&story=v2-perf-line-5x1000-tooltip
xcrun simctl spawn A706C6A5-26A2-499F-B24A-A9FB574888B0 /bin/ps -axo 'pid,rss,comm'
xcrun simctl spawn A706C6A5-26A2-499F-B24A-A9FB574888B0 /bin/ps -axo 'pid,rss,comm'
xcrun simctl io A706C6A5-26A2-499F-B24A-A9FB574888B0 screenshot /Users/berman/Documents/react-native-chart-kit/docs/release/artifacts/ios-svg-multi-line-shared-tooltip-scrub-performance.png
xcrun simctl list devices booted
```

Launch timing:

| Metric                         | Result |
| ------------------------------ | -----: |
| simctl openurl command elapsed | 284 ms |

Memory:

| Metric | After launch | After scenario wait |
| ------ | -----------: | ------------------: |
| PID    |       25,223 |              25,223 |
| RSS    |   375,632 KB |          378,512 KB |

Artifact:

- Screenshot: [ios-svg-multi-line-shared-tooltip-scrub-performance.png](ios-svg-multi-line-shared-tooltip-scrub-performance.png)

Notes:

- This is iOS release-simulator evidence for one native performance matrix row.
- It captures launch command timing, process RSS, and a screenshot only.
- It does not replace Instruments frame timing, physical-device performance, synthetic gesture coverage, Skia parity, or manual visible-correctness review.

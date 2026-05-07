# Native QA Checklists

<!-- prettier-ignore-start -->

Generated from native and Skia evidence matrices last updated 2026-05-07. Regenerate with `npm run release:qa:checklists`. Capture a row screenshot with `npm run release:qa:capture -- --matrix runtime --row ios-line-charts --platform ios --output docs/release/artifacts/example.png`, then record row evidence with `npm run release:qa:record -- --matrix runtime --row ios-line-charts --status pass --evidence docs/release/artifacts/example.png --reviewed-by QA --device "iPhone 17 simulator / iOS 26.0" --build-surface "Release simulator build" --notes "Manual runtime checks passed"` or `--matrix skia` for Skia rows. Do not mark a row as `pass` without evidence links, review metadata, and notes in the source matrix.

## Matrix Summary

| Matrix | Rows | Pass | Partial | Pending | Blocked | Fail | Not Applicable |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Runtime QA | 16 | 0 | 16 | 0 | 0 | 0 | 0 |
| Accessibility QA | 16 | 0 | 16 | 0 | 0 | 0 | 0 |
| Native Performance | 18 | 0 | 18 | 0 | 0 | 0 | 0 |
| Skia Renderer | 8 | 8 | 0 | 0 | 0 | 0 | 0 |

## Runtime QA

Source: [docs/release/native-runtime-qa.md](native-runtime-qa.md) and [docs/release/evidence/native-runtime-matrix.json](evidence/native-runtime-matrix.json).

### Runtime Check Groups

### `global`

- [ ] page opens without red-screen warnings or console errors
- [ ] app-level menu, theme mode, and preset switching work after chart interactions
- [ ] tooltips render above chart content, legends, axes, labels, and overlays
- [ ] tooltips shift or flip instead of clipping against chart or screen edges
- [ ] chart labels do not trigger text selection on web, Expo web, or native-web surfaces
- [ ] theme switching does not leave stale colors in chart surfaces
- [ ] rotation or width changes keep charts inside parent bounds without clipped labels

### `line`

- [ ] tap selection can be enabled without scrub
- [ ] scrub selection updates continuously and does not flicker
- [ ] while-active scrub hides tooltip on release
- [ ] main-plot pan blocks vertical page scroll while dragging
- [ ] pinch zoom does not fight vertical page scroll or leave invalid viewport
- [ ] range selector drag and thumb resize block vertical page scroll while active
- [ ] multi-series selection keeps marker, tooltip, legend, and external consumers in sync
- [ ] outside tap dismisses only within the configured provider scope

### `bar`

- [ ] tap selection animates without moving bar layout
- [ ] scrollable bars preserve bottom labels and selected hit targets
- [ ] scrollable selectable bars drag horizontally without vertical scroll conflicts
- [ ] first and last bar tooltips are not clipped by axes or labels
- [ ] gridlines stay behind inactive, dimmed, selected, and custom-rendered bars

### `combinedFinancial`

- [ ] shared tooltip values match selected x value across visible series
- [ ] legend toggles update visible series without stale tooltip content
- [ ] dual-axis values remain visually tied to the correct axis
- [ ] candlestick tap inspection selects the expected candle
- [ ] candlestick pan, pinch, and range selector keep candle, volume, and session-gap overlays aligned

### `radialHeatmap`

- [ ] slice, segment, ring, and heatmap cell selection returns the expected item
- [ ] long labels and legends do not cover selected slices or tooltips
- [ ] progress values and heatmap cells remain tappable at small widths
- [ ] empty, zero, and missing data states render without runtime errors

### `compat`

- [ ] legacy facade fixtures render without runtime errors
- [ ] legacy labels remain visible within chart bounds
- [ ] compatibility dark-mode fixtures follow app-level theme switching

### Runtime Rows

| Row | Target | Build Surface | Showcase Page | Deep Link | Check Groups | Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `ios-line-charts` | iOS / Line Charts | Expo showcase and iOS release build | `line-area` | chartkitshowcase://showcase?view=charts&page=line-area | `global`, `line` | partial | `docs/release/artifacts/ios-runtime-smoke.png`, `docs/release/artifacts/ios-line-charts.png`, `docs/release/artifacts/ios-line-charts.log` |
| `ios-bar-charts` | iOS / Bar Charts | Expo showcase and iOS release build | `bar` | chartkitshowcase://showcase?view=charts&page=bar | `global`, `bar` | partial | `docs/release/artifacts/ios-runtime-bar-charts.png`, `docs/release/artifacts/ios-bar-charts.png`, `docs/release/artifacts/ios-bar-charts.log` |
| `ios-combined-preview` | iOS / Combined Preview | Expo showcase and iOS release build | `combined` | chartkitshowcase://showcase?view=charts&page=combined | `global`, `combinedFinancial` | partial | `docs/release/artifacts/ios-runtime-combined-preview.png`, `docs/release/artifacts/ios-combined-preview.png`, `docs/release/artifacts/ios-combined-preview.log` |
| `ios-financial-preview` | iOS / Financial Preview | Expo showcase and iOS release build | `financial` | chartkitshowcase://showcase?view=charts&page=financial | `global`, `combinedFinancial` | partial | `docs/release/artifacts/ios-runtime-financial-preview.png`, `docs/release/artifacts/ios-financial-preview.png`, `docs/release/artifacts/ios-financial-preview.log` |
| `ios-pie-donut` | iOS / Pie & Donut | Expo showcase and iOS release build | `pie-donut` | chartkitshowcase://showcase?view=charts&page=pie-donut | `global`, `radialHeatmap` | partial | `docs/release/artifacts/ios-runtime-pie-donut.png`, `docs/release/artifacts/ios-pie-donut.png`, `docs/release/artifacts/ios-pie-donut.log` |
| `ios-progress` | iOS / Progress | Expo showcase and iOS release build | `progress` | chartkitshowcase://showcase?view=charts&page=progress | `global`, `radialHeatmap` | partial | `docs/release/artifacts/ios-runtime-progress.png`, `docs/release/artifacts/ios-progress.png`, `docs/release/artifacts/ios-progress.log` |
| `ios-heatmaps` | iOS / Heatmaps | Expo showcase and iOS release build | `heatmaps` | chartkitshowcase://showcase?view=charts&page=heatmaps | `global`, `radialHeatmap` | partial | `docs/release/artifacts/ios-runtime-heatmaps.png`, `docs/release/artifacts/ios-heatmaps.png`, `docs/release/artifacts/ios-heatmaps.log` |
| `ios-compatibility` | iOS / Compatibility | Expo showcase and iOS release build | `compat` | chartkitshowcase://showcase?view=charts&page=compat | `global`, `compat` | partial | `docs/release/artifacts/ios-runtime-compatibility.png`, `docs/release/artifacts/ios-compatibility.png`, `docs/release/artifacts/ios-compatibility.log` |
| `android-line-charts` | Android / Line Charts | Expo showcase and Android release build | `line-area` | chartkitshowcase://showcase?view=charts&page=line-area | `global`, `line` | partial | `docs/release/artifacts/android-runtime-smoke.png`, `docs/release/artifacts/android-line-charts.png`, `docs/release/artifacts/android-line-charts.log` |
| `android-bar-charts` | Android / Bar Charts | Expo showcase and Android release build | `bar` | chartkitshowcase://showcase?view=charts&page=bar | `global`, `bar` | partial | `docs/release/artifacts/android-runtime-bar-charts.png`, `docs/release/artifacts/android-bar-charts.png`, `docs/release/artifacts/android-bar-charts.log` |
| `android-combined-preview` | Android / Combined Preview | Expo showcase and Android release build | `combined` | chartkitshowcase://showcase?view=charts&page=combined | `global`, `combinedFinancial` | partial | `docs/release/artifacts/android-runtime-combined-preview.png`, `docs/release/artifacts/android-combined-preview.png`, `docs/release/artifacts/android-combined-preview.log` |
| `android-financial-preview` | Android / Financial Preview | Expo showcase and Android release build | `financial` | chartkitshowcase://showcase?view=charts&page=financial | `global`, `combinedFinancial` | partial | `docs/release/artifacts/android-runtime-financial-preview.png`, `docs/release/artifacts/android-financial-preview.png`, `docs/release/artifacts/android-financial-preview.log` |
| `android-pie-donut` | Android / Pie & Donut | Expo showcase and Android release build | `pie-donut` | chartkitshowcase://showcase?view=charts&page=pie-donut | `global`, `radialHeatmap` | partial | `docs/release/artifacts/android-runtime-pie-donut.png`, `docs/release/artifacts/android-pie-donut.png`, `docs/release/artifacts/android-pie-donut.log` |
| `android-progress` | Android / Progress | Expo showcase and Android release build | `progress` | chartkitshowcase://showcase?view=charts&page=progress | `global`, `radialHeatmap` | partial | `docs/release/artifacts/android-runtime-progress.png`, `docs/release/artifacts/android-progress.png`, `docs/release/artifacts/android-progress.log` |
| `android-heatmaps` | Android / Heatmaps | Expo showcase and Android release build | `heatmaps` | chartkitshowcase://showcase?view=charts&page=heatmaps | `global`, `radialHeatmap` | partial | `docs/release/artifacts/android-runtime-heatmaps.png`, `docs/release/artifacts/android-heatmaps.png`, `docs/release/artifacts/android-heatmaps.log` |
| `android-compatibility` | Android / Compatibility | Expo showcase and Android release build | `compat` | chartkitshowcase://showcase?view=charts&page=compat | `global`, `compat` | partial | `docs/release/artifacts/android-runtime-compatibility.png`, `docs/release/artifacts/android-compatibility.png`, `docs/release/artifacts/android-compatibility.log` |

## Accessibility QA

Source: [docs/release/accessibility-qa.md](accessibility-qa.md) and [docs/release/evidence/native-accessibility-matrix.json](evidence/native-accessibility-matrix.json).

### Accessibility Check Groups

### `global`

- [ ] chart is reachable by screen-reader swipe navigation
- [ ] focused chart announces a concise summary instead of raw SVG internals
- [ ] summary names chart type and key data insight
- [ ] selection, tooltip, range selector, and legend controls do not trap screen-reader focus
- [ ] visually selected value is also available through summary, table fallback, or app text
- [ ] menu controls, legend toggles, and story controls are reachable and named
- [ ] theme switching preserves text, tooltip, and control contrast
- [ ] decorative gridlines, markers, and session-gap bands are not announced separately

### `tableFallback`

- [ ] details control announces expanded or collapsed state where used
- [ ] rows read in a stable order
- [ ] null or missing values are announced as no value or equivalent app copy
- [ ] dual-axis values are not compared as if they shared units

### Accessibility Rows

| Row | Target | Build Surface | Showcase Page | Deep Link | Check Groups | Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `ios-voiceover-line-charts` | iOS VoiceOver / Line Charts | Expo showcase or iOS release app | `line-area` | chartkitshowcase://showcase?view=charts&page=line-area | `global`, `tableFallback` | partial | `docs/release/artifacts/accessibility-local-baseline-2026-05-06.md`, `docs/release/artifacts/ios-voiceover-line-charts.png`, `docs/release/artifacts/ios-voiceover-line-charts.log` |
| `ios-voiceover-bar-charts` | iOS VoiceOver / Bar Charts | Expo showcase or iOS release app | `bar` | chartkitshowcase://showcase?view=charts&page=bar | `global`, `tableFallback` | partial | `docs/release/artifacts/accessibility-local-baseline-2026-05-06.md`, `docs/release/artifacts/ios-voiceover-bar-charts.png`, `docs/release/artifacts/ios-voiceover-bar-charts.log` |
| `ios-voiceover-combined-preview` | iOS VoiceOver / Combined Preview | Expo showcase or iOS release app | `combined` | chartkitshowcase://showcase?view=charts&page=combined | `global`, `tableFallback` | partial | `docs/release/artifacts/accessibility-local-baseline-2026-05-06.md`, `docs/release/artifacts/ios-voiceover-combined-preview.png`, `docs/release/artifacts/ios-voiceover-combined-preview.log` |
| `ios-voiceover-financial-preview` | iOS VoiceOver / Financial Preview | Expo showcase or iOS release app | `financial` | chartkitshowcase://showcase?view=charts&page=financial | `global`, `tableFallback` | partial | `docs/release/artifacts/accessibility-local-baseline-2026-05-06.md`, `docs/release/artifacts/ios-voiceover-financial-preview.png`, `docs/release/artifacts/ios-voiceover-financial-preview.log` |
| `ios-voiceover-pie-donut` | iOS VoiceOver / Pie & Donut | Expo showcase or iOS release app | `pie-donut` | chartkitshowcase://showcase?view=charts&page=pie-donut | `global`, `tableFallback` | partial | `docs/release/artifacts/accessibility-local-baseline-2026-05-06.md`, `docs/release/artifacts/ios-voiceover-pie-donut.png`, `docs/release/artifacts/ios-voiceover-pie-donut.log` |
| `ios-voiceover-progress` | iOS VoiceOver / Progress | Expo showcase or iOS release app | `progress` | chartkitshowcase://showcase?view=charts&page=progress | `global`, `tableFallback` | partial | `docs/release/artifacts/accessibility-local-baseline-2026-05-06.md`, `docs/release/artifacts/ios-voiceover-progress.png`, `docs/release/artifacts/ios-voiceover-progress.log` |
| `ios-voiceover-heatmaps` | iOS VoiceOver / Heatmaps | Expo showcase or iOS release app | `heatmaps` | chartkitshowcase://showcase?view=charts&page=heatmaps | `global`, `tableFallback` | partial | `docs/release/artifacts/accessibility-local-baseline-2026-05-06.md`, `docs/release/artifacts/ios-voiceover-heatmaps.png`, `docs/release/artifacts/ios-voiceover-heatmaps.log` |
| `ios-voiceover-compatibility` | iOS VoiceOver / Compatibility | Expo showcase or iOS release app | `compat` | chartkitshowcase://showcase?view=charts&page=compat | `global` | partial | `docs/release/artifacts/accessibility-local-baseline-2026-05-06.md`, `docs/release/artifacts/ios-voiceover-compatibility.png`, `docs/release/artifacts/ios-voiceover-compatibility.log` |
| `android-talkback-line-charts` | Android TalkBack / Line Charts | Expo showcase or Android release app | `line-area` | chartkitshowcase://showcase?view=charts&page=line-area | `global`, `tableFallback` | partial | `docs/release/artifacts/accessibility-local-baseline-2026-05-06.md`, `docs/release/artifacts/android-talkback-line-charts.png`, `docs/release/artifacts/android-talkback-line-charts.log`, `docs/release/artifacts/android-talkback-line-charts.xml` |
| `android-talkback-bar-charts` | Android TalkBack / Bar Charts | Expo showcase or Android release app | `bar` | chartkitshowcase://showcase?view=charts&page=bar | `global`, `tableFallback` | partial | `docs/release/artifacts/accessibility-local-baseline-2026-05-06.md`, `docs/release/artifacts/android-talkback-bar-charts.png`, `docs/release/artifacts/android-talkback-bar-charts.log`, `docs/release/artifacts/android-talkback-bar-charts.xml` |
| `android-talkback-combined-preview` | Android TalkBack / Combined Preview | Expo showcase or Android release app | `combined` | chartkitshowcase://showcase?view=charts&page=combined | `global`, `tableFallback` | partial | `docs/release/artifacts/accessibility-local-baseline-2026-05-06.md`, `docs/release/artifacts/android-talkback-combined-preview.png`, `docs/release/artifacts/android-talkback-combined-preview.log`, `docs/release/artifacts/android-talkback-combined-preview.xml` |
| `android-talkback-financial-preview` | Android TalkBack / Financial Preview | Expo showcase or Android release app | `financial` | chartkitshowcase://showcase?view=charts&page=financial | `global`, `tableFallback` | partial | `docs/release/artifacts/accessibility-local-baseline-2026-05-06.md`, `docs/release/artifacts/android-talkback-financial-preview.png`, `docs/release/artifacts/android-talkback-financial-preview.log`, `docs/release/artifacts/android-talkback-financial-preview.xml` |
| `android-talkback-pie-donut` | Android TalkBack / Pie & Donut | Expo showcase or Android release app | `pie-donut` | chartkitshowcase://showcase?view=charts&page=pie-donut | `global`, `tableFallback` | partial | `docs/release/artifacts/accessibility-local-baseline-2026-05-06.md`, `docs/release/artifacts/android-talkback-pie-donut.png`, `docs/release/artifacts/android-talkback-pie-donut.log`, `docs/release/artifacts/android-talkback-pie-donut.xml` |
| `android-talkback-progress` | Android TalkBack / Progress | Expo showcase or Android release app | `progress` | chartkitshowcase://showcase?view=charts&page=progress | `global`, `tableFallback` | partial | `docs/release/artifacts/accessibility-local-baseline-2026-05-06.md`, `docs/release/artifacts/android-talkback-progress.png`, `docs/release/artifacts/android-talkback-progress.log`, `docs/release/artifacts/android-talkback-progress.xml` |
| `android-talkback-heatmaps` | Android TalkBack / Heatmaps | Expo showcase or Android release app | `heatmaps` | chartkitshowcase://showcase?view=charts&page=heatmaps | `global`, `tableFallback` | partial | `docs/release/artifacts/accessibility-local-baseline-2026-05-06.md`, `docs/release/artifacts/android-talkback-heatmaps.png`, `docs/release/artifacts/android-talkback-heatmaps.log`, `docs/release/artifacts/android-talkback-heatmaps.xml` |
| `android-talkback-compatibility` | Android TalkBack / Compatibility | Expo showcase or Android release app | `compat` | chartkitshowcase://showcase?view=charts&page=compat | `global` | partial | `docs/release/artifacts/accessibility-local-baseline-2026-05-06.md`, `docs/release/artifacts/android-talkback-compatibility.png`, `docs/release/artifacts/android-talkback-compatibility.log`, `docs/release/artifacts/android-talkback-compatibility.xml` |

## Native Performance

Source: [docs/release/native-performance-benchmark.md](native-performance-benchmark.md) and [docs/release/evidence/native-performance-matrix.json](evidence/native-performance-matrix.json).

### Metrics To Capture

- [ ] commit SHA
- [ ] package version
- [ ] platform, OS, device, and simulator/emulator/physical flag
- [ ] build type
- [ ] renderer
- [ ] chart type and scenario
- [ ] total, visible, rendered points, and series count
- [ ] initial render time
- [ ] median frame time during interaction
- [ ] p95 frame time during interaction
- [ ] max frame time during interaction
- [ ] dropped frames or frames over 16.7 ms where available
- [ ] memory before and after scenario
- [ ] visible correctness notes for clipping, tooltip stacking, and gesture conflicts

### Performance Rows

| Row | Target | Scenario | Data Size | Expected Story Metrics | Interaction | Showcase Story | Deep Link | Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `ios-svg-small-line-initial-render` | iOS / svg | Small line initial render | 100 points | chart line; 100 total; 100 visible; 1 series | initial render | `v2-perf-line-100` | chartkitshowcase://showcase?story=v2-perf-line-100&visual=1 | partial | `docs/release/artifacts/ios-svg-small-line-initial-render-performance.md` |
| `ios-svg-standard-line-scrub` | iOS / svg | Standard line scrub | 1,000 points | chart line; 1,000 total; 1,000 visible; 1 series | initial render and scrub | `v2-perf-line-1000-scrub` | chartkitshowcase://showcase?story=v2-perf-line-1000-scrub&visual=1 | partial | `docs/release/artifacts/ios-svg-standard-line-scrub-performance.md` |
| `ios-svg-dense-line-decimated-overview` | iOS / svg | Dense line decimated overview | 10,000 total points | chart line; 10,000 total; 10,000 visible; 1 series | decimated overview | `v2-perf-line-10000-overview` | chartkitshowcase://showcase?story=v2-perf-line-10000-overview&visual=1 | partial | `docs/release/artifacts/ios-svg-dense-line-decimated-overview-performance.md` |
| `ios-svg-multi-line-shared-tooltip-scrub` | iOS / svg | Multi-line shared tooltip scrub | 5 series x 1,000 points | chart line; 1,000 total; 1,000 visible; 5 series | shared tooltip scrub | `v2-perf-line-5x1000-tooltip` | chartkitshowcase://showcase?story=v2-perf-line-5x1000-tooltip&visual=1 | partial | `docs/release/artifacts/ios-svg-multi-line-shared-tooltip-scrub-performance.md` |
| `ios-svg-scrollable-line-one-finger-pan` | iOS / svg | Scrollable line one-finger pan | 10,000 total points, 2,000 shown | chart line; 10,000 total; 2,000 visible; 1 series | one-finger pan | `v2-perf-line-10000-pan` | chartkitshowcase://showcase?story=v2-perf-line-10000-pan&visual=1 | partial | `docs/release/artifacts/ios-svg-scrollable-line-one-finger-pan-performance.md` |
| `ios-svg-range-selector-drag-and-thumb-resize` | iOS / svg | Range selector drag and thumb resize | 2 series x 10,000 points | chart line; 10,000 total; 1,500 visible; 2 series | drag and thumb resize | `v2-perf-range-2x10000` | chartkitshowcase://showcase?story=v2-perf-range-2x10000&visual=1 | partial | `docs/release/artifacts/ios-svg-range-selector-drag-and-thumb-resize-performance.md` |
| `ios-svg-scrollable-bar-horizontal-scroll-and-selection` | iOS / svg | Scrollable bar horizontal scroll and selection | 500 bars | chart bar; 500 total; 24 visible; 1 series | horizontal scroll and selection | `v2-perf-bar-500-selection` | chartkitshowcase://showcase?story=v2-perf-bar-500-selection&visual=1 | partial | `docs/release/artifacts/ios-svg-scrollable-bar-horizontal-scroll-and-selection-performance.md` |
| `ios-svg-combined-chart-shared-tooltip-and-legend` | iOS / svg | Combined chart shared tooltip and legend | bars plus line | chart combined; 36 total; 36 visible; 2 series | shared tooltip and legend | `v2-perf-combined-tooltip` | chartkitshowcase://showcase?story=v2-perf-combined-tooltip&visual=1 | partial | `docs/release/artifacts/ios-svg-combined-chart-shared-tooltip-and-legend-performance.md` |
| `ios-svg-candlestick-pan-pinch-and-tap-inspection` | iOS / svg | Candlestick pan, pinch, and tap inspection | 1,000 candles | chart candlestick; 1,000 total; 80 visible; 1 series | pan, pinch, tap inspection | `v2-perf-candlestick-1000` | chartkitshowcase://showcase?story=v2-perf-candlestick-1000&visual=1 | partial | `docs/release/artifacts/ios-svg-candlestick-pan-pinch-and-tap-inspection-performance.md` |
| `android-svg-small-line-initial-render` | Android / svg | Small line initial render | 100 points | chart line; 100 total; 100 visible; 1 series | initial render | `v2-perf-line-100` | chartkitshowcase://showcase?story=v2-perf-line-100&visual=1 | partial | `docs/release/artifacts/android-svg-small-line-initial-render-performance.md` |
| `android-svg-standard-line-scrub` | Android / svg | Standard line scrub | 1,000 points | chart line; 1,000 total; 1,000 visible; 1 series | initial render and scrub | `v2-perf-line-1000-scrub` | chartkitshowcase://showcase?story=v2-perf-line-1000-scrub&visual=1 | partial | `docs/release/artifacts/android-svg-standard-line-scrub-performance.md` |
| `android-svg-dense-line-decimated-overview` | Android / svg | Dense line decimated overview | 10,000 total points | chart line; 10,000 total; 10,000 visible; 1 series | decimated overview | `v2-perf-line-10000-overview` | chartkitshowcase://showcase?story=v2-perf-line-10000-overview&visual=1 | partial | `docs/release/artifacts/android-svg-dense-line-decimated-overview-performance.md` |
| `android-svg-multi-line-shared-tooltip-scrub` | Android / svg | Multi-line shared tooltip scrub | 5 series x 1,000 points | chart line; 1,000 total; 1,000 visible; 5 series | shared tooltip scrub | `v2-perf-line-5x1000-tooltip` | chartkitshowcase://showcase?story=v2-perf-line-5x1000-tooltip&visual=1 | partial | `docs/release/artifacts/android-svg-multi-line-shared-tooltip-scrub-performance.md` |
| `android-svg-scrollable-line-one-finger-pan` | Android / svg | Scrollable line one-finger pan | 10,000 total points, 2,000 shown | chart line; 10,000 total; 2,000 visible; 1 series | one-finger pan | `v2-perf-line-10000-pan` | chartkitshowcase://showcase?story=v2-perf-line-10000-pan&visual=1 | partial | `docs/release/artifacts/android-svg-scrollable-line-one-finger-pan-performance.md` |
| `android-svg-range-selector-drag-and-thumb-resize` | Android / svg | Range selector drag and thumb resize | 2 series x 10,000 points | chart line; 10,000 total; 1,500 visible; 2 series | drag and thumb resize | `v2-perf-range-2x10000` | chartkitshowcase://showcase?story=v2-perf-range-2x10000&visual=1 | partial | `docs/release/artifacts/android-svg-range-selector-drag-and-thumb-resize-performance.md` |
| `android-svg-scrollable-bar-horizontal-scroll-and-selection` | Android / svg | Scrollable bar horizontal scroll and selection | 500 bars | chart bar; 500 total; 24 visible; 1 series | horizontal scroll and selection | `v2-perf-bar-500-selection` | chartkitshowcase://showcase?story=v2-perf-bar-500-selection&visual=1 | partial | `docs/release/artifacts/android-svg-scrollable-bar-horizontal-scroll-and-selection-performance.md` |
| `android-svg-combined-chart-shared-tooltip-and-legend` | Android / svg | Combined chart shared tooltip and legend | bars plus line | chart combined; 36 total; 36 visible; 2 series | shared tooltip and legend | `v2-perf-combined-tooltip` | chartkitshowcase://showcase?story=v2-perf-combined-tooltip&visual=1 | partial | `docs/release/artifacts/android-svg-combined-chart-shared-tooltip-and-legend-performance.md` |
| `android-svg-candlestick-pan-pinch-and-tap-inspection` | Android / svg | Candlestick pan, pinch, and tap inspection | 1,000 candles | chart candlestick; 1,000 total; 80 visible; 1 series | pan, pinch, tap inspection | `v2-perf-candlestick-1000` | chartkitshowcase://showcase?story=v2-perf-candlestick-1000&visual=1 | partial | `docs/release/artifacts/android-svg-candlestick-pan-pinch-and-tap-inspection-performance.md` |

### Deferred Rows

- `skia`: blocked. Native Skia install and renderer parity evidence are not complete.

## Skia Renderer

Source: [docs/release/skia-renderer-qa.md](skia-renderer-qa.md) and [docs/release/evidence/skia-renderer-matrix.json](evidence/skia-renderer-matrix.json).

### Skia Rows

| Row | Target | Build Surface | Required Evidence | Showcase Targets | Deep Links | Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `ios-skia-native-install` | iOS / Native Skia install verification | Release build on device or accepted simulator with optional Skia renderer installed | Install optional Skia renderer dependencies, run native release build, and verify the SVG default path still works without static Skia imports. |  |  | pass | `docs/release/artifacts/ios-skia-native-install.md` |
| `android-skia-native-install` | Android / Native Skia install verification | Release APK on device or accepted emulator with optional Skia renderer installed | Install optional Skia renderer dependencies, run native release build, and verify the SVG default path still works without static Skia imports. |  |  | pass | `docs/release/artifacts/android-skia-native-install.md` |
| `ios-skia-free-chart-parity` | iOS / Free chart renderer parity | Release build on device or accepted simulator with optional Skia renderer installed | Line, Area, Bar, StackedBar, Pie, Donut, Progress, and Contribution surfaces render with injected Skia primitives without missing text, gradients, clipping, tooltips, or legends. | Line and Area, Bar and StackedBar, Pie and Donut, Progress, Contribution, Compatibility | chartkitshowcase://showcase?view=charts&page=line-area, chartkitshowcase://showcase?view=charts&page=bar, chartkitshowcase://showcase?view=charts&page=pie-donut, chartkitshowcase://showcase?view=charts&page=progress, chartkitshowcase://showcase?view=charts&page=heatmaps, chartkitshowcase://showcase?view=charts&page=compat | pass | `docs/release/artifacts/ios-skia-renderer-build.md`, `docs/release/artifacts/ios-skia-free-chart-parity-review.md`, `docs/release/artifacts/ios-skia-free-chart-parity-1-line-and-area.png`, `docs/release/artifacts/ios-skia-free-chart-parity-1-line-and-area.log`, `docs/release/artifacts/ios-skia-free-chart-parity-2-bar-and-stackedbar.png`, `docs/release/artifacts/ios-skia-free-chart-parity-2-bar-and-stackedbar.log`, `docs/release/artifacts/ios-skia-free-chart-parity-3-pie-and-donut.png`, `docs/release/artifacts/ios-skia-free-chart-parity-3-pie-and-donut.log`, `docs/release/artifacts/ios-skia-free-chart-parity-4-progress.png`, `docs/release/artifacts/ios-skia-free-chart-parity-4-progress.log`, `docs/release/artifacts/ios-skia-free-chart-parity-5-contribution.png`, `docs/release/artifacts/ios-skia-free-chart-parity-5-contribution.log`, `docs/release/artifacts/ios-skia-free-chart-parity-6-compatibility.png`, `docs/release/artifacts/ios-skia-free-chart-parity-6-compatibility.log`, `docs/release/artifacts/ios-skia-free-chart-parity-7-compat-bar-basic.png`, `docs/release/artifacts/ios-skia-free-chart-parity-7-compat-bar-basic.log`, `docs/release/artifacts/ios-skia-free-chart-parity-8-line-tooltip.png`, `docs/release/artifacts/ios-skia-free-chart-parity-8-line-tooltip.log`, `docs/release/artifacts/ios-skia-free-chart-parity-9-bar-tooltip.png`, `docs/release/artifacts/ios-skia-free-chart-parity-9-bar-tooltip.log` |
| `android-skia-free-chart-parity` | Android / Free chart renderer parity | Release APK on device or accepted emulator with optional Skia renderer installed | Line, Area, Bar, StackedBar, Pie, Donut, Progress, and Contribution surfaces render with injected Skia primitives without missing text, gradients, clipping, tooltips, or legends. | Line and Area, Bar and StackedBar, Pie and Donut, Progress, Contribution, Compatibility | chartkitshowcase://showcase?view=charts&page=line-area, chartkitshowcase://showcase?view=charts&page=bar, chartkitshowcase://showcase?view=charts&page=pie-donut, chartkitshowcase://showcase?view=charts&page=progress, chartkitshowcase://showcase?view=charts&page=heatmaps, chartkitshowcase://showcase?view=charts&page=compat | pass | `docs/release/artifacts/android-skia-renderer-build.md`, `docs/release/artifacts/android-skia-free-chart-parity-review.md`, `docs/release/artifacts/android-skia-free-chart-parity-1-line-and-area.png`, `docs/release/artifacts/android-skia-free-chart-parity-1-line-and-area.log`, `docs/release/artifacts/android-skia-free-chart-parity-2-bar-and-stackedbar.png`, `docs/release/artifacts/android-skia-free-chart-parity-2-bar-and-stackedbar.log`, `docs/release/artifacts/android-skia-free-chart-parity-3-pie-and-donut.png`, `docs/release/artifacts/android-skia-free-chart-parity-3-pie-and-donut.log`, `docs/release/artifacts/android-skia-free-chart-parity-4-progress.png`, `docs/release/artifacts/android-skia-free-chart-parity-4-progress.log`, `docs/release/artifacts/android-skia-free-chart-parity-5-contribution.png`, `docs/release/artifacts/android-skia-free-chart-parity-5-contribution.log`, `docs/release/artifacts/android-skia-free-chart-parity-6-compatibility.png`, `docs/release/artifacts/android-skia-free-chart-parity-6-compatibility.log`, `docs/release/artifacts/android-skia-free-chart-parity-7-compat-bar-basic.png`, `docs/release/artifacts/android-skia-free-chart-parity-7-compat-bar-basic.log`, `docs/release/artifacts/android-skia-free-chart-parity-8-line-tooltip.png`, `docs/release/artifacts/android-skia-free-chart-parity-8-line-tooltip.log`, `docs/release/artifacts/android-skia-free-chart-parity-9-bar-tooltip.png`, `docs/release/artifacts/android-skia-free-chart-parity-9-bar-tooltip.log` |
| `ios-skia-pro-preview-parity` | iOS / Pro preview renderer parity | Release build on device or accepted simulator with optional Skia renderer installed | Combined, Candlestick, range selector, sticky axis, crosshair, tooltip, and debug-layout preview surfaces render correctly with injected Skia primitives. | Combined, Candlestick, Range Selector, Crosshair, Debug Layout | chartkitshowcase://showcase?view=charts&page=combined, chartkitshowcase://showcase?view=charts&page=financial, chartkitshowcase://showcase?story=v2-range-selector&visual=1, chartkitshowcase://showcase?story=v2-custom-crosshair&visual=1, chartkitshowcase://showcase?story=v2-debug-layout&visual=1 | pass | `docs/release/artifacts/ios-skia-renderer-build.md`, `docs/release/artifacts/ios-skia-pro-preview-parity-review.md`, `docs/release/artifacts/ios-skia-pro-preview-parity-1-combined.png`, `docs/release/artifacts/ios-skia-pro-preview-parity-1-combined.log`, `docs/release/artifacts/ios-skia-pro-preview-parity-2-candlestick.png`, `docs/release/artifacts/ios-skia-pro-preview-parity-2-candlestick.log`, `docs/release/artifacts/ios-skia-pro-preview-parity-3-range-selector.png`, `docs/release/artifacts/ios-skia-pro-preview-parity-3-range-selector.log`, `docs/release/artifacts/ios-skia-pro-preview-parity-4-crosshair.png`, `docs/release/artifacts/ios-skia-pro-preview-parity-4-crosshair.log`, `docs/release/artifacts/ios-skia-pro-preview-parity-5-debug-layout.png`, `docs/release/artifacts/ios-skia-pro-preview-parity-5-debug-layout.log` |
| `android-skia-pro-preview-parity` | Android / Pro preview renderer parity | Release APK on device or accepted emulator with optional Skia renderer installed | Combined, Candlestick, range selector, sticky axis, crosshair, tooltip, and debug-layout preview surfaces render correctly with injected Skia primitives. | Combined, Candlestick, Range Selector, Crosshair, Debug Layout | chartkitshowcase://showcase?view=charts&page=combined, chartkitshowcase://showcase?view=charts&page=financial, chartkitshowcase://showcase?story=v2-range-selector&visual=1, chartkitshowcase://showcase?story=v2-custom-crosshair&visual=1, chartkitshowcase://showcase?story=v2-debug-layout&visual=1 | pass | `docs/release/artifacts/android-skia-renderer-build.md`, `docs/release/artifacts/android-skia-pro-preview-parity-review.md`, `docs/release/artifacts/android-skia-pro-preview-parity-1-combined.png`, `docs/release/artifacts/android-skia-pro-preview-parity-1-combined.log`, `docs/release/artifacts/android-skia-pro-preview-parity-2-candlestick.png`, `docs/release/artifacts/android-skia-pro-preview-parity-2-candlestick.log`, `docs/release/artifacts/android-skia-pro-preview-parity-3-range-selector.png`, `docs/release/artifacts/android-skia-pro-preview-parity-3-range-selector.log`, `docs/release/artifacts/android-skia-pro-preview-parity-4-crosshair.png`, `docs/release/artifacts/android-skia-pro-preview-parity-4-crosshair.log`, `docs/release/artifacts/android-skia-pro-preview-parity-5-debug-layout.png`, `docs/release/artifacts/android-skia-pro-preview-parity-5-debug-layout.log` |
| `ios-skia-performance-comparison` | iOS / Skia performance comparison | Release build on device or accepted simulator with optional Skia renderer installed | Compare SVG and Skia native release-build timing and memory on dense line, multi-line scrub, range selector, scrollable bar, combined, and candlestick scenarios. | Dense Line, Multi-line Scrub, Range Selector, Scrollable Bar, Combined Tooltip, Candlestick | chartkitshowcase://showcase?story=v2-perf-line-10000-overview&visual=1, chartkitshowcase://showcase?story=v2-perf-line-5x1000-tooltip&visual=1, chartkitshowcase://showcase?story=v2-perf-range-2x10000&visual=1, chartkitshowcase://showcase?story=v2-perf-bar-500-selection&visual=1, chartkitshowcase://showcase?story=v2-perf-combined-tooltip&visual=1, chartkitshowcase://showcase?story=v2-perf-candlestick-1000&visual=1 | pass | `docs/release/artifacts/ios-skia-renderer-build.md`, `docs/release/artifacts/ios-skia-performance-comparison-review.md`, `docs/release/artifacts/ios-skia-performance-1-dense-line.png`, `docs/release/artifacts/ios-skia-performance-1-dense-line.log`, `docs/release/artifacts/ios-skia-performance-2-multi-line-tooltip.png`, `docs/release/artifacts/ios-skia-performance-2-multi-line-tooltip.log`, `docs/release/artifacts/ios-skia-performance-3-range-selector.png`, `docs/release/artifacts/ios-skia-performance-3-range-selector.log`, `docs/release/artifacts/ios-skia-performance-4-scrollable-bar.png`, `docs/release/artifacts/ios-skia-performance-4-scrollable-bar.log`, `docs/release/artifacts/ios-skia-performance-5-combined-tooltip.png`, `docs/release/artifacts/ios-skia-performance-5-combined-tooltip.log`, `docs/release/artifacts/ios-skia-performance-6-candlestick.png`, `docs/release/artifacts/ios-skia-performance-6-candlestick.log`, `docs/release/artifacts/ios-skia-performance-comparison-metric-1-dense-line.md`, `docs/release/artifacts/ios-skia-performance-comparison-metric-1-dense-line.png`, `docs/release/artifacts/ios-skia-performance-comparison-metric-2-multi-line-scrub.md`, `docs/release/artifacts/ios-skia-performance-comparison-metric-2-multi-line-scrub.png`, `docs/release/artifacts/ios-skia-performance-comparison-metric-3-range-selector.md`, `docs/release/artifacts/ios-skia-performance-comparison-metric-3-range-selector.png`, `docs/release/artifacts/ios-skia-performance-comparison-metric-4-scrollable-bar.md`, `docs/release/artifacts/ios-skia-performance-comparison-metric-4-scrollable-bar.png`, `docs/release/artifacts/ios-skia-performance-comparison-metric-5-combined-tooltip.md`, `docs/release/artifacts/ios-skia-performance-comparison-metric-5-combined-tooltip.png`, `docs/release/artifacts/ios-skia-performance-comparison-metric-6-candlestick.md`, `docs/release/artifacts/ios-skia-performance-comparison-metric-6-candlestick.png` |
| `android-skia-performance-comparison` | Android / Skia performance comparison | Release APK on device or accepted emulator with optional Skia renderer installed | Compare SVG and Skia native release-build timing and memory on dense line, multi-line scrub, range selector, scrollable bar, combined, and candlestick scenarios. | Dense Line, Multi-line Scrub, Range Selector, Scrollable Bar, Combined Tooltip, Candlestick | chartkitshowcase://showcase?story=v2-perf-line-10000-overview&visual=1, chartkitshowcase://showcase?story=v2-perf-line-5x1000-tooltip&visual=1, chartkitshowcase://showcase?story=v2-perf-range-2x10000&visual=1, chartkitshowcase://showcase?story=v2-perf-bar-500-selection&visual=1, chartkitshowcase://showcase?story=v2-perf-combined-tooltip&visual=1, chartkitshowcase://showcase?story=v2-perf-candlestick-1000&visual=1 | pass | `docs/release/artifacts/android-skia-renderer-build.md`, `docs/release/artifacts/android-skia-performance-comparison-review.md`, `docs/release/artifacts/android-skia-performance-comparison-1-dense-line.png`, `docs/release/artifacts/android-skia-performance-comparison-1-dense-line.log`, `docs/release/artifacts/android-skia-performance-comparison-2-multi-line-scrub.png`, `docs/release/artifacts/android-skia-performance-comparison-2-multi-line-scrub.log`, `docs/release/artifacts/android-skia-performance-comparison-3-range-selector.png`, `docs/release/artifacts/android-skia-performance-comparison-3-range-selector.log`, `docs/release/artifacts/android-skia-performance-comparison-4-scrollable-bar.png`, `docs/release/artifacts/android-skia-performance-comparison-4-scrollable-bar.log`, `docs/release/artifacts/android-skia-performance-comparison-5-combined-tooltip.png`, `docs/release/artifacts/android-skia-performance-comparison-5-combined-tooltip.log`, `docs/release/artifacts/android-skia-performance-comparison-6-candlestick.png`, `docs/release/artifacts/android-skia-performance-comparison-6-candlestick.log`, `docs/release/artifacts/android-skia-performance-comparison-metric-1-dense-line.md`, `docs/release/artifacts/android-skia-performance-comparison-metric-1-dense-line.png`, `docs/release/artifacts/android-skia-performance-comparison-metric-2-multi-line-scrub.md`, `docs/release/artifacts/android-skia-performance-comparison-metric-2-multi-line-scrub.png`, `docs/release/artifacts/android-skia-performance-comparison-metric-3-range-selector.md`, `docs/release/artifacts/android-skia-performance-comparison-metric-3-range-selector.png`, `docs/release/artifacts/android-skia-performance-comparison-metric-4-scrollable-bar.md`, `docs/release/artifacts/android-skia-performance-comparison-metric-4-scrollable-bar.png`, `docs/release/artifacts/android-skia-performance-comparison-metric-5-combined-tooltip.md`, `docs/release/artifacts/android-skia-performance-comparison-metric-5-combined-tooltip.png`, `docs/release/artifacts/android-skia-performance-comparison-metric-6-candlestick.md`, `docs/release/artifacts/android-skia-performance-comparison-metric-6-candlestick.png` |

<!-- prettier-ignore-end -->

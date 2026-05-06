# Native QA Checklists

<!-- prettier-ignore-start -->

Generated from native and Skia evidence matrices last updated 2026-05-06. Regenerate with `npm run release:qa:checklists`. Record row evidence with `npm run release:qa:record -- --matrix runtime --row ios-line-charts --status pass --evidence docs/release/artifacts/example.md` or `--matrix skia` for Skia rows. Do not mark a row as `pass` without evidence links in the source matrix.

## Matrix Summary

| Matrix | Rows | Pass | Pending | Blocked | Fail | Not Applicable |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Runtime QA | 16 | 0 | 16 | 0 | 0 | 0 |
| Accessibility QA | 16 | 0 | 16 | 0 | 0 | 0 |
| Native Performance | 18 | 0 | 18 | 0 | 0 | 0 |
| Skia Renderer | 8 | 0 | 8 | 0 | 0 | 0 |

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

| Row | Target | Build Surface | Showcase Page | Check Groups | Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| `ios-line-charts` | iOS / Line Charts | Expo showcase and iOS release build | `line-area` | `global`, `line` | pending | None |
| `ios-bar-charts` | iOS / Bar Charts | Expo showcase and iOS release build | `bar` | `global`, `bar` | pending | None |
| `ios-combined-preview` | iOS / Combined Preview | Expo showcase and iOS release build | `combined` | `global`, `combinedFinancial` | pending | None |
| `ios-financial-preview` | iOS / Financial Preview | Expo showcase and iOS release build | `financial` | `global`, `combinedFinancial` | pending | None |
| `ios-pie-donut` | iOS / Pie & Donut | Expo showcase and iOS release build | `pie-donut` | `global`, `radialHeatmap` | pending | None |
| `ios-progress` | iOS / Progress | Expo showcase and iOS release build | `progress` | `global`, `radialHeatmap` | pending | None |
| `ios-heatmaps` | iOS / Heatmaps | Expo showcase and iOS release build | `heatmaps` | `global`, `radialHeatmap` | pending | None |
| `ios-compatibility` | iOS / Compatibility | Expo showcase and iOS release build | `compat` | `global`, `compat` | pending | None |
| `android-line-charts` | Android / Line Charts | Expo showcase and Android release build | `line-area` | `global`, `line` | pending | None |
| `android-bar-charts` | Android / Bar Charts | Expo showcase and Android release build | `bar` | `global`, `bar` | pending | None |
| `android-combined-preview` | Android / Combined Preview | Expo showcase and Android release build | `combined` | `global`, `combinedFinancial` | pending | None |
| `android-financial-preview` | Android / Financial Preview | Expo showcase and Android release build | `financial` | `global`, `combinedFinancial` | pending | None |
| `android-pie-donut` | Android / Pie & Donut | Expo showcase and Android release build | `pie-donut` | `global`, `radialHeatmap` | pending | None |
| `android-progress` | Android / Progress | Expo showcase and Android release build | `progress` | `global`, `radialHeatmap` | pending | None |
| `android-heatmaps` | Android / Heatmaps | Expo showcase and Android release build | `heatmaps` | `global`, `radialHeatmap` | pending | None |
| `android-compatibility` | Android / Compatibility | Expo showcase and Android release build | `compat` | `global`, `compat` | pending | None |

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

| Row | Target | Build Surface | Showcase Page | Check Groups | Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| `ios-voiceover-line-charts` | iOS VoiceOver / Line Charts | Expo showcase or iOS release app | `line-area` | `global`, `tableFallback` | pending | None |
| `ios-voiceover-bar-charts` | iOS VoiceOver / Bar Charts | Expo showcase or iOS release app | `bar` | `global`, `tableFallback` | pending | None |
| `ios-voiceover-combined-preview` | iOS VoiceOver / Combined Preview | Expo showcase or iOS release app | `combined` | `global`, `tableFallback` | pending | None |
| `ios-voiceover-financial-preview` | iOS VoiceOver / Financial Preview | Expo showcase or iOS release app | `financial` | `global`, `tableFallback` | pending | None |
| `ios-voiceover-pie-donut` | iOS VoiceOver / Pie & Donut | Expo showcase or iOS release app | `pie-donut` | `global`, `tableFallback` | pending | None |
| `ios-voiceover-progress` | iOS VoiceOver / Progress | Expo showcase or iOS release app | `progress` | `global`, `tableFallback` | pending | None |
| `ios-voiceover-heatmaps` | iOS VoiceOver / Heatmaps | Expo showcase or iOS release app | `heatmaps` | `global`, `tableFallback` | pending | None |
| `ios-voiceover-compatibility` | iOS VoiceOver / Compatibility | Expo showcase or iOS release app | `compat` | `global` | pending | None |
| `android-talkback-line-charts` | Android TalkBack / Line Charts | Expo showcase or Android release app | `line-area` | `global`, `tableFallback` | pending | None |
| `android-talkback-bar-charts` | Android TalkBack / Bar Charts | Expo showcase or Android release app | `bar` | `global`, `tableFallback` | pending | None |
| `android-talkback-combined-preview` | Android TalkBack / Combined Preview | Expo showcase or Android release app | `combined` | `global`, `tableFallback` | pending | None |
| `android-talkback-financial-preview` | Android TalkBack / Financial Preview | Expo showcase or Android release app | `financial` | `global`, `tableFallback` | pending | None |
| `android-talkback-pie-donut` | Android TalkBack / Pie & Donut | Expo showcase or Android release app | `pie-donut` | `global`, `tableFallback` | pending | None |
| `android-talkback-progress` | Android TalkBack / Progress | Expo showcase or Android release app | `progress` | `global`, `tableFallback` | pending | None |
| `android-talkback-heatmaps` | Android TalkBack / Heatmaps | Expo showcase or Android release app | `heatmaps` | `global`, `tableFallback` | pending | None |
| `android-talkback-compatibility` | Android TalkBack / Compatibility | Expo showcase or Android release app | `compat` | `global` | pending | None |

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

| Row | Target | Scenario | Data Size | Interaction | Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| `ios-svg-small-line-initial-render` | iOS / svg | Small line initial render | 100 points | initial render | pending | None |
| `ios-svg-standard-line-scrub` | iOS / svg | Standard line scrub | 1,000 points | initial render and scrub | pending | None |
| `ios-svg-dense-line-decimated-overview` | iOS / svg | Dense line decimated overview | 10,000 total points | decimated overview | pending | None |
| `ios-svg-multi-line-shared-tooltip-scrub` | iOS / svg | Multi-line shared tooltip scrub | 5 series x 1,000 points | shared tooltip scrub | pending | None |
| `ios-svg-scrollable-line-one-finger-pan` | iOS / svg | Scrollable line one-finger pan | 10,000 total points, 2,000 shown | one-finger pan | pending | None |
| `ios-svg-range-selector-drag-and-thumb-resize` | iOS / svg | Range selector drag and thumb resize | 2 series x 10,000 points | drag and thumb resize | pending | None |
| `ios-svg-scrollable-bar-horizontal-scroll-and-selection` | iOS / svg | Scrollable bar horizontal scroll and selection | 500 bars | horizontal scroll and selection | pending | None |
| `ios-svg-combined-chart-shared-tooltip-and-legend` | iOS / svg | Combined chart shared tooltip and legend | bars plus line | shared tooltip and legend | pending | None |
| `ios-svg-candlestick-pan-pinch-and-tap-inspection` | iOS / svg | Candlestick pan, pinch, and tap inspection | 1,000 candles | pan, pinch, tap inspection | pending | None |
| `android-svg-small-line-initial-render` | Android / svg | Small line initial render | 100 points | initial render | pending | None |
| `android-svg-standard-line-scrub` | Android / svg | Standard line scrub | 1,000 points | initial render and scrub | pending | None |
| `android-svg-dense-line-decimated-overview` | Android / svg | Dense line decimated overview | 10,000 total points | decimated overview | pending | None |
| `android-svg-multi-line-shared-tooltip-scrub` | Android / svg | Multi-line shared tooltip scrub | 5 series x 1,000 points | shared tooltip scrub | pending | None |
| `android-svg-scrollable-line-one-finger-pan` | Android / svg | Scrollable line one-finger pan | 10,000 total points, 2,000 shown | one-finger pan | pending | None |
| `android-svg-range-selector-drag-and-thumb-resize` | Android / svg | Range selector drag and thumb resize | 2 series x 10,000 points | drag and thumb resize | pending | None |
| `android-svg-scrollable-bar-horizontal-scroll-and-selection` | Android / svg | Scrollable bar horizontal scroll and selection | 500 bars | horizontal scroll and selection | pending | None |
| `android-svg-combined-chart-shared-tooltip-and-legend` | Android / svg | Combined chart shared tooltip and legend | bars plus line | shared tooltip and legend | pending | None |
| `android-svg-candlestick-pan-pinch-and-tap-inspection` | Android / svg | Candlestick pan, pinch, and tap inspection | 1,000 candles | pan, pinch, tap inspection | pending | None |

### Deferred Rows

- `skia`: blocked. Native Skia install and renderer parity evidence are not complete.

## Skia Renderer

Source: [docs/release/h4-pro-scope.md](h4-pro-scope.md) and [docs/release/evidence/skia-renderer-matrix.json](evidence/skia-renderer-matrix.json).

### Skia Rows

| Row | Target | Build Surface | Required Evidence | Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| `ios-skia-native-install` | iOS / Native Skia install verification | Release build on device or accepted simulator with optional Skia renderer installed | Install optional Skia renderer dependencies, run native release build, and verify the SVG default path still works without static Skia imports. | pending | None |
| `android-skia-native-install` | Android / Native Skia install verification | Release APK on device or accepted emulator with optional Skia renderer installed | Install optional Skia renderer dependencies, run native release build, and verify the SVG default path still works without static Skia imports. | pending | None |
| `ios-skia-free-chart-parity` | iOS / Free chart renderer parity | Release build on device or accepted simulator with optional Skia renderer installed | Line, Area, Bar, StackedBar, Pie, Donut, Progress, and Contribution surfaces render with injected Skia primitives without missing text, gradients, clipping, tooltips, or legends. | pending | None |
| `android-skia-free-chart-parity` | Android / Free chart renderer parity | Release APK on device or accepted emulator with optional Skia renderer installed | Line, Area, Bar, StackedBar, Pie, Donut, Progress, and Contribution surfaces render with injected Skia primitives without missing text, gradients, clipping, tooltips, or legends. | pending | None |
| `ios-skia-pro-preview-parity` | iOS / Pro preview renderer parity | Release build on device or accepted simulator with optional Skia renderer installed | Combined, Candlestick, range selector, sticky axis, crosshair, tooltip, and debug-layout preview surfaces render correctly with injected Skia primitives. | pending | None |
| `android-skia-pro-preview-parity` | Android / Pro preview renderer parity | Release APK on device or accepted emulator with optional Skia renderer installed | Combined, Candlestick, range selector, sticky axis, crosshair, tooltip, and debug-layout preview surfaces render correctly with injected Skia primitives. | pending | None |
| `ios-skia-performance-comparison` | iOS / Skia performance comparison | Release build on device or accepted simulator with optional Skia renderer installed | Compare SVG and Skia native release-build timing and memory on dense line, multi-line scrub, range selector, scrollable bar, combined, and candlestick scenarios. | pending | None |
| `android-skia-performance-comparison` | Android / Skia performance comparison | Release APK on device or accepted emulator with optional Skia renderer installed | Compare SVG and Skia native release-build timing and memory on dense line, multi-line scrub, range selector, scrollable bar, combined, and candlestick scenarios. | pending | None |

<!-- prettier-ignore-end -->

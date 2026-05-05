# Native Runtime QA Protocol

Status on May 5, 2026: protocol ready, native runtime evidence missing.

This protocol covers the manual iOS and Android runtime checks required before H5/H6 can claim native interaction confidence. Web Playwright tests, visual screenshots, and native release-build checks are useful, but they do not prove device gesture behavior, nested scrolling, text rendering, tooltip stacking, or release-mode runtime behavior.

## Automated Baseline

Run these before manual native QA:

```sh
npm run test:e2e
npm run test:visual
npm run native:release:dry-run
```

Current automated coverage:

- web showcase tap, scrub, tooltip, menu, and chart interaction flows
- visual regression screenshots for the current chart-story catalog
- native release command generation for Expo prebuild, Android release, CocoaPods, and iOS release

This baseline does not replace the manual device pass below.

## Device Matrix

Run the checks on:

| Platform | Required build surface                  | Preferred evidence                    |
| -------- | --------------------------------------- | ------------------------------------- |
| iOS      | Expo showcase and iOS release build     | device or simulator screen recording  |
| Android  | Expo showcase and Android release build | physical device or emulator recording |

Use:

```sh
npm run example:expo
npm run example:ios
npm run example:android
npm run native:release:ios
npm run native:release:android
```

If a local native toolchain is unavailable, record the missing toolchain and use the GitHub `Native Release Checks` workflow as the release-build evidence source. Do not count Expo Go alone as release-build evidence.

## Required Pages

Review these showcase pages:

- Line Charts
- Bar Charts
- Combined Charts
- Financial Charts
- Pie & Donut
- Progress
- Heatmaps
- Compatibility

## Required Interaction Checks

For each page, confirm:

- The page opens without red-screen warnings or console errors.
- App-level menu, theme mode, and preset switching still work after chart interactions.
- Tooltips render above chart content, legends, axes, labels, and decorative overlays.
- Tooltips shift or flip instead of clipping against chart or screen edges.
- Chart labels do not trigger text selection on web, Expo web, or native-web surfaces.
- Theme switching does not leave stale colors in chart lines, bars, fills, labels, tooltips, or mini charts.
- Device rotation or width changes keep the chart within its parent without clipped labels.

For Line Charts:

- Tap selection can be enabled without scrub.
- Scrub selection updates continuously and does not flicker.
- While-active scrub hides the tooltip on release.
- Main-plot pan blocks vertical page scroll while dragging.
- Pinch zoom does not fight vertical page scroll or leave the viewport in an invalid range.
- Range selector drag and thumb resize block vertical page scroll while active.
- Multi-series selection keeps marker, tooltip, legend, and external selection consumers in sync.
- Tapping outside a chart only dismisses selection in the configured provider scope.

For Bar Charts:

- Tap selection animates without moving the bar layout.
- Scrollable bars preserve bottom labels and keep selected bars hittable.
- Scrollable plus selectable bars can be dragged horizontally without triggering vertical page scroll.
- Tooltips for first and last bars are not clipped by axes or labels.
- Gridlines stay behind inactive, dimmed, selected, and custom-rendered bars.

For Combined and Financial Charts:

- Shared tooltip values match the selected x value across visible series.
- Legend toggles update visible series without stale tooltip content.
- Dual-axis values remain visually tied to the correct axis.
- Candlestick tap inspection selects the expected candle.
- Candlestick viewport pan, pinch, and range selector keep candle, volume, and session-gap overlays aligned.

For Pie, Donut, Progress, and Heatmaps:

- Slice or segment selection returns the expected item.
- Long labels and legends do not cover selected slices or tooltips.
- Progress values and heatmap cells remain tappable at small widths.
- Empty, zero, and missing data states render without runtime errors.

## Evidence Log Template

Before H5/H6, capture a completed log:

| Date | Commit | Platform | Device/OS | Build surface | Result  | Notes |
| ---- | ------ | -------- | --------- | ------------- | ------- | ----- |
| TBD  | TBD    | iOS      | TBD       | TBD           | Pending |       |
| TBD  | TBD    | Android  | TBD       | TBD           | Pending |       |

For any failure, file or link an issue with:

- chart page and story name
- platform and build surface
- exact gesture or control used
- expected behavior
- actual behavior
- screenshot or screen recording
- whether the issue reproduces on web visual/e2e tests

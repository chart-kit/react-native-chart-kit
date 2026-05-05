# Native Runtime QA Protocol

Status on May 5, 2026: protocol ready, partial iOS simulator smoke evidence captured; full native runtime evidence incomplete.

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

## Local Smoke Evidence

The Expo showcase was built and launched on the local iOS simulator as a release-configuration smoke check:

```sh
npm --workspace @chart-kit/expo-showcase exec expo -- run:ios --configuration Release --device A706C6A5-26A2-499F-B24A-A9FB574888B0 --no-bundler
```

Observed result:

- Expo prebuild completed.
- CocoaPods install completed.
- Xcode build completed with `Build Succeeded`.
- The `ChartKitShowcase.app` release simulator build installed on iPhone 17, iOS 26.0.
- The app launched to the Line Charts page without a red-screen error.
- The first line-chart content rendered with visible axes, labels, legend, line/area fills, and controls.

Artifact:

- [iOS runtime smoke screenshot](artifacts/ios-runtime-smoke.png)

This is useful launch/render evidence, but it is not a completed manual runtime QA pass. It does not cover all required pages, gestures, rotation, Android runtime behavior, or physical-device behavior.

Android local status:

- `adb devices -l` started the adb daemon successfully.
- No Android device or emulator was attached, so Android runtime QA evidence is still missing.

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

| Date        | Commit    | Platform | Device/OS                      | Build surface           | Result       | Notes                                                                                              |
| ----------- | --------- | -------- | ------------------------------ | ----------------------- | ------------ | -------------------------------------------------------------------------------------------------- |
| May 5, 2026 | `d54e599` | iOS      | iPhone 17 simulator / iOS 26.0 | Release simulator build | Partial pass | App launched and Line Charts rendered; screenshot captured. Full interaction matrix still pending. |
| May 5, 2026 | `d54e599` | Android  | No attached device/emulator    | N/A                     | Pending      | `adb devices -l` found no devices.                                                                 |

For any failure, file or link an issue with:

- chart page and story name
- platform and build surface
- exact gesture or control used
- expected behavior
- actual behavior
- screenshot or screen recording
- whether the issue reproduces on web visual/e2e tests

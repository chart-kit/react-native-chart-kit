# Native Runtime QA Protocol

Status on May 5, 2026: protocol ready, partial iOS and Android simulator/emulator smoke evidence captured; full native runtime evidence incomplete. Structured gate evidence lives in [native-runtime-qa.json](evidence/native-runtime-qa.json), with the page-by-page manual matrix in [native-runtime-matrix.json](evidence/native-runtime-matrix.json). Use the generated [native QA checklist](native-qa-checklists.md) for row-by-row execution.

This protocol covers the manual iOS and Android runtime checks required before production beta/RC can claim native interaction confidence. Web Playwright tests, visual screenshots, and native release-build checks are useful, but they do not prove device gesture behavior, nested scrolling, text rendering, tooltip stacking, or release-mode runtime behavior.

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

This is useful launch/render evidence, but it is not a completed manual runtime QA pass. It does not cover all required pages, gestures, rotation, or physical-device behavior.

The Android release APK was installed and launched on a local Android emulator as a release-build smoke check:

```sh
JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home sdkmanager --sdk_root=/opt/homebrew/share/android-commandlinetools --install emulator "system-images;android-36;google_apis;arm64-v8a"
ANDROID_HOME=/opt/homebrew/share/android-commandlinetools /opt/homebrew/share/android-commandlinetools/cmdline-tools/latest/bin/avdmanager create avd -n chartkit_api36 -k "system-images;android-36;google_apis;arm64-v8a" --device pixel_7 --force
ANDROID_HOME=/opt/homebrew/share/android-commandlinetools /opt/homebrew/share/android-commandlinetools/emulator/emulator -avd chartkit_api36 -no-window -no-audio -no-boot-anim -gpu swiftshader_indirect
ANDROID_HOME=/opt/homebrew/share/android-commandlinetools adb install -r apps/expo-showcase/android/app/build/outputs/apk/release/app-release.apk
ANDROID_HOME=/opt/homebrew/share/android-commandlinetools adb shell am start -n io.chartkit.showcase/.MainActivity
```

Observed result:

- Android emulator 36.5.11.0 booted `chartkit_api36` with Android 36 Google APIs ARM64.
- `adb install -r` installed the release APK successfully.
- `adb shell am start -n io.chartkit.showcase/.MainActivity` launched the showcase.
- The app launched to the Line Charts page without a red-screen error.
- The first line-chart content rendered with visible axes, labels, legend, line/area fills, and controls.
- Follow-up release-emulator smoke captures opened every required Android runtime page by deep link without a red-screen error.

Artifacts:

- [Android runtime smoke screenshot](artifacts/android-runtime-smoke.png)
- [Android Bar Charts screenshot](artifacts/android-runtime-bar-charts.png)
- [Android Combined Preview screenshot](artifacts/android-runtime-combined-preview.png)
- [Android Financial Preview screenshot](artifacts/android-runtime-financial-preview.png)
- [Android Pie & Donut screenshot](artifacts/android-runtime-pie-donut.png)
- [Android Progress screenshot](artifacts/android-runtime-progress.png)
- [Android Heatmaps screenshot](artifacts/android-runtime-heatmaps.png)
- [Android Compatibility screenshot](artifacts/android-runtime-compatibility.png)

This is useful release-build launch/render evidence, but it is not a completed Android runtime QA pass. It does not cover gestures, rotation, TalkBack, or physical-device behavior.

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

The native showcase also accepts deep-link query params for faster matrix execution:

```sh
xcrun simctl openurl booted "chartkitshowcase://showcase?page=bar-charts&theme=dark&preset=analytics"
adb shell am start -W -a android.intent.action.VIEW -d "chartkitshowcase://showcase?page=bar-charts&theme=dark&preset=analytics" io.chartkit.showcase
```

Supported params match the web preview URLs: `page`, `story`, `view`, `theme`, and `preset`. Use `story` to jump to a single visual fixture, or `page` to jump to a full public preview page such as `line-charts`, `bar-charts`, `combined-charts`, `financial-charts`, `pie-donut`, `progress`, or `heatmaps`.

On iOS, `simctl openurl` may show a first-use custom-scheme confirmation dialog. For headless release-simulator smoke capture, build the showcase with `EXPO_PUBLIC_CHARTKIT_SHOWCASE_QA_QUERY` instead of using a deep link:

```sh
EXPO_PUBLIC_CHARTKIT_SHOWCASE_QA_QUERY="view=charts&page=bar" \
  npm --workspace @chart-kit/expo-showcase exec expo -- \
  run:ios --configuration Release --device <simulator-uuid> --no-bundler
```

The value accepts the same query params as the deep-link and web URLs, including full values such as `chartkitshowcase://showcase?story=v2-range-selector&theme=dark&preset=analytics`. This is only a launch helper; row evidence still requires the manual checks and screenshots or recordings listed below.

For row-by-row screenshot evidence, use the capture helper after the release app is installed and launchable on a simulator, emulator, or attached device:

```sh
npm run release:qa:capture -- \
  --matrix runtime \
  --row ios-line-charts \
  --platform ios \
  --output docs/release/artifacts/ios-line-charts-runtime.png
```

Android accepts the same matrix row metadata:

```sh
npm run release:qa:capture -- \
  --matrix runtime \
  --row android-bar-charts \
  --platform android \
  --output docs/release/artifacts/android-bar-charts-runtime.png \
  --android-log-output docs/release/artifacts/android-bar-charts-runtime.log
```

Use `--device <simulator-udid-or-adb-serial>` for a specific target, `--dry-run` to print the native commands, and `--no-launch` when the row is already open and only the current screen should be captured. On Android, `--android-log-output <path>` clears logcat before launch and captures trailing logcat after the screenshot, so the row evidence can include both visual and runtime-log artifacts. After manual checks pass, attach the captured files to the structured matrix with `npm run release:qa:record -- --matrix runtime --row <row-id> --status pass --evidence <artifact> --evidence <log-artifact> --reviewed-by <name> --device "<device/os>" --build-surface "<build>" --notes "<checks passed>"`.

## Required Pages

Review these showcase pages:

- Line Charts
- Bar Charts
- Combined Preview
- Financial Preview
- Pie & Donut
- Progress
- Heatmaps
- Compatibility

The machine-readable matrix in [native-runtime-matrix.json](evidence/native-runtime-matrix.json) expands these pages across iOS and Android. Fill each row with `status: "pass"`, evidence links, review metadata, and notes only after the required global and page-specific checks below have passed on that platform.

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

For Combined Preview and Financial Preview:

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

Before production beta/RC, capture a completed log:

| Date        | Commit    | Platform | Device/OS                                     | Build surface           | Result       | Notes                                                                                                                                 |
| ----------- | --------- | -------- | --------------------------------------------- | ----------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| May 5, 2026 | `d54e599` | iOS      | iPhone 17 simulator / iOS 26.0                | Release simulator build | Partial pass | App launched and Line Charts rendered; screenshot captured. Full interaction matrix still pending.                                    |
| May 5, 2026 | `e0b46ae` | Android  | `chartkit_api36` emulator / Android 36, ARM64 | Release APK             | Partial pass | App launched from a freshly rebuilt release APK and Line Charts rendered; screenshot captured. Full interaction matrix still pending. |

For any failure, file or link an issue with:

- chart page and story name
- platform and build surface
- exact gesture or control used
- expected behavior
- actual behavior
- screenshot or screen recording
- whether the issue reproduces on web visual/e2e tests

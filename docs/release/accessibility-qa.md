# Accessibility QA Protocol

Status on May 6, 2026: protocol ready, local baseline recorded, and row-level iOS/Android support captures recorded. Native screen-reader review is still missing. Structured gate evidence lives in [native-accessibility-qa.json](evidence/native-accessibility-qa.json), with the page-by-page assistive-technology matrix in [native-accessibility-matrix.json](evidence/native-accessibility-matrix.json). Use the generated [native QA evidence backlog](native-qa-signoff-worksheet.md) only when release engineering or an agent is collecting stable-RC evidence.

This protocol covers the VoiceOver and TalkBack evidence required before production beta/RC can claim native accessibility confidence. Automated tests verify generated summaries and data table helpers, but they do not prove native assistive-technology behavior.

## Automated Coverage

Run:

```sh
npm run test:unit -- packages/react-native/test/chart-accessibility.test.ts packages/react-native/test/line-accessibility.test.ts
```

Current automated coverage:

- LineChart summary and data table helpers
- BarChart grouped summary and data table helpers
- CombinedChart dual-axis summary and visible-series table helpers
- CandlestickChart OHLC summary and data table helpers
- PieChart largest-slice summary and data table helpers
- ProgressChart clamped-value summary and data table helpers
- ContributionGraph empty-day summary and data table helpers
- Expo showcase representative data details panels for each page that requires table-fallback QA
- local baseline artifact: [accessibility-local-baseline-2026-05-06.md](artifacts/accessibility-local-baseline-2026-05-06.md)
- row-level iOS screenshots/logs and Android screenshots/logs/UIAutomator hierarchy snapshots for every accessibility matrix row

## Manual Device Matrix

Run the checks on:

| Platform | Required assistive tech | App surface                         |
| -------- | ----------------------- | ----------------------------------- |
| iOS      | VoiceOver               | Expo showcase or native release app |
| Android  | TalkBack                | Expo showcase or native release app |

Use `npm run example:expo` for preview review. Use `npm run native:release:ios` and `npm run native:release:android` for release-build review once the native toolchains are available.

For faster native navigation during screen-reader review, open a specific page with the showcase deep link:

```sh
xcrun simctl openurl booted "chartkitshowcase://showcase?page=line-charts&theme=dark&preset=highContrast"
adb shell am start -W -a android.intent.action.VIEW -d "chartkitshowcase://showcase?page=line-charts&theme=dark&preset=highContrast" io.chartkit.showcase
```

Supported params match the web preview URLs: `page`, `story`, `view`, `theme`, and `preset`.

For row evidence, the native QA capture helper can open the row deep link and save a screenshot before or after screen-reader inspection:

```sh
npm run release:qa:status -- --matrix accessibility --status partial --details

npm run release:qa:capture -- \
  --matrix accessibility \
  --row ios-voiceover-line-charts \
  --platform ios \
  --output docs/release/artifacts/ios-voiceover-line-charts.png \
  --ios-log-output docs/release/artifacts/ios-voiceover-line-charts.log
```

Android TalkBack rows can also capture a UIAutomator hierarchy snapshot:

```sh
npm run release:qa:capture -- \
  --matrix accessibility \
  --row android-talkback-line-charts \
  --platform android \
  --output docs/release/artifacts/android-talkback-line-charts.png \
  --android-log-output docs/release/artifacts/android-talkback-line-charts.log \
  --android-ui-output docs/release/artifacts/android-talkback-line-charts.xml
```

Use `--device <simulator-udid-or-adb-serial>` for a specific target and `--no-launch` when the screen-reader state is already positioned on the target page. The iOS log and Android UI hierarchy artifacts are supporting evidence; they do not replace the required VoiceOver or TalkBack manual review. Record the artifacts with `npm run release:qa:record -- --matrix accessibility --row <row-id> --status pass --evidence <artifact> --evidence <log-or-ui-artifact> --reviewed-by <name> --device "<device/os>" --build-surface "<build>" --notes "<manual iOS VoiceOver screen-reader checks passed>"` or equivalent Android TalkBack notes only after the required VoiceOver or TalkBack checks pass.

Representative stories on the Line, Bar, Combined, Financial, Pie & Donut, Progress, and Heatmaps pages include a collapsed `Data details` panel. Use those panels during VoiceOver and TalkBack review to verify the table-fallback checks without making the public preview visually dense by default.

## Required Screens

Review these showcase pages:

- Line Charts
- Bar Charts
- Combined Preview
- Financial Preview
- Pie & Donut
- Progress
- Heatmaps
- Compatibility

The machine-readable matrix in [native-accessibility-matrix.json](evidence/native-accessibility-matrix.json) expands these screens across iOS VoiceOver and Android TalkBack. Fill each row with `status: "pass"`, evidence links, review metadata, and notes only after the global and table-fallback checks below have passed on that platform.

## Acceptance Checks

For each page:

- The chart is reachable by screen-reader swipe navigation.
- The focused chart announces a concise summary instead of raw SVG internals.
- The summary names the chart type and key data insight.
- Selection, tooltip, range selector, and legend controls do not trap screen-reader focus.
- Any visually selected value is also available through a summary, table fallback, or app text.
- Touch targets around menu controls, legend toggles, and story controls are reachable and named.
- Theme switching does not remove contrast from chart text, tooltips, or controls.
- Decorative gridlines, markers, and session-gap bands are not announced as separate content.

For table fallback examples:

- The details control announces its expanded/collapsed state if the app uses one.
- Rows read in a stable order.
- Null or missing values are announced as "No value" or equivalent app copy.
- Dual-axis values are not compared as if they shared units.

## Evidence Log Template

Before production beta/RC, capture a completed log:

| Date | Commit | Platform         | Device/OS | Build | Result  | Notes |
| ---- | ------ | ---------------- | --------- | ----- | ------- | ----- |
| TBD  | TBD    | iOS VoiceOver    | TBD       | TBD   | Pending |       |
| TBD  | TBD    | Android TalkBack | TBD       | TBD   | Pending |       |

Attach screenshots or short screen recordings for any focus-order or announcement bug. File issues with chart type, platform, exact story, expected announcement, actual announcement, and whether a table fallback exists.

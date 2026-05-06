# Accessibility QA Protocol

Status on May 5, 2026: protocol ready, native screen-reader evidence missing. Structured gate evidence lives in [native-accessibility-qa.json](evidence/native-accessibility-qa.json), with the page-by-page assistive-technology matrix in [native-accessibility-matrix.json](evidence/native-accessibility-matrix.json). Use the generated [native QA checklist](native-qa-checklists.md) for row-by-row execution.

This protocol covers the manual VoiceOver and TalkBack checks required before production beta/RC can claim native accessibility confidence. Automated tests verify generated summaries and data table helpers, but they do not prove native assistive-technology behavior.

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

## Manual Device Matrix

Run the checks on:

| Platform | Required assistive tech | App surface                         |
| -------- | ----------------------- | ----------------------------------- |
| iOS      | VoiceOver               | Expo showcase or native release app |
| Android  | TalkBack                | Expo showcase or native release app |

Use `npm run example:expo` for preview review. Use `npm run native:release:ios` and `npm run native:release:android` for release-build review once the native toolchains are available.

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

The machine-readable matrix in [native-accessibility-matrix.json](evidence/native-accessibility-matrix.json) expands these screens across iOS VoiceOver and Android TalkBack. Fill each row with `status: "pass"` and evidence links only after the global and table-fallback checks below have passed on that platform.

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

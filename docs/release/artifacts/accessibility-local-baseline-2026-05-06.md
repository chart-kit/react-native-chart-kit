# Accessibility Local Baseline Evidence

Date: 2026-05-06
Commit: `b4984e0`
Build surface: local repository checks only

This artifact records the automated accessibility baseline required before native assistive-technology QA. It is suitable only for `partial` accessibility matrix evidence. It does not prove VoiceOver or TalkBack focus order, announcements, rotor/navigation behavior, tooltip/selection focus behavior, or native table-fallback announcements.

## Commands

```sh
npm run test:unit -- packages/react-native/test/chart-accessibility.test.ts packages/react-native/test/line-accessibility.test.ts apps/expo-showcase/src/showcaseAccessibilityDetails.test.ts
npm run showcase:typecheck
npm run release:preview:gate
```

## Results

- Accessibility-focused unit tests passed. Vitest reported 3 test files and 12 tests passing for chart summary/data-table helpers, LineChart accessibility helpers, and the Expo showcase data-details coverage guard.
- Showcase typecheck passed for `@chart-kit/expo-showcase`.
- Developer Preview gate passed; the active smoke-test process is documented in `docs/release/smoke-test-checks.md`.

## Scope

Covered by this local baseline:

- generated summary helpers for LineChart, BarChart, CombinedChart, CandlestickChart, PieChart, ProgressChart, and ContributionGraph
- data-table helper coverage for major chart families
- representative collapsed `Data details` panels in the Expo showcase for the pages that require table-fallback QA
- Developer Preview gate coverage for the simplified smoke-test process
- TypeScript coverage for the native showcase wiring

Not covered by this local baseline:

- iOS VoiceOver navigation or announcements
- Android TalkBack navigation or announcements
- native focus order across chart, menu, legend, tooltip, and data-details controls
- native screen-reader behavior for selected values, scrub/crosshair state, range selectors, or interactive legends
- native contrast review with assistive technologies enabled
- physical-device or simulator/emulator screen-reader evidence

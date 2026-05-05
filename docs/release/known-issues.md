# Known Issues Before Beta

These are allowed only as explicit beta caveats. Anything in this file should either become a tracked issue or be resolved before release candidate.

## Native Release-Build Coverage

Android and iOS release-build tests are not configured yet. The Expo showcase verifies web screenshots and can run on device through Expo Go or Expo dev targets, but that does not prove native release-build behavior.

Impact: beta can be used for preview and API feedback, but production users should wait for native release-build verification before treating v2 as stable.

## Native E2E Coverage

`npm run test:e2e` covers web showcase interaction flows through Playwright. It does not cover native iOS or Android runtime behavior.

`npm run example:ios` and `npm run example:android` launch the Expo showcase for manual simulator or emulator review. They are tracked as manual example commands, not passing native e2e or release-build checks.

Impact: CI can validate web showcase interactions, but cannot yet validate native navigation, release builds, or platform-specific gesture conflicts.

## Pro Split

Some advanced line-chart experiences, such as animation preview and range-selector/zoom workflows, are visible in the showcase before the final free-vs-Pro boundary is locked.

Impact: H4/H5 must decide which features stay free, which move to Pro, and how to avoid making the free library feel intentionally limited.

## Candlestick Scope

`CandlestickChart` currently supports OHLC body and wick geometry, opt-in volume overlays, baseline OHLC accessibility helpers, and tap inspection with an OHLC tooltip plus close-price badge. It does not yet include range selector integration, market-session gaps, or advanced financial narratives.

Impact: keep it labeled as financial foundation or preview unless those gaps are acceptable for beta.

## Docs Examples

`npm run docs:build` extracts every JS/TS markdown fence and runs it through the TypeScript transpiler for syntax diagnostics. Representative docs examples are also type-checked in `packages/react-native/test/docs-examples.typecheck.tsx`.

Impact: chart docs should still be reviewed alongside showcase stories until every markdown snippet is type-checked as a standalone app example.

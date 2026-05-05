# Known Issues Before Beta

These are allowed only as explicit beta caveats. Anything in this file should either become a tracked issue or be resolved before release candidate.

## Native Release-Build Coverage

Android and iOS release-build tests are not configured yet. The Expo showcase verifies web screenshots and can run on device through Expo Go, but that does not prove native release-build behavior.

Impact: beta can be used for preview and API feedback, but production users should wait for native release-build verification before treating v2 as stable.

## E2E Coverage

`npm run test:e2e`, `npm run example:ios`, and `npm run example:android` intentionally fail through placeholder commands. They are tracked gaps, not passing checks.

Impact: CI cannot yet validate native navigation, release builds, or platform-specific gesture conflicts.

## Package Naming

The modern workspace package is currently private as `@chart-kit/react-native-v2`, while the root package is `@chart-kit/react-native`. The final public package path remains a beta gate.

Impact: docs separate modern API examples from the legacy migration surface, but install/import instructions must be finalized before public beta.

## Pro Split

Some advanced line-chart experiences, such as animation preview and range-selector/zoom workflows, are visible in the showcase before the final free-vs-Pro boundary is locked.

Impact: H4/H5 must decide which features stay free, which move to Pro, and how to avoid making the free library feel intentionally limited.

## Candlestick Scope

`CandlestickChart` currently supports OHLC body and wick geometry only. It does not yet include volume overlays, crosshair price labels, range selector integration, market-session gaps, or financial-chart accessibility summaries.

Impact: keep it labeled as financial foundation or preview unless those gaps are acceptable for beta.

## Docs Examples

Markdown docs validate local links and fenced code blocks, but snippets are not yet compiled as standalone examples.

Impact: chart docs should be reviewed alongside showcase stories until docs-snippet compilation is added.

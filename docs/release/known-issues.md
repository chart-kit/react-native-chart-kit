# Known Issues Before Beta

These are allowed only as explicit beta caveats. Anything in this file should either become a tracked issue or be resolved before release candidate.

## Native Release-Build Coverage

Android and iOS release-build checks are configured in `.github/workflows/native-release.yml` and can be run locally with `npm run native:release:android` and `npm run native:release:ios`. The Expo showcase also verifies web screenshots and can run on device through Expo Go or Expo dev targets.

The remaining gap is evidence: H5/H6 should not count native release-build coverage as complete until the native workflow has a green run on the release candidate commit.

Impact: beta can be used for preview and API feedback, but production users should wait for native release-build verification before treating v2 as stable.

## Native E2E Coverage

`npm run test:e2e` covers web showcase interaction flows through Playwright. It does not cover native iOS or Android runtime behavior.

`npm run example:ios` and `npm run example:android` launch the Expo showcase for manual simulator or emulator review. They are tracked as manual example commands, not passing native e2e or release-build checks.

`examples/rn-cli-basic` provides a non-Expo app source and Metro alias smoke surface. `npm run example:rn-cli:typecheck` verifies its TypeScript imports, but generated RN CLI `ios/` and `android/` projects are not checked in or release-built yet.

Impact: CI can validate web showcase interactions, but cannot yet validate native navigation, release builds, or platform-specific gesture conflicts.

## Pro Split

Some advanced line-chart experiences, such as animation preview and range-selector/zoom workflows, are visible in the showcase before the final free-vs-Pro boundary is locked.

Impact: H4/H5 must decide which features stay free, which move to Pro, and how to avoid making the free library feel intentionally limited.

## Candlestick Scope

`CandlestickChart` currently supports OHLC body and wick geometry, opt-in volume overlays, scrollable long-history mode, viewport windowing with pan/pinch preview gestures, interactive range selector overview, baseline OHLC accessibility helpers, and tap inspection with an OHLC tooltip plus close-price badge. It does not yet include market-session gaps or advanced financial narratives.

Impact: keep it labeled as financial foundation or preview unless those gaps are acceptable for beta.

## Docs Examples

`npm run docs:build` extracts every JS/TS markdown fence and runs it through the TypeScript transpiler for syntax diagnostics. It also extracts public TS/TSX docs examples into temporary files and type-checks them against the current package path aliases. Representative integrated docs examples are still type-checked in `packages/react-native/test/docs-examples.typecheck.tsx`.

Impact: public chart docs now have automated type coverage, but docs should still be reviewed alongside showcase stories for product quality and visual correctness.

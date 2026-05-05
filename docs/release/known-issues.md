# Known Issues Before Beta

These are allowed only as explicit beta caveats. Anything in this file should either become a tracked issue or be resolved before release candidate.

## Native Release-Build Coverage

Android and iOS release-build checks are configured in `.github/workflows/native-release.yml` and can be run locally with `npm run native:release:android` and `npm run native:release:ios`. The Expo showcase also verifies web screenshots and can run on device through Expo Go or Expo dev targets.

The iOS release build passed locally on May 5, 2026. Android cannot run locally because the machine has no Java runtime; the release script now fails before prebuild in that case. The remaining gap is CI evidence: H5/H6 should not count native release-build coverage as complete until the native workflow has a green run on the release candidate commit.

Impact: beta can be used for preview and API feedback, but production users should wait for native release-build verification before treating v2 as stable.

## Native E2E Coverage

`npm run test:e2e` covers web showcase interaction flows through Playwright. It does not cover native iOS or Android runtime behavior.

`npm run example:ios` and `npm run example:android` launch the Expo showcase for manual simulator or emulator review. They are tracked as manual example commands, not passing native e2e or release-build checks.

The [Native runtime QA protocol](native-runtime-qa.md) defines the required iOS and Android gesture/runtime review path. The missing evidence is a completed device log for tap, scrub, pan, pinch, range selector, tooltip stacking, nested scroll, theme switching, and edge-label behavior.

`examples/rn-cli-basic` provides a non-Expo app source and Metro alias smoke surface. `npm run example:rn-cli:typecheck` verifies its TypeScript imports, but generated RN CLI `ios/` and `android/` projects are not checked in or release-built yet.

Impact: CI can validate web showcase interactions, but cannot yet validate native navigation, release builds, or platform-specific gesture conflicts.

## Pro Split

Some advanced line-chart experiences, such as animation preview and range-selector/zoom workflows, are visible in the showcase before the final free-vs-Pro boundary is locked.

The [H4 Pro scope decision packet](h4-pro-scope.md) proposes the package boundary and recommended feature split, and `packages/pro` now provides a preview feature-registry boundary. Owner approval is still pending before any license checks, runtime activation, or paid implementations are added.

Impact: H4/H5 must decide which features stay free, which move to Pro, and how to avoid making the free library feel intentionally limited.

## Skia Renderer

`packages/skia-renderer` now provides a preview package boundary, capability metadata, install guidance, and an injected Skia primitive adapter. `LineChart` can accept the injected renderer for its main plot, range selector, sticky-axis, and default marker surfaces, but sticky-axis labels require a Skia font, and gradient area fills, default SVG-only legends/tooltips, native install verification, and renderer parity tests are not complete yet.

Impact: the optional package boundary exists for H4 review, but Skia must stay labeled as preview until the remaining chart integration, install matrix, native benchmarks, and parity tests are implemented.

## Native Performance Evidence

`npm run benchmark` covers core geometry and web showcase scrub timing. The [Native performance benchmark protocol](native-performance-benchmark.md) defines the release-device measurements needed for iOS and Android, including frame timing, memory, renderer, data size, and gesture scenarios.

Impact: benchmark regressions can be caught locally for core geometry and web scrub timing, but H5/H6 should not claim native release-device performance until the native benchmark log is complete.

## Candlestick Scope

`CandlestickChart` currently supports OHLC body and wick geometry, opt-in volume overlays, opt-in calendar-aware session-gap markers for dated candles, built-in US equities exchange presets for regular full-day holidays and early closes, an emergency-closure feed adapter, scrollable long-history mode, viewport windowing with pan/pinch preview gestures, interactive range selector overview, baseline OHLC accessibility helpers, a financial narrative helper, and tap inspection with an OHLC tooltip plus close-price badge.

Impact: keep it labeled as financial foundation or preview until H4 decides whether advanced financial charts belong in the free package, Pro package, or a separate preview channel.

## Docs Examples

`npm run docs:build` extracts every JS/TS markdown fence and runs it through the TypeScript transpiler for syntax diagnostics. It also extracts public TS/TSX docs examples into temporary files and type-checks them against the current package path aliases. Representative integrated docs examples are still type-checked in `packages/react-native/test/docs-examples.typecheck.tsx`.

Impact: public chart docs now have automated type coverage, but docs should still be reviewed alongside showcase stories for product quality and visual correctness.

## Screen-Reader QA

Generated summaries and data table helpers are covered by unit tests, and the [Accessibility QA protocol](accessibility-qa.md) defines the VoiceOver/TalkBack review path. The missing evidence is a completed native screen-reader pass on iOS and Android.

Impact: accessibility helpers are present, but H5/H6 should not claim native assistive-technology behavior until the manual QA log is complete.

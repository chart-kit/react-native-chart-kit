# Known Issues Before Beta

These are allowed only as explicit Developer Preview caveats. Anything in this file should either become a tracked issue or be resolved before release candidate.

## Native Release-Build Coverage

Android and iOS release-build checks are configured in `.github/workflows/native-release.yml` and can be run locally with `npm run native:release:android` and `npm run native:release:ios`. The Expo showcase also verifies web screenshots and can run on device through Expo Go or Expo dev targets.

The iOS and Android release builds passed locally on May 5, 2026. Android used OpenJDK 17 plus the Homebrew Android command-line tools SDK (`/opt/homebrew/share/android-commandlinetools`) and completed `assembleRelease`. The release script now fails before prebuild when either Java or the Android SDK is missing. The remaining gap is CI evidence: production beta/RC should not count native release-build coverage as complete until the native workflow has a green run on the release candidate commit. A manual dispatch attempt on May 6, 2026 failed because `.github/workflows/native-release.yml` exists on `next` but not on the default `master` branch, so GitHub does not expose it as a dispatchable workflow yet. The structured status lives in [native-release-workflow.json](evidence/native-release-workflow.json).

Impact: Developer Preview can be used for preview and API feedback, but production users should wait for green native workflow verification before treating v2 as stable.

## Developer Preview Package Publish

`react-native-chart-kit@7.0.0-next.0` is published under the `next` npm dist-tag, while `latest` remains `6.12.2`. The scoped modern packages are not published yet. A May 6, 2026 publish rerun failed before package installation because GitHub Actions received an empty npm auth token (`NODE_AUTH_TOKEN`), so npm returned `ENEEDAUTH`.

The structured status lives in [npm-publish-evidence.json](evidence/npm-publish-evidence.json). The publish workflow now verifies npm auth/scope access before expensive checks, skips already-published package versions, and publishes the scoped dependency packages before the root compatibility package on the next rerun. The next unblock is to add or repair the GitHub Actions `NPM_TOKEN` secret and ensure that token can create and publish public packages under the `@chart-kit` scope.

Impact: existing users can install the root preview package with the `next` dist-tag, but new adopters cannot install the modern `@chart-kit/react-native` package until the npm `@chart-kit` scope access is fixed and the publish workflow is rerun.

## Native E2E Coverage

`npm run test:e2e` covers web showcase interaction flows through Playwright. It does not cover native iOS or Android runtime behavior.

`npm run example:ios` and `npm run example:android` launch the Expo showcase for manual simulator or emulator review. They are tracked as manual example commands, not passing native e2e or release-build checks.

The [Native runtime QA protocol](native-runtime-qa.md) defines the required iOS and Android gesture/runtime review path. Local iOS simulator and Android emulator release smoke passes launched the showcase and captured Line Charts screenshots, but the missing evidence is still a completed device log for tap, scrub, pan, pinch, range selector, tooltip stacking, nested scroll, theme switching, edge-label behavior, accessibility services, and physical-device behavior.

`examples/rn-cli-basic` provides a non-Expo app source and Metro alias smoke surface. `npm run example:rn-cli:typecheck` verifies its TypeScript imports, but generated RN CLI `ios/` and `android/` projects are not checked in or release-built yet.

Impact: CI can validate web showcase interactions, but cannot yet validate native navigation, release builds, or platform-specific gesture conflicts.

## Pro Split

Some advanced line-chart experiences, such as animation preview and range-selector/zoom workflows, are visible in the showcase before the final free-vs-Pro boundary is locked.

The [H4 Pro scope decision packet](h4-pro-scope.md) is approved: Pro should focus on production layout depth, production interactions, commercial chart types, export, premium templates, and performance. `packages/pro` now provides a preview feature-registry boundary for those buckets. Per H4/H5, Pro ships later as a separate package and no license checks, runtime activation, paid implementations, or npm publication are added before Developer Preview.

Impact: Developer Preview must keep these features labeled as preview or Pro-candidate, and H6 must not treat Pro as a finished paid package until paid implementation and native evidence are complete.

## Skia Renderer

`packages/skia-renderer` now provides a preview package boundary, capability metadata, install guidance, and an injected Skia primitive adapter. Local renderer contract coverage exists for the injected primitives plus LineChart, BarChart, PieChart/DonutChart, ProgressChart/ProgressRing, ContributionGraph/CalendarHeatmap, CombinedChart, and CandlestickChart. Sticky-axis labels and measured text anchors are covered locally with a supplied Skia-like font, but native Skia install verification, native renderer parity tests, and native Skia benchmark comparisons are not complete yet. The structured status lives in [skia-renderer-evidence.json](evidence/skia-renderer-evidence.json).

Impact: the optional package boundary is approved for preview, but Skia must stay labeled as preview until the install matrix, native benchmarks, and native parity tests are implemented.

## Native Performance Evidence

`npm run benchmark` covers core geometry and web showcase scrub timing. The [Native performance benchmark protocol](native-performance-benchmark.md) defines the release-device measurements needed for iOS and Android, including frame timing, memory, renderer, data size, and gesture scenarios. A partial Android release-emulator sample now covers one Line Charts animation scenario, but it does not replace the required iOS, physical-device or accepted simulator/emulator, gesture-heavy, memory, and renderer-parity matrix.

Impact: benchmark regressions can be caught locally for core geometry and web scrub timing, but production beta/RC should not claim native release-device performance until the native benchmark log is complete.

## Candlestick Scope

`CandlestickChart` currently supports OHLC body and wick geometry, opt-in volume overlays, opt-in calendar-aware session-gap markers for dated candles, built-in US equities exchange presets for regular full-day holidays and early closes, an emergency-closure feed adapter, scrollable long-history mode, viewport windowing with pan/pinch preview gestures, interactive range selector overview, baseline OHLC accessibility helpers, a financial narrative helper, and tap inspection with an OHLC tooltip plus close-price badge.

Impact: per H4, keep it labeled as Financial Preview until native performance evidence and the Pro implementation path are complete.

## Docs Examples

`npm run docs:build` extracts every JS/TS markdown fence and runs it through the TypeScript transpiler for syntax diagnostics. It also extracts public TS/TSX docs examples into temporary files and type-checks them against the current package path aliases. Representative integrated docs examples are still type-checked in `packages/react-native/test/docs-examples.typecheck.tsx`.

Impact: public chart docs now have automated type coverage, but docs should still be reviewed alongside showcase stories for product quality and visual correctness.

## Screen-Reader QA

Generated summaries and data table helpers are covered by unit tests, and the [Accessibility QA protocol](accessibility-qa.md) defines the VoiceOver/TalkBack review path. The missing evidence is a completed native screen-reader pass on iOS and Android.

Impact: accessibility helpers are present, but production beta/RC should not claim native assistive-technology behavior until the manual QA log is complete.

# H5 Owner Decision Memo

This memo converts the H5 beta gate into explicit choices. It is a recommendation, not approval.

## Recommended Decision

Do not publish the beta package yet. Approve the preview implementation for continued beta preparation, then finish the remaining native and Pro-scope caveats before publishing.

Reason: the implementation, showcase, docs, tests, visual coverage, benchmark, support workflow, release checklist, local native release builds, and package path are in place, but remote native workflow evidence and the final free-vs-Pro package boundary are not complete.

The current export surface is guarded by `npm run surface:check`. That check verifies the legacy `react-native-chart-kit` root exports, the free/baseline `@chart-kit/react-native` exports, and the temporary `@chart-kit/react-native/pro-preview` subpath for H4 review.

## Decision 1: Publish Now Or Keep Iterating

Recommendation: keep iterating before npm beta.

Rationale:

- verification is strong for web showcase and TypeScript surfaces
- native release-build checks are configured and iOS/Android passed locally, but no green native workflow artifact is recorded yet
- the [H4 Pro scope decision packet](h4-pro-scope.md) now captures the owner monetization direction, but final package separation, license timing, and beta labels are not approved

Acceptable owner override: publish a limited preview beta only if the beta is clearly labeled as API-preview and not production-ready.

## Decision 2: Package And Import Path

Recommendation:

- Keep `react-native-chart-kit` compatibility-first for existing users.
- Use `@chart-kit/react-native` as the modern public import path for new adopters.
- Keep old `chartConfig` examples in migration docs, not the primary v2 getting-started path.

Rationale:

- existing users need common v1 imports to keep working
- new adopters should not start from the old `chartConfig` API
- the approved H0/H1 strategy called for a dual-package split between compatibility and modern APIs

## Decision 3: Native Release-Build Gaps

Recommendation: acceptable for an API-preview beta, not acceptable for RC.

Beta label requirement:

- docs and release notes must say web-showcase e2e and local native release builds pass, but native workflow/device evidence is not yet proven
- `example:ios` and `example:android` launch the Expo showcase through dev tooling only; they must not be counted as release-build or native e2e coverage
- `native:release:android` and `native:release:ios` are the release-build checks to run before production beta or RC

## Decision 4: Free Vs Pro Visibility

Recommendation for beta preview:

- Keep current line interactions visible in the showcase.
- Label production layout depth, production touch workflows, range selector, pan/zoom, commercial chart types, export, premium templates, and future Skia/large-dataset work as preview or Pro-candidate features until H4 finalizes package scope.
- Do not add license gating before the free v2 architecture and public API are stable.

Rationale: hiding the best line-chart interactions before beta weakens visual review, but hard-gating them now would confuse API feedback.

## Decision 5: Candlestick Status

Recommendation: keep `CandlestickChart` in the showcase as Financial Preview, not as a finished beta chart.

Rationale:

- OHLC body and wick geometry exist
- tap inspection, an OHLC tooltip, and a close-price badge exist
- opt-in volume overlays exist
- scrollable histories, controlled viewport gestures, and range selector integration exist in preview form
- opt-in calendar-aware market-session gap markers exist for dated candles
- opt-in early-close and emergency-closure session markers exist
- an emergency-closure feed adapter maps external closure feeds into session markers
- a financial narrative helper exists for close change, percentage change, range, and up/down/flat candle counts
- named early-close calendars exist for US equities presets
- including it as a preview helps owner review Pro/financial direction without overpromising

## Recommended H5 Outcome

The recorder enforces the gate order: H4 must be approved before H5 can be approved. Native evidence gaps can still be accepted for an API-preview beta if the owner records that decision explicitly.

Approve continued beta preparation with these next tasks:

1. Verify the public package/import path in CI and release docs.
2. Keep the chosen path wired into docs and typechecked examples.
3. Decide whether the first beta is API-preview or production-beta.
4. Keep native workflow and native performance gaps in known issues until workflow and device benchmark evidence are green on the release commit.
5. Keep candlestick labeled Financial Preview.

Record H5 approval only after H4 is approved and the owner accepts or edits the beta decisions:

```sh
npm run release:owner:record -- \
  --gate h5 \
  --approved-by <owner> \
  --approved-at <yyyy-mm-dd> \
  --decision "Continue beta preparation before npm publication." \
  --decision "First beta may be labeled API Preview only if native evidence gaps remain." \
  --decision "Compatibility package and modern package paths approved for beta review." \
  --decision "Advanced interactions, financial charts, range selector, pan/zoom, animation, Skia, and large-data workflows remain preview or Pro-candidate until H4 final labels are approved." \
  --decision "CandlestickChart remains Financial Preview."
```

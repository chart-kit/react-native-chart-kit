# H5 Owner Decision Memo

This memo converts the H5 beta gate into explicit choices. It is a recommendation, not approval.

## Recommended Decision

Do not publish the beta package yet. Approve the preview implementation for continued beta preparation, then spend the next slice on package/export strategy before publishing.

Reason: the implementation, showcase, docs, tests, visual coverage, benchmark, support workflow, and release checklist are in place, but the public package path is still unresolved. Publishing before resolving the package path would make migration docs and install instructions unstable.

The current export surface is guarded by `npm run surface:check`. That check verifies the legacy root exports and the private v2 preview exports, but it does not decide the final public v2 import path.

## Decision 1: Publish Now Or Keep Iterating

Recommendation: keep iterating before npm beta.

Rationale:

- verification is strong for web showcase and TypeScript surfaces
- native iOS/Android release-build coverage is not configured
- package/import path is not final
- Pro/free feature boundary is not final

Acceptable owner override: publish a limited preview beta only if the beta is clearly labeled as API-preview and not production-ready.

## Decision 2: Package And Import Path

Recommendation:

- Keep the root legacy component names compatibility-first.
- Add a modern public import path before beta, preferably `@chart-kit/react-native/v2` or a scoped modern package decided by the owner.
- Keep `@chart-kit/react-native-v2` private/internal until the final path is chosen.

Rationale:

- existing users need common v1 imports to keep working
- new adopters should not start from the old `chartConfig` API
- modern docs currently use the private workspace name to avoid pretending the public path is final

## Decision 3: Native Release-Build Gaps

Recommendation: acceptable for an API-preview beta, not acceptable for RC.

Beta label requirement:

- docs and release notes must say web-showcase e2e passes, but native release builds are not yet proven
- `example:ios` and `example:android` launch the Expo showcase through dev tooling only; they must not be counted as release-build or native e2e coverage

## Decision 4: Free Vs Pro Visibility

Recommendation for beta preview:

- Keep current line interactions visible in the showcase.
- Label animation, range selector, pan/zoom, and future Skia/large-dataset work as preview features until H4 finalizes Pro scope.
- Do not add license gating before the free v2 architecture and public API are stable.

Rationale: hiding the best line-chart interactions before beta weakens visual review, but hard-gating them now would confuse API feedback.

## Decision 5: Candlestick Status

Recommendation: keep `CandlestickChart` in the showcase as Financial Preview, not as a finished beta chart.

Rationale:

- OHLC body and wick geometry exist
- volume overlay, market gaps, crosshair price labels, range selector integration, and financial accessibility summaries are not complete
- including it as a preview helps owner review Pro/financial direction without overpromising

## Recommended H5 Outcome

Approve continued beta preparation with these next tasks:

1. Finalize public package/import path.
2. Wire the chosen path into docs and typechecked examples.
3. Decide whether the first beta is API-preview or production-beta.
4. Keep native release-build gaps in known issues unless native examples are implemented first.
5. Keep candlestick labeled Financial Preview.

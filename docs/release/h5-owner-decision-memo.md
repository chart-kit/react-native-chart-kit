# H5 Owner Decision Memo

This memo records the H5 Developer Preview approval from May 6, 2026.

## Approved Decision

Chart Kit v2 may publish a Developer Preview from the free packages only. This is not a production beta or release candidate.

Reason: the implementation, showcase, docs, tests, visual coverage, benchmark, support workflow, release checklist, local native release builds, and package path are in place. Native workflow/device evidence, Skia native parity, native accessibility, and native performance are still incomplete, so the release must be labeled Developer Preview with gaps disclosed.

The current export surface is guarded by `npm run surface:check`. That check verifies the legacy `react-native-chart-kit` root exports, the free/baseline `@chart-kit/react-native` exports, and the temporary `@chart-kit/react-native/pro-preview` subpath for the H4-approved preview boundary.

## Decision 1: Publish Label

Approved: publish free packages as **Developer Preview**, not production beta.

Rationale:

- verification is strong for web showcase and TypeScript surfaces
- native release-build checks are configured and iOS/Android passed locally, but no green native workflow artifact is recorded yet
- the [H4 Pro scope decision packet](h4-pro-scope.md) is approved, but native workflow/device evidence is still incomplete

Developer Preview must not be described as production-ready.

## Decision 2: Package And Import Path

Approved:

- Keep `react-native-chart-kit` compatibility-first for existing users.
- Use `@chart-kit/react-native` as the modern public import path for new adopters.
- Keep old `chartConfig` examples in migration docs, not the primary v2 getting-started path.

Rationale:

- existing users need common v1 imports to keep working
- new adopters should not start from the old `chartConfig` API
- the approved H0/H1 strategy called for a dual-package split between compatibility and modern APIs

## Decision 3: Native Release-Build Gaps

Approved: native evidence gaps are acceptable for Developer Preview only, not for RC.

Developer Preview label requirement:

- docs and release notes must say web-showcase e2e and local native release builds pass, but native workflow/device evidence is not yet proven
- `example:ios` and `example:android` launch the Expo showcase through dev tooling only; they must not be counted as release-build or native e2e coverage
- `native:release:android` and `native:release:ios` are the release-build checks to run before production beta or RC

## Decision 4: Package Publish Set

Approved publishable package set:

- `react-native-chart-kit`
- `@chart-kit/core`
- `@chart-kit/svg-renderer`
- `@chart-kit/react-native`

Do not publish:

- `@chart-kit/pro`
- `@chart-kit/skia-renderer`

Use npm dist-tag `next` for Developer Preview. No production release date is approved.

## Decision 5: Free Vs Pro Visibility

Approved for Developer Preview:

- Keep current line interactions visible in the showcase.
- Label production layout depth, production touch workflows, range selector, pan/zoom, commercial chart types, export, premium templates, and future Skia/large-dataset work as preview or Pro-candidate features per the H4-approved boundary.
- Do not add license gating before the free v2 architecture and public API are stable.

Rationale: hiding the best line-chart interactions before beta weakens visual review, but hard-gating them now would confuse API feedback.

## Decision 6: Candlestick Status

Approved: keep `CandlestickChart` in the showcase as Financial Preview, not as a finished beta chart.

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

## H5 Outcome

H5 is approved for Developer Preview, not for production beta or release candidate.

Approved next tasks:

1. Verify the public package/import path in CI and release docs.
2. Keep the chosen path wired into docs and typechecked examples.
3. Keep native workflow and native performance gaps in known issues until workflow and device benchmark evidence are green on the release commit.
4. Keep `@chart-kit/pro` and `@chart-kit/skia-renderer` unpublished for Developer Preview.
5. Keep candlestick labeled Financial Preview.

Recorded approval:

```sh
npm run release:owner:record -- \
  --gate h5 \
  --approved-by owner \
  --approved-at 2026-05-06 \
  --decision "Chart Kit v2 may publish a Developer Preview from the free packages only; this is not a production beta or release candidate." \
  --decision "Native runtime, accessibility, performance, workflow, and Skia evidence gaps are accepted only for Developer Preview and must remain disclosed in known issues and release notes." \
  --decision "Publishable package set is react-native-chart-kit, @chart-kit/core, @chart-kit/svg-renderer, and @chart-kit/react-native; do not publish @chart-kit/pro or @chart-kit/skia-renderer." \
  --decision "Use the next npm dist-tag for Developer Preview; no production release date is approved." \
  --decision "Advanced interactions, financial charts, range selector, pan/zoom, animation, Skia, and large-data workflows remain preview or Pro-candidate per the H4-approved boundary." \
  --decision "CandlestickChart remains Financial Preview."
```

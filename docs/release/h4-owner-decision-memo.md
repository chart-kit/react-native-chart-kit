# H4 Owner Decision Memo

This memo converts the Pro/free boundary gate into explicit choices. It is a recommendation, not approval.

## Recommended Decision

Approve the Pro direction as a package-boundary plan, but do not add license enforcement yet.

Reason: the current implementation keeps the free/baseline public package useful, exposes current advanced workflows through `@chart-kit/react-native/pro-preview`, and records Pro-candidate feature buckets plus prop-level triggers in `packages/pro`. The final paid package and license behavior should wait until native evidence and beta feedback are stronger.

## Decision 1: Free Baseline

Recommendation:

- keep `react-native-chart-kit` as the compatibility package
- keep `@chart-kit/react-native` as the clean modern free API
- keep common charts, safe default layout, basic themes, accessibility helpers, migration docs, and the SVG renderer free
- do not make free charts look broken to create Pro value

Rationale: existing users need a low-friction upgrade path, and new adopters need a modern API that does not start from the old `chartConfig` pattern.

## Decision 2: Pro Package

Recommendation: ship Pro as a separate package later.

Suggested package direction:

```text
@chart-kit/react-native         # modern free package
@chart-kit/pro                  # paid workflows and composition helpers
@chart-kit/skia-renderer        # optional renderer package, used by Pro docs/examples when approved
```

Rationale: a separate package keeps license checks, paid workflows, and optional native dependencies out of the free runtime.

## Decision 3: Pro Scope

Recommendation: keep the owner-proposed commercial buckets as Pro candidates:

- production layout engine depth
- production interactions
- commercial chart types
- export
- premium themes/templates
- large-data performance
- optional Skia renderer
- enterprise accessibility reports

The current registry records these as `chartKitProPreviewFeatures`.

## Decision 4: Prop-Level Triggers

Recommendation: approve the trigger metadata as the working split map, not as runtime gating.

Examples currently tracked:

- `LineChart.rangeSelector`
- `LineChart.interaction=scrub`
- `LineChart.viewportInteraction`
- `LineChart.crosshair`
- `LineChart.renderTooltip`
- `LineChart.decimation`
- `LineChart.renderer`
- `BarChart.scrollable`
- `BarChart.selectionAnimation`
- `BarChart.mode=grouped`
- `BarChart.orientation=horizontal`
- `CombinedChart`
- `CandlestickChart`
- `DonutChart.activeSlice`

Rationale: this lets the project decide later whether a component, a prop, or a workflow moves into Pro without moving runtime code prematurely.

## Decision 5: License Timing

Recommendation: no license enforcement before beta.

Rationale:

- API feedback is more important than monetization code at this stage
- free/pro boundaries are still under owner review
- native Skia and performance evidence are not complete
- license checks should never live in `packages/core`

## Decision 6: Beta Labels

Recommendation:

- label advanced touch workflows, range selector, pan/zoom, animation previews, financial charts, Skia, and large-data features as preview or Pro candidate
- keep `CandlestickChart` visible only as Financial Preview
- keep `@chart-kit/react-native/pro-preview` as the temporary review entrypoint

## Recommended H4 Outcome

Approve the strategy, not the final paid implementation:

1. Free v2 stays useful and trustworthy.
2. Pro focuses on production pain and commercial workflows.
3. Pro and Skia remain preview packages for beta.
4. License enforcement is deferred.
5. Final free-vs-Pro labels are revisited after native evidence and beta feedback.

Record approval only after the owner accepts or edits these decisions:

```sh
npm run release:owner:record -- \
  --gate h4 \
  --approved-by <owner> \
  --approved-at <yyyy-mm-dd> \
  --decision "Free v2 remains useful with safe layout, SVG renderer, baseline charts, themes, accessibility helpers, and compatibility facade." \
  --decision "@chart-kit/pro will be a separate package later." \
  --decision "@chart-kit/skia-renderer remains an optional renderer package until native evidence is complete." \
  --decision "No license enforcement before beta." \
  --decision "Advanced interactions, range selector, pan/zoom, animation, financial charts, Skia, and large-data workflows stay preview/Pro-candidate for beta." \
  --decision "CandlestickChart remains Financial Preview."
```

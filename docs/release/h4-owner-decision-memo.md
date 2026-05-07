# H4 Owner Decision Memo

This memo records the H4 Pro/free boundary approval from May 6, 2026.

## Approved Decision

The owner approved the Pro direction as a package-boundary plan, with no license enforcement before beta.

Reason: the current implementation keeps the free/baseline public package useful, exposes current advanced workflows through `@chart-kit/react-native/pro-preview`, and records Pro-candidate feature buckets plus prop-level triggers in `packages/pro`. The final paid package and license behavior should wait until native evidence and beta feedback are stronger.

## Decision 1: Free Baseline

Approved:

- keep `react-native-chart-kit` as the compatibility package
- keep `@chart-kit/react-native` as the clean modern free API
- keep common charts, safe default layout, basic themes, accessibility helpers, migration docs, and the SVG renderer free
- do not make free charts look broken to create Pro value

Rationale: existing users need a low-friction upgrade path, and new adopters need a modern API that does not start from the old `chartConfig` pattern.

## Decision 2: Pro Package

Approved: ship Pro as a separate package later.

Suggested package direction:

```text
@chart-kit/react-native         # modern free package
@chart-kit/pro                  # paid workflows and composition helpers
@chart-kit/skia-renderer        # separate optional preview renderer until H6 package approval
```

Rationale: a separate package keeps license checks, paid workflows, and optional native dependencies out of the free runtime.

## Decision 3: Pro Scope

Approved: keep the owner-proposed commercial buckets as Pro candidates:

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

Approved: use the trigger metadata as the working split map, not as runtime gating.

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

Approved: no license enforcement before beta.

Rationale:

- API feedback is more important than monetization code at this stage
- paid implementation and native evidence are still incomplete
- native Skia and performance evidence are not complete
- license checks should never live in `packages/core`

## Decision 6: Beta Labels

Approved:

- label advanced touch workflows, range selector, pan/zoom, animation previews, financial charts, Skia, and large-data features as preview or Pro candidate
- keep `CandlestickChart` visible only as Financial Preview
- keep `@chart-kit/react-native/pro-preview` as the temporary review entrypoint

## H4 Outcome

Approved the strategy, not the final paid implementation:

1. Free v2 stays useful and trustworthy.
2. Pro focuses on production pain and commercial workflows.
3. Pro and Skia remain preview packages for beta.
4. License enforcement is deferred.
5. Final paid implementation details are revisited after native evidence and beta feedback.

Recorded approval:

```sh
npm run release:owner:record -- \
  --gate h4 \
  --approved-by owner \
  --approved-at 2026-05-06 \
  --decision "Free v2 remains useful with safe layout, SVG renderer, baseline charts, themes, accessibility helpers, and compatibility facade." \
  --decision "@chart-kit/pro will be a separate package later." \
  --decision "@chart-kit/skia-renderer remains a separate optional preview renderer package until native install, parity, and benchmark evidence are complete." \
  --decision "No license enforcement before beta." \
  --decision "Advanced interactions, range selector, pan/zoom, animation, financial charts, Skia, and large-data workflows stay preview/Pro-candidate for beta." \
  --decision "CandlestickChart remains Financial Preview."
```

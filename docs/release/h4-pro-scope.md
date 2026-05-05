# H4 Pro Scope Decision Packet

Status on May 5, 2026: owner monetization direction captured, package separation not approved for release yet.

This packet defines the recommended free-vs-Pro boundary for the v2 beta path. It does not add license checks or move exports. The implementation should keep the current preview surface intact until the owner approves the final package split and release timing.

## Recommended H4 Decision

Keep the free library useful and trustworthy. Make Pro about the places real production apps bleed: layout certainty, touch workflows, commercial chart types, export, premium templates, and performance.

Recommended beta decision:

- ship free v2 with SVG renderer, modern baseline charts, compatibility facade, themes, accessibility helpers, safe default layout, and basic examples
- keep currently implemented advanced interactions, range selector, pan/zoom, animation, and financial charts visible only as preview/pro-candidate features until API feedback stabilizes
- do not add runtime license gating before the free API and package boundaries are stable
- create Pro as a separate package later, not as conditional behavior hidden inside free chart components

Guardrail: do not make the free library look broken to create Pro value. Free charts should avoid obvious clipping and should have good defaults. Pro monetizes depth, polish, scale, and advanced workflows.

## Free V2 Boundary

These should remain free because they are baseline production expectations for a modern mobile chart library.

| Area          | Free scope                                                                                                  |
| ------------- | ----------------------------------------------------------------------------------------------------------- |
| Renderer      | SVG renderer, theme-aware primitives, gradients, clipping, test IDs                                         |
| Compatibility | `react-native-chart-kit` legacy component names and common data shapes                                      |
| Core charts   | Line, Area, Bar, StackedBar, Pie, Donut, Progress, Contribution baseline                                    |
| Layout        | safe default padding, no obvious label clipping, basic tick density, responsive chart area, debug layout    |
| Themes        | good default, dark mode, custom preset creation, tooltip tokens                                             |
| Interaction   | basic chart press events and simple selected-value examples; advanced touch workflows remain Pro candidates |
| Scales/data   | explicit domains, null gaps, categorical/time/linear scales, conservative decimation hooks                  |
| Scrolling     | basic scrollable chart examples; fixed-axis/brush/range workflows remain Pro candidates until approved      |
| Accessibility | generated summaries, data table helpers, high-contrast theme                                                |
| Tooling       | docs, Expo showcase, RN CLI smoke surface, codemod, visual tests, benchmarks                                |

## Pro Candidate Boundary

These are reasonable Pro candidates because they are deeper product workflows, performance layers, or specialized domains.

| Area              | Pro candidate scope                                                                                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Layout engine     | smart Y-axis width measurement, multi-line/rotated/ellipsized X labels, auto tick density, custom ticks, axis titles, true full-width plotting, small-screen solvers           |
| Interactions      | tooltips, crosshair, scrubbing, nearest-point selection, long press, selected-series highlighting, shared tooltips, zoom/pan, fixed Y-axis scrolling, brush/range selection    |
| Commercial charts | Candlestick/OHLC, financial presets, combo bar + line, dual-axis, grouped bars, horizontal stacked bars, advanced donut, gauge, radar, treemap, advanced contribution heatmaps |
| Export            | PNG/SVG export, snapshot API, share sheet integration, and future server-side/headless chart image generation                                                                  |
| Themes/templates  | Apple Health style, Linear-style, fintech dark mode, analytics dashboard, minimal SaaS, fitness, crypto, accessibility-safe palettes, animated transitions                     |
| Performance       | large dataset mode, decimation/downsampling, virtualized or windowed rendering, memoized path generation, optional Skia renderer, native benchmarks in docs                    |
| Enterprise        | accessibility reports, design-system token adapters, support matrices                                                                                                          |

## Package Architecture

Recommended package direction:

```text
react-native-chart-kit          # compatibility package and migration bridge
@chart-kit/react-native         # modern free v2 public API
@chart-kit/skia-renderer        # optional/Pro renderer package, peer-depends on Skia
@chart-kit/pro                  # paid workflow package that composes free primitives
```

`packages/skia-renderer` currently exposes capability metadata, install guidance, and an injected Skia primitive adapter. `LineChart` can accept the injected renderer for its main plot, range selector, sticky-axis, path-local area gradients, threshold rect clips, measured text anchors, default marker, default legend, default tooltip, and debug-layout surfaces, with local renderer contract coverage in `packages/react-native/test/line-renderer.test.ts`. Sticky-axis labels require a Skia font, and native install evidence plus native renderer parity tests remain pending. The package does not add license gating until H4 approves the Pro/package split.

`packages/pro` currently exists only as a preview feature-registry and surface-boundary package. It has no license checks, no runtime activation, and no gated chart implementations. Its registry now mirrors the owner-proposed commercial buckets: `pro-layout-engine`, `pro-interactions`, `pro-chart-types`, `pro-export`, `pro-theme-templates`, `pro-performance`, `skia-renderer`, and `accessibility-reports`. Its package-boundary metadata classifies current exports as compatibility, free baseline, or Pro candidate so the final split can be reviewed before moving runtime code.

Implementation principles:

- keep free components free of license checks
- keep license logic out of `packages/core` and renderer-agnostic chart math
- make Pro features compose around free chart models rather than forking chart behavior
- keep Pro install optional so Expo/SVG users do not pay a native dependency cost
- let CI run without remote license activation
- paywall production depth and commercial workflows, not obvious bug fixes

## Preview Feature Labels

Until H4 implementation is approved, label these as preview or Pro candidate in docs/showcase language instead of calling them final free or final Pro:

- advanced tooltip/crosshair/scrub workflows
- LineChart range selector and brush selection
- controlled pan and pinch-zoom windows
- animation previews and animated transitions
- CandlestickChart and financial workflows
- Combo/Dual-axis polish and advanced grouped/horizontal bar variants
- future Skia renderer experiments

## Owner Decisions Needed

H4 approval needs explicit answers:

1. Does `@chart-kit/pro` ship as a separate package?
2. Does `@chart-kit/skia-renderer` ship as a separate optional package or inside Pro?
3. Which current preview interactions must remain free at beta?
4. Can `CandlestickChart` remain public as Financial Preview?
5. Should combo/dual-axis, grouped bars, horizontal stacked bars, and advanced contribution heatmap move to Pro candidates?
6. Should the first beta publish without any license enforcement?

Recommended answers:

1. Yes, separate package.
2. Separate optional package, with Pro docs and examples depending on it.
3. Keep simple press handlers and baseline selection examples free; label production touch workflows as Pro candidates until pricing is final.
4. Yes, but only as Financial Preview until native performance and the free-vs-Pro boundary are approved.
5. Yes, where they are commercial workflows rather than baseline chart primitives.
6. Yes. Add license enforcement only after API feedback and package boundaries settle.

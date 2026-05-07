# Troubleshooting

## Chart Is Blank

Check that the chart has a real width and height. Most examples use fixed numbers because React Native charts cannot infer size from an unconstrained parent.

```tsx
<LineChart data={data} xKey="date" yKey="value" width={360} height={240} />
```

If the chart is inside a flex layout, measure the parent with `onLayout` and pass the measured width to the chart.

## Expo Go Says The Project Is Incompatible

The showcase tracks a specific Expo SDK for device review. If Expo Go cannot open the local app:

1. Update Expo Go from the App Store or Play Store.
2. Run `npm install` from the repo root.
3. Start with tunnel mode if LAN discovery fails.

```sh
npm run example:expo -- --tunnel
```

## Gestures Do Not Work

Baseline tap, scrub, pan, pinch zoom, and range selector interactions use React Native responder APIs. They do not require `GestureHandlerRootView` or Reanimated.

When a chart lives inside a vertical scroll view, use chart interaction props that lock parent scrolling during the gesture, such as `viewportInteraction={{ pan: true, lockParentScroll: true }}` or range-selector interaction settings.

If an app has its own gesture system, keep chart selection controlled with `selectedIndex`, `viewport`, and `onViewportChange` so parent screens can coordinate dismissal, scrolling, and navigation.

## Labels Clip Or Overlap

Prefer the default `labelStrategy="auto"` before rotating labels manually. For dense charts:

- use `labelStrategy="skip"` for predictable intervals
- use `edgeLabelPolicy="shift"` to keep first and last labels inside the plot
- use `scrollable` and `visiblePoints` for long categorical datasets
- use `yAxisLabelWidth="stable"` when changing the viewport changes y-label length

## Tooltip Is Cut Off

Tooltips are rendered in an overlay above chart content and shifted into the visible viewport. If a custom tooltip clips:

- keep the chart wrapper height equal to the chart `height`
- avoid wrapping the chart in a parent with `overflow: "hidden"` unless intentional
- pass a realistic tooltip `width`
- prefer `positionAnimationDuration` for smooth movement between selected points

## Theme Does Not Apply

Themes flow from `ChartKitProvider`, but per-chart `theme`, `preset`, or explicit series colors win over provider values.

```tsx
<ChartKitProvider mode="dark" preset="fintech">
  <Dashboard />
</ChartKitProvider>
```

If a chart keeps old colors after changing the provider, check for hardcoded `series[].color`, `upColor`, `downColor`, `fill`, or local `theme` overrides.

## Visual Snapshot Changed

For renderer, layout, label, or theme changes, update only the affected screenshots first:

```sh
npm run visual:update -- --grep "v2-bar-selection"
```

Then run the full visual suite:

```sh
npm run test:visual
```

Review snapshots before committing; do not update screenshots as a substitute for verifying the visual change.

## Compatibility Chart Looks Different From v1

v2 compatibility preserves common props and data shapes, not pixel-perfect old bugs. Differences are expected when old behavior clipped labels, depended on SVG node order, or used undocumented internals.

Use [the v1 migration guide](migration/from-v1.md) and [prop mapping](migration/prop-mapping.md) to decide whether the chart should stay on the compatibility surface or move to the modern API.

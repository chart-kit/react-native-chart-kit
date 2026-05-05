# CKV2-010 Interaction Notes

Date: May 1, 2026

## Current Slice

This slice starts the free v2 interaction baseline for modern Line/Area charts.

Added:

- `interaction="tap"` and `interaction="scrub"` modes
- object form `interaction={{ mode, onSelect, onGestureStart, onGestureEnd }}`
- uncontrolled `defaultSelectedIndex`
- selection lifecycle options: `selectionPersistence`, `deselectOnOutsidePress`, and `onDeselect`
- tap selection through React Native responder events
- scrub selection through responder move events
- nearest-x hit testing
- plot-bounds touch gating with touch slop
- selection event payload with index, x value, x label, selected position, series values, and raw row
- Expo showcase `Tap and scrub` example
- unit tests for interaction config, bounds checks, nearest-index mapping, and select-event payloads

## Design Choices

Gesture selection reuses the same selection model as controlled `selectedIndex`, so tooltips, active dots, crosshair, null-gap handling, and formatter behavior stay consistent. Tooltip rendering is intentionally just one consumer of selection state.

The interaction baseline is opt-in. Charts do not claim responder ownership unless `interaction` is set, which keeps default charts safer inside app scroll containers.

Selection lifecycle is named around selection, not tooltip. That allows Wealthsimple-style external consumers, such as a balance header, to respond through `onSelect` and `onDeselect` while keeping `tooltip={false}`.

Tap and scrub selection still use React Native responder events. Viewport pinch zoom now uses `react-native-gesture-handler` because native pinch recognition is worth the dependency for real portfolio/price-history workflows. Main-plot pan remains responder-based so one-finger drag works in the same controlled viewport model.

## Future Selection Scope

Chart-local dismissal is useful but not sufficient for real product screens. A chart can reliably dismiss selection when a user taps inside that chart's own non-plot regions, but it cannot observe touches on arbitrary sibling views, other charts, buttons, navigation controls, or screen background outside its mounted tree.

Added a shared selection scope for screen-level dismissal and cross-chart
coordination:

```tsx
<ChartSelectionProvider dismissOnPressOutside>
  <PortfolioHeader />
  <LineChart id="portfolio" interaction="scrub" />
  <LineChart id="benchmark" interaction="scrub" />
  <RangeButtons />
</ChartSelectionProvider>
```

Current behavior:

- Selecting one chart clears other uncontrolled selections in the same scope.
- Tapping empty space inside the provider dismisses current selection.
- Tapping another chart moves selection to the new chart and clears the previous chart.
- Tooltips, crosshairs, active dots, and external selected-value headers can use the same scoped selection lifecycle.
- Buttons or controls inside the provider can call an imperative hook such as `useDismissChartSelection()` before running their own action.
- Apps that need dismissal from controls outside the provider should either place the provider at the screen boundary or use controlled `selectedIndex` plus explicit `onPress` wiring.

Do not implement this as a global event listener by default. Global touch interception is fragile in React Native and can break `ScrollView`, navigation, modals, bottom sheets, and app-specific gesture systems. The provider should be a screen-level or card-group-level scope chosen by the app.

Public API names:

- `ChartSelectionProvider`
- `dismissOnPressOutside`
- `useChartSelection()`
- `useDismissChartSelection()`

## Remaining Work

- Verify touch behavior in native iOS and Android examples.
- Add interaction examples inside `ScrollView`.
- Add native visual QA for `ChartSelectionProvider` across sibling charts, buttons, and scroll containers.
- Add gesture conflict tests once native example apps exist.
- Keep pinch zoom opt-in through `viewportInteraction={{ pinchZoom: true }}` until native QA validates conflict behavior in scroll views, bottom sheets, and tab layouts.

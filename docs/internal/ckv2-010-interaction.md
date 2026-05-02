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

This first pass intentionally uses React Native responder events rather than adding Gesture Handler or Reanimated. That keeps the free baseline dependency-light while leaving room for a stronger adapter for pan, zoom, and high-frequency scrub later.

## Remaining Work

- Verify touch behavior in native iOS and Android examples.
- Add interaction examples inside `ScrollView`.
- Add bar and pie press events.
- Add gesture conflict tests once native example apps exist.
- Defer pinch zoom and viewport pan to the scroll/zoom slice.

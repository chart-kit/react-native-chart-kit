# CKV2-004 Layout Engine Notes

Date: May 1, 2026

## Current Slice

This slice adds first-pass renderer-agnostic layout primitives to `packages/core`.

Added:

- chart box solving
- auto padding calculations from labels and legends
- deterministic label collision decisions
- legend wrapping layout
- tooltip auto-placement with edge shifting
- debug layout model collection
- unit tests for layout primitives

## Design Choices

The layout package deals only in plain rectangles, sizes, and decisions. It does not measure text directly and does not render debug overlays yet. The debug model is a plain rectangle collection that renderers can later draw however they need.

Text measurement stays a renderer/platform concern for now. Renderers can pass measured label and legend sizes into core layout.

## Current Behavior

- Chart plot boxes clamp negative dimensions to zero.
- Auto padding adds max label dimensions by axis side and reserves legend space by position.
- Label collision currently chooses among `show`, `stagger`, `rotate`, `skip`, and `hide`.
- Legend layout wraps items horizontally within a max width.
- Tooltip placement prefers the requested side, flips when needed, and clamps to bounds.
- Debug layout models collect outer, plot, label, legend, and tooltip rectangles.

## Follow-Up Work

- Add edge label policy helpers.
- Add RTL-aware legend and label layout.
- Integrate scale ranges with chart boxes.

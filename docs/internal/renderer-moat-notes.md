# Renderer Moat Notes

## Current State

- SVG renderer has a small primitive surface: surface, group, path, rect, circle, text, line, defs, gradients, and clip rects.
- Line chart markers now support styled circle, square, and diamond dots through existing SVG primitives.
- The chart layer still owns marker rendering logic, so marker parity across future SVG and Skia renderers is not guaranteed yet.

## Recommended Next Renderer Work

1. Add a renderer-level marker/symbol primitive so dots, legend markers, active points, and scatter-like charts share one contract.
2. Add explicit render layers for background, grid, axes, data, overlays, interaction affordances, and debug layout.
3. Add renderer capability flags for gradients, shadows, clipping, text measurement quality, hit regions, and animation support.
4. Move clipping policy into renderer helpers so large paths, area fills, and markers can be clipped consistently per backend.
5. Add invisible hit-region primitives for touch targets without changing visual output.
6. Add measured text parity tests so SVG, web, and future Skia text produce predictable layout decisions.
7. Add visual pixel checks for blank canvas, clipped labels, clipped markers, and missing gradients.

## Product Moat

The renderer moat is not just "SVG vs Skia." It is whether every backend can render the same chart model with predictable layout, safe clipping, touchable elements, and useful visual tests. The strongest next slice is a shared marker primitive plus layer model, because it improves dots now and becomes the foundation for active dots, crosshair overlays, scatter, tooltips, and hit testing.

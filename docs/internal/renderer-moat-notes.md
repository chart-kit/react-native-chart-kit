# Renderer Moat Notes

## Current State

- SVG renderer has a small primitive surface: surface, group, layer, path, rect, circle, symbol, text, line, defs, gradients, and clip rects.
- Renderer-level symbols now support circle, square, diamond, and line markers.
- Line chart normal dots, active dots, and default legend markers now render through the same symbol primitive.
- SVG render layers are explicit: background, plot, grid, axes, data area, data, markers, overlays, interaction, and debug.
- SVG renderer exposes capability flags for animation, clip paths, gradients, hit regions, layers, shadows, symbols, test IDs, and text measurement quality.
- Layer and symbol geometry helpers are pure enough to unit test without loading native SVG components.

## Recommended Next Renderer Work

1. Move clipping policy into renderer helpers so large paths, area fills, and markers can be clipped consistently per backend.
2. Add invisible hit-region primitives for touch targets without changing visual output.
3. Add measured text parity tests so SVG, web, and future Skia text produce predictable layout decisions.
4. Add visual pixel checks for blank canvas, clipped labels, clipped markers, and missing gradients.
5. Add Skia parity notes once a second renderer exists.

## Product Moat

The renderer moat is not just "SVG vs Skia." It is whether every backend can render the same chart model with predictable layout, safe clipping, touchable elements, and useful visual tests. The shared symbol primitive plus layer model is now the foundation for dots, active dots, legend markers, crosshair overlays, scatter-like charts, tooltips, and future hit regions.

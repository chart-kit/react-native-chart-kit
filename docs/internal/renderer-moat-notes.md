# Renderer Moat Notes

## Current State

- SVG renderer has a small primitive surface: surface, group, layer, path, rect, circle, symbol, text, line, defs, gradients, and clip rects.
- Renderer-level symbols now support circle, square, diamond, and line markers.
- Line chart normal dots, active dots, and default legend markers now render through the same symbol primitive.
- SVG render layers are explicit: background, plot, grid, axes, data area, data, markers, overlays, interaction, and debug.
- SVG renderer exposes capability flags for animation, clip paths, gradients, hit regions, layers, shadows, symbols, test IDs, and text measurement quality.
- SVG clipping now has a pure policy helper that returns both the clip-path reference and the clip-rect model for backend consumers.
- SVG renderer includes an invisible hit-region primitive for future touch targets that should not change visual output.
- Layer and symbol geometry helpers are pure enough to unit test without loading native SVG components.

## Recommended Next Renderer Work

1. Add measured text parity tests so SVG, web, and future Skia text produce predictable layout decisions.
2. Add visual pixel checks for blank canvas, clipped labels, clipped markers, and missing gradients.
3. Add Skia parity notes once a second renderer exists.

## Product Moat

The renderer moat is not just "SVG vs Skia." It is whether every backend can render the same chart model with predictable layout, safe clipping, touchable elements, and useful visual tests. The shared symbol primitive plus layer model is now the foundation for dots, active dots, legend markers, crosshair overlays, scatter-like charts, tooltips, and future hit regions.

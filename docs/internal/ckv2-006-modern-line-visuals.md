# CKV2-006 Modern Line Visual Notes

Date: May 1, 2026

## Current State

CKV2-006 now has a visually reviewable modern Line/Area chart foundation.

Added:

- private experimental `@chart-kit/react-native` package implementation
- modern SVG `LineChart`
- modern SVG `AreaChart`
- Expo showcase fixtures for basic, multi-series, null gaps, area fill, dense labels, dark mode, label strategies, marker styles, custom legend, grid lines, and shared tooltip
- public Expo showcase Line Charts page grouped into showpieces, interaction, and composition demos
- visual regression story entries for the new v2 charts
- configurable typography and legend render hooks
- opt-in horizontal and vertical grid lines
- renderer-level marker primitive for line dots, active dots, and legend markers
- per-series stroke styles, dashed lines, custom area-fill gradients, threshold coloring, and reference overlays
- explicit SVG layer groups for background, plot, grid, axes, area, data, markers, overlays, and interaction
- controlled `selectedIndex` selection with crosshair, active markers, animated tooltips, and shared or single tooltip content
- scrollable charts, controlled viewport windows, touch pan, pinch zoom, and range selector overview

## Design Choices

The component is intentionally not exported from the legacy root package yet. It lives in the private modern package implementation so the API can be visually reviewed without changing the public migration surface.

The chart uses core normalization, scales, layout, and line-series geometry, then renders through the SVG renderer primitives.

Marker and selection option resolution moved into small pure helpers so marker precedence, active-dot defaults, crosshair opt-in behavior, tooltip bounds, and null-gap selection can be unit tested without a native render harness.

## Acceptance Progress

- single and multi-series rendering: implemented
- null/gap rendering: implemented and visually covered
- area fill rendering: implemented, configurable, and visually covered
- dashed and straight-line forecasts: implemented and visually covered
- threshold and reference overlays: implemented and unit covered
- label strategies: implemented for auto, skip, rotate, stagger, hide, and show
- marker styles: implemented through shared renderer symbols
- basic legend flexibility: implemented with sizing, spacing, alignment, render item, and render legend hooks
- tooltip and crosshair: implemented for controlled and opt-in tap/scrub selection state
- scroll, pan, pinch zoom, and range selector: implemented for controlled viewport workflows
- dark mode example: implemented
- unit coverage: added for marker config, crosshair/tooltip config, tooltip placement, and null-gap selection
- visual coverage: includes line showpieces, interaction states, viewport/range selector, dense labels, dark mode, and compatibility fixtures

## Developer Preview Status

Closed for Developer Preview.

- Modern charts are exposed through `@chart-kit/react-native`.
- The root compatibility package keeps the legacy `LineChart` path available.
- Line/area visual coverage includes showpieces, interactions, dense labels,
  viewport/range selector, dark mode, and compatibility fixtures.
- Owner smoke evidence covers the current Expo preview interaction behavior.

Further native release-build evidence is handled by the H6 release-claim
decision, not by CKV2-006.

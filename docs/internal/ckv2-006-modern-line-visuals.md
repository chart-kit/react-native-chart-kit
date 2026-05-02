# CKV2-006 Modern Line Visual Notes

Date: May 1, 2026

## Current State

CKV2-006 now has a visually reviewable modern Line/Area chart foundation.

Added:

- private experimental `@chart-kit/react-native` package implementation
- modern SVG `LineChart`
- modern SVG `AreaChart`
- Expo showcase fixtures for basic, multi-series, null gaps, area fill, dense labels, dark mode, label strategies, marker styles, custom legend, grid lines, and shared tooltip
- visual regression story entries for the new v2 charts
- configurable typography and legend render hooks
- opt-in horizontal and vertical grid lines
- renderer-level marker primitive for line dots, active dots, and legend markers
- explicit SVG layer groups for background, plot, grid, axes, area, data, markers, overlays, and interaction
- controlled `selectedIndex` selection with crosshair, active markers, and shared or single tooltip content

## Design Choices

The component is intentionally not exported from the legacy root package yet. It lives in the private modern package implementation so the API can be visually reviewed without changing the public migration surface.

The chart uses core normalization, scales, layout, and line-series geometry, then renders through the SVG renderer primitives.

Marker and selection option resolution moved into small pure helpers so marker precedence, active-dot defaults, crosshair opt-in behavior, tooltip bounds, and null-gap selection can be unit tested without a native render harness.

## Acceptance Progress

- single and multi-series rendering: implemented
- null/gap rendering: implemented and visually covered
- area fill rendering: implemented and visually covered
- label strategies: implemented for auto, skip, rotate, stagger, hide, and show
- marker styles: implemented through shared renderer symbols
- basic legend flexibility: implemented with sizing, spacing, alignment, render item, and render legend hooks
- tooltip and crosshair: implemented for controlled and opt-in tap/scrub selection state
- dark mode example: implemented
- unit coverage: added for marker config, crosshair/tooltip config, tooltip placement, and null-gap selection

## Remaining Before CKV2-006 Close

- Promote or rename the import path after API review.
- Add user-facing docs examples for the modern Line/Area API.
- Add legacy `LineChart` adapter work in the compatibility package slice.
- Continue CKV2-010 with richer gesture adapters and native conflict testing.

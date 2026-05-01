# CKV2-006 Modern Line Visual Notes

Date: May 1, 2026

## Current Slice

This slice adds the first visually reviewable v2 chart component.

Added:

- private experimental `@chart-kit/react-native-v2` package
- modern SVG `LineChart`
- modern SVG `AreaChart`
- Storybook fixtures for basic, multi-series, null gaps, area fill, dense labels, and dark mode
- visual regression story entries for the new v2 charts

## Design Choices

The component is intentionally not exported from the legacy root package yet. It uses a temporary private package name so the implementation can be visually reviewed without changing the public migration surface.

The chart uses core normalization, scales, layout, and line-series geometry, then renders through the SVG renderer primitives.

## Follow-Up Work

- Improve legend layout beyond the first compact top-row pass.
- Add tooltip and crosshair once the interaction layer starts.
- Promote or rename the import path after API review.

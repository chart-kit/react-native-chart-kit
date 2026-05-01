# CKV2-006 Line Series Geometry Notes

Date: May 1, 2026

## Current Slice

This slice adds projection from normalized cartesian series into renderer-ready line geometry.

Added:

- `buildLineSeriesGeometry`
- projected line point metadata
- scale function adapters for x and y projection
- optional area path generation from the same projected points
- tests for null gaps, `connectNulls`, multi-series missing values, time scale spacing, and area baselines

## Design Choices

The projection API accepts scale functions instead of concrete scale objects. This keeps it compatible with linear, time, point, band-center, and future custom scales without adding renderer or chart-component dependencies.

Missing values remain independent per series. A point is render-defined only when the normalized value is defined and both projected x/y positions are finite.

## Follow-Up Work

- Add convenience helpers for common scale object projection.
- Use this geometry in the first modern SVG `LineChart`.
- Add visual fixtures for null gaps and area fills after renderer integration.

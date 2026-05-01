# CKV2-006 Line and Area Geometry Notes

Date: May 1, 2026

## Current Slice

This slice starts CKV2-006 with renderer-agnostic line and area path generation in `packages/core`.

Added:

- line path generation
- area path generation
- null-gap segmentation
- `connectNulls`
- `linear`, `step`, and first-pass `monotone` curve handling
- stable numeric formatting for SVG paths
- unit tests for line gaps, leading/trailing nulls, area baselines, and path formatting

## Design Choices

This slice deliberately does not change public React Native chart components. The goal is to establish reusable geometry that SVG and future Skia renderers can consume.

`null` and invalid points split path segments by default. `connectNulls` skips missing points and connects the remaining defined points.

The monotone curve implementation uses deterministic cubic Hermite tangents and falls back to linear paths when x positions are not strictly increasing.

## Follow-Up Work

- Project normalized series through scales into geometry points.
- Integrate line and area geometry into modern SVG-rendered chart components.
- Add visual fixtures for null gaps and area fills once the modern component consumes this geometry.

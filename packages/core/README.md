# @chart-kit/core

Private scaffold for the Chart Kit v2 renderer-agnostic core.

This package will own:

- data normalization
- series models
- scales, domains, and ticks
- layout calculations
- geometry generation
- interaction math
- theme tokens
- accessibility summaries

Boundary rules:

- Do not import `react`, `react-native`, or `react-native-svg`.
- Keep functions deterministic and unit-testable.
- Return plain data models for renderers to consume.
- Add public API intentionally; current exports are the first data normalization primitives.

Current exports:

- `normalizeCartesianData`
- `normalizeLegacyLineData`
- `normalizeLegacyPieData`
- `normalizeLegacyProgressData`

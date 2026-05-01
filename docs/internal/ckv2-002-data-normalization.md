# CKV2-002 Data Normalization Notes

Date: May 1, 2026

## Current Slice

This slice adds the first renderer-agnostic data normalization primitives to `packages/core`.

Added:

- modern object-row cartesian normalization
- legacy line data normalization
- legacy pie data normalization
- legacy progress data normalization
- structured warning collection
- Vitest coverage for modern rows, null gaps, invalid values, unequal legacy line series, legacy pie data, and legacy progress data

## Design Choices

Normalization returns plain data models and does not import React, React Native, SVG, Skia, or app code.

Warnings are returned as data:

```ts
const result = normalizeCartesianData(input);
console.log(result.warnings);
```

Callers can also receive warnings immediately:

```ts
normalizeCartesianData(input, {
  onWarning: (warning) => {
    // dev-only console warning can happen at the adapter layer
  }
});
```

Core does not call `console.warn` directly. Compatibility adapters can decide when and how to surface warnings in development.

## Current Behavior

- `null` numeric values remain `null` and represent gaps.
- `undefined`, `NaN`, `Infinity`, and non-number y values normalize to `null` and emit warnings.
- Invalid x values fall back to the row index and emit warnings.
- Legacy line datasets are aligned to the longest dataset or label array.
- Legacy pie values must be finite and non-negative.
- Legacy progress values warn when outside `0..1`, but are preserved for now.

## Follow-Up Work

- Add stacked bar normalization.
- Add contribution graph/date normalization.
- Add explicit `connectNulls` handling when line geometry is introduced.
- Promote compatibility fixtures into `npm run test:compat`.
- Decide whether progress normalization should clamp values or leave clamping to renderers.

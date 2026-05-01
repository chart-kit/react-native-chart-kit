# CKV2-003 Scales And Domains Notes

Date: May 1, 2026

## Current Slice

This slice adds first-pass renderer-agnostic scale, domain, and tick primitives to `packages/core`.

Added:

- numeric domain resolution
- time domain resolution
- nice numeric domain expansion
- linear scale with inversion
- time scale with inversion
- band scale
- point scale
- linear tick generation
- time tick generation
- unit tests for explicit domains, include-zero domains, negative domains, irregular timestamps, categorical scales, and time ticks

## Design Choices

Scales are plain objects with deterministic functions:

```ts
const scale = createLinearScale({
  values: [10, 20, 30],
  range: [200, 0]
});

scale.scale(20);
scale.invert(100);
```

Core does not know about chart dimensions, SVG, Skia, React, or layout boxes yet. Later layout code will provide plot ranges.

## Follow-Up Work

- Add log scale if still in scope.
- Add duplicate formatted label avoidance.
- Add formatter helpers for numeric and time ticks.
- Integrate domains/ticks with layout and axis models.

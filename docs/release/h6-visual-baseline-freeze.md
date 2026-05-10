# H6 Visual Baseline Freeze

Status on May 10, 2026: proposed for owner review.

This document defines what "visual baseline freeze" means for H6. It does not
ask the owner to fill out long QA forms. The owner approves the visual direction;
automation protects the checked-in web baseline.

## Current Visual Baseline Surface

The checked-in baseline lives in:

- `apps/expo-showcase/visual/__screenshots__/`

Representative covered surfaces include:

- legacy compatibility: line, bar, stacked bar
- modern line/area: basic, multi-series, null gaps, labels, dots, references,
  thresholds, tooltip, range selector, viewport pan/zoom, custom legend, dark
  mode
- modern bar: basic, grouped, stacked, selection, scrollable, animation,
  horizontal, negative
- radial charts: pie, donut, progress
- contribution heatmap
- combined chart
- candlestick and financial preview

## Freeze Criteria

Before H6 approval:

- owner accepts the current default visual direction for stable claims
- financial charts are either approved as preview or removed from stable claims
- Pro-candidate visuals remain labeled as preview
- theme, tooltip, legend, marker, and selection defaults are accepted
- no visual snapshot update is made after freeze without owner approval

## Verification Commands

Visual freeze requires:

```sh
npm run test:visual
npm run test:e2e
```

For release prep, these commands should be run before H6 approval or rerun in CI
on the H6 candidate commit.

## Owner Decision

H6 should record one explicit visual decision:

```text
Visual baseline freeze approved.
```

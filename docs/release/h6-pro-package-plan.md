# H6 Pro Package Plan

Status on May 10, 2026: proposed for owner review.

This plan keeps the stable free release clean while preserving future Pro
optionality.

## Recommended H6 Decision

Do not publish `@chart-kit/pro` or `@chart-kit/skia-renderer` as stable packages
for H6.

For the stable free release:

- publish `react-native-chart-kit`
- publish `@chart-kit/core`
- publish `@chart-kit/svg-renderer`
- publish `@chart-kit/react-native`
- keep `@chart-kit/pro` unpublished
- keep `@chart-kit/skia-renderer` unpublished

## Rationale

The H4-approved boundary says Pro should focus on production layout depth,
production interactions, commercial chart types, export, premium templates, and
performance. The current repo has useful Pro-candidate foundations, but not a
finished paid package, license policy, support policy, or pricing/publication
plan.

Publishing Pro too early would blur the free/stable promise and make future paid
positioning harder. Keeping it unpublished avoids accidental commitments while
letting the showcase and docs continue to label advanced work as preview or
Pro-candidate.

## Stable Release Wording

Stable release notes should say:

- Pro is planned separately.
- Skia remains an optional preview renderer boundary.
- Financial charts and advanced interaction workflows remain preview or
  Pro-candidate unless explicitly promoted before H6.

Stable release notes should not say:

- Pro is available.
- Skia is part of the stable free install path.
- financial charts are fully stable production APIs.

## Owner Decision

H6 should record one explicit Pro/package decision:

```text
Pro and Skia package plan approved: keep @chart-kit/pro and @chart-kit/skia-renderer unpublished for stable H6; label advanced workflows as preview or Pro-candidate.
```

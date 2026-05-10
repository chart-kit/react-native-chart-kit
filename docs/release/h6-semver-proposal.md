# H6 Semver Proposal

Status on May 10, 2026: proposed for owner review.

## Recommended Stable Versions

Use one aligned stable version for the free v2 release train:

- `react-native-chart-kit@7.0.0`
- `@chart-kit/core@7.0.0`
- `@chart-kit/svg-renderer@7.0.0`
- `@chart-kit/react-native@7.0.0`

Keep these unpublished as stable packages until a separate paid/optional package
plan is approved:

- `@chart-kit/pro`
- `@chart-kit/skia-renderer`

## Rationale

`react-native-chart-kit` should use the existing package lineage and move from
the current `6.x` line to `7.0.0` because v2 changes the architecture,
rendering model, public API surface, layout defaults, and package structure.

The scoped packages should align at `7.0.0` for the first stable release so
support, docs, and package compatibility are easy to reason about. A separate
versioning policy can be introduced later if the scoped packages begin shipping
on different cadences.

## Dist Tags

Recommended stable publish tags:

- publish stable free packages under `latest`
- keep future preview releases under `next`
- do not move `@chart-kit/pro` or `@chart-kit/skia-renderer` to `latest` until
  the owner approves their stable package plan

## Owner Decision

H6 should record one explicit semver decision:

```text
Final semver approved: stable free package train is 7.0.0; Pro and Skia remain unpublished as stable packages.
```

# H6 Docs Freeze

Status on May 11, 2026: proposed for owner review.

This document defines what "docs freeze" means for H6. It is intentionally
short: the owner approves the docs direction, while automated checks verify
links, code fences, and typed examples.

## Docs Included In Freeze

Core docs:

- [Docs README](../README.md)
- [Installation](../getting-started/installation.md)
- [Line and area](../charts/line-and-area.md)
- [Bar](../charts/bar.md)
- [Pie and donut](../charts/pie-and-donut.md)
- [Progress](../charts/progress.md)
- [Contribution heatmap](../charts/contribution-heatmap.md)
- [Combined](../charts/combined.md)
- [Candlestick](../charts/candlestick.md)
- [Themes](../charts/themes.md)
- [Accessibility](../charts/accessibility.md)
- [Recipes](../recipes/README.md)

Migration docs:

- [From v1](../migration/from-v1.md)
- [Prop mapping](../migration/prop-mapping.md)

Release docs:

- [Known issues](known-issues.md)
- [Deprecation policy](deprecation-policy.md)
- [H6 semver proposal](h6-semver-proposal.md)
- [H6 release notes draft](h6-release-notes-draft.md)
- [H6 finalization checklist](h6-finalization-checklist.md)
- [H6 release claims](h6-release-claims.md)
- GitHub issue templates in `.github/ISSUE_TEMPLATE/`

## Freeze Criteria

Before H6 approval:

- installation instructions match the final package list and dist-tags
- migration docs match the compatibility facade behavior
- Pro/preview language matches the H4-approved package boundary
- known issues match the exact stable-release claims
- stable release notes do not overclaim native performance, native accessibility,
  Pro, Skia, or financial chart stability
- support issue templates match the support workflow promised in release notes
- high/critical security audit status is current or clearly disclosed if it
  changes before H6
- public examples compile or are covered by docs tests

## Verification Command

Docs freeze requires:

```sh
npm run docs:build
```

Current latest checked result: docs build passed for 121 markdown files, 104
JS/TS code fences, and 61 public TS/TSX fences.

## Owner Decision

H6 should record one explicit docs decision:

```text
Docs freeze approved.
```

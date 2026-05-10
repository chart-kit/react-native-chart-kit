# H6 Finalization Checklist

Status on May 10, 2026: proposed for owner review.

Use this checklist only when moving from Developer Preview to release
candidate. It is not required for another `next` prerelease.

## Release Candidate Approval

Before H6 approval:

- RC timing is explicitly approved by the owner
- owner explicitly chooses to move from Developer Preview toward a release
  candidate
- smoke-test risk summary is accepted
- remaining known gaps are either resolved or accepted as release caveats
- `npm run release:gate:report` has no blocker other than H6 owner approval

Owner must approve release-candidate timing before H6.

## Final Semver

Recommended default:

- `react-native-chart-kit`: `7.0.0` for stable v2 compatibility package
- `@chart-kit/react-native`: align with the same stable release train unless
  the owner chooses a separate modern-package versioning policy
- `@chart-kit/core` and `@chart-kit/svg-renderer`: align with the same stable
  release train
- `@chart-kit/pro` and `@chart-kit/skia-renderer`: keep unpublished or preview
  until the owner approves a stable paid/optional package plan

Owner must approve the final version numbers before H6.

Detailed proposal: [H6 Semver Proposal](h6-semver-proposal.md).

## Final Changelog

Before H6 approval:

- convert the current `next` changelog entries into final release notes
- keep Developer Preview publish notes separate from stable release notes
- call out compatibility support and changed layout behavior plainly
- call out preview/Pro-candidate APIs that are not stable commitments
- disclose known native/accessibility/performance caveats that remain true

Owner must approve the final changelog wording before H6.

Draft notes: [Chart Kit v2 Stable Release Notes Draft](h6-release-notes-draft.md).

## Docs Freeze

Before H6 approval:

- install docs match the final package list
- migration guide and prop mapping match the compatibility facade
- Pro-preview labels match the approved H4 boundary
- known issues match the final release claims
- `npm run docs:build` passes

Owner must approve docs freeze before H6.

Detailed proposal: [H6 Docs Freeze](h6-docs-freeze.md).

## Visual Baseline Freeze

Before H6 approval:

- line and area chart defaults are approved
- bar chart defaults are approved
- pie/donut/progress/heatmap defaults are approved
- dark/light mode and preset behavior are approved
- tooltip, legend, and selection defaults are approved
- financial preview is either approved as preview or removed from stable claims
- visual regression baselines are updated only after owner approval

Owner must approve visual baseline freeze before H6.

Detailed proposal: [H6 Visual Baseline Freeze](h6-visual-baseline-freeze.md).

## Deprecation Policy

Before H6 approval:

- common v1 component names and data shapes remain documented
- deprecated or behavior-changing props have documented migration guidance
- undocumented internals, SVG node order, and old layout bugs remain outside the
  compatibility promise
- `compatibility="v1"` and legacy-like props are documented only where they
  exist

Owner must approve the deprecation policy before H6.

Detailed proposal: [Deprecation Policy](deprecation-policy.md).

## Pro And Skia Package Plan

Before H6 approval:

- Pro and Skia either remain unpublished or get an explicitly approved stable
  package plan
- advanced workflows remain labeled as preview or Pro-candidate unless promoted
- no runtime license enforcement is added before the paid-package plan is final

Owner must approve the Pro and Skia package plan before H6.

Detailed proposal: [H6 Pro Package Plan](h6-pro-package-plan.md).

## Release Claims

Before H6 approval:

- stable wording does not overclaim physical Android, TalkBack, Pro, Skia,
  financial-chart, or native release-device performance evidence
- Developer Preview caveats are either resolved or carried into known issues
- release notes match the approved final claims

Owner must approve release claims before H6.

Detailed proposal: [H6 Release Claims](h6-release-claims.md).

## H6 Approval

After the above decisions are approved, run:

```sh
npm run release:owner:record -- \
  --gate h6 \
  --approved-by owner \
  --approved-at 2026-05-10 \
  --decision "Release candidate approved." \
  --decision "Final semver approved." \
  --decision "Final changelog approved." \
  --decision "Docs freeze approved." \
  --decision "Visual baseline freeze approved." \
  --decision "Deprecation policy approved." \
  --decision "Pro and Skia package plan approved." \
  --decision "Release claims approved."
```

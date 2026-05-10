# H6 Finalization Checklist

Status on May 10, 2026: proposed for owner review.

Use this checklist only when moving from Developer Preview to release
candidate. It is not required for another `next` prerelease.

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

## Final Changelog

Before H6 approval:

- convert the current `next` changelog entries into final release notes
- keep Developer Preview publish notes separate from stable release notes
- call out compatibility support and changed layout behavior plainly
- call out preview/Pro-candidate APIs that are not stable commitments
- disclose known native/accessibility/performance caveats that remain true

Owner must approve the final changelog wording before H6.

## Docs Freeze

Before H6 approval:

- install docs match the final package list
- migration guide and prop mapping match the compatibility facade
- Pro-preview labels match the approved H4 boundary
- known issues match the final release claims
- `npm run docs:build` passes

Owner must approve docs freeze before H6.

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
  --decision "Deprecation policy approved."
```

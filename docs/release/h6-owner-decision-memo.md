# H6 Owner Decision Memo

This memo converts the release-candidate gate into explicit choices. It is a recommendation, not approval.

## Recommended Decision

Do not approve a release candidate yet.

Reason: H6 requires final semver, release notes, docs freeze, visual baseline freeze, deprecation policy, owner approval, and complete native QA evidence. The repository is prepared for review, the native release workflow is green, and the Skia matrix is complete, but the release gate still blocks on owner approval plus native runtime, accessibility, and performance evidence.

## Decision 1: RC Timing

Recommendation: keep H6 `not-started` until all remaining native evidence manifests are complete.

Required before RC:

- completed native runtime QA matrix
- completed native accessibility QA matrix
- completed native performance matrix
- owner-approved native QA target policy
- final semver, changelog, docs freeze, visual baseline freeze, and deprecation policy decisions

## Decision 2: Final Semver

Recommendation: use the existing package lineage for the compatibility package and keep product wording separate from npm semver.

Suggested default:

- `react-native-chart-kit`: next major, likely `7.0.0`
- `@chart-kit/react-native`: first public modern package version aligned with the release plan
- `@chart-kit/pro` and `@chart-kit/skia-renderer`: do not publish as paid/stable packages until H4 approves final scope

## Decision 3: Docs Freeze

Recommendation: freeze docs only after:

- install docs match the final package list
- Pro-preview labels match the approved H4 boundary
- migration docs match the compatibility facade behavior
- native caveats are either resolved or explicitly listed as known issues
- every public code fence passes `npm run docs:build`

## Decision 4: Visual Baseline Freeze

Recommendation: freeze the visual baseline only after owner approval of:

- line/area defaults
- bar chart defaults
- radial chart defaults
- dark/light and preset behavior
- tooltip and legend defaults
- financial preview visibility

The web visual suite is useful evidence, but RC should not treat it as a substitute for native runtime review.

## Decision 5: Deprecation Policy

Recommendation:

- keep common v1 component names working through the compatibility facade
- warn for deprecated or behavior-changing props in development where practical
- do not preserve undocumented internals, SVG node order, or old layout bugs
- document `compatibility="v1"` and explicit legacy-like props only where they exist

## Recommended H6 Outcome

Keep H6 blocked until the release gate has no blockers.

Record approval only after the owner accepts or edits these decisions and the gate is green:

The recorder enforces H6 prerequisites: H4 and H5 must already be approved, and native workflow, RN CLI example, native runtime, native accessibility, native performance, and Skia evidence manifests must be complete. The currently open evidence work is native runtime, accessibility, and performance.

Use [native QA target policy](native-qa-target-policy.md), [native QA signoff worksheet](native-qa-signoff-worksheet.md), or `npm run release:qa:status -- --status partial --details` to run the remaining row checks. Do not record H6 approval until those rows have reviewer/device/build metadata and the strict release gate is green.

```sh
npm run release:owner:record -- \
  --gate h6 \
  --approved-by <owner> \
  --approved-at <yyyy-mm-dd> \
  --decision "Release candidate approved." \
  --decision "Final semver approved." \
  --decision "Final changelog approved." \
  --decision "Docs freeze approved." \
  --decision "Visual baseline freeze approved." \
  --decision "Deprecation policy approved." \
  --decision "Native QA target policy approved."
```

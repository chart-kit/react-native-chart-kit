# H6 Owner Decision Memo

This memo converts the release-candidate gate into explicit choices. It is a recommendation, not approval.

## Recommended Decision

Do not approve a stable release candidate yet.

Reason: H6 still needs final semver, release notes, docs freeze, visual baseline freeze, deprecation policy, and owner approval. Developer Preview is acceptable with disclosed gaps.

## Owner Review Scope

The owner is not assigned long QA sessions, row-by-row checklists, or evidence reports.

Owner approval should be short and product-focused:

- call out any blockers
- approve, reject, or request targeted follow-up
- give feedback in conversation; release engineering or an agent records any useful notes

There is no active matrix signoff path. Stable RC should use concise pass/fail smoke results and release-risk notes.

## Decision 1: RC Timing

Recommendation: keep H6 `not-started` until final release decisions are made.

Required before stable RC:

- smoke-test risk summary accepted
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

Detailed proposal: [Deprecation Policy](deprecation-policy.md).

## Recommended H6 Outcome

Keep H6 blocked until the release gate has no blockers.

The recorder enforces H6 prerequisites: H4 and H5 must already be approved, and native workflow, RN CLI example, and Skia evidence manifests must be complete.

Use [Smoke Test Checks](smoke-test-checks.md) for release-risk summary. Do not reintroduce row-by-row matrix completion as an approval requirement.

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
  --decision "Deprecation policy approved."
```

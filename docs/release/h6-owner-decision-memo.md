# H6 Owner Decision Memo

This memo converts the release-candidate gate into explicit choices. It is a recommendation, not approval.

## Recommended Decision

Do not approve a stable release candidate yet.

Reason: H6 still needs final semver, release notes, docs freeze, visual baseline freeze, deprecation policy, owner approval, and engineering-owned native QA evidence. Developer Preview is acceptable with disclosed gaps; stable RC should wait for summarized native runtime, accessibility, and performance evidence.

## Owner Review Scope

The owner is not assigned long QA sessions, row-by-row checklists, or evidence reports.

Owner approval should be short and product-focused:

- confirm the preview surface reviewed
- call out any blockers
- approve, reject, or request targeted follow-up

The detailed native QA matrix is for release engineering or agents. It should feed a concise risk summary for the owner, not become owner homework.

## Decision 1: RC Timing

Recommendation: keep H6 `not-started` until the remaining evidence is complete or explicitly waived for a non-stable release type.

Required before stable RC:

- engineering-owned native runtime QA summary
- engineering-owned native accessibility QA summary
- engineering-owned native performance summary
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

The recorder enforces H6 prerequisites: H4 and H5 must already be approved, and native workflow, RN CLI example, native runtime, native accessibility, native performance, and Skia evidence manifests must be complete. The currently open evidence work is native runtime, accessibility, and performance.

Use [native QA target policy](native-qa-target-policy.md), [native QA evidence backlog](native-qa-signoff-worksheet.md), or `npm run release:qa:status -- --status partial --details` when a release engineer or agent is collecting the remaining evidence. The owner should approve based on the resulting summary and known risks.

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

# H6 Owner Decision Memo

This memo converts the release-candidate gate into explicit choices. It is a recommendation, not approval.

## Recommended Decision

Do not approve a stable release candidate yet.

Reason: H6 still needs release candidate timing, final semver, release notes,
docs freeze, visual baseline freeze, deprecation policy, Pro/Skia package plan,
release claims, and owner approval. Developer Preview is acceptable with
disclosed gaps.

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
- final semver, changelog, docs freeze, visual baseline freeze, deprecation
  policy, Pro/Skia package plan, and release claims decisions

## Decision 2: Final Semver

Recommendation: use the existing package lineage for the compatibility package and keep product wording separate from npm semver.

Suggested default:

- `react-native-chart-kit`: next major, likely `7.0.0`
- `@chart-kit/react-native`: first public modern package version aligned with the release plan
- `@chart-kit/pro` and `@chart-kit/skia-renderer`: do not publish as
  paid/stable packages until the owner explicitly approves their stable package
  plan

Detailed proposal: [H6 Semver Proposal](h6-semver-proposal.md).

## Decision 3: Final Changelog

Recommendation: approve final changelog wording only after:

- current `next` release notes are converted into stable-release wording
- Developer Preview publish notes stay separate from stable release notes
- compatibility support and intentional behavior changes are plain
- preview and Pro-candidate APIs are labeled clearly
- remaining native, accessibility, and performance caveats match the final
  release claims

Draft wording: [Chart Kit v2 Stable Release Notes Draft](h6-release-notes-draft.md).

## Decision 4: Docs Freeze

Recommendation: freeze docs only after:

- install docs match the final package list
- Pro-preview labels match the approved H4 boundary
- migration docs match the compatibility facade behavior
- native caveats are either resolved or explicitly listed as known issues
- every public code fence passes `npm run docs:build`

## Decision 5: Visual Baseline Freeze

Recommendation: freeze the visual baseline only after owner approval of:

- line/area defaults
- bar chart defaults
- radial chart defaults
- dark/light and preset behavior
- tooltip and legend defaults
- financial preview visibility

The web visual suite is useful evidence, but RC should not treat it as a substitute for native runtime review.

## Decision 6: Deprecation Policy

Recommendation:

- keep common v1 component names working through the compatibility facade
- warn for deprecated or behavior-changing props in development where practical
- do not preserve undocumented internals, SVG node order, or old layout bugs
- document `compatibility="v1"` and explicit legacy-like props only where they exist

Detailed proposal: [Deprecation Policy](deprecation-policy.md).

## Decision 7: Pro And Skia Package Plan

Recommendation:

- keep Pro and Skia unpublished for stable v2 unless the owner explicitly
  approves a separate paid/optional package release
- keep Pro-candidate and Skia work documented as preview capability, not a
  stable public commitment
- do not add runtime license enforcement before the paid package plan is
  finalized

Detailed proposal: [H6 Pro Package Plan](h6-pro-package-plan.md).

## Decision 8: Release Claims

Recommendation:

- call this release a Developer Preview until H6 is approved
- do not claim stable physical Android, TalkBack, Pro, Skia, or financial-chart
  readiness beyond the evidence that exists
- keep native/accessibility/performance caveats in known issues unless they are
  resolved before stable RC

Detailed proposal: [H6 Release Claims](h6-release-claims.md).

## Recommended H6 Outcome

Keep H6 blocked until the owner explicitly approves all eight H6 decisions.

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
  --decision "Deprecation policy approved." \
  --decision "Pro and Skia package plan approved." \
  --decision "Release claims approved."
```

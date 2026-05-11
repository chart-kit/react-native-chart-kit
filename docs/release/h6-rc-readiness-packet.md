# H6 RC Readiness Packet

Status on May 11, 2026: H6 is ready for an owner decision, but not approved.

This packet is intentionally short. It replaces long QA matrices with release
risk notes, current gate output, and explicit owner choices.

## Current Gate State

Developer Preview is green with one expected local-prep warning:

```sh
npm run release:preview:gate
```

Latest checked state: `pass=114 warn=1 block=0 fail=0`.

Stable RC is blocked only by H6 owner approval:

```sh
npm run release:gate:report
```

Latest checked state: `pass=114 warn=1 block=1 fail=0`.

Remaining blocker:

- H6 release-candidate approval is not started.

H6 approval dry-run:

```sh
npm run release:owner:record -- --dry-run --gate h6 ...
```

Latest checked state: passes with `Would approve h6 in
docs/release/evidence/owner-gates.json.`

That means H4, H5, native workflow evidence, RN CLI evidence, Skia evidence, and
the required eight decision labels are structurally ready. The missing action is
actual owner approval, not another matrix or evidence task.

The old native runtime, accessibility, and performance matrix summaries are
archived historical evidence, not active H6 blockers.

## Current Product State

Ready for Developer Preview:

- published `next` preview packages are documented in
  [npm-publish-evidence.json](evidence/npm-publish-evidence.json)
- Pro and Skia packages remain unpublished by design
- compatibility package path exists through `react-native-chart-kit`
- modern package path exists through `@chart-kit/react-native`
- Expo showcase has been smoke-tested by the owner on iOS device, iOS
  VoiceOver, Android emulator, and web
- automated release, docs, pack, typecheck, lint, unit, compatibility, visual,
  e2e, and benchmark commands are wired into the repo
- release-hardening checks cover required package scripts, issue templates,
  package publish status, pack checks, and high/critical security audit gating

Still intentionally deferred for stable RC:

- final semver decision
- final changelog approval
- docs freeze
- visual baseline freeze
- [deprecation policy](deprecation-policy.md) approval
- Pro package timing/licensing decision
- exact native claims for stable release wording

Detailed finalization checklist:
[H6 Finalization Checklist](h6-finalization-checklist.md).

Concrete drafts:

- [H6 Semver Proposal](h6-semver-proposal.md)
- [Chart Kit v2 Stable Release Notes Draft](h6-release-notes-draft.md)
- [H6 Docs Freeze](h6-docs-freeze.md)
- [H6 Visual Baseline Freeze](h6-visual-baseline-freeze.md)
- [H6 Pro Package Plan](h6-pro-package-plan.md)
- [H6 Release Claims](h6-release-claims.md)

## Recommended Decision

Do not approve stable RC yet unless the owner wants to make final release
decisions now.

Recommended next step:

- continue shipping Developer Preview updates on the `next` dist-tag
- keep `@chart-kit/pro` and `@chart-kit/skia-renderer` unpublished
- use smoke-test notes and release-risk notes instead of QA matrices

## Owner Decisions Needed For H6

To approve H6, the owner must explicitly approve:

- release candidate timing
- final semver
- final changelog
- docs freeze
- visual baseline freeze
- deprecation policy
- Pro and Skia package plan
- release claims

If any of those are not approved, H6 should remain blocked and the project
should continue as Developer Preview.

## Approval Command

Only run this when the owner has explicitly approved H6:

```sh
npm run release:owner:record -- \
  --gate h6 \
  --approved-by owner \
  --approved-at 2026-05-11 \
  --decision "Release candidate approved." \
  --decision "Final semver approved." \
  --decision "Final changelog approved." \
  --decision "Docs freeze approved." \
  --decision "Visual baseline freeze approved." \
  --decision "Deprecation policy approved." \
  --decision "Pro and Skia package plan approved." \
  --decision "Release claims approved."
```

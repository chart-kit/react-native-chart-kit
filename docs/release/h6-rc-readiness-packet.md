# H6 RC Readiness Packet

Status on May 10, 2026: H6 is ready for an owner decision, but not approved.

This packet is intentionally short. It replaces long QA matrices with release
risk notes, current gate output, and explicit owner choices.

## Current Gate State

Developer Preview is green with one expected local-prep warning:

```sh
npm run release:preview:gate
```

Latest checked state: `pass=97 warn=1 block=0 fail=0`.

Stable RC is blocked only by H6 owner approval:

```sh
npm run release:gate:report
```

Latest checked state: `pass=97 warn=1 block=1 fail=0`.

Remaining blocker:

- H6 release-candidate approval is not started.

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

Still intentionally deferred for stable RC:

- final semver decision
- final changelog approval
- docs freeze
- visual baseline freeze
- [deprecation policy](deprecation-policy.md) approval
- Pro package timing/licensing decision
- exact native claims for stable release wording

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

If any of those are not approved, H6 should remain blocked and the project
should continue as Developer Preview.

## Approval Command

Only run this when the owner has explicitly approved H6:

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

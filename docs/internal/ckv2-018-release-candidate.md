# CKV2-018 Release Candidate

Status on May 10, 2026: prepared, not complete.

CKV2-018 is the stable release-candidate milestone from the original v2/v2 Pro
plan. It is separate from Developer Preview publishing.

## Objective

Prepare the stable RC decision packet, final release notes, package boundary,
and release evidence so the owner can explicitly approve or defer the release
candidate.

## Prepared Artifacts

- [H6 RC readiness packet](../release/h6-rc-readiness-packet.md)
- [H6 finalization checklist](../release/h6-finalization-checklist.md)
- [H6 semver proposal](../release/h6-semver-proposal.md)
- [H6 release notes draft](../release/h6-release-notes-draft.md)
- [H6 docs freeze](../release/h6-docs-freeze.md)
- [H6 visual baseline freeze](../release/h6-visual-baseline-freeze.md)
- [Deprecation policy](../release/deprecation-policy.md)
- [H6 Pro package plan](../release/h6-pro-package-plan.md)
- [H6 release claims](../release/h6-release-claims.md)

## Current Verification

Developer Preview verification is current in
[completion-audit.md](completion-audit.md). The strict stable gate remains open:

```sh
npm run release:gate:report
```

Current expected result:

- `pass=106 warn=1 block=1 fail=0`
- the only blocker is `blocker:h6-owner-approval`

## Remaining Work

H6 requires explicit owner decisions for:

- release candidate approval
- final semver
- final changelog
- docs freeze
- visual baseline freeze
- deprecation policy
- Pro and Skia package plan
- release claims

Do not mark CKV2-018 complete until `npm run release:gate` passes and H6 is
recorded as approved in [owner-gates.json](../release/evidence/owner-gates.json).

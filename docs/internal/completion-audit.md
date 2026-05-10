# Chart Kit V2 Completion Audit

Status on May 10, 2026: Developer Preview is complete; stable RC is not complete.

This audit intentionally separates preview readiness from stable-release readiness. Native QA matrices are no longer part of the active completion path.

## Developer Preview Complete

The current repository is ready for Developer Preview when these checks pass:

- automated tests, docs, visual, benchmark, build, and pack checks
- publish manifest limits publishing to free packages
- Pro and Skia packages remain unpublished
- Expo showcase smoke review works on available preview surfaces
- known gaps stay disclosed

Current source version: `7.0.0-next.1`.

Latest published Developer Preview: `7.0.0-next.0`.

The preview gate currently reports one non-blocking warning because local source
prep is ahead of published npm evidence. That warning should clear after the
next approved `next` publish succeeds and `npm-publish-evidence.json` is
updated.

`npm run release:publish:status -- --strict` currently reports `partial` for
`7.0.0-next.1`: the four free publishable packages are not published yet, while
`@chart-kit/pro` and `@chart-kit/skia-renderer` remain unpublished as intended.
Do not publish the next Developer Preview without owner approval.

H6 approval dry-run currently passes with all eight required decision labels.
The stable-RC blocker is therefore explicit owner approval, not missing
prerequisite evidence.

Current smoke evidence:

- [owner-smoke-notes-2026-05-10.md](../release/artifacts/owner-smoke-notes-2026-05-10.md)
- iOS physical Expo preview passed
- iOS VoiceOver Expo preview passed
- Android emulator Expo preview passed

Current known gaps:

- no physical Android device pass
- no TalkBack pass
- no owner-run non-Expo native release-build pass
- `@chart-kit/pro` remains a preview registry/composition package

## Covered Implementation Areas

- repo audit and compatibility inventory
- monorepo foundation
- core data model, scales, layout, geometry, themes, and accessibility helpers
- SVG renderer
- modern React Native chart package
- compatibility root package path
- line/area, bar/stacked bar, pie/donut, progress, contribution, combined, and candlestick previews
- Expo showcase, visual tests, e2e tests, docs, migration guide, recipes, codemod
- package publish manifest and Developer Preview publish workflow
- H4 Pro/free boundary and H5 Developer Preview approval
- H6 readiness packet and proposed H6 decision artifacts

## Stable RC Still Open

Stable RC is a separate decision and should not block Developer Preview.

Remaining RC decisions:

- release candidate approval
- final semver
- final changelog
- docs freeze
- visual baseline freeze
- deprecation policy approval
- Pro and Skia package plan
- release claims

Draft decision artifacts exist for each of those topics:

- [H6 RC readiness packet](../release/h6-rc-readiness-packet.md)
- [H6 finalization checklist](../release/h6-finalization-checklist.md)
- [H6 semver proposal](../release/h6-semver-proposal.md)
- [H6 release notes draft](../release/h6-release-notes-draft.md)
- [H6 docs freeze](../release/h6-docs-freeze.md)
- [H6 visual baseline freeze](../release/h6-visual-baseline-freeze.md)
- [Deprecation policy](../release/deprecation-policy.md)
- [H6 Pro package plan](../release/h6-pro-package-plan.md)
- [H6 release claims](../release/h6-release-claims.md)

The remaining blocker is explicit owner approval, not missing decision prep.

## Simplified Completion Rule

Developer Preview is complete when `npm run release:preview:gate` passes.

Stable RC is complete when `npm run release:gate` passes and H6 is approved.

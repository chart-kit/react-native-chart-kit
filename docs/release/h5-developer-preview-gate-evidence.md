# H5 Developer Preview Evidence

Status on May 10, 2026: H5 is approved for Developer Preview publishing from free packages only. This is not a production release, stable release, or release candidate.

## Active Evidence

- automated checks: lint, typecheck, unit/compat tests, web e2e, visual tests, benchmark, docs build, package build, pack check
- Expo showcase: reviewed on iOS physical device, iOS VoiceOver, Android emulator, and web preview
- smoke notes: [owner-smoke-notes-2026-05-10.md](artifacts/owner-smoke-notes-2026-05-10.md)
- native release workflow: [native-release-workflow.json](evidence/native-release-workflow.json)
- RN CLI smoke evidence: [rn-cli-example-evidence.json](evidence/rn-cli-example-evidence.json)
- npm publish evidence for `7.0.0-next.0`: [npm-publish-evidence.json](evidence/npm-publish-evidence.json)
- package manifest: [package-manifest.json](evidence/package-manifest.json)

## Package Boundary

Developer Preview publishes:

- `react-native-chart-kit`
- `@chart-kit/core`
- `@chart-kit/svg-renderer`
- `@chart-kit/react-native`

Developer Preview does not publish:

- `@chart-kit/pro`
- `@chart-kit/skia-renderer`

## Current Gaps

These are acceptable for Developer Preview when disclosed:

- no physical Android device pass
- no TalkBack pass
- no owner-run non-Expo native release-build pass
- Pro is still a preview boundary, not a paid product
- Skia remains unpublished

## Removed From H5

Native runtime, accessibility, and performance matrices are no longer H5 evidence or owner-facing tasks. Use [Smoke Test Checks](smoke-test-checks.md) instead.

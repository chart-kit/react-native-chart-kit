# H6 Release Claims

Status on May 10, 2026: proposed for owner review.

This document constrains stable-release wording so the release does not overclaim
native, accessibility, performance, Pro, Skia, or financial-chart readiness.

## Claims Approved For Developer Preview

These claims are currently supported by evidence:

- web showcase visual and interaction flows are covered by Playwright
- Expo showcase works for owner smoke review on iOS physical device
- Expo showcase works for owner smoke review on Android emulator
- iOS VoiceOver smoke review in Expo preview passed
- generated accessibility summaries and data table helpers are covered by unit
  tests
- RN CLI example import/typecheck and generated release-build smoke evidence
  exist
- native release workflow evidence exists for the configured CI workflow
- package pack checks cover all packages in the release manifest

## Claims To Avoid Unless New Evidence Is Added

Do not claim the stable release has:

- completed physical Android-device QA
- completed TalkBack review
- owner-run non-Expo native release-build review
- guaranteed native release-device performance targets
- stable Pro package availability
- stable Skia package availability
- stable financial chart API guarantees

## Recommended Stable Claim

Recommended wording:

> Chart Kit v2 is ready as a stable free chart foundation with a compatibility
> path, modern typed APIs, SVG rendering, improved layout, chart families,
> themes, docs, examples, and automated web/package verification. Advanced Pro,
> Skia, financial, and large-data workflows remain preview or Pro-candidate.

## Owner Decision

H6 should record one explicit release-claims decision:

```text
Release claims approved: stable release wording must not overclaim Pro, Skia, financial charts, physical Android, TalkBack, or native release-device performance.
```

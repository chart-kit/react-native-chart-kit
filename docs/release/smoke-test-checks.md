# Smoke Test Checks

This is the active release-review path for Developer Preview.

Do not use row-by-row QA matrices for preview approval. A quick real check is better than a large checklist that nobody should have to maintain.

## Preview Pass Criteria

- Expo preview opens.
- Main chart pages render.
- Theme switching works.
- Representative interactions work: tap, scrub, pan, zoom/range where available.
- No red screen or obvious broken layout.
- Known gaps are disclosed.

## Current Smoke Evidence

Current owner-reported smoke notes are in [owner-smoke-notes-2026-05-10.md](artifacts/owner-smoke-notes-2026-05-10.md).

Covered there:

- iOS physical device Expo preview
- iOS VoiceOver in Expo preview
- Android emulator Expo preview

## Still Worth Disclosing

- no physical Android device pass
- no TalkBack pass
- no non-Expo native release-build manual pass by the owner
- Pro and Skia packages remain unpublished for Developer Preview

## Stable RC

Stable RC can still require more evidence, but it should be summarized as pass/fail smoke results and release risks. Do not reintroduce long owner checklists or matrix completion as the default path.

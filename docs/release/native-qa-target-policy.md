# Native QA Target Policy

Status on May 10, 2026: owner review scope updated. This policy defines native QA targets without assigning long manual QA sessions or report-writing to the owner.

## Owner Review Scope

The owner is not expected to run row-by-row QA, fill long reports, or attach evidence for every matrix row.

Owner review is intentionally lightweight and can happen in conversation:

- smoke-test the preview build or app surface that is ready for review
- report blockers or product-quality issues found during normal review
- approve, reject, or ask for targeted follow-up
- let release engineering or an agent record any useful notes

A valid owner signoff can be a short sentence, for example:

```text
Owner smoke-tested the Expo iOS preview on a physical device. Themes and all chart pages worked as expected. Known untested surfaces: native release builds and screen-reader pass.
```

## Engineering-Owned QA

Detailed native runtime, accessibility, performance, and Skia evidence is owned by release engineering or agents.

The generated [native QA evidence backlog](native-qa-signoff-worksheet.md), [native QA checklists](native-qa-checklists.md), and `npm run release:qa:*` commands are tools for whoever is preparing a stable release candidate. They are not owner homework.

Rows should move to `pass` only after a release engineer or agent records:

- evidence links
- reviewer metadata
- device and OS metadata
- build surface
- notes describing the verified behavior

## Developer Preview Target

Developer Preview can proceed with:

- automated tests and docs checks passing
- Expo preview smoke-tested by the owner or maintainer
- known gaps disclosed in release notes and known issues

For the current Developer Preview, native release-build testing and full VoiceOver/TalkBack review remain disclosed gaps unless separately completed.

## Stable RC Target

Stable release-candidate approval should wait for an engineering-owned evidence summary covering:

- iOS release build on a physical iPhone, with simulator evidence allowed as support
- Android release build on a physical Android device, with emulator evidence allowed as support
- VoiceOver and TalkBack checks for the core preview surfaces
- performance checks for representative large-data and interaction scenarios

If simulator/emulator evidence is accepted instead of physical-device evidence for RC, the limitation must be stated in the H6 memo and release notes.

## Recording Rules

Use these commands for release engineering, not owner review:

```sh
npm run release:qa:signoff
npm run release:qa:status -- --matrix runtime --status partial --details --limit 1
npm run release:qa:record -- --matrix <runtime|accessibility|performance> --row <row-id> --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed and target policy used>"
```

Do not record H6 approval until:

- runtime, accessibility, and performance evidence is complete or explicitly waived for the chosen release type
- the owner has accepted the summarized release risk
- `npm run release:gate` passes for the intended release gate

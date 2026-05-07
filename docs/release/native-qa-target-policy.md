# Native QA Target Policy

Status on May 7, 2026: pending owner approval for H6. This policy defines what counts as an accepted target for the remaining runtime, accessibility, and performance QA rows.

## Recommendation

Do not treat screenshots, logs, UI dumps, or profiler snippets as pass evidence by themselves. They are supporting artifacts. A row can move to `pass` only after a reviewer completes the row checks in [native QA signoff worksheet](native-qa-signoff-worksheet.md) on an accepted target and records device/build metadata, evidence, reviewer, date, and notes.

## Runtime QA

Recommended H6 target:

- iOS release build on physical iPhone, plus simulator evidence may be used as supporting evidence.
- Android release build on physical Android device, plus emulator evidence may be used as supporting evidence.

Fallback H6 target:

- Simulator/emulator release builds may be accepted only if the owner explicitly records that decision for H6.
- The signoff notes must say that simulator/emulator targets were accepted instead of physical devices.

Rows must still cover tap, scrub, pan, pinch, range selector, tooltip stacking, nested scroll, theme switching, edge-label behavior, rotation or width changes, and page-specific checks.

## Accessibility QA

Recommended H6 target:

- Manual VoiceOver review on iOS.
- Manual TalkBack review on Android.

Accepted surfaces:

- Physical devices are preferred.
- Simulator/emulator can be accepted only when the actual assistive technology is enabled and manually reviewed.
- Android UIAutomator hierarchy dumps and iOS logs are supporting evidence only; they do not replace listening to VoiceOver/TalkBack announcements and checking focus behavior.

Rows must still verify chart summaries, focus order, table fallback, named controls, contrast after theme switching, and that decorative chart primitives are not announced as content.

## Performance QA

Recommended H6 target:

- iOS release build measured with Instruments on an accepted iPhone or explicitly accepted simulator.
- Android release build measured with Android Studio Profiler, `dumpsys gfxinfo`, or equivalent on an accepted Android device or explicitly accepted emulator.

Fallback H6 target:

- Existing simulator/emulator timing samples can become pass evidence only if the owner explicitly accepts them as the RC performance target.
- The signoff notes must preserve the limitation that these are not physical-device results.

Rows must still include renderer, data size, visible point count, initial render timing, interaction frame timing where available, memory, visible-correctness notes, and whether dropped frames or frame-over-budget data was available.

## Recording Rules

Use:

```sh
npm run release:qa:signoff
npm run release:qa:status -- --matrix runtime --status partial --details --limit 1
npm run release:qa:record -- --matrix <runtime|accessibility|performance> --row <row-id> --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed and target policy used>"
```

Do not record H6 approval until:

- every runtime, accessibility, and performance matrix row is complete
- the owner has accepted the target policy used for those rows
- `npm run release:gate` passes

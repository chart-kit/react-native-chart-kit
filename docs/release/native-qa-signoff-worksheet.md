# Native QA Signoff Worksheet

<!-- prettier-ignore-start -->

This worksheet expands the still-open release QA matrix rows into a manual review checklist. Screenshots, logs, UI dumps, simulator samples, or benchmark snippets are supporting evidence; do not record a row as `pass` until the reviewer has completed the listed checks on an accepted target.

Open rows: 50

Use `npm run release:qa:record` only after the row has evidence links, reviewer metadata, device/build metadata, and notes that describe the completed review.

## Accessibility QA

Matrix: `docs/release/evidence/native-accessibility-matrix.json`

Status: partial

Counts: partial=16

### ios-voiceover-line-charts

Target: iOS VoiceOver / Line Charts

Status: partial

Launch: `chartkitshowcase://showcase?view=charts&page=line-area`

Capture:

- `npm run release:qa:capture -- --matrix accessibility --row ios-voiceover-line-charts --platform ios --output docs/release/artifacts/ios-voiceover-line-charts.png --ios-log-output docs/release/artifacts/ios-voiceover-line-charts.log`

Existing Evidence:

- `docs/release/artifacts/accessibility-local-baseline-2026-05-06.md`
- `docs/release/artifacts/ios-voiceover-line-charts.png`
- `docs/release/artifacts/ios-voiceover-line-charts.log`

Acceptance Checks:

- [ ] global: chart is reachable by screen-reader swipe navigation
- [ ] global: focused chart announces a concise summary instead of raw SVG internals
- [ ] global: summary names chart type and key data insight
- [ ] global: selection, tooltip, range selector, and legend controls do not trap screen-reader focus
- [ ] global: visually selected value is also available through summary, table fallback, or app text
- [ ] global: menu controls, legend toggles, and story controls are reachable and named
- [ ] global: theme switching preserves text, tooltip, and control contrast
- [ ] global: decorative gridlines, markers, and session-gap bands are not announced separately
- [ ] tableFallback: details control announces expanded or collapsed state where used
- [ ] tableFallback: rows read in a stable order
- [ ] tableFallback: null or missing values are announced as no value or equivalent app copy
- [ ] tableFallback: dual-axis values are not compared as if they shared units

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix accessibility --row ios-voiceover-line-charts --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### ios-voiceover-bar-charts

Target: iOS VoiceOver / Bar Charts

Status: partial

Launch: `chartkitshowcase://showcase?view=charts&page=bar`

Capture:

- `npm run release:qa:capture -- --matrix accessibility --row ios-voiceover-bar-charts --platform ios --output docs/release/artifacts/ios-voiceover-bar-charts.png --ios-log-output docs/release/artifacts/ios-voiceover-bar-charts.log`

Existing Evidence:

- `docs/release/artifacts/accessibility-local-baseline-2026-05-06.md`
- `docs/release/artifacts/ios-voiceover-bar-charts.png`
- `docs/release/artifacts/ios-voiceover-bar-charts.log`

Acceptance Checks:

- [ ] global: chart is reachable by screen-reader swipe navigation
- [ ] global: focused chart announces a concise summary instead of raw SVG internals
- [ ] global: summary names chart type and key data insight
- [ ] global: selection, tooltip, range selector, and legend controls do not trap screen-reader focus
- [ ] global: visually selected value is also available through summary, table fallback, or app text
- [ ] global: menu controls, legend toggles, and story controls are reachable and named
- [ ] global: theme switching preserves text, tooltip, and control contrast
- [ ] global: decorative gridlines, markers, and session-gap bands are not announced separately
- [ ] tableFallback: details control announces expanded or collapsed state where used
- [ ] tableFallback: rows read in a stable order
- [ ] tableFallback: null or missing values are announced as no value or equivalent app copy
- [ ] tableFallback: dual-axis values are not compared as if they shared units

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix accessibility --row ios-voiceover-bar-charts --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### ios-voiceover-combined-preview

Target: iOS VoiceOver / Combined Preview

Status: partial

Launch: `chartkitshowcase://showcase?view=charts&page=combined`

Capture:

- `npm run release:qa:capture -- --matrix accessibility --row ios-voiceover-combined-preview --platform ios --output docs/release/artifacts/ios-voiceover-combined-preview.png --ios-log-output docs/release/artifacts/ios-voiceover-combined-preview.log`

Existing Evidence:

- `docs/release/artifacts/accessibility-local-baseline-2026-05-06.md`
- `docs/release/artifacts/ios-voiceover-combined-preview.png`
- `docs/release/artifacts/ios-voiceover-combined-preview.log`

Acceptance Checks:

- [ ] global: chart is reachable by screen-reader swipe navigation
- [ ] global: focused chart announces a concise summary instead of raw SVG internals
- [ ] global: summary names chart type and key data insight
- [ ] global: selection, tooltip, range selector, and legend controls do not trap screen-reader focus
- [ ] global: visually selected value is also available through summary, table fallback, or app text
- [ ] global: menu controls, legend toggles, and story controls are reachable and named
- [ ] global: theme switching preserves text, tooltip, and control contrast
- [ ] global: decorative gridlines, markers, and session-gap bands are not announced separately
- [ ] tableFallback: details control announces expanded or collapsed state where used
- [ ] tableFallback: rows read in a stable order
- [ ] tableFallback: null or missing values are announced as no value or equivalent app copy
- [ ] tableFallback: dual-axis values are not compared as if they shared units

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix accessibility --row ios-voiceover-combined-preview --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### ios-voiceover-financial-preview

Target: iOS VoiceOver / Financial Preview

Status: partial

Launch: `chartkitshowcase://showcase?view=charts&page=financial`

Capture:

- `npm run release:qa:capture -- --matrix accessibility --row ios-voiceover-financial-preview --platform ios --output docs/release/artifacts/ios-voiceover-financial-preview.png --ios-log-output docs/release/artifacts/ios-voiceover-financial-preview.log`

Existing Evidence:

- `docs/release/artifacts/accessibility-local-baseline-2026-05-06.md`
- `docs/release/artifacts/ios-voiceover-financial-preview.png`
- `docs/release/artifacts/ios-voiceover-financial-preview.log`

Acceptance Checks:

- [ ] global: chart is reachable by screen-reader swipe navigation
- [ ] global: focused chart announces a concise summary instead of raw SVG internals
- [ ] global: summary names chart type and key data insight
- [ ] global: selection, tooltip, range selector, and legend controls do not trap screen-reader focus
- [ ] global: visually selected value is also available through summary, table fallback, or app text
- [ ] global: menu controls, legend toggles, and story controls are reachable and named
- [ ] global: theme switching preserves text, tooltip, and control contrast
- [ ] global: decorative gridlines, markers, and session-gap bands are not announced separately
- [ ] tableFallback: details control announces expanded or collapsed state where used
- [ ] tableFallback: rows read in a stable order
- [ ] tableFallback: null or missing values are announced as no value or equivalent app copy
- [ ] tableFallback: dual-axis values are not compared as if they shared units

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix accessibility --row ios-voiceover-financial-preview --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### ios-voiceover-pie-donut

Target: iOS VoiceOver / Pie & Donut

Status: partial

Launch: `chartkitshowcase://showcase?view=charts&page=pie-donut`

Capture:

- `npm run release:qa:capture -- --matrix accessibility --row ios-voiceover-pie-donut --platform ios --output docs/release/artifacts/ios-voiceover-pie-donut.png --ios-log-output docs/release/artifacts/ios-voiceover-pie-donut.log`

Existing Evidence:

- `docs/release/artifacts/accessibility-local-baseline-2026-05-06.md`
- `docs/release/artifacts/ios-voiceover-pie-donut.png`
- `docs/release/artifacts/ios-voiceover-pie-donut.log`

Acceptance Checks:

- [ ] global: chart is reachable by screen-reader swipe navigation
- [ ] global: focused chart announces a concise summary instead of raw SVG internals
- [ ] global: summary names chart type and key data insight
- [ ] global: selection, tooltip, range selector, and legend controls do not trap screen-reader focus
- [ ] global: visually selected value is also available through summary, table fallback, or app text
- [ ] global: menu controls, legend toggles, and story controls are reachable and named
- [ ] global: theme switching preserves text, tooltip, and control contrast
- [ ] global: decorative gridlines, markers, and session-gap bands are not announced separately
- [ ] tableFallback: details control announces expanded or collapsed state where used
- [ ] tableFallback: rows read in a stable order
- [ ] tableFallback: null or missing values are announced as no value or equivalent app copy
- [ ] tableFallback: dual-axis values are not compared as if they shared units

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix accessibility --row ios-voiceover-pie-donut --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### ios-voiceover-progress

Target: iOS VoiceOver / Progress

Status: partial

Launch: `chartkitshowcase://showcase?view=charts&page=progress`

Capture:

- `npm run release:qa:capture -- --matrix accessibility --row ios-voiceover-progress --platform ios --output docs/release/artifacts/ios-voiceover-progress.png --ios-log-output docs/release/artifacts/ios-voiceover-progress.log`

Existing Evidence:

- `docs/release/artifacts/accessibility-local-baseline-2026-05-06.md`
- `docs/release/artifacts/ios-voiceover-progress.png`
- `docs/release/artifacts/ios-voiceover-progress.log`

Acceptance Checks:

- [ ] global: chart is reachable by screen-reader swipe navigation
- [ ] global: focused chart announces a concise summary instead of raw SVG internals
- [ ] global: summary names chart type and key data insight
- [ ] global: selection, tooltip, range selector, and legend controls do not trap screen-reader focus
- [ ] global: visually selected value is also available through summary, table fallback, or app text
- [ ] global: menu controls, legend toggles, and story controls are reachable and named
- [ ] global: theme switching preserves text, tooltip, and control contrast
- [ ] global: decorative gridlines, markers, and session-gap bands are not announced separately
- [ ] tableFallback: details control announces expanded or collapsed state where used
- [ ] tableFallback: rows read in a stable order
- [ ] tableFallback: null or missing values are announced as no value or equivalent app copy
- [ ] tableFallback: dual-axis values are not compared as if they shared units

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix accessibility --row ios-voiceover-progress --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### ios-voiceover-heatmaps

Target: iOS VoiceOver / Heatmaps

Status: partial

Launch: `chartkitshowcase://showcase?view=charts&page=heatmaps`

Capture:

- `npm run release:qa:capture -- --matrix accessibility --row ios-voiceover-heatmaps --platform ios --output docs/release/artifacts/ios-voiceover-heatmaps.png --ios-log-output docs/release/artifacts/ios-voiceover-heatmaps.log`

Existing Evidence:

- `docs/release/artifacts/accessibility-local-baseline-2026-05-06.md`
- `docs/release/artifacts/ios-voiceover-heatmaps.png`
- `docs/release/artifacts/ios-voiceover-heatmaps.log`

Acceptance Checks:

- [ ] global: chart is reachable by screen-reader swipe navigation
- [ ] global: focused chart announces a concise summary instead of raw SVG internals
- [ ] global: summary names chart type and key data insight
- [ ] global: selection, tooltip, range selector, and legend controls do not trap screen-reader focus
- [ ] global: visually selected value is also available through summary, table fallback, or app text
- [ ] global: menu controls, legend toggles, and story controls are reachable and named
- [ ] global: theme switching preserves text, tooltip, and control contrast
- [ ] global: decorative gridlines, markers, and session-gap bands are not announced separately
- [ ] tableFallback: details control announces expanded or collapsed state where used
- [ ] tableFallback: rows read in a stable order
- [ ] tableFallback: null or missing values are announced as no value or equivalent app copy
- [ ] tableFallback: dual-axis values are not compared as if they shared units

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix accessibility --row ios-voiceover-heatmaps --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### ios-voiceover-compatibility

Target: iOS VoiceOver / Compatibility

Status: partial

Launch: `chartkitshowcase://showcase?view=charts&page=compat`

Capture:

- `npm run release:qa:capture -- --matrix accessibility --row ios-voiceover-compatibility --platform ios --output docs/release/artifacts/ios-voiceover-compatibility.png --ios-log-output docs/release/artifacts/ios-voiceover-compatibility.log`

Existing Evidence:

- `docs/release/artifacts/accessibility-local-baseline-2026-05-06.md`
- `docs/release/artifacts/ios-voiceover-compatibility.png`
- `docs/release/artifacts/ios-voiceover-compatibility.log`

Acceptance Checks:

- [ ] global: chart is reachable by screen-reader swipe navigation
- [ ] global: focused chart announces a concise summary instead of raw SVG internals
- [ ] global: summary names chart type and key data insight
- [ ] global: selection, tooltip, range selector, and legend controls do not trap screen-reader focus
- [ ] global: visually selected value is also available through summary, table fallback, or app text
- [ ] global: menu controls, legend toggles, and story controls are reachable and named
- [ ] global: theme switching preserves text, tooltip, and control contrast
- [ ] global: decorative gridlines, markers, and session-gap bands are not announced separately

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix accessibility --row ios-voiceover-compatibility --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### android-talkback-line-charts

Target: Android TalkBack / Line Charts

Status: partial

Launch: `chartkitshowcase://showcase?view=charts&page=line-area`

Capture:

- `npm run release:qa:capture -- --matrix accessibility --row android-talkback-line-charts --platform android --output docs/release/artifacts/android-talkback-line-charts.png --android-log-output docs/release/artifacts/android-talkback-line-charts.log --android-ui-output docs/release/artifacts/android-talkback-line-charts.xml`

Existing Evidence:

- `docs/release/artifacts/accessibility-local-baseline-2026-05-06.md`
- `docs/release/artifacts/android-talkback-line-charts.png`
- `docs/release/artifacts/android-talkback-line-charts.log`
- `docs/release/artifacts/android-talkback-line-charts.xml`

Acceptance Checks:

- [ ] global: chart is reachable by screen-reader swipe navigation
- [ ] global: focused chart announces a concise summary instead of raw SVG internals
- [ ] global: summary names chart type and key data insight
- [ ] global: selection, tooltip, range selector, and legend controls do not trap screen-reader focus
- [ ] global: visually selected value is also available through summary, table fallback, or app text
- [ ] global: menu controls, legend toggles, and story controls are reachable and named
- [ ] global: theme switching preserves text, tooltip, and control contrast
- [ ] global: decorative gridlines, markers, and session-gap bands are not announced separately
- [ ] tableFallback: details control announces expanded or collapsed state where used
- [ ] tableFallback: rows read in a stable order
- [ ] tableFallback: null or missing values are announced as no value or equivalent app copy
- [ ] tableFallback: dual-axis values are not compared as if they shared units

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix accessibility --row android-talkback-line-charts --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### android-talkback-bar-charts

Target: Android TalkBack / Bar Charts

Status: partial

Launch: `chartkitshowcase://showcase?view=charts&page=bar`

Capture:

- `npm run release:qa:capture -- --matrix accessibility --row android-talkback-bar-charts --platform android --output docs/release/artifacts/android-talkback-bar-charts.png --android-log-output docs/release/artifacts/android-talkback-bar-charts.log --android-ui-output docs/release/artifacts/android-talkback-bar-charts.xml`

Existing Evidence:

- `docs/release/artifacts/accessibility-local-baseline-2026-05-06.md`
- `docs/release/artifacts/android-talkback-bar-charts.png`
- `docs/release/artifacts/android-talkback-bar-charts.log`
- `docs/release/artifacts/android-talkback-bar-charts.xml`

Acceptance Checks:

- [ ] global: chart is reachable by screen-reader swipe navigation
- [ ] global: focused chart announces a concise summary instead of raw SVG internals
- [ ] global: summary names chart type and key data insight
- [ ] global: selection, tooltip, range selector, and legend controls do not trap screen-reader focus
- [ ] global: visually selected value is also available through summary, table fallback, or app text
- [ ] global: menu controls, legend toggles, and story controls are reachable and named
- [ ] global: theme switching preserves text, tooltip, and control contrast
- [ ] global: decorative gridlines, markers, and session-gap bands are not announced separately
- [ ] tableFallback: details control announces expanded or collapsed state where used
- [ ] tableFallback: rows read in a stable order
- [ ] tableFallback: null or missing values are announced as no value or equivalent app copy
- [ ] tableFallback: dual-axis values are not compared as if they shared units

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix accessibility --row android-talkback-bar-charts --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### android-talkback-combined-preview

Target: Android TalkBack / Combined Preview

Status: partial

Launch: `chartkitshowcase://showcase?view=charts&page=combined`

Capture:

- `npm run release:qa:capture -- --matrix accessibility --row android-talkback-combined-preview --platform android --output docs/release/artifacts/android-talkback-combined-preview.png --android-log-output docs/release/artifacts/android-talkback-combined-preview.log --android-ui-output docs/release/artifacts/android-talkback-combined-preview.xml`

Existing Evidence:

- `docs/release/artifacts/accessibility-local-baseline-2026-05-06.md`
- `docs/release/artifacts/android-talkback-combined-preview.png`
- `docs/release/artifacts/android-talkback-combined-preview.log`
- `docs/release/artifacts/android-talkback-combined-preview.xml`

Acceptance Checks:

- [ ] global: chart is reachable by screen-reader swipe navigation
- [ ] global: focused chart announces a concise summary instead of raw SVG internals
- [ ] global: summary names chart type and key data insight
- [ ] global: selection, tooltip, range selector, and legend controls do not trap screen-reader focus
- [ ] global: visually selected value is also available through summary, table fallback, or app text
- [ ] global: menu controls, legend toggles, and story controls are reachable and named
- [ ] global: theme switching preserves text, tooltip, and control contrast
- [ ] global: decorative gridlines, markers, and session-gap bands are not announced separately
- [ ] tableFallback: details control announces expanded or collapsed state where used
- [ ] tableFallback: rows read in a stable order
- [ ] tableFallback: null or missing values are announced as no value or equivalent app copy
- [ ] tableFallback: dual-axis values are not compared as if they shared units

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix accessibility --row android-talkback-combined-preview --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### android-talkback-financial-preview

Target: Android TalkBack / Financial Preview

Status: partial

Launch: `chartkitshowcase://showcase?view=charts&page=financial`

Capture:

- `npm run release:qa:capture -- --matrix accessibility --row android-talkback-financial-preview --platform android --output docs/release/artifacts/android-talkback-financial-preview.png --android-log-output docs/release/artifacts/android-talkback-financial-preview.log --android-ui-output docs/release/artifacts/android-talkback-financial-preview.xml`

Existing Evidence:

- `docs/release/artifacts/accessibility-local-baseline-2026-05-06.md`
- `docs/release/artifacts/android-talkback-financial-preview.png`
- `docs/release/artifacts/android-talkback-financial-preview.log`
- `docs/release/artifacts/android-talkback-financial-preview.xml`

Acceptance Checks:

- [ ] global: chart is reachable by screen-reader swipe navigation
- [ ] global: focused chart announces a concise summary instead of raw SVG internals
- [ ] global: summary names chart type and key data insight
- [ ] global: selection, tooltip, range selector, and legend controls do not trap screen-reader focus
- [ ] global: visually selected value is also available through summary, table fallback, or app text
- [ ] global: menu controls, legend toggles, and story controls are reachable and named
- [ ] global: theme switching preserves text, tooltip, and control contrast
- [ ] global: decorative gridlines, markers, and session-gap bands are not announced separately
- [ ] tableFallback: details control announces expanded or collapsed state where used
- [ ] tableFallback: rows read in a stable order
- [ ] tableFallback: null or missing values are announced as no value or equivalent app copy
- [ ] tableFallback: dual-axis values are not compared as if they shared units

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix accessibility --row android-talkback-financial-preview --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### android-talkback-pie-donut

Target: Android TalkBack / Pie & Donut

Status: partial

Launch: `chartkitshowcase://showcase?view=charts&page=pie-donut`

Capture:

- `npm run release:qa:capture -- --matrix accessibility --row android-talkback-pie-donut --platform android --output docs/release/artifacts/android-talkback-pie-donut.png --android-log-output docs/release/artifacts/android-talkback-pie-donut.log --android-ui-output docs/release/artifacts/android-talkback-pie-donut.xml`

Existing Evidence:

- `docs/release/artifacts/accessibility-local-baseline-2026-05-06.md`
- `docs/release/artifacts/android-talkback-pie-donut.png`
- `docs/release/artifacts/android-talkback-pie-donut.log`
- `docs/release/artifacts/android-talkback-pie-donut.xml`

Acceptance Checks:

- [ ] global: chart is reachable by screen-reader swipe navigation
- [ ] global: focused chart announces a concise summary instead of raw SVG internals
- [ ] global: summary names chart type and key data insight
- [ ] global: selection, tooltip, range selector, and legend controls do not trap screen-reader focus
- [ ] global: visually selected value is also available through summary, table fallback, or app text
- [ ] global: menu controls, legend toggles, and story controls are reachable and named
- [ ] global: theme switching preserves text, tooltip, and control contrast
- [ ] global: decorative gridlines, markers, and session-gap bands are not announced separately
- [ ] tableFallback: details control announces expanded or collapsed state where used
- [ ] tableFallback: rows read in a stable order
- [ ] tableFallback: null or missing values are announced as no value or equivalent app copy
- [ ] tableFallback: dual-axis values are not compared as if they shared units

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix accessibility --row android-talkback-pie-donut --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### android-talkback-progress

Target: Android TalkBack / Progress

Status: partial

Launch: `chartkitshowcase://showcase?view=charts&page=progress`

Capture:

- `npm run release:qa:capture -- --matrix accessibility --row android-talkback-progress --platform android --output docs/release/artifacts/android-talkback-progress.png --android-log-output docs/release/artifacts/android-talkback-progress.log --android-ui-output docs/release/artifacts/android-talkback-progress.xml`

Existing Evidence:

- `docs/release/artifacts/accessibility-local-baseline-2026-05-06.md`
- `docs/release/artifacts/android-talkback-progress.png`
- `docs/release/artifacts/android-talkback-progress.log`
- `docs/release/artifacts/android-talkback-progress.xml`

Acceptance Checks:

- [ ] global: chart is reachable by screen-reader swipe navigation
- [ ] global: focused chart announces a concise summary instead of raw SVG internals
- [ ] global: summary names chart type and key data insight
- [ ] global: selection, tooltip, range selector, and legend controls do not trap screen-reader focus
- [ ] global: visually selected value is also available through summary, table fallback, or app text
- [ ] global: menu controls, legend toggles, and story controls are reachable and named
- [ ] global: theme switching preserves text, tooltip, and control contrast
- [ ] global: decorative gridlines, markers, and session-gap bands are not announced separately
- [ ] tableFallback: details control announces expanded or collapsed state where used
- [ ] tableFallback: rows read in a stable order
- [ ] tableFallback: null or missing values are announced as no value or equivalent app copy
- [ ] tableFallback: dual-axis values are not compared as if they shared units

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix accessibility --row android-talkback-progress --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### android-talkback-heatmaps

Target: Android TalkBack / Heatmaps

Status: partial

Launch: `chartkitshowcase://showcase?view=charts&page=heatmaps`

Capture:

- `npm run release:qa:capture -- --matrix accessibility --row android-talkback-heatmaps --platform android --output docs/release/artifacts/android-talkback-heatmaps.png --android-log-output docs/release/artifacts/android-talkback-heatmaps.log --android-ui-output docs/release/artifacts/android-talkback-heatmaps.xml`

Existing Evidence:

- `docs/release/artifacts/accessibility-local-baseline-2026-05-06.md`
- `docs/release/artifacts/android-talkback-heatmaps.png`
- `docs/release/artifacts/android-talkback-heatmaps.log`
- `docs/release/artifacts/android-talkback-heatmaps.xml`

Acceptance Checks:

- [ ] global: chart is reachable by screen-reader swipe navigation
- [ ] global: focused chart announces a concise summary instead of raw SVG internals
- [ ] global: summary names chart type and key data insight
- [ ] global: selection, tooltip, range selector, and legend controls do not trap screen-reader focus
- [ ] global: visually selected value is also available through summary, table fallback, or app text
- [ ] global: menu controls, legend toggles, and story controls are reachable and named
- [ ] global: theme switching preserves text, tooltip, and control contrast
- [ ] global: decorative gridlines, markers, and session-gap bands are not announced separately
- [ ] tableFallback: details control announces expanded or collapsed state where used
- [ ] tableFallback: rows read in a stable order
- [ ] tableFallback: null or missing values are announced as no value or equivalent app copy
- [ ] tableFallback: dual-axis values are not compared as if they shared units

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix accessibility --row android-talkback-heatmaps --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### android-talkback-compatibility

Target: Android TalkBack / Compatibility

Status: partial

Launch: `chartkitshowcase://showcase?view=charts&page=compat`

Capture:

- `npm run release:qa:capture -- --matrix accessibility --row android-talkback-compatibility --platform android --output docs/release/artifacts/android-talkback-compatibility.png --android-log-output docs/release/artifacts/android-talkback-compatibility.log --android-ui-output docs/release/artifacts/android-talkback-compatibility.xml`

Existing Evidence:

- `docs/release/artifacts/accessibility-local-baseline-2026-05-06.md`
- `docs/release/artifacts/android-talkback-compatibility.png`
- `docs/release/artifacts/android-talkback-compatibility.log`
- `docs/release/artifacts/android-talkback-compatibility.xml`

Acceptance Checks:

- [ ] global: chart is reachable by screen-reader swipe navigation
- [ ] global: focused chart announces a concise summary instead of raw SVG internals
- [ ] global: summary names chart type and key data insight
- [ ] global: selection, tooltip, range selector, and legend controls do not trap screen-reader focus
- [ ] global: visually selected value is also available through summary, table fallback, or app text
- [ ] global: menu controls, legend toggles, and story controls are reachable and named
- [ ] global: theme switching preserves text, tooltip, and control contrast
- [ ] global: decorative gridlines, markers, and session-gap bands are not announced separately

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix accessibility --row android-talkback-compatibility --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`
## Native Performance

Matrix: `docs/release/evidence/native-performance-matrix.json`

Status: partial

Counts: partial=18

### ios-svg-small-line-initial-render

Target: iOS / Small line initial render

Status: partial

Launch: `chartkitshowcase://showcase?story=v2-perf-line-100&visual=1`

Capture:

- `npm run release:qa:capture -- --matrix performance --row ios-svg-small-line-initial-render --platform ios --output docs/release/artifacts/ios-svg-small-line-initial-render.png --ios-log-output docs/release/artifacts/ios-svg-small-line-initial-render.log`

Existing Evidence:

- `docs/release/artifacts/ios-svg-small-line-initial-render-performance.md`

Acceptance Checks:

- [ ] scenario: data size 100 points
- [ ] scenario: expected story metrics chart line; 100 total; 100 visible; 1 series
- [ ] scenario: interaction initial render
- [ ] metric: commit SHA
- [ ] metric: package version
- [ ] metric: platform, OS, device, and simulator/emulator/physical flag
- [ ] metric: build type
- [ ] metric: renderer
- [ ] metric: chart type and scenario
- [ ] metric: total, visible, rendered points, and series count
- [ ] metric: initial render time
- [ ] metric: median frame time during interaction
- [ ] metric: p95 frame time during interaction
- [ ] metric: max frame time during interaction
- [ ] metric: dropped frames or frames over 16.7 ms where available
- [ ] metric: memory before and after scenario
- [ ] metric: visible correctness notes for clipping, tooltip stacking, and gesture conflicts

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix performance --row ios-svg-small-line-initial-render --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### ios-svg-standard-line-scrub

Target: iOS / Standard line scrub

Status: partial

Launch: `chartkitshowcase://showcase?story=v2-perf-line-1000-scrub&visual=1`

Capture:

- `npm run release:qa:capture -- --matrix performance --row ios-svg-standard-line-scrub --platform ios --output docs/release/artifacts/ios-svg-standard-line-scrub.png --ios-log-output docs/release/artifacts/ios-svg-standard-line-scrub.log`

Existing Evidence:

- `docs/release/artifacts/ios-svg-standard-line-scrub-performance.md`

Acceptance Checks:

- [ ] scenario: data size 1,000 points
- [ ] scenario: expected story metrics chart line; 1,000 total; 1,000 visible; 1 series
- [ ] scenario: interaction initial render and scrub
- [ ] metric: commit SHA
- [ ] metric: package version
- [ ] metric: platform, OS, device, and simulator/emulator/physical flag
- [ ] metric: build type
- [ ] metric: renderer
- [ ] metric: chart type and scenario
- [ ] metric: total, visible, rendered points, and series count
- [ ] metric: initial render time
- [ ] metric: median frame time during interaction
- [ ] metric: p95 frame time during interaction
- [ ] metric: max frame time during interaction
- [ ] metric: dropped frames or frames over 16.7 ms where available
- [ ] metric: memory before and after scenario
- [ ] metric: visible correctness notes for clipping, tooltip stacking, and gesture conflicts

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix performance --row ios-svg-standard-line-scrub --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### ios-svg-dense-line-decimated-overview

Target: iOS / Dense line decimated overview

Status: partial

Launch: `chartkitshowcase://showcase?story=v2-perf-line-10000-overview&visual=1`

Capture:

- `npm run release:qa:capture -- --matrix performance --row ios-svg-dense-line-decimated-overview --platform ios --output docs/release/artifacts/ios-svg-dense-line-decimated-overview.png --ios-log-output docs/release/artifacts/ios-svg-dense-line-decimated-overview.log`

Existing Evidence:

- `docs/release/artifacts/ios-svg-dense-line-decimated-overview-performance.md`

Acceptance Checks:

- [ ] scenario: data size 10,000 total points
- [ ] scenario: expected story metrics chart line; 10,000 total; 10,000 visible; 1 series
- [ ] scenario: interaction decimated overview
- [ ] metric: commit SHA
- [ ] metric: package version
- [ ] metric: platform, OS, device, and simulator/emulator/physical flag
- [ ] metric: build type
- [ ] metric: renderer
- [ ] metric: chart type and scenario
- [ ] metric: total, visible, rendered points, and series count
- [ ] metric: initial render time
- [ ] metric: median frame time during interaction
- [ ] metric: p95 frame time during interaction
- [ ] metric: max frame time during interaction
- [ ] metric: dropped frames or frames over 16.7 ms where available
- [ ] metric: memory before and after scenario
- [ ] metric: visible correctness notes for clipping, tooltip stacking, and gesture conflicts

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix performance --row ios-svg-dense-line-decimated-overview --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### ios-svg-multi-line-shared-tooltip-scrub

Target: iOS / Multi-line shared tooltip scrub

Status: partial

Launch: `chartkitshowcase://showcase?story=v2-perf-line-5x1000-tooltip&visual=1`

Capture:

- `npm run release:qa:capture -- --matrix performance --row ios-svg-multi-line-shared-tooltip-scrub --platform ios --output docs/release/artifacts/ios-svg-multi-line-shared-tooltip-scrub.png --ios-log-output docs/release/artifacts/ios-svg-multi-line-shared-tooltip-scrub.log`

Existing Evidence:

- `docs/release/artifacts/ios-svg-multi-line-shared-tooltip-scrub-performance.md`

Acceptance Checks:

- [ ] scenario: data size 5 series x 1,000 points
- [ ] scenario: expected story metrics chart line; 1,000 total; 1,000 visible; 5 series
- [ ] scenario: interaction shared tooltip scrub
- [ ] metric: commit SHA
- [ ] metric: package version
- [ ] metric: platform, OS, device, and simulator/emulator/physical flag
- [ ] metric: build type
- [ ] metric: renderer
- [ ] metric: chart type and scenario
- [ ] metric: total, visible, rendered points, and series count
- [ ] metric: initial render time
- [ ] metric: median frame time during interaction
- [ ] metric: p95 frame time during interaction
- [ ] metric: max frame time during interaction
- [ ] metric: dropped frames or frames over 16.7 ms where available
- [ ] metric: memory before and after scenario
- [ ] metric: visible correctness notes for clipping, tooltip stacking, and gesture conflicts

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix performance --row ios-svg-multi-line-shared-tooltip-scrub --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### ios-svg-scrollable-line-one-finger-pan

Target: iOS / Scrollable line one-finger pan

Status: partial

Launch: `chartkitshowcase://showcase?story=v2-perf-line-10000-pan&visual=1`

Capture:

- `npm run release:qa:capture -- --matrix performance --row ios-svg-scrollable-line-one-finger-pan --platform ios --output docs/release/artifacts/ios-svg-scrollable-line-one-finger-pan.png --ios-log-output docs/release/artifacts/ios-svg-scrollable-line-one-finger-pan.log`

Existing Evidence:

- `docs/release/artifacts/ios-svg-scrollable-line-one-finger-pan-performance.md`

Acceptance Checks:

- [ ] scenario: data size 10,000 total points, 2,000 shown
- [ ] scenario: expected story metrics chart line; 10,000 total; 2,000 visible; 1 series
- [ ] scenario: interaction one-finger pan
- [ ] metric: commit SHA
- [ ] metric: package version
- [ ] metric: platform, OS, device, and simulator/emulator/physical flag
- [ ] metric: build type
- [ ] metric: renderer
- [ ] metric: chart type and scenario
- [ ] metric: total, visible, rendered points, and series count
- [ ] metric: initial render time
- [ ] metric: median frame time during interaction
- [ ] metric: p95 frame time during interaction
- [ ] metric: max frame time during interaction
- [ ] metric: dropped frames or frames over 16.7 ms where available
- [ ] metric: memory before and after scenario
- [ ] metric: visible correctness notes for clipping, tooltip stacking, and gesture conflicts

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix performance --row ios-svg-scrollable-line-one-finger-pan --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### ios-svg-range-selector-drag-and-thumb-resize

Target: iOS / Range selector drag and thumb resize

Status: partial

Launch: `chartkitshowcase://showcase?story=v2-perf-range-2x10000&visual=1`

Capture:

- `npm run release:qa:capture -- --matrix performance --row ios-svg-range-selector-drag-and-thumb-resize --platform ios --output docs/release/artifacts/ios-svg-range-selector-drag-and-thumb-resize.png --ios-log-output docs/release/artifacts/ios-svg-range-selector-drag-and-thumb-resize.log`

Existing Evidence:

- `docs/release/artifacts/ios-svg-range-selector-drag-and-thumb-resize-performance.md`

Acceptance Checks:

- [ ] scenario: data size 2 series x 10,000 points
- [ ] scenario: expected story metrics chart line; 10,000 total; 1,500 visible; 2 series
- [ ] scenario: interaction drag and thumb resize
- [ ] metric: commit SHA
- [ ] metric: package version
- [ ] metric: platform, OS, device, and simulator/emulator/physical flag
- [ ] metric: build type
- [ ] metric: renderer
- [ ] metric: chart type and scenario
- [ ] metric: total, visible, rendered points, and series count
- [ ] metric: initial render time
- [ ] metric: median frame time during interaction
- [ ] metric: p95 frame time during interaction
- [ ] metric: max frame time during interaction
- [ ] metric: dropped frames or frames over 16.7 ms where available
- [ ] metric: memory before and after scenario
- [ ] metric: visible correctness notes for clipping, tooltip stacking, and gesture conflicts

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix performance --row ios-svg-range-selector-drag-and-thumb-resize --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### ios-svg-scrollable-bar-horizontal-scroll-and-selection

Target: iOS / Scrollable bar horizontal scroll and selection

Status: partial

Launch: `chartkitshowcase://showcase?story=v2-perf-bar-500-selection&visual=1`

Capture:

- `npm run release:qa:capture -- --matrix performance --row ios-svg-scrollable-bar-horizontal-scroll-and-selection --platform ios --output docs/release/artifacts/ios-svg-scrollable-bar-horizontal-scroll-and-selection.png --ios-log-output docs/release/artifacts/ios-svg-scrollable-bar-horizontal-scroll-and-selection.log`

Existing Evidence:

- `docs/release/artifacts/ios-svg-scrollable-bar-horizontal-scroll-and-selection-performance.md`

Acceptance Checks:

- [ ] scenario: data size 500 bars
- [ ] scenario: expected story metrics chart bar; 500 total; 24 visible; 1 series
- [ ] scenario: interaction horizontal scroll and selection
- [ ] metric: commit SHA
- [ ] metric: package version
- [ ] metric: platform, OS, device, and simulator/emulator/physical flag
- [ ] metric: build type
- [ ] metric: renderer
- [ ] metric: chart type and scenario
- [ ] metric: total, visible, rendered points, and series count
- [ ] metric: initial render time
- [ ] metric: median frame time during interaction
- [ ] metric: p95 frame time during interaction
- [ ] metric: max frame time during interaction
- [ ] metric: dropped frames or frames over 16.7 ms where available
- [ ] metric: memory before and after scenario
- [ ] metric: visible correctness notes for clipping, tooltip stacking, and gesture conflicts

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix performance --row ios-svg-scrollable-bar-horizontal-scroll-and-selection --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### ios-svg-combined-chart-shared-tooltip-and-legend

Target: iOS / Combined chart shared tooltip and legend

Status: partial

Launch: `chartkitshowcase://showcase?story=v2-perf-combined-tooltip&visual=1`

Capture:

- `npm run release:qa:capture -- --matrix performance --row ios-svg-combined-chart-shared-tooltip-and-legend --platform ios --output docs/release/artifacts/ios-svg-combined-chart-shared-tooltip-and-legend.png --ios-log-output docs/release/artifacts/ios-svg-combined-chart-shared-tooltip-and-legend.log`

Existing Evidence:

- `docs/release/artifacts/ios-svg-combined-chart-shared-tooltip-and-legend-performance.md`

Acceptance Checks:

- [ ] scenario: data size bars plus line
- [ ] scenario: expected story metrics chart combined; 36 total; 36 visible; 2 series
- [ ] scenario: interaction shared tooltip and legend
- [ ] metric: commit SHA
- [ ] metric: package version
- [ ] metric: platform, OS, device, and simulator/emulator/physical flag
- [ ] metric: build type
- [ ] metric: renderer
- [ ] metric: chart type and scenario
- [ ] metric: total, visible, rendered points, and series count
- [ ] metric: initial render time
- [ ] metric: median frame time during interaction
- [ ] metric: p95 frame time during interaction
- [ ] metric: max frame time during interaction
- [ ] metric: dropped frames or frames over 16.7 ms where available
- [ ] metric: memory before and after scenario
- [ ] metric: visible correctness notes for clipping, tooltip stacking, and gesture conflicts

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix performance --row ios-svg-combined-chart-shared-tooltip-and-legend --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### ios-svg-candlestick-pan-pinch-and-tap-inspection

Target: iOS / Candlestick pan, pinch, and tap inspection

Status: partial

Launch: `chartkitshowcase://showcase?story=v2-perf-candlestick-1000&visual=1`

Capture:

- `npm run release:qa:capture -- --matrix performance --row ios-svg-candlestick-pan-pinch-and-tap-inspection --platform ios --output docs/release/artifacts/ios-svg-candlestick-pan-pinch-and-tap-inspection.png --ios-log-output docs/release/artifacts/ios-svg-candlestick-pan-pinch-and-tap-inspection.log`

Existing Evidence:

- `docs/release/artifacts/ios-svg-candlestick-pan-pinch-and-tap-inspection-performance.md`

Acceptance Checks:

- [ ] scenario: data size 1,000 candles
- [ ] scenario: expected story metrics chart candlestick; 1,000 total; 80 visible; 1 series
- [ ] scenario: interaction pan, pinch, tap inspection
- [ ] metric: commit SHA
- [ ] metric: package version
- [ ] metric: platform, OS, device, and simulator/emulator/physical flag
- [ ] metric: build type
- [ ] metric: renderer
- [ ] metric: chart type and scenario
- [ ] metric: total, visible, rendered points, and series count
- [ ] metric: initial render time
- [ ] metric: median frame time during interaction
- [ ] metric: p95 frame time during interaction
- [ ] metric: max frame time during interaction
- [ ] metric: dropped frames or frames over 16.7 ms where available
- [ ] metric: memory before and after scenario
- [ ] metric: visible correctness notes for clipping, tooltip stacking, and gesture conflicts

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix performance --row ios-svg-candlestick-pan-pinch-and-tap-inspection --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### android-svg-small-line-initial-render

Target: Android / Small line initial render

Status: partial

Launch: `chartkitshowcase://showcase?story=v2-perf-line-100&visual=1`

Capture:

- `npm run release:qa:capture -- --matrix performance --row android-svg-small-line-initial-render --platform android --output docs/release/artifacts/android-svg-small-line-initial-render.png --android-log-output docs/release/artifacts/android-svg-small-line-initial-render.log`

Existing Evidence:

- `docs/release/artifacts/android-svg-small-line-initial-render-performance.md`

Acceptance Checks:

- [ ] scenario: data size 100 points
- [ ] scenario: expected story metrics chart line; 100 total; 100 visible; 1 series
- [ ] scenario: interaction initial render
- [ ] metric: commit SHA
- [ ] metric: package version
- [ ] metric: platform, OS, device, and simulator/emulator/physical flag
- [ ] metric: build type
- [ ] metric: renderer
- [ ] metric: chart type and scenario
- [ ] metric: total, visible, rendered points, and series count
- [ ] metric: initial render time
- [ ] metric: median frame time during interaction
- [ ] metric: p95 frame time during interaction
- [ ] metric: max frame time during interaction
- [ ] metric: dropped frames or frames over 16.7 ms where available
- [ ] metric: memory before and after scenario
- [ ] metric: visible correctness notes for clipping, tooltip stacking, and gesture conflicts

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix performance --row android-svg-small-line-initial-render --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### android-svg-standard-line-scrub

Target: Android / Standard line scrub

Status: partial

Launch: `chartkitshowcase://showcase?story=v2-perf-line-1000-scrub&visual=1`

Capture:

- `npm run release:qa:capture -- --matrix performance --row android-svg-standard-line-scrub --platform android --output docs/release/artifacts/android-svg-standard-line-scrub.png --android-log-output docs/release/artifacts/android-svg-standard-line-scrub.log`

Existing Evidence:

- `docs/release/artifacts/android-svg-standard-line-scrub-performance.md`

Acceptance Checks:

- [ ] scenario: data size 1,000 points
- [ ] scenario: expected story metrics chart line; 1,000 total; 1,000 visible; 1 series
- [ ] scenario: interaction initial render and scrub
- [ ] metric: commit SHA
- [ ] metric: package version
- [ ] metric: platform, OS, device, and simulator/emulator/physical flag
- [ ] metric: build type
- [ ] metric: renderer
- [ ] metric: chart type and scenario
- [ ] metric: total, visible, rendered points, and series count
- [ ] metric: initial render time
- [ ] metric: median frame time during interaction
- [ ] metric: p95 frame time during interaction
- [ ] metric: max frame time during interaction
- [ ] metric: dropped frames or frames over 16.7 ms where available
- [ ] metric: memory before and after scenario
- [ ] metric: visible correctness notes for clipping, tooltip stacking, and gesture conflicts

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix performance --row android-svg-standard-line-scrub --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### android-svg-dense-line-decimated-overview

Target: Android / Dense line decimated overview

Status: partial

Launch: `chartkitshowcase://showcase?story=v2-perf-line-10000-overview&visual=1`

Capture:

- `npm run release:qa:capture -- --matrix performance --row android-svg-dense-line-decimated-overview --platform android --output docs/release/artifacts/android-svg-dense-line-decimated-overview.png --android-log-output docs/release/artifacts/android-svg-dense-line-decimated-overview.log`

Existing Evidence:

- `docs/release/artifacts/android-svg-dense-line-decimated-overview-performance.md`

Acceptance Checks:

- [ ] scenario: data size 10,000 total points
- [ ] scenario: expected story metrics chart line; 10,000 total; 10,000 visible; 1 series
- [ ] scenario: interaction decimated overview
- [ ] metric: commit SHA
- [ ] metric: package version
- [ ] metric: platform, OS, device, and simulator/emulator/physical flag
- [ ] metric: build type
- [ ] metric: renderer
- [ ] metric: chart type and scenario
- [ ] metric: total, visible, rendered points, and series count
- [ ] metric: initial render time
- [ ] metric: median frame time during interaction
- [ ] metric: p95 frame time during interaction
- [ ] metric: max frame time during interaction
- [ ] metric: dropped frames or frames over 16.7 ms where available
- [ ] metric: memory before and after scenario
- [ ] metric: visible correctness notes for clipping, tooltip stacking, and gesture conflicts

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix performance --row android-svg-dense-line-decimated-overview --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### android-svg-multi-line-shared-tooltip-scrub

Target: Android / Multi-line shared tooltip scrub

Status: partial

Launch: `chartkitshowcase://showcase?story=v2-perf-line-5x1000-tooltip&visual=1`

Capture:

- `npm run release:qa:capture -- --matrix performance --row android-svg-multi-line-shared-tooltip-scrub --platform android --output docs/release/artifacts/android-svg-multi-line-shared-tooltip-scrub.png --android-log-output docs/release/artifacts/android-svg-multi-line-shared-tooltip-scrub.log`

Existing Evidence:

- `docs/release/artifacts/android-svg-multi-line-shared-tooltip-scrub-performance.md`

Acceptance Checks:

- [ ] scenario: data size 5 series x 1,000 points
- [ ] scenario: expected story metrics chart line; 1,000 total; 1,000 visible; 5 series
- [ ] scenario: interaction shared tooltip scrub
- [ ] metric: commit SHA
- [ ] metric: package version
- [ ] metric: platform, OS, device, and simulator/emulator/physical flag
- [ ] metric: build type
- [ ] metric: renderer
- [ ] metric: chart type and scenario
- [ ] metric: total, visible, rendered points, and series count
- [ ] metric: initial render time
- [ ] metric: median frame time during interaction
- [ ] metric: p95 frame time during interaction
- [ ] metric: max frame time during interaction
- [ ] metric: dropped frames or frames over 16.7 ms where available
- [ ] metric: memory before and after scenario
- [ ] metric: visible correctness notes for clipping, tooltip stacking, and gesture conflicts

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix performance --row android-svg-multi-line-shared-tooltip-scrub --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### android-svg-scrollable-line-one-finger-pan

Target: Android / Scrollable line one-finger pan

Status: partial

Launch: `chartkitshowcase://showcase?story=v2-perf-line-10000-pan&visual=1`

Capture:

- `npm run release:qa:capture -- --matrix performance --row android-svg-scrollable-line-one-finger-pan --platform android --output docs/release/artifacts/android-svg-scrollable-line-one-finger-pan.png --android-log-output docs/release/artifacts/android-svg-scrollable-line-one-finger-pan.log`

Existing Evidence:

- `docs/release/artifacts/android-svg-scrollable-line-one-finger-pan-performance.md`

Acceptance Checks:

- [ ] scenario: data size 10,000 total points, 2,000 shown
- [ ] scenario: expected story metrics chart line; 10,000 total; 2,000 visible; 1 series
- [ ] scenario: interaction one-finger pan
- [ ] metric: commit SHA
- [ ] metric: package version
- [ ] metric: platform, OS, device, and simulator/emulator/physical flag
- [ ] metric: build type
- [ ] metric: renderer
- [ ] metric: chart type and scenario
- [ ] metric: total, visible, rendered points, and series count
- [ ] metric: initial render time
- [ ] metric: median frame time during interaction
- [ ] metric: p95 frame time during interaction
- [ ] metric: max frame time during interaction
- [ ] metric: dropped frames or frames over 16.7 ms where available
- [ ] metric: memory before and after scenario
- [ ] metric: visible correctness notes for clipping, tooltip stacking, and gesture conflicts

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix performance --row android-svg-scrollable-line-one-finger-pan --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### android-svg-range-selector-drag-and-thumb-resize

Target: Android / Range selector drag and thumb resize

Status: partial

Launch: `chartkitshowcase://showcase?story=v2-perf-range-2x10000&visual=1`

Capture:

- `npm run release:qa:capture -- --matrix performance --row android-svg-range-selector-drag-and-thumb-resize --platform android --output docs/release/artifacts/android-svg-range-selector-drag-and-thumb-resize.png --android-log-output docs/release/artifacts/android-svg-range-selector-drag-and-thumb-resize.log`

Existing Evidence:

- `docs/release/artifacts/android-svg-range-selector-drag-and-thumb-resize-performance.md`

Acceptance Checks:

- [ ] scenario: data size 2 series x 10,000 points
- [ ] scenario: expected story metrics chart line; 10,000 total; 1,500 visible; 2 series
- [ ] scenario: interaction drag and thumb resize
- [ ] metric: commit SHA
- [ ] metric: package version
- [ ] metric: platform, OS, device, and simulator/emulator/physical flag
- [ ] metric: build type
- [ ] metric: renderer
- [ ] metric: chart type and scenario
- [ ] metric: total, visible, rendered points, and series count
- [ ] metric: initial render time
- [ ] metric: median frame time during interaction
- [ ] metric: p95 frame time during interaction
- [ ] metric: max frame time during interaction
- [ ] metric: dropped frames or frames over 16.7 ms where available
- [ ] metric: memory before and after scenario
- [ ] metric: visible correctness notes for clipping, tooltip stacking, and gesture conflicts

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix performance --row android-svg-range-selector-drag-and-thumb-resize --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### android-svg-scrollable-bar-horizontal-scroll-and-selection

Target: Android / Scrollable bar horizontal scroll and selection

Status: partial

Launch: `chartkitshowcase://showcase?story=v2-perf-bar-500-selection&visual=1`

Capture:

- `npm run release:qa:capture -- --matrix performance --row android-svg-scrollable-bar-horizontal-scroll-and-selection --platform android --output docs/release/artifacts/android-svg-scrollable-bar-horizontal-scroll-and-selection.png --android-log-output docs/release/artifacts/android-svg-scrollable-bar-horizontal-scroll-and-selection.log`

Existing Evidence:

- `docs/release/artifacts/android-svg-scrollable-bar-horizontal-scroll-and-selection-performance.md`

Acceptance Checks:

- [ ] scenario: data size 500 bars
- [ ] scenario: expected story metrics chart bar; 500 total; 24 visible; 1 series
- [ ] scenario: interaction horizontal scroll and selection
- [ ] metric: commit SHA
- [ ] metric: package version
- [ ] metric: platform, OS, device, and simulator/emulator/physical flag
- [ ] metric: build type
- [ ] metric: renderer
- [ ] metric: chart type and scenario
- [ ] metric: total, visible, rendered points, and series count
- [ ] metric: initial render time
- [ ] metric: median frame time during interaction
- [ ] metric: p95 frame time during interaction
- [ ] metric: max frame time during interaction
- [ ] metric: dropped frames or frames over 16.7 ms where available
- [ ] metric: memory before and after scenario
- [ ] metric: visible correctness notes for clipping, tooltip stacking, and gesture conflicts

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix performance --row android-svg-scrollable-bar-horizontal-scroll-and-selection --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### android-svg-combined-chart-shared-tooltip-and-legend

Target: Android / Combined chart shared tooltip and legend

Status: partial

Launch: `chartkitshowcase://showcase?story=v2-perf-combined-tooltip&visual=1`

Capture:

- `npm run release:qa:capture -- --matrix performance --row android-svg-combined-chart-shared-tooltip-and-legend --platform android --output docs/release/artifacts/android-svg-combined-chart-shared-tooltip-and-legend.png --android-log-output docs/release/artifacts/android-svg-combined-chart-shared-tooltip-and-legend.log`

Existing Evidence:

- `docs/release/artifacts/android-svg-combined-chart-shared-tooltip-and-legend-performance.md`

Acceptance Checks:

- [ ] scenario: data size bars plus line
- [ ] scenario: expected story metrics chart combined; 36 total; 36 visible; 2 series
- [ ] scenario: interaction shared tooltip and legend
- [ ] metric: commit SHA
- [ ] metric: package version
- [ ] metric: platform, OS, device, and simulator/emulator/physical flag
- [ ] metric: build type
- [ ] metric: renderer
- [ ] metric: chart type and scenario
- [ ] metric: total, visible, rendered points, and series count
- [ ] metric: initial render time
- [ ] metric: median frame time during interaction
- [ ] metric: p95 frame time during interaction
- [ ] metric: max frame time during interaction
- [ ] metric: dropped frames or frames over 16.7 ms where available
- [ ] metric: memory before and after scenario
- [ ] metric: visible correctness notes for clipping, tooltip stacking, and gesture conflicts

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix performance --row android-svg-combined-chart-shared-tooltip-and-legend --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### android-svg-candlestick-pan-pinch-and-tap-inspection

Target: Android / Candlestick pan, pinch, and tap inspection

Status: partial

Launch: `chartkitshowcase://showcase?story=v2-perf-candlestick-1000&visual=1`

Capture:

- `npm run release:qa:capture -- --matrix performance --row android-svg-candlestick-pan-pinch-and-tap-inspection --platform android --output docs/release/artifacts/android-svg-candlestick-pan-pinch-and-tap-inspection.png --android-log-output docs/release/artifacts/android-svg-candlestick-pan-pinch-and-tap-inspection.log`

Existing Evidence:

- `docs/release/artifacts/android-svg-candlestick-pan-pinch-and-tap-inspection-performance.md`

Acceptance Checks:

- [ ] scenario: data size 1,000 candles
- [ ] scenario: expected story metrics chart candlestick; 1,000 total; 80 visible; 1 series
- [ ] scenario: interaction pan, pinch, tap inspection
- [ ] metric: commit SHA
- [ ] metric: package version
- [ ] metric: platform, OS, device, and simulator/emulator/physical flag
- [ ] metric: build type
- [ ] metric: renderer
- [ ] metric: chart type and scenario
- [ ] metric: total, visible, rendered points, and series count
- [ ] metric: initial render time
- [ ] metric: median frame time during interaction
- [ ] metric: p95 frame time during interaction
- [ ] metric: max frame time during interaction
- [ ] metric: dropped frames or frames over 16.7 ms where available
- [ ] metric: memory before and after scenario
- [ ] metric: visible correctness notes for clipping, tooltip stacking, and gesture conflicts

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix performance --row android-svg-candlestick-pan-pinch-and-tap-inspection --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`
## Runtime QA

Matrix: `docs/release/evidence/native-runtime-matrix.json`

Status: partial

Counts: partial=16

### ios-line-charts

Target: iOS / Line Charts

Status: partial

Launch: `chartkitshowcase://showcase?view=charts&page=line-area`

Capture:

- `npm run release:qa:capture -- --matrix runtime --row ios-line-charts --platform ios --output docs/release/artifacts/ios-line-charts.png --ios-log-output docs/release/artifacts/ios-line-charts.log`

Existing Evidence:

- `docs/release/artifacts/ios-runtime-smoke.png`
- `docs/release/artifacts/ios-line-charts.png`
- `docs/release/artifacts/ios-line-charts.log`

Acceptance Checks:

- [ ] global: page opens without red-screen warnings or console errors
- [ ] global: app-level menu, theme mode, and preset switching work after chart interactions
- [ ] global: tooltips render above chart content, legends, axes, labels, and overlays
- [ ] global: tooltips shift or flip instead of clipping against chart or screen edges
- [ ] global: chart labels do not trigger text selection on web, Expo web, or native-web surfaces
- [ ] global: theme switching does not leave stale colors in chart surfaces
- [ ] global: rotation or width changes keep charts inside parent bounds without clipped labels
- [ ] line: tap selection can be enabled without scrub
- [ ] line: scrub selection updates continuously and does not flicker
- [ ] line: while-active scrub hides tooltip on release
- [ ] line: main-plot pan blocks vertical page scroll while dragging
- [ ] line: pinch zoom does not fight vertical page scroll or leave invalid viewport
- [ ] line: range selector drag and thumb resize block vertical page scroll while active
- [ ] line: multi-series selection keeps marker, tooltip, legend, and external consumers in sync
- [ ] line: outside tap dismisses only within the configured provider scope

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix runtime --row ios-line-charts --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### ios-bar-charts

Target: iOS / Bar Charts

Status: partial

Launch: `chartkitshowcase://showcase?view=charts&page=bar`

Capture:

- `npm run release:qa:capture -- --matrix runtime --row ios-bar-charts --platform ios --output docs/release/artifacts/ios-bar-charts.png --ios-log-output docs/release/artifacts/ios-bar-charts.log`

Existing Evidence:

- `docs/release/artifacts/ios-runtime-bar-charts.png`
- `docs/release/artifacts/ios-bar-charts.png`
- `docs/release/artifacts/ios-bar-charts.log`

Acceptance Checks:

- [ ] global: page opens without red-screen warnings or console errors
- [ ] global: app-level menu, theme mode, and preset switching work after chart interactions
- [ ] global: tooltips render above chart content, legends, axes, labels, and overlays
- [ ] global: tooltips shift or flip instead of clipping against chart or screen edges
- [ ] global: chart labels do not trigger text selection on web, Expo web, or native-web surfaces
- [ ] global: theme switching does not leave stale colors in chart surfaces
- [ ] global: rotation or width changes keep charts inside parent bounds without clipped labels
- [ ] bar: tap selection animates without moving bar layout
- [ ] bar: scrollable bars preserve bottom labels and selected hit targets
- [ ] bar: scrollable selectable bars drag horizontally without vertical scroll conflicts
- [ ] bar: first and last bar tooltips are not clipped by axes or labels
- [ ] bar: gridlines stay behind inactive, dimmed, selected, and custom-rendered bars

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix runtime --row ios-bar-charts --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### ios-combined-preview

Target: iOS / Combined Preview

Status: partial

Launch: `chartkitshowcase://showcase?view=charts&page=combined`

Capture:

- `npm run release:qa:capture -- --matrix runtime --row ios-combined-preview --platform ios --output docs/release/artifacts/ios-combined-preview.png --ios-log-output docs/release/artifacts/ios-combined-preview.log`

Existing Evidence:

- `docs/release/artifacts/ios-runtime-combined-preview.png`
- `docs/release/artifacts/ios-combined-preview.png`
- `docs/release/artifacts/ios-combined-preview.log`

Acceptance Checks:

- [ ] global: page opens without red-screen warnings or console errors
- [ ] global: app-level menu, theme mode, and preset switching work after chart interactions
- [ ] global: tooltips render above chart content, legends, axes, labels, and overlays
- [ ] global: tooltips shift or flip instead of clipping against chart or screen edges
- [ ] global: chart labels do not trigger text selection on web, Expo web, or native-web surfaces
- [ ] global: theme switching does not leave stale colors in chart surfaces
- [ ] global: rotation or width changes keep charts inside parent bounds without clipped labels
- [ ] combinedFinancial: shared tooltip values match selected x value across visible series
- [ ] combinedFinancial: legend toggles update visible series without stale tooltip content
- [ ] combinedFinancial: dual-axis values remain visually tied to the correct axis
- [ ] combinedFinancial: candlestick tap inspection selects the expected candle
- [ ] combinedFinancial: candlestick pan, pinch, and range selector keep candle, volume, and session-gap overlays aligned

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix runtime --row ios-combined-preview --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### ios-financial-preview

Target: iOS / Financial Preview

Status: partial

Launch: `chartkitshowcase://showcase?view=charts&page=financial`

Capture:

- `npm run release:qa:capture -- --matrix runtime --row ios-financial-preview --platform ios --output docs/release/artifacts/ios-financial-preview.png --ios-log-output docs/release/artifacts/ios-financial-preview.log`

Existing Evidence:

- `docs/release/artifacts/ios-runtime-financial-preview.png`
- `docs/release/artifacts/ios-financial-preview.png`
- `docs/release/artifacts/ios-financial-preview.log`

Acceptance Checks:

- [ ] global: page opens without red-screen warnings or console errors
- [ ] global: app-level menu, theme mode, and preset switching work after chart interactions
- [ ] global: tooltips render above chart content, legends, axes, labels, and overlays
- [ ] global: tooltips shift or flip instead of clipping against chart or screen edges
- [ ] global: chart labels do not trigger text selection on web, Expo web, or native-web surfaces
- [ ] global: theme switching does not leave stale colors in chart surfaces
- [ ] global: rotation or width changes keep charts inside parent bounds without clipped labels
- [ ] combinedFinancial: shared tooltip values match selected x value across visible series
- [ ] combinedFinancial: legend toggles update visible series without stale tooltip content
- [ ] combinedFinancial: dual-axis values remain visually tied to the correct axis
- [ ] combinedFinancial: candlestick tap inspection selects the expected candle
- [ ] combinedFinancial: candlestick pan, pinch, and range selector keep candle, volume, and session-gap overlays aligned

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix runtime --row ios-financial-preview --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### ios-pie-donut

Target: iOS / Pie & Donut

Status: partial

Launch: `chartkitshowcase://showcase?view=charts&page=pie-donut`

Capture:

- `npm run release:qa:capture -- --matrix runtime --row ios-pie-donut --platform ios --output docs/release/artifacts/ios-pie-donut.png --ios-log-output docs/release/artifacts/ios-pie-donut.log`

Existing Evidence:

- `docs/release/artifacts/ios-runtime-pie-donut.png`
- `docs/release/artifacts/ios-pie-donut.png`
- `docs/release/artifacts/ios-pie-donut.log`

Acceptance Checks:

- [ ] global: page opens without red-screen warnings or console errors
- [ ] global: app-level menu, theme mode, and preset switching work after chart interactions
- [ ] global: tooltips render above chart content, legends, axes, labels, and overlays
- [ ] global: tooltips shift or flip instead of clipping against chart or screen edges
- [ ] global: chart labels do not trigger text selection on web, Expo web, or native-web surfaces
- [ ] global: theme switching does not leave stale colors in chart surfaces
- [ ] global: rotation or width changes keep charts inside parent bounds without clipped labels
- [ ] radialHeatmap: slice, segment, ring, and heatmap cell selection returns the expected item
- [ ] radialHeatmap: long labels and legends do not cover selected slices or tooltips
- [ ] radialHeatmap: progress values and heatmap cells remain tappable at small widths
- [ ] radialHeatmap: empty, zero, and missing data states render without runtime errors

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix runtime --row ios-pie-donut --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### ios-progress

Target: iOS / Progress

Status: partial

Launch: `chartkitshowcase://showcase?view=charts&page=progress`

Capture:

- `npm run release:qa:capture -- --matrix runtime --row ios-progress --platform ios --output docs/release/artifacts/ios-progress.png --ios-log-output docs/release/artifacts/ios-progress.log`

Existing Evidence:

- `docs/release/artifacts/ios-runtime-progress.png`
- `docs/release/artifacts/ios-progress.png`
- `docs/release/artifacts/ios-progress.log`

Acceptance Checks:

- [ ] global: page opens without red-screen warnings or console errors
- [ ] global: app-level menu, theme mode, and preset switching work after chart interactions
- [ ] global: tooltips render above chart content, legends, axes, labels, and overlays
- [ ] global: tooltips shift or flip instead of clipping against chart or screen edges
- [ ] global: chart labels do not trigger text selection on web, Expo web, or native-web surfaces
- [ ] global: theme switching does not leave stale colors in chart surfaces
- [ ] global: rotation or width changes keep charts inside parent bounds without clipped labels
- [ ] radialHeatmap: slice, segment, ring, and heatmap cell selection returns the expected item
- [ ] radialHeatmap: long labels and legends do not cover selected slices or tooltips
- [ ] radialHeatmap: progress values and heatmap cells remain tappable at small widths
- [ ] radialHeatmap: empty, zero, and missing data states render without runtime errors

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix runtime --row ios-progress --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### ios-heatmaps

Target: iOS / Heatmaps

Status: partial

Launch: `chartkitshowcase://showcase?view=charts&page=heatmaps`

Capture:

- `npm run release:qa:capture -- --matrix runtime --row ios-heatmaps --platform ios --output docs/release/artifacts/ios-heatmaps.png --ios-log-output docs/release/artifacts/ios-heatmaps.log`

Existing Evidence:

- `docs/release/artifacts/ios-runtime-heatmaps.png`
- `docs/release/artifacts/ios-heatmaps.png`
- `docs/release/artifacts/ios-heatmaps.log`

Acceptance Checks:

- [ ] global: page opens without red-screen warnings or console errors
- [ ] global: app-level menu, theme mode, and preset switching work after chart interactions
- [ ] global: tooltips render above chart content, legends, axes, labels, and overlays
- [ ] global: tooltips shift or flip instead of clipping against chart or screen edges
- [ ] global: chart labels do not trigger text selection on web, Expo web, or native-web surfaces
- [ ] global: theme switching does not leave stale colors in chart surfaces
- [ ] global: rotation or width changes keep charts inside parent bounds without clipped labels
- [ ] radialHeatmap: slice, segment, ring, and heatmap cell selection returns the expected item
- [ ] radialHeatmap: long labels and legends do not cover selected slices or tooltips
- [ ] radialHeatmap: progress values and heatmap cells remain tappable at small widths
- [ ] radialHeatmap: empty, zero, and missing data states render without runtime errors

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix runtime --row ios-heatmaps --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### ios-compatibility

Target: iOS / Compatibility

Status: partial

Launch: `chartkitshowcase://showcase?view=charts&page=compat`

Capture:

- `npm run release:qa:capture -- --matrix runtime --row ios-compatibility --platform ios --output docs/release/artifacts/ios-compatibility.png --ios-log-output docs/release/artifacts/ios-compatibility.log`

Existing Evidence:

- `docs/release/artifacts/ios-runtime-compatibility.png`
- `docs/release/artifacts/ios-compatibility.png`
- `docs/release/artifacts/ios-compatibility.log`

Acceptance Checks:

- [ ] global: page opens without red-screen warnings or console errors
- [ ] global: app-level menu, theme mode, and preset switching work after chart interactions
- [ ] global: tooltips render above chart content, legends, axes, labels, and overlays
- [ ] global: tooltips shift or flip instead of clipping against chart or screen edges
- [ ] global: chart labels do not trigger text selection on web, Expo web, or native-web surfaces
- [ ] global: theme switching does not leave stale colors in chart surfaces
- [ ] global: rotation or width changes keep charts inside parent bounds without clipped labels
- [ ] compat: legacy facade fixtures render without runtime errors
- [ ] compat: legacy labels remain visible within chart bounds
- [ ] compat: compatibility dark-mode fixtures follow app-level theme switching

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix runtime --row ios-compatibility --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### android-line-charts

Target: Android / Line Charts

Status: partial

Launch: `chartkitshowcase://showcase?view=charts&page=line-area`

Capture:

- `npm run release:qa:capture -- --matrix runtime --row android-line-charts --platform android --output docs/release/artifacts/android-line-charts.png --android-log-output docs/release/artifacts/android-line-charts.log`

Existing Evidence:

- `docs/release/artifacts/android-runtime-smoke.png`
- `docs/release/artifacts/android-line-charts.png`
- `docs/release/artifacts/android-line-charts.log`

Acceptance Checks:

- [ ] global: page opens without red-screen warnings or console errors
- [ ] global: app-level menu, theme mode, and preset switching work after chart interactions
- [ ] global: tooltips render above chart content, legends, axes, labels, and overlays
- [ ] global: tooltips shift or flip instead of clipping against chart or screen edges
- [ ] global: chart labels do not trigger text selection on web, Expo web, or native-web surfaces
- [ ] global: theme switching does not leave stale colors in chart surfaces
- [ ] global: rotation or width changes keep charts inside parent bounds without clipped labels
- [ ] line: tap selection can be enabled without scrub
- [ ] line: scrub selection updates continuously and does not flicker
- [ ] line: while-active scrub hides tooltip on release
- [ ] line: main-plot pan blocks vertical page scroll while dragging
- [ ] line: pinch zoom does not fight vertical page scroll or leave invalid viewport
- [ ] line: range selector drag and thumb resize block vertical page scroll while active
- [ ] line: multi-series selection keeps marker, tooltip, legend, and external consumers in sync
- [ ] line: outside tap dismisses only within the configured provider scope

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix runtime --row android-line-charts --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### android-bar-charts

Target: Android / Bar Charts

Status: partial

Launch: `chartkitshowcase://showcase?view=charts&page=bar`

Capture:

- `npm run release:qa:capture -- --matrix runtime --row android-bar-charts --platform android --output docs/release/artifacts/android-bar-charts.png --android-log-output docs/release/artifacts/android-bar-charts.log`

Existing Evidence:

- `docs/release/artifacts/android-runtime-bar-charts.png`
- `docs/release/artifacts/android-bar-charts.png`
- `docs/release/artifacts/android-bar-charts.log`

Acceptance Checks:

- [ ] global: page opens without red-screen warnings or console errors
- [ ] global: app-level menu, theme mode, and preset switching work after chart interactions
- [ ] global: tooltips render above chart content, legends, axes, labels, and overlays
- [ ] global: tooltips shift or flip instead of clipping against chart or screen edges
- [ ] global: chart labels do not trigger text selection on web, Expo web, or native-web surfaces
- [ ] global: theme switching does not leave stale colors in chart surfaces
- [ ] global: rotation or width changes keep charts inside parent bounds without clipped labels
- [ ] bar: tap selection animates without moving bar layout
- [ ] bar: scrollable bars preserve bottom labels and selected hit targets
- [ ] bar: scrollable selectable bars drag horizontally without vertical scroll conflicts
- [ ] bar: first and last bar tooltips are not clipped by axes or labels
- [ ] bar: gridlines stay behind inactive, dimmed, selected, and custom-rendered bars

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix runtime --row android-bar-charts --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### android-combined-preview

Target: Android / Combined Preview

Status: partial

Launch: `chartkitshowcase://showcase?view=charts&page=combined`

Capture:

- `npm run release:qa:capture -- --matrix runtime --row android-combined-preview --platform android --output docs/release/artifacts/android-combined-preview.png --android-log-output docs/release/artifacts/android-combined-preview.log`

Existing Evidence:

- `docs/release/artifacts/android-runtime-combined-preview.png`
- `docs/release/artifacts/android-combined-preview.png`
- `docs/release/artifacts/android-combined-preview.log`

Acceptance Checks:

- [ ] global: page opens without red-screen warnings or console errors
- [ ] global: app-level menu, theme mode, and preset switching work after chart interactions
- [ ] global: tooltips render above chart content, legends, axes, labels, and overlays
- [ ] global: tooltips shift or flip instead of clipping against chart or screen edges
- [ ] global: chart labels do not trigger text selection on web, Expo web, or native-web surfaces
- [ ] global: theme switching does not leave stale colors in chart surfaces
- [ ] global: rotation or width changes keep charts inside parent bounds without clipped labels
- [ ] combinedFinancial: shared tooltip values match selected x value across visible series
- [ ] combinedFinancial: legend toggles update visible series without stale tooltip content
- [ ] combinedFinancial: dual-axis values remain visually tied to the correct axis
- [ ] combinedFinancial: candlestick tap inspection selects the expected candle
- [ ] combinedFinancial: candlestick pan, pinch, and range selector keep candle, volume, and session-gap overlays aligned

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix runtime --row android-combined-preview --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### android-financial-preview

Target: Android / Financial Preview

Status: partial

Launch: `chartkitshowcase://showcase?view=charts&page=financial`

Capture:

- `npm run release:qa:capture -- --matrix runtime --row android-financial-preview --platform android --output docs/release/artifacts/android-financial-preview.png --android-log-output docs/release/artifacts/android-financial-preview.log`

Existing Evidence:

- `docs/release/artifacts/android-runtime-financial-preview.png`
- `docs/release/artifacts/android-financial-preview.png`
- `docs/release/artifacts/android-financial-preview.log`

Acceptance Checks:

- [ ] global: page opens without red-screen warnings or console errors
- [ ] global: app-level menu, theme mode, and preset switching work after chart interactions
- [ ] global: tooltips render above chart content, legends, axes, labels, and overlays
- [ ] global: tooltips shift or flip instead of clipping against chart or screen edges
- [ ] global: chart labels do not trigger text selection on web, Expo web, or native-web surfaces
- [ ] global: theme switching does not leave stale colors in chart surfaces
- [ ] global: rotation or width changes keep charts inside parent bounds without clipped labels
- [ ] combinedFinancial: shared tooltip values match selected x value across visible series
- [ ] combinedFinancial: legend toggles update visible series without stale tooltip content
- [ ] combinedFinancial: dual-axis values remain visually tied to the correct axis
- [ ] combinedFinancial: candlestick tap inspection selects the expected candle
- [ ] combinedFinancial: candlestick pan, pinch, and range selector keep candle, volume, and session-gap overlays aligned

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix runtime --row android-financial-preview --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### android-pie-donut

Target: Android / Pie & Donut

Status: partial

Launch: `chartkitshowcase://showcase?view=charts&page=pie-donut`

Capture:

- `npm run release:qa:capture -- --matrix runtime --row android-pie-donut --platform android --output docs/release/artifacts/android-pie-donut.png --android-log-output docs/release/artifacts/android-pie-donut.log`

Existing Evidence:

- `docs/release/artifacts/android-runtime-pie-donut.png`
- `docs/release/artifacts/android-pie-donut.png`
- `docs/release/artifacts/android-pie-donut.log`

Acceptance Checks:

- [ ] global: page opens without red-screen warnings or console errors
- [ ] global: app-level menu, theme mode, and preset switching work after chart interactions
- [ ] global: tooltips render above chart content, legends, axes, labels, and overlays
- [ ] global: tooltips shift or flip instead of clipping against chart or screen edges
- [ ] global: chart labels do not trigger text selection on web, Expo web, or native-web surfaces
- [ ] global: theme switching does not leave stale colors in chart surfaces
- [ ] global: rotation or width changes keep charts inside parent bounds without clipped labels
- [ ] radialHeatmap: slice, segment, ring, and heatmap cell selection returns the expected item
- [ ] radialHeatmap: long labels and legends do not cover selected slices or tooltips
- [ ] radialHeatmap: progress values and heatmap cells remain tappable at small widths
- [ ] radialHeatmap: empty, zero, and missing data states render without runtime errors

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix runtime --row android-pie-donut --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### android-progress

Target: Android / Progress

Status: partial

Launch: `chartkitshowcase://showcase?view=charts&page=progress`

Capture:

- `npm run release:qa:capture -- --matrix runtime --row android-progress --platform android --output docs/release/artifacts/android-progress.png --android-log-output docs/release/artifacts/android-progress.log`

Existing Evidence:

- `docs/release/artifacts/android-runtime-progress.png`
- `docs/release/artifacts/android-progress.png`
- `docs/release/artifacts/android-progress.log`

Acceptance Checks:

- [ ] global: page opens without red-screen warnings or console errors
- [ ] global: app-level menu, theme mode, and preset switching work after chart interactions
- [ ] global: tooltips render above chart content, legends, axes, labels, and overlays
- [ ] global: tooltips shift or flip instead of clipping against chart or screen edges
- [ ] global: chart labels do not trigger text selection on web, Expo web, or native-web surfaces
- [ ] global: theme switching does not leave stale colors in chart surfaces
- [ ] global: rotation or width changes keep charts inside parent bounds without clipped labels
- [ ] radialHeatmap: slice, segment, ring, and heatmap cell selection returns the expected item
- [ ] radialHeatmap: long labels and legends do not cover selected slices or tooltips
- [ ] radialHeatmap: progress values and heatmap cells remain tappable at small widths
- [ ] radialHeatmap: empty, zero, and missing data states render without runtime errors

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix runtime --row android-progress --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### android-heatmaps

Target: Android / Heatmaps

Status: partial

Launch: `chartkitshowcase://showcase?view=charts&page=heatmaps`

Capture:

- `npm run release:qa:capture -- --matrix runtime --row android-heatmaps --platform android --output docs/release/artifacts/android-heatmaps.png --android-log-output docs/release/artifacts/android-heatmaps.log`

Existing Evidence:

- `docs/release/artifacts/android-runtime-heatmaps.png`
- `docs/release/artifacts/android-heatmaps.png`
- `docs/release/artifacts/android-heatmaps.log`

Acceptance Checks:

- [ ] global: page opens without red-screen warnings or console errors
- [ ] global: app-level menu, theme mode, and preset switching work after chart interactions
- [ ] global: tooltips render above chart content, legends, axes, labels, and overlays
- [ ] global: tooltips shift or flip instead of clipping against chart or screen edges
- [ ] global: chart labels do not trigger text selection on web, Expo web, or native-web surfaces
- [ ] global: theme switching does not leave stale colors in chart surfaces
- [ ] global: rotation or width changes keep charts inside parent bounds without clipped labels
- [ ] radialHeatmap: slice, segment, ring, and heatmap cell selection returns the expected item
- [ ] radialHeatmap: long labels and legends do not cover selected slices or tooltips
- [ ] radialHeatmap: progress values and heatmap cells remain tappable at small widths
- [ ] radialHeatmap: empty, zero, and missing data states render without runtime errors

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix runtime --row android-heatmaps --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`

### android-compatibility

Target: Android / Compatibility

Status: partial

Launch: `chartkitshowcase://showcase?view=charts&page=compat`

Capture:

- `npm run release:qa:capture -- --matrix runtime --row android-compatibility --platform android --output docs/release/artifacts/android-compatibility.png --android-log-output docs/release/artifacts/android-compatibility.log`

Existing Evidence:

- `docs/release/artifacts/android-runtime-compatibility.png`
- `docs/release/artifacts/android-compatibility.png`
- `docs/release/artifacts/android-compatibility.log`

Acceptance Checks:

- [ ] global: page opens without red-screen warnings or console errors
- [ ] global: app-level menu, theme mode, and preset switching work after chart interactions
- [ ] global: tooltips render above chart content, legends, axes, labels, and overlays
- [ ] global: tooltips shift or flip instead of clipping against chart or screen edges
- [ ] global: chart labels do not trigger text selection on web, Expo web, or native-web surfaces
- [ ] global: theme switching does not leave stale colors in chart surfaces
- [ ] global: rotation or width changes keep charts inside parent bounds without clipped labels
- [ ] compat: legacy facade fixtures render without runtime errors
- [ ] compat: legacy labels remain visible within chart bounds
- [ ] compat: compatibility dark-mode fixtures follow app-level theme switching

Reviewer Signoff:

- [ ] Device / OS recorded
- [ ] Build surface recorded
- [ ] Reviewer recorded
- [ ] Date recorded
- [ ] Screenshots, logs, profiler output, or recordings attached
- [ ] All acceptance checks above passed on the accepted target

Record Command:

`npm run release:qa:record -- --matrix runtime --row android-compatibility --status pass --evidence <artifact> --reviewed-by "<name>" --device "<device / OS>" --build-surface "<release build surface>" --notes "<checks passed>"`
## Skia Renderer

Matrix: `docs/release/evidence/skia-renderer-matrix.json`

Status: complete

Counts: pass=8

No open rows.

<!-- prettier-ignore-end -->

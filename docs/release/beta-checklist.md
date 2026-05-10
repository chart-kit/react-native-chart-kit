# Developer Preview Release Checklist

This checklist tracks CKV2-017 readiness for the H5-approved Developer Preview. It is not release-candidate approval.

## Package And Version

- Current version: `7.0.0-next.0`
- Current root package name: `react-native-chart-kit`
- Current modern workspace package: `@chart-kit/react-native`
- Package strategy: `react-native-chart-kit` remains the compatibility path; `@chart-kit/react-native` is the modern v2 API for new adopters
- Dist-tag target for Developer Preview: `next`
- Publish manifest: [package-manifest.json](evidence/package-manifest.json) is the source of truth for Developer Preview-publishable packages. It publishes `@chart-kit/core`, `@chart-kit/svg-renderer`, `@chart-kit/react-native`, and then the root compatibility package `react-native-chart-kit`; it pack-checks but does not publish `@chart-kit/skia-renderer` or `@chart-kit/pro`.
- npm access prerequisite: the `NPM_TOKEN` used by GitHub Actions must exist, authenticate with npm, and be able to create and publish public packages under the `@chart-kit` scope. The publish workflow checks for the secret, runs `npm whoami`, and runs `npm access list packages @chart-kit --json` before expensive build/test work so missing auth or scope access fails early.

## Required Checks

Run these before requesting H5 review:

```sh
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run test:visual
npm run benchmark
npm run boundaries:check
npm run surface:check
npm run skia:parity
npm run release:preview:gate:report
npm run docs:build
npm run example:rn-cli:typecheck
npm run native:release:dry-run
npm run build
npm run pack:check
```

Manual example commands:

- `npm run example:expo` starts the Expo showcase for phone/device review.
- `npm run example:ios` starts the Expo showcase with the iOS dev target. It requires local iOS tooling.
- `npm run example:android` starts the Expo showcase with the Android dev target. It requires local Android tooling.
- `npm run example:rn-cli:typecheck` verifies the non-Expo RN CLI app source and Metro import aliases.
- `npm run native:release:dry-run` prints the generated native release-build commands without requiring local native projects.
- `npm run native:release:android` and `npm run native:release:ios` run the release-build checks documented in [Native release checks](native-release-checks.md).
- `npm run release:preview:gate:report` prints Developer Preview readiness without failing.
- `npm run release:gate:report` prints RC/stable readiness; `npm run release:gate` is the strict RC/stable gate and should fail until H6 is approved.

The `test:e2e` command covers web showcase interaction flows. The example commands are not native release-build checks and must not be counted as passing automated native coverage.

The `docs:build` command validates local links, balanced code fences, JS/TS markdown fence syntax, and public TS/TSX docs examples. Integrated docs example coverage still runs through `npm run rn:typecheck`.

The `pack:check` command runs `npm pack --dry-run --json --ignore-scripts` for every package in the release package manifest, using a repo-local temp npm cache. It verifies package names, package metadata, README files, built `dist` entrypoints, and the modern `pro-preview` subpath artifacts. The publish workflow reads the same manifest for the Developer Preview publish list so preview-only packages cannot be published by an unrelated hardcoded loop. Keep dependency packages before the root compatibility package in the manifest so scoped package access failures happen before the root package is published. After publishing, the workflow runs `npm run release:publish:status -- --strict` and creates the GitHub prerelease only if the npm registry shows the publishable packages under `next`, the preview-only packages unpublished, and the release does not already exist; idempotent reruns skip already-published package versions and existing releases.

Use [Smoke Test Checks](smoke-test-checks.md) for preview review. Do not use native QA matrices, row checklists, or owner reports as the path to Developer Preview completion.

Use `npm run release:native-workflow:record -- --list` to inspect native release workflow evidence. After a green workflow run, record the run URL, commit, and both platform artifact links with `--run-url`, `--commit`, `--ios-artifact`, and `--android-artifact`.

Use `npm run release:publish:status` to compare the Developer Preview package manifest against actual npm registry state. It should report the scoped free packages and root compatibility package under `next`, while `@chart-kit/pro` and `@chart-kit/skia-renderer` remain unpublished for Developer Preview. Add `-- --strict` when a complete publish is expected.

Use [npm-publish-runbook.md](npm-publish-runbook.md) when rerunning the Developer Preview publish workflow for future `next` prereleases. It documents the required token properties, idempotent rerun command, dist-tag caveats, and post-publish registry checks.

Use [native-workflow-runbook.md](native-workflow-runbook.md) when making the native release workflow visible on the default branch, dispatching it for the release-candidate commit, and recording iOS/Android workflow artifacts.

Use `npm run release:owner:record -- --list` to inspect H4/H5/H6 owner gates. Owner approval should be recorded through the same command with `--gate`, `--approved-by`, and one `--decision` value for each pending decision. Do not ask the owner to duplicate the native QA matrix in long-form reports; summarize evidence and unresolved risk instead.

## Preview Smoke Review

- Expo showcase opens on a phone with `npm run example:expo`.
- Line Charts page covers free baseline examples plus Pro-candidate animation, range selector, viewport pan/zoom, scrub tooltip, markers, references, and multi-series examples.
- Bar Charts page covers free baseline examples plus Pro-candidate grouped, selectable, animated, scrollable, horizontal, negative, and stacked percentage examples.
- Combined Preview page covers Pro-candidate dual-axis revenue/margin, shared tooltip, legend toggles, and negative values.
- Pie & Donut, Progress, Heatmaps, and Financial Preview pages render with app-level theme switching.
- Compatibility page still shows line, bar, and stacked-bar fixtures.

## Release Artifacts

- [Accessibility QA protocol](accessibility-qa.md)
- [Smoke test checks](smoke-test-checks.md)
- [Owner smoke notes](artifacts/owner-smoke-notes-2026-05-10.md)
- [Native performance benchmark protocol](native-performance-benchmark.md)
- [Native runtime QA protocol](native-runtime-qa.md)
- [Migration guide](../migration/from-v1.md)
- `chartkit-codemod v1-to-v2`
- [Prop mapping](../migration/prop-mapping.md)
- [Installation guide](../getting-started/installation.md)
- [Production recipes](../recipes/README.md)
- [Troubleshooting guide](../troubleshooting.md)
- [Known issues](known-issues.md)
- [NPM publish runbook](npm-publish-runbook.md)
- [Native workflow runbook](native-workflow-runbook.md)
- [H4 Pro scope decision packet](h4-pro-scope.md)
- [H4 owner decision memo](h4-owner-decision-memo.md)
- [H5 Developer Preview evidence](h5-beta-gate-evidence.md)
- [H5 owner decision memo](h5-owner-decision-memo.md)
- [H6 owner decision memo](h6-owner-decision-memo.md)
- [Native release workflow evidence manifest](evidence/native-release-workflow.json)
- [Skia renderer evidence manifest](evidence/skia-renderer-evidence.json)
- [Changelog](../../CHANGELOG.md)

## H5 Owner Decision

H5 is approved for Developer Preview with these constraints:

- publish free packages only under the `next` dist-tag
- do not publish `@chart-kit/pro`
- do not publish `@chart-kit/skia-renderer`
- native runtime, accessibility, and performance gaps must stay disclosed
- advanced workflows remain preview or Pro-candidate
- `CandlestickChart` remains Financial Preview

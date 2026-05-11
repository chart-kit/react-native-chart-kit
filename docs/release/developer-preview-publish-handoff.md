# Developer Preview Publish Handoff

Status on May 11, 2026: `7.0.0-next.1` is ready for an owner-approved `next`
publish workflow run. It is not published yet.

Use this handoff only for the Developer Preview `next` dist-tag. It is not a
stable release or H6 approval path.

## Current State

- Source version: `7.0.0-next.1`
- Latest published Developer Preview: `7.0.0-next.0`
- Publish target: free packages only, under `next`
- Do not publish: `@chart-kit/pro`, `@chart-kit/skia-renderer`
- Current preflight: `npm run release:preview:publish:preflight` passed from
  current HEAD
- Current preview gate: `pass=118 warn=1 block=0 fail=0`
- Expected warning: publish evidence still records `7.0.0-next.0` until the
  next publish succeeds

## Before Running

Run:

```sh
npm run release:preview:publish:preflight
```

Expected pre-publish result:

- `@chart-kit/core@7.0.0-next.1`: missing
- `@chart-kit/svg-renderer@7.0.0-next.1`: missing
- `@chart-kit/react-native@7.0.0-next.1`: missing
- `react-native-chart-kit@7.0.0-next.1`: missing
- `@chart-kit/pro@7.0.0-next.1`: unpublished
- `@chart-kit/skia-renderer@7.0.0-next.1`: unpublished

## Run Publish

Only after owner approval:

```sh
gh workflow run publish.yml --ref next -f npm_tag=next
gh run watch <run-id> --exit-status
```

The workflow runs the Developer Preview gate before npm writes, skips already
published packages on idempotent reruns, verifies the `next` dist-tag after
publish, creates the GitHub prerelease, records npm publish evidence, and
uploads that evidence as a workflow artifact.

## After Success

Verify npm:

```sh
npm run release:publish:status -- --strict --dist-tag next
npm view @chart-kit/core@next version
npm view @chart-kit/svg-renderer@next version
npm view @chart-kit/react-native@next version
npm view react-native-chart-kit@next version
npm dist-tag ls react-native-chart-kit
```

Expected:

- free packages resolve to `7.0.0-next.1` under `next`
- `react-native-chart-kit@latest` remains `6.12.2`
- Pro and Skia remain unpublished

Download evidence:

```sh
gh run download <run-id> \
  --name npm-publish-evidence-7.0.0-next.1 \
  --dir /tmp/chartkit-npm-publish-evidence
```

Replace
`docs/release/evidence/npm-publish-evidence.json` with the downloaded
`npm-publish-evidence.json`, then rerun:

```sh
npm run docs:build
npm run release:gate:report
```

After evidence is updated, the `publish:source-version-evidence` warning should
clear. H6 should still remain blocked until the owner explicitly approves the
stable release-candidate decisions.

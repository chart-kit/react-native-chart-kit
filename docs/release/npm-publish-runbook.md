# NPM Developer Preview Publish Runbook

Status on May 6, 2026: the Developer Preview npm publish is blocked on GitHub Actions npm authentication. `react-native-chart-kit@7.0.0-next.0` is already published under `next`; the scoped free packages are still missing.

## Publish Target

Publish these packages under the `next` dist-tag:

- `@chart-kit/core@7.0.0-next.0`
- `@chart-kit/svg-renderer@7.0.0-next.0`
- `@chart-kit/react-native@7.0.0-next.0`
- `react-native-chart-kit@7.0.0-next.0`

Do not publish these packages for Developer Preview:

- `@chart-kit/skia-renderer@7.0.0-next.0`
- `@chart-kit/pro@7.0.0-next.0`

The publish workflow reads [package-manifest.json](evidence/package-manifest.json), so the package list above should not be duplicated manually in the workflow.

## Current Blocker

The latest publish rerun failed before install/build because GitHub Actions received an empty npm auth token:

- [Publish rerun 25416750710](https://github.com/indiespirit/react-native-chart-kit/actions/runs/25416750710)
- [Publish rerun 25417506026](https://github.com/indiespirit/react-native-chart-kit/actions/runs/25417506026)
- [Publish rerun 25417790177](https://github.com/indiespirit/react-native-chart-kit/actions/runs/25417790177)
- Evidence: [npm-publish-evidence.json](evidence/npm-publish-evidence.json)

The workflow expects a repository Actions secret named `NPM_TOKEN`.

## Required Token Properties

The `NPM_TOKEN` secret must:

- authenticate with `npm whoami`
- publish public packages
- create or publish packages under the `@chart-kit` npm scope
- work in CI without interactive 2FA prompts
- remain scoped to npm package publishing, not general GitHub access

If the npm account or organization enforces 2FA for publishing, use a publish-capable automation or granular access token that npm accepts from CI.

## Preflight Checks

After adding the GitHub secret, the workflow checks:

```sh
npm whoami
npm access list packages @chart-kit --json
```

The second command must succeed for the token-owning npm account. If the `@chart-kit` scope does not exist or the token cannot access it, create or claim the scope and grant publish rights before rerunning the workflow.

Local status check:

```sh
npm run release:publish:status
```

Expected state before the auth fix:

- `react-native-chart-kit@7.0.0-next.0`: published under `next`
- `@chart-kit/core@7.0.0-next.0`: missing
- `@chart-kit/svg-renderer@7.0.0-next.0`: missing
- `@chart-kit/react-native@7.0.0-next.0`: missing
- `@chart-kit/skia-renderer@7.0.0-next.0`: unpublished, expected
- `@chart-kit/pro@7.0.0-next.0`: unpublished, expected

## Rerun Publish

Run the workflow from the `next` branch with npm tag `next`:

```sh
gh workflow run publish.yml --ref next -f npm_tag=next
gh run watch <run-id> --exit-status
```

The workflow is idempotent for already-published package versions. On rerun, it should skip `react-native-chart-kit@7.0.0-next.0` and publish the missing scoped free packages.

The workflow will fail if:

- it is not run from `next`
- `NPM_TOKEN` is missing or invalid
- the token cannot access `@chart-kit`
- `latest` is selected for a prerelease version
- a GitHub release tag for the same package version already exists
- `npm run release:publish:status -- --strict` does not see the expected registry state after publish

## Post-Publish Verification

After the workflow succeeds, run:

```sh
npm run release:publish:status -- --strict
npm view @chart-kit/core@next version
npm view @chart-kit/svg-renderer@next version
npm view @chart-kit/react-native@next version
npm view react-native-chart-kit@next version
```

Expected versions:

```text
7.0.0-next.0
```

Confirm Pro and Skia remain unpublished:

```sh
npm view @chart-kit/pro@7.0.0-next.0 version
npm view @chart-kit/skia-renderer@7.0.0-next.0 version
```

Those commands should fail with npm not-found output during Developer Preview.

## After Successful Publish

Update the release evidence:

- [npm-publish-evidence.json](evidence/npm-publish-evidence.json)
- [known-issues.md](known-issues.md), removing or revising the Developer Preview Package Publish blocker
- [completion-audit.md](../internal/completion-audit.md), changing Developer Preview publish from missing to covered

Then rerun:

```sh
npm run docs:build
npm run release:gate:report
```

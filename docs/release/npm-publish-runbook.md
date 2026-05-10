# NPM Developer Preview Publish Runbook

Status on May 6, 2026: Developer Preview npm publishing is complete for `7.0.0-next.0`. The successful workflow run is [25441203278](https://github.com/indiespirit/react-native-chart-kit/actions/runs/25441203278), and the GitHub prerelease is [v7.0.0-next.0](https://github.com/indiespirit/react-native-chart-kit/releases/tag/v7.0.0-next.0).

The repository may be prepared for a newer unpublished `next` prerelease. For
future reruns, use the current `package.json` version as the publish target and
keep the package list controlled by [package-manifest.json](evidence/package-manifest.json).

## Publish Target

Published under the `next` dist-tag:

- `@chart-kit/core@7.0.0-next.0`
- `@chart-kit/svg-renderer@7.0.0-next.0`
- `@chart-kit/react-native@7.0.0-next.0`
- `react-native-chart-kit@7.0.0-next.0`

Not published for Developer Preview:

- `@chart-kit/skia-renderer@7.0.0-next.0`
- `@chart-kit/pro@7.0.0-next.0`

The publish workflow reads [package-manifest.json](evidence/package-manifest.json), so future package-list changes should happen in the manifest rather than in a hardcoded publish loop.

## Dist-Tag Notes

`react-native-chart-kit@latest` remains `6.12.2`, and `react-native-chart-kit@next` points to `7.0.0-next.0`. This protects existing users from accidental upgrades.

The new scoped packages currently show both `latest` and `next` pointing to `7.0.0-next.0`:

- `@chart-kit/core`
- `@chart-kit/svg-renderer`
- `@chart-kit/react-native`

npm rejected removal of `latest` for these packages with `E400` because each package has no stable version yet. The publish-state checker treats this as an explicit Developer Preview caveat only when no stable version exists. It still fails if an existing stable package has its `latest` tag moved to a prerelease.

## Required Token Properties

The `NPM_TOKEN` secret must:

- authenticate with `npm whoami`
- publish public packages
- create or publish packages under the `@chart-kit` npm scope
- work in CI without interactive 2FA prompts
- remain scoped to npm package publishing, not general GitHub access

Current preflight evidence is recorded in [npm-auth-preflight.json](evidence/npm-auth-preflight.json).

## Rerun Publish

Run the workflow from the `next` branch with npm tag `next`:

```sh
gh workflow run publish.yml --ref next -f npm_tag=next
gh run watch <run-id> --exit-status
```

The workflow is idempotent for already-published package versions. On rerun, it skips versions that already exist, accepts an existing Git tag only when all publishable packages are already present, attempts to remove unintended prerelease `latest` tags, verifies the final registry state, and then creates the GitHub prerelease only if it does not already exist.

The workflow fails if:

- it is not run from `next`
- `NPM_TOKEN` is missing or invalid
- `latest` is selected for a prerelease version
- the Git tag already exists while one or more publishable packages are still missing
- a publishable package is missing from the expected `next` dist-tag after publish
- a preview-only package is published
- an existing stable package has `latest` moved to a prerelease

## Post-Publish Verification

After the workflow succeeds, run:

```sh
npm run release:publish:status -- --strict
npm view @chart-kit/core@next version
npm view @chart-kit/svg-renderer@next version
npm view @chart-kit/react-native@next version
npm view react-native-chart-kit@next version
npm dist-tag ls react-native-chart-kit
```

Expected version output:

```text
<current package.json version>
```

Expected root package dist-tags:

```text
latest: 6.12.2
next: <current package.json version>
```

Confirm Pro and Skia remain unpublished:

```sh
npm view @chart-kit/pro@<current package.json version> version
npm view @chart-kit/skia-renderer@<current package.json version> version
```

Those commands should fail with npm not-found output during Developer Preview.

## Evidence To Update

After each future publish rerun, update:

- [npm-publish-evidence.json](evidence/npm-publish-evidence.json)
- [known-issues.md](known-issues.md), if the publish caveats changed
- [completion-audit.md](../internal/completion-audit.md), if release-gate status changed

Then rerun:

```sh
npm run docs:build
npm run release:gate:report
```

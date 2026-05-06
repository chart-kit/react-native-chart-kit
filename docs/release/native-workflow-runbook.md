# Native Workflow Runbook

Status on May 6, 2026: native iOS and Android release builds passed locally, but the GitHub `Native Release Checks` workflow has not produced release-candidate evidence yet.

## Current Blocker

GitHub Actions only exposes manually dispatched workflows after the workflow file exists on the repository default branch. The workflow file currently exists on `next`, while the repository default branch is `master`, so `workflow_dispatch` is not available yet for `.github/workflows/native-release.yml`.

The workflow is also configured to run on relevant `next` pushes. Use that path when the workflow is not dispatchable from the UI yet.

Do not mark the native workflow evidence complete until a green workflow run exists on the release-candidate commit and both platform artifacts are archived.

## Required Evidence

The release gate requires:

- green `Native Release Checks` workflow run on the release-candidate commit
- iOS release-build log artifact
- Android release-build log artifact
- Android release APK artifact when generated
- recorded workflow URL, commit SHA, and artifact links in [native-release-workflow.json](evidence/native-release-workflow.json)

Local release-build passes are useful smoke evidence, but they do not replace this workflow evidence for RC/stable.

## Run From A `next` Push

Push a release-candidate commit to `next` that touches the workflow, showcase, packages, lockfile, package metadata, or native release script paths covered by the workflow `push` trigger. Then watch the resulting workflow run:

```sh
gh run list --workflow native-release.yml --branch next --limit 5
gh run watch <run-id> --exit-status
```

## Make The Workflow Dispatchable

For manual runs, choose one of these owner-approved paths:

- Merge the workflow file into the default branch as part of the release branch process.
- Temporarily add the workflow file to the default branch, then dispatch it against `next` or the release-candidate branch.
- Change the repository default branch after the release branch is ready, if that matches the repository strategy.

After the workflow is visible from the default branch, verify it appears in GitHub Actions:

```sh
gh workflow list
```

## Run The Workflow

Run the native release workflow on the release-candidate branch or commit:

```sh
gh workflow run native-release.yml --ref next
gh run watch <run-id> --exit-status
```

If the workflow fails, use the uploaded logs first. The jobs upload artifacts even on failure where possible.

## Record Passing Evidence

After the workflow passes, collect the artifact links from the workflow run and record them:

```sh
npm run release:native-workflow:record -- \
  --run-url https://github.com/indiespirit/react-native-chart-kit/actions/runs/<run-id> \
  --commit <release-candidate-sha> \
  --ios-artifact https://github.com/indiespirit/react-native-chart-kit/actions/runs/<run-id>/artifacts/<ios-artifact-id> \
  --android-artifact https://github.com/indiespirit/react-native-chart-kit/actions/runs/<run-id>/artifacts/<android-artifact-id>
```

Then verify the gate status:

```sh
npm run release:gate:report
```

The `blocker:native-workflow-evidence` blocker should disappear only after the workflow manifest is complete.

## Related Local Checks

Run these before relying on the workflow:

```sh
npm run native:release:dry-run
npm run native:release:android
npm run native:release:ios
```

These commands are documented in [Native release checks](native-release-checks.md). Local results are tracked in [Native release results](native-release-results.md).

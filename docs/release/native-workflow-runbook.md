# Native Workflow Runbook

Status on May 6, 2026: native iOS and Android release builds passed locally and the GitHub `Native Release Checks` workflow has passed on `next` with archived platform evidence.

## Current Evidence

The workflow is available through `workflow_dispatch` and is also configured to run on relevant `next` pushes. Use manual dispatch when refreshing evidence for a release-candidate commit that does not otherwise touch workflow-triggered paths.

The current recorded evidence lives in [native-release-workflow.json](evidence/native-release-workflow.json). Keep it current by recording the latest green workflow run whenever the release-candidate commit changes.

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

## Verify Manual Dispatch

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

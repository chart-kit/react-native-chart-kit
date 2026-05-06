# Native Release Results

Last updated: May 5, 2026.

These results document local native release-build attempts for the Expo showcase. They do not replace green CI workflow artifacts for production beta/RC.

## Summary

| Check                            | Result                                                                                                  |
| -------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `npm run native:release:dry-run` | Passed. Printed Expo prebuild, Android Gradle release, CocoaPods, and iOS Xcode release-build commands. |
| `npm run native:release:ios`     | Passed locally outside the sandbox after CocoaPods downloaded native dependencies.                      |
| `npm run native:release:android` | Passed locally outside the sandbox with OpenJDK 17 and the Homebrew Android command-line tools SDK.     |

## iOS Evidence

Command:

```sh
npm run native:release:ios
```

Observed steps:

- `expo prebuild --platform ios --clean --no-install` completed.
- `pod install` completed after network access was allowed for React Native and Hermes artifacts.
- `xcodebuild -workspace ChartKitShowcase.xcworkspace -scheme ChartKitShowcase -configuration Release -destination generic/platform=iOS CODE_SIGNING_ALLOWED=NO build` completed.
- Final Xcode result: `BUILD SUCCEEDED`.

## Android Evidence

Command:

```sh
npm run native:release:android
```

Observed steps before the preflight was added:

- `expo prebuild --platform android --clean --no-install` completed.
- `android/gradlew assembleRelease` initially did not start a Gradle build because Java was not installed in the local environment.

Current local behavior:

- the native release script resolves a keg-only Homebrew OpenJDK 17 install when available
- the native release script resolves the Homebrew Android command-line tools SDK path when available
- the native release script fails before prebuild if Java or the Android SDK is missing
- `expo prebuild --platform android --clean --no-install` completed
- `android/gradlew assembleRelease` completed

Observed successful result:

```text
BUILD SUCCESSFUL in 1m 14s
357 actionable tasks: 333 executed, 24 up-to-date
```

Non-blocking warnings observed:

- Expo prebuild warned that `expo-system-ui` is required to enable `userInterfaceStyle`.
- Gradle emitted Expo/React Native deprecation warnings from generated native dependencies.
- Gradle warned that the daemon would stop after running out of JVM metaspace; the release build still completed successfully.

The GitHub `Native Release Checks` workflow configures Java and runs on an Android-capable hosted runner, so the next evidence step is a green workflow run. The default-branch dispatch and evidence-recording sequence is documented in [Native workflow runbook](native-workflow-runbook.md).

When the workflow runs, download the `native-release-android` and `native-release-ios` artifacts. The archived logs are expected at:

- `docs/release/artifacts/native-workflow/android-release.log`
- `docs/release/artifacts/native-workflow/ios-release.log`

Use those artifact links when updating [native-release-workflow.json](evidence/native-release-workflow.json):

```sh
npm run release:native-workflow:record -- \
  --run-url https://github.com/<owner>/<repo>/actions/runs/<run-id> \
  --commit <release-candidate-sha> \
  --ios-artifact https://github.com/<owner>/<repo>/actions/runs/<run-id>/artifacts/<ios-artifact-id> \
  --android-artifact https://github.com/<owner>/<repo>/actions/runs/<run-id>/artifacts/<android-artifact-id>
```

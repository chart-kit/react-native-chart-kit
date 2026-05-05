# Native Release Results

Last updated: May 5, 2026.

These results document local native release-build attempts for the Expo showcase. They do not replace green CI workflow artifacts for H5/H6.

## Summary

| Check                            | Result                                                                                                  |
| -------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `npm run native:release:dry-run` | Passed. Printed Expo prebuild, Android Gradle release, CocoaPods, and iOS Xcode release-build commands. |
| `npm run native:release:ios`     | Passed locally outside the sandbox after CocoaPods downloaded native dependencies.                      |
| `npm run native:release:android` | Blocked locally. Expo prebuild succeeded, then Gradle stopped because this machine has no Java runtime. |

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

Observed steps:

- `expo prebuild --platform android --clean --no-install` completed.
- `android/gradlew assembleRelease` did not start a Gradle build because Java is not installed in the local environment.

Local blocker:

```text
Unable to locate a Java Runtime.
```

The GitHub `Native Release Checks` workflow configures Java before running the Android release build, so the next evidence step is a green workflow run.

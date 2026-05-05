# Native Release Results

Last updated: May 5, 2026.

These results document local native release-build attempts for the Expo showcase. They do not replace green CI workflow artifacts for H5/H6.

## Summary

| Check                            | Result                                                                                                  |
| -------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `npm run native:release:dry-run` | Passed. Printed Expo prebuild, Android Gradle release, CocoaPods, and iOS Xcode release-build commands. |
| `npm run native:release:ios`     | Passed locally outside the sandbox after CocoaPods downloaded native dependencies.                      |
| `npm run native:release:android` | Blocked locally. OpenJDK 17 is available, but this machine has no configured Android SDK.               |

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
- the native release script fails before prebuild if Java or the Android SDK is missing
- after OpenJDK 17 was installed locally, Gradle reached project configuration and failed because no Android SDK path was configured

Local blocker:

```text
SDK location not found. Define a valid SDK location with an ANDROID_HOME environment variable or by setting the sdk.dir path in local.properties.
```

The GitHub `Native Release Checks` workflow configures Java and runs on an Android-capable hosted runner, so the next evidence step is either a local Android SDK install or a green workflow run.

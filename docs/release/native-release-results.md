# Native Release Results

Last updated: May 6, 2026.

These results document local native release-build attempts for the Expo showcase and the matching green native release workflow evidence.

## Summary

| Check                            | Result                                                                                                   |
| -------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `npm run native:release:dry-run` | Passed. Printed Expo prebuild, Android Gradle release, CocoaPods, and iOS Xcode release-build commands.  |
| `npm run native:release:ios`     | Passed locally outside the sandbox after CocoaPods downloaded native dependencies.                       |
| `npm run native:release:android` | Passed locally outside the sandbox with OpenJDK 17 and the Homebrew Android command-line tools SDK.      |
| Native Release Checks workflow   | Passed on `next` for commit `b3db5c3fe188264c6d3beb85e0de77e3b383468b` with archived platform artifacts. |

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

The GitHub `Native Release Checks` workflow configures Java and runs on an Android-capable hosted runner. On May 6, 2026, run `25443812256` passed both iOS and Android release-build jobs for commit `b3db5c3fe188264c6d3beb85e0de77e3b383468b`.

The recorded artifacts are:

- iOS artifact: `https://github.com/indiespirit/react-native-chart-kit/actions/runs/25443812256/artifacts/6834135468`
- Android artifact: `https://github.com/indiespirit/react-native-chart-kit/actions/runs/25443812256/artifacts/6834216118`

The evidence was recorded with:

```sh
npm run release:native-workflow:record -- \
  --run-url https://github.com/indiespirit/react-native-chart-kit/actions/runs/25443812256 \
  --commit b3db5c3fe188264c6d3beb85e0de77e3b383468b \
  --ios-artifact https://github.com/indiespirit/react-native-chart-kit/actions/runs/25443812256/artifacts/6834135468 \
  --android-artifact https://github.com/indiespirit/react-native-chart-kit/actions/runs/25443812256/artifacts/6834216118
```

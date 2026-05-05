# Native Release Checks

The web showcase and unit tests are not enough for release confidence. Native release builds catch Metro aliasing, Expo prebuild, Android Gradle, iOS CocoaPods, React Native SVG, and release-mode bundling issues.

## Commands

Run the dry-run first to inspect the exact commands:

```sh
npm run native:release:dry-run
```

Run platform-specific release checks:

```sh
npm run native:release:android
npm run native:release:ios
```

Run both platforms:

```sh
npm run native:release
```

These commands use `apps/expo-showcase` as the native smoke app. They run `expo prebuild --clean --no-install`, then build:

- Android: `android/gradlew assembleRelease`
- iOS: `pod install`, then `xcodebuild` with code signing disabled

Generated `apps/expo-showcase/android` and `apps/expo-showcase/ios` folders are intentionally ignored. They are build artifacts for verification, not source-owned app projects.

The release-check script restores `apps/expo-showcase/app.json` and `apps/expo-showcase/package.json` after prebuild so generated native checks do not rewrite the Expo Go review scripts.

## CI

The `Native Release Checks` workflow runs Android and iOS release-build jobs separately. It is available through `workflow_dispatch` and also runs on pull requests that touch package source, the showcase app, package manifests, or the native-release script.

Do not treat H5 or H6 as complete until this workflow has a green run on the release candidate commit, or until the owner explicitly accepts the native gap for an API-preview beta.

## Local Requirements

Android requires a working JDK and Android SDK. iOS requires macOS, Xcode command line tools, and CocoaPods.

Set `CK_IOS_SCHEME` if automatic scheme discovery does not match the generated Expo project:

```sh
CK_IOS_SCHEME=ChartKitShowcase npm run native:release:ios
```

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

Non-dry-run checks fail before prebuild if the required native toolchain is unavailable. Android requires Java plus an Android SDK path from `ANDROID_HOME`, `ANDROID_SDK_ROOT`, the default macOS `~/Library/Android/sdk` location, or the Homebrew command-line tools SDK path. The script can resolve a keg-only Homebrew OpenJDK 17 install automatically. iOS requires Xcode command line tools and CocoaPods.

Generated `apps/expo-showcase/android` and `apps/expo-showcase/ios` folders are intentionally ignored. They are build artifacts for verification, not source-owned app projects.

The release-check script restores `apps/expo-showcase/app.json` and `apps/expo-showcase/package.json` after prebuild so generated native checks do not rewrite the Expo Go review scripts.

## CI

The `Native Release Checks` workflow runs Android and iOS release-build jobs separately. It is available through `workflow_dispatch` and also runs on pull requests that touch package source, the showcase app, package manifests, or the native-release script.

Each workflow job writes native build output into `docs/release/artifacts/native-workflow/*-release.log` and uploads those logs as GitHub Actions artifacts. The Android job also uploads the generated release APK when present. These artifacts are the expected evidence source for clearing the native workflow blocker in the release gate.

Do not treat H5 or H6 as complete until this workflow has a green run on the release candidate commit, or until the owner explicitly accepts the native gap for an API-preview beta.

## Local Requirements

Android requires a working JDK and Android SDK. iOS requires macOS, Xcode command line tools, and CocoaPods.

Set `ANDROID_HOME` or `ANDROID_SDK_ROOT` if the Android SDK is not installed at the default macOS path:

```sh
ANDROID_HOME="$HOME/Library/Android/sdk" npm run native:release:android
```

Set `CK_IOS_SCHEME` if automatic scheme discovery does not match the generated Expo project:

```sh
CK_IOS_SCHEME=ChartKitShowcase npm run native:release:ios
```

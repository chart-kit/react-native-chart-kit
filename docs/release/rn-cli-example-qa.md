# React Native CLI Example QA

Status on May 6, 2026: source-level example coverage, Android/iOS release builds, and Android/iOS release runtime smoke evidence are complete for the non-Expo RN CLI smoke app. Structured evidence lives in [rn-cli-example-evidence.json](evidence/rn-cli-example-evidence.json).

The Expo showcase is the main visual and release-build QA surface today. The full v2 plan also requires a React Native CLI example so teams that do not use Expo can validate the package in a plain RN app.

## Current Baseline

The source-level example is in [examples/rn-cli-basic](../../examples/rn-cli-basic):

- `App.tsx` imports `@chart-kit/react-native`
- baseline charts render without Expo or Gesture Handler runtime wrappers
- `LineChart`, `BarChart`, and `ProgressRing` render from the modern API
- `metro.config.js` resolves local workspace packages during development
- `package.json` declares React Native, SVG, and Chart Kit dependencies
- root and example package metadata declare `@react-native-community/cli`, so the installed `react-native` binary can run CLI commands

Run the current check from the repo root:

```sh
npm run example:rn-cli:typecheck
npm run example:rn-cli:native:dry-run
```

Also verify the CLI is installed:

```sh
./node_modules/.bin/react-native --help
```

These are useful evidence for TypeScript, Metro-resolution intent, and CLI availability, but they are not native runtime evidence.

Android release-build evidence is captured in [rn-cli-android-release.log](artifacts/rn-cli-android-release.log). It proves the generated RN CLI app can install the local Chart Kit packages, bundle JavaScript, and complete `./gradlew assembleRelease` without Expo, Gesture Handler, or Reanimated.

Android release runtime smoke evidence is captured in [rn-cli-android-runtime-smoke.png](artifacts/rn-cli-android-runtime-smoke.png). It shows the generated Release APK installed and launched on the `chartkit_api36` emulator, rendering Chart Kit v2 line, bar, and progress charts without the Expo runtime.

iOS release-build evidence is captured in [rn-cli-ios-release.log](artifacts/rn-cli-ios-release.log). It proves the generated RN CLI app can install pods, auto-link only `RNSVG` as the chart native dependency, and complete generic Release `xcodebuild` with signing disabled.

iOS release runtime smoke evidence is captured in [rn-cli-ios-runtime-smoke.png](artifacts/rn-cli-ios-runtime-smoke.png). It shows a Release iphonesimulator build of the generated RN CLI app rendering Chart Kit v2 line and bar charts without the Expo runtime.

The RN CLI evidence is intentionally scoped to a plain native app build and runtime smoke. Full gesture, accessibility, and performance behavior remain tracked by the native runtime, accessibility, and performance evidence matrices.

## Required Native Evidence

Before H6 can be approved, keep the RN CLI evidence fresh for:

- Android and iOS release-build launch and chart rendering
- confirmation that the app does not require Expo runtime APIs

The evidence can come from a temporary QA branch, a checked-in native example, or CI artifacts. If the repo keeps generated native projects out of source control, link the exact command log and artifact bundle used to generate and build the projects.

## Suggested Verification

Use a clean working tree or throwaway branch, then:

```sh
npm run build
npm run example:rn-cli:typecheck
npm run example:rn-cli:ios -- --log-file docs/release/artifacts/rn-cli-ios-release.log
npm run example:rn-cli:android -- --log-file docs/release/artifacts/rn-cli-android-release.log
```

The native commands generate a transient React Native CLI app under the system temp directory, overlay the example chart screen, install local Chart Kit packages, install pods for iOS, and run release builds on both platforms. Attach refreshed build logs and screenshots or recordings to [rn-cli-example-evidence.json](evidence/rn-cli-example-evidence.json) when rerunning the smoke check.

Do not mark this evidence complete from the Expo showcase, web visual tests, or source typecheck alone.

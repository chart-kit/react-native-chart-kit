# React Native CLI Example QA

Status on May 6, 2026: source-level example coverage exists, but native CLI runtime evidence is incomplete. Structured evidence lives in [rn-cli-example-evidence.json](evidence/rn-cli-example-evidence.json).

The Expo showcase is the main visual and release-build QA surface today. The full v2 plan also requires a React Native CLI example so teams that do not use Expo can validate the package in a plain RN app.

## Current Baseline

The source-level example is in [examples/rn-cli-basic](../../examples/rn-cli-basic):

- `App.tsx` imports `@chart-kit/react-native`
- `GestureHandlerRootView` wraps gesture-enabled charts
- `LineChart`, `BarChart`, and `ProgressRing` render from the modern API
- `metro.config.js` resolves local workspace packages during development
- `package.json` declares React Native, Gesture Handler, SVG, and Chart Kit dependencies
- root and example package metadata declare `@react-native-community/cli`, so the installed `react-native` binary can run CLI commands

Run the current check from the repo root:

```sh
npm run example:rn-cli:typecheck
```

Also verify the CLI is installed:

```sh
./node_modules/.bin/react-native --help
```

These are useful evidence for TypeScript, Metro-resolution intent, and CLI availability, but they are not native runtime evidence.

## Required Native Evidence

Before H6 can be approved, capture real RN CLI evidence for:

- generated or maintained iOS native project
- generated or maintained Android native project
- iOS release-build launch and chart rendering
- Android release-build launch and chart rendering
- gesture sanity checks for at least line selection, bar selection, and vertical scroll containment
- confirmation that the app does not require Expo runtime APIs

The evidence can come from a temporary QA branch, a checked-in native example, or CI artifacts. If the repo keeps generated native projects out of source control, link the exact command log and artifact bundle used to generate and build the projects.

## Suggested Verification

Use a clean working tree or throwaway branch, then:

```sh
npm run build
npm run example:rn-cli:typecheck
```

Generate or refresh the native RN CLI projects with the React Native CLI version used by the example, install pods for iOS, and run release builds on both platforms. Attach build logs and screenshots or recordings to [rn-cli-example-evidence.json](evidence/rn-cli-example-evidence.json) before changing its status to `complete`.

Do not mark this evidence complete from the Expo showcase, web visual tests, or source typecheck alone.

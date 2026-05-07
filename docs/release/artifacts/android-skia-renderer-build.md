# Skia Native Install Evidence

Date: 2026-05-07
Commit: `aab853c`
Build surface: temporary native QA workspace
Platform target: android
Skia package: `@shopify/react-native-skia`
Skia peer packages: `react-native-reanimated@~4.1.1`
Showcase renderer mode: skia
Temporary workspace: `/var/folders/7s/fkbc25vs3q57wq6k8ttdvxmh0000gn/T/chartkit-skia-native-qa-MrD4wB`

This artifact records a native optional-Skia install check. It should only be
used for Skia matrix rows after the command succeeds and the resulting native
app is reviewed according to `docs/release/skia-renderer-qa.md`.

## Commands

```sh
$ cd . && git archive --format=tar --output=/var/folders/7s/fkbc25vs3q57wq6k8ttdvxmh0000gn/T/chartkit-skia-native-qa-MrD4wB.tar HEAD
$ cd . && tar -xf /var/folders/7s/fkbc25vs3q57wq6k8ttdvxmh0000gn/T/chartkit-skia-native-qa-MrD4wB.tar -C /var/folders/7s/fkbc25vs3q57wq6k8ttdvxmh0000gn/T/chartkit-skia-native-qa-MrD4wB
$ cd ../../../../var/folders/7s/fkbc25vs3q57wq6k8ttdvxmh0000gn/T/chartkit-skia-native-qa-MrD4wB && npm ci
$ cd ../../../../var/folders/7s/fkbc25vs3q57wq6k8ttdvxmh0000gn/T/chartkit-skia-native-qa-MrD4wB/apps/expo-showcase && npm install @shopify/react-native-skia react-native-reanimated@~4.1.1 --workspaces=false
$ cd ../../../../var/folders/7s/fkbc25vs3q57wq6k8ttdvxmh0000gn/T/chartkit-skia-native-qa-MrD4wB/apps/expo-showcase && npm ls @shopify/react-native-skia --depth=0 --workspaces=false
$ cd ../../../../var/folders/7s/fkbc25vs3q57wq6k8ttdvxmh0000gn/T/chartkit-skia-native-qa-MrD4wB && node scripts/prepare-skia-showcase-renderer-preview.mjs --app-dir apps/expo-showcase
$ cd ../../../../var/folders/7s/fkbc25vs3q57wq6k8ttdvxmh0000gn/T/chartkit-skia-native-qa-MrD4wB && npm --workspace @chart-kit/expo-showcase run typecheck
$ cd ../../../../var/folders/7s/fkbc25vs3q57wq6k8ttdvxmh0000gn/T/chartkit-skia-native-qa-MrD4wB && node scripts/run-expo-native-release-check.mjs --platform android --app-dir apps/expo-showcase
```

## Result

- Temporary workspace created from the current committed repository state.
- `@shopify/react-native-skia` installed only in the temporary showcase workspace.
- Skia peer packages installed only in the temporary showcase workspace.
- `@shopify/react-native-skia` verified with `npm ls`.
- Showcase renderer mode stayed `skia`.
- Existing native release check completed for `android`.

## Verified Output

- Installed package: `@shopify/react-native-skia@2.6.2`
- Showcase renderer mode: skia
- Skia Gradle project configured: yes
- Release build successful: yes
- Showcase Skia renderer injected: yes

## Caveats

- This install evidence does not by itself prove renderer parity screenshots.
- Performance comparison rows still require SVG-vs-Skia timing and memory data.
- Review metadata must still be recorded with `npm run release:qa:record`.

# Skia Native Install Evidence

Date: 2026-05-06
Commit: `aa44323`
Build surface: temporary native QA workspace
Platform target: ios
Skia package: `@shopify/react-native-skia`
Skia peer packages: `react-native-reanimated@~4.1.1`
Showcase renderer mode: skia
Temporary workspace: `/var/folders/7s/fkbc25vs3q57wq6k8ttdvxmh0000gn/T/chartkit-skia-native-qa-CAPHcX`

This artifact records a native optional-Skia install check. It should only be
used for Skia matrix rows after the command succeeds and the resulting native
app is reviewed according to `docs/release/skia-renderer-qa.md`.

## Commands

```sh
$ cd . && git archive --format=tar --output=/var/folders/7s/fkbc25vs3q57wq6k8ttdvxmh0000gn/T/chartkit-skia-native-qa-CAPHcX.tar HEAD
$ cd . && tar -xf /var/folders/7s/fkbc25vs3q57wq6k8ttdvxmh0000gn/T/chartkit-skia-native-qa-CAPHcX.tar -C /var/folders/7s/fkbc25vs3q57wq6k8ttdvxmh0000gn/T/chartkit-skia-native-qa-CAPHcX
$ cd ../../../../var/folders/7s/fkbc25vs3q57wq6k8ttdvxmh0000gn/T/chartkit-skia-native-qa-CAPHcX && npm ci
$ cd ../../../../var/folders/7s/fkbc25vs3q57wq6k8ttdvxmh0000gn/T/chartkit-skia-native-qa-CAPHcX/apps/expo-showcase && npm install @shopify/react-native-skia react-native-reanimated@~4.1.1 --workspaces=false
$ cd ../../../../var/folders/7s/fkbc25vs3q57wq6k8ttdvxmh0000gn/T/chartkit-skia-native-qa-CAPHcX/apps/expo-showcase && npm ls @shopify/react-native-skia --depth=0 --workspaces=false
$ cd ../../../../var/folders/7s/fkbc25vs3q57wq6k8ttdvxmh0000gn/T/chartkit-skia-native-qa-CAPHcX && node scripts/prepare-skia-showcase-renderer-preview.mjs --app-dir apps/expo-showcase
$ cd ../../../../var/folders/7s/fkbc25vs3q57wq6k8ttdvxmh0000gn/T/chartkit-skia-native-qa-CAPHcX && npm --workspace @chart-kit/expo-showcase run typecheck
$ cd ../../../../var/folders/7s/fkbc25vs3q57wq6k8ttdvxmh0000gn/T/chartkit-skia-native-qa-CAPHcX && node scripts/run-expo-native-release-check.mjs --platform ios --app-dir apps/expo-showcase
$ cd ../../../../var/folders/7s/fkbc25vs3q57wq6k8ttdvxmh0000gn/T/chartkit-skia-native-qa-CAPHcX && npm --workspace @chart-kit/expo-showcase exec expo -- run:ios --configuration Release --device A706C6A5-26A2-499F-B24A-A9FB574888B0 --no-bundler
```

## Result

- Temporary workspace created from the current committed repository state.
- `@shopify/react-native-skia` installed only in the temporary showcase workspace.
- Skia peer packages installed only in the temporary showcase workspace.
- `@shopify/react-native-skia` verified with `npm ls`.
- Showcase renderer mode stayed `skia`.
- Existing native release check completed for `ios`.
- iOS simulator install/run completed for `A706C6A5-26A2-499F-B24A-A9FB574888B0`.

## Verified Output

- Installed package: `@shopify/react-native-skia@2.6.2`
- Showcase renderer mode: skia
- Skia CocoaPods target autolinked: yes
- Release build successful: yes
- Showcase Skia renderer injected: yes

## Caveats

- This install evidence does not by itself prove renderer parity screenshots.
- Performance comparison rows still require SVG-vs-Skia timing and memory data.
- Review metadata must still be recorded with `npm run release:qa:record`.

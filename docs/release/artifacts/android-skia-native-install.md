# Skia Native Install Evidence

Date: 2026-05-06
Commit: `c602131`
Build surface: temporary native release workspace
Platform target: android
Skia package: `@shopify/react-native-skia`
Temporary workspace: `/var/folders/7s/fkbc25vs3q57wq6k8ttdvxmh0000gn/T/chartkit-skia-native-qa-heDfg0`

This artifact records a native optional-Skia install check. It should be used
as concise Skia release evidence after the command succeeds and the resulting
native app is reviewed according to `docs/release/skia-renderer-qa.md`.

## Commands

```sh
$ cd . && git archive --format=tar --output=/var/folders/7s/fkbc25vs3q57wq6k8ttdvxmh0000gn/T/chartkit-skia-native-qa-heDfg0.tar HEAD
$ cd . && tar -xf /var/folders/7s/fkbc25vs3q57wq6k8ttdvxmh0000gn/T/chartkit-skia-native-qa-heDfg0.tar -C /var/folders/7s/fkbc25vs3q57wq6k8ttdvxmh0000gn/T/chartkit-skia-native-qa-heDfg0
$ cd ../../../../var/folders/7s/fkbc25vs3q57wq6k8ttdvxmh0000gn/T/chartkit-skia-native-qa-heDfg0 && npm ci
$ cd ../../../../var/folders/7s/fkbc25vs3q57wq6k8ttdvxmh0000gn/T/chartkit-skia-native-qa-heDfg0/apps/expo-showcase && npm install @shopify/react-native-skia --workspaces=false
$ cd ../../../../var/folders/7s/fkbc25vs3q57wq6k8ttdvxmh0000gn/T/chartkit-skia-native-qa-heDfg0/apps/expo-showcase && npm ls @shopify/react-native-skia --depth=0 --workspaces=false
$ cd ../../../../var/folders/7s/fkbc25vs3q57wq6k8ttdvxmh0000gn/T/chartkit-skia-native-qa-heDfg0 && node scripts/run-expo-native-release-check.mjs --platform android --app-dir apps/expo-showcase
```

## Result

- Temporary workspace created from the current committed repository state.
- `@shopify/react-native-skia` installed only in the temporary showcase workspace.
- `@shopify/react-native-skia` verified with `npm ls`.
- Existing native release check completed for `android`.

## Verified Output

- Installed package: `@shopify/react-native-skia@2.6.2`
- Skia Gradle project configured: yes
- Release build successful: yes

## Caveats

- This install evidence does not by itself prove renderer parity screenshots.
- SVG-vs-Skia timing and memory data remain separate performance evidence.
- Review metadata should be summarized in the relevant release evidence file or
  smoke-test note.

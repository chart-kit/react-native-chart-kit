# Android Skia Pro Preview Parity Review

Date: 2026-05-07
Commit reviewed: `838a560`
Package version: `7.0.0-next.0`
Platform: Android emulator
Build surface: Release APK with injected Skia renderer
Device: `chartkit_api36` emulator / Android 16 API 36

This artifact records Android Skia renderer parity evidence for Pro-candidate
preview surfaces. The screenshots were captured from the installed release
showcase app via `npm run release:qa:capture`.

## Build Evidence

- [android-skia-renderer-build.md](android-skia-renderer-build.md)

## Captured Screens

| Surface                | Screenshot                                                                                                   | Log                                                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Combined chart page    | [android-skia-pro-preview-parity-1-combined.png](android-skia-pro-preview-parity-1-combined.png)             | [android-skia-pro-preview-parity-1-combined.log](android-skia-pro-preview-parity-1-combined.log)             |
| Financial preview page | [android-skia-pro-preview-parity-2-candlestick.png](android-skia-pro-preview-parity-2-candlestick.png)       | [android-skia-pro-preview-parity-2-candlestick.log](android-skia-pro-preview-parity-2-candlestick.log)       |
| Range selector focus   | [android-skia-pro-preview-parity-3-range-selector.png](android-skia-pro-preview-parity-3-range-selector.png) | [android-skia-pro-preview-parity-3-range-selector.log](android-skia-pro-preview-parity-3-range-selector.log) |
| Custom crosshair focus | [android-skia-pro-preview-parity-4-crosshair.png](android-skia-pro-preview-parity-4-crosshair.png)           | [android-skia-pro-preview-parity-4-crosshair.log](android-skia-pro-preview-parity-4-crosshair.log)           |
| Debug layout focus     | [android-skia-pro-preview-parity-5-debug-layout.png](android-skia-pro-preview-parity-5-debug-layout.png)     | [android-skia-pro-preview-parity-5-debug-layout.log](android-skia-pro-preview-parity-5-debug-layout.log)     |

## Result

- Combined chart and financial preview pages rendered nonblank native chart
  surfaces with visible dual axes, bar and line composition, candlestick
  geometry, range selector content, labels, legends, and tooltip overlays.
- Focused range selector, custom crosshair, and debug layout captures rendered
  the Pro-candidate interaction/layout surfaces without blank Skia canvases.
- A strict log scan found no `AndroidRuntime`, `FATAL EXCEPTION`, fatal signal,
  ANR, failed activity start, or React Native JavaScript error.

## Caveats

- Emulator logs include Skia/EGL surface warnings such as
  `eglQueryContext(2159): error 0x3004`, RNSkia `updateAndRelease()` lines
  that the native module logs as safely ignorable, and Android emulator
  `Surface.release` warnings.
- This is Android emulator visual parity evidence. Physical-device performance
  and final Skia-vs-SVG performance acceptance are tracked by separate rows.

## Status

Pass for Android emulator visual parity of the Pro-preview chart surface.

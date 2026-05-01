# @chart-kit/react-native-v2

Private experimental package for Chart Kit v2 React Native components.

The package is intentionally not exported from the legacy root package yet. It exists so modern components can be built and visually reviewed before public API approval.

Current exports:

- `LineChart`
- `AreaChart`

Current customization surface:

- theme colors
- theme typography for axis and legend labels
- configurable legend visibility, position, alignment, wrapping, marker style, spacing, item padding, and custom renderers
- x-axis label strategies: auto, show, skip, rotate, stagger, and hide
- edge label policies for shifting or hiding labels that would clip

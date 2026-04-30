# Showcase Web

Storybook lab for rendering `@chart-kit/react-native` with React Native Web.

```sh
npm run showcase
npm run showcase:build
npm run visual:test
npm run visual:update
```

This app is intentionally not the public docs site. Stories and fixtures here should stay deterministic so they can later feed docs, screenshots, and visual regression tests.

Visual tests build static Storybook, serve `storybook-static`, open story iframe URLs directly, and screenshot the `visual-frame` story target. Use `npm run visual:update` intentionally when accepting baseline changes.

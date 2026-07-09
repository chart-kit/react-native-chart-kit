import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@chart-kit/core": path.resolve(__dirname, "packages/core/src/index.ts"),
      "@chart-kit/svg-renderer": path.resolve(
        __dirname,
        "packages/svg-renderer/src/index.ts"
      )
    }
  },
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: [
        "packages/core/src/**/*.ts",
        "packages/react-native/src/**/*.ts",
        "packages/svg-renderer/src/**/*.{ts,tsx}"
      ],
      exclude: [
        "**/index.ts",
        "**/types.ts",
        "packages/react-native/src/**/*.tsx",
        "packages/react-native/src/**/use*.ts",
        "packages/react-native/src/charts/line/responders.ts",
        "packages/react-native/src/viewport/pan.ts",
        "packages/react-native/src/viewport/panResponder.ts",
        "packages/react-native/src/charts/*/*Animation.ts",
        "packages/react-native/src/charts/progress/animation.ts"
      ],
      thresholds: {
        statements: 90,
        branches: 80,
        functions: 95,
        lines: 90
      }
    },
    environment: "node",
    include: [
      "apps/**/*.test.ts",
      "packages/**/test/**/*.test.ts",
      "scripts/**/*.test.mjs",
      "src/**/*.test.ts",
      "test/**/*.test.ts"
    ],
    passWithNoTests: false
  }
});

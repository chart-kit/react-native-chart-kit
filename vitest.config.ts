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
    environment: "node",
    include: [
      "apps/**/*.test.ts",
      "packages/**/test/**/*.test.ts",
      "scripts/**/*.test.mjs",
      "src/**/*.test.ts"
    ],
    passWithNoTests: false
  }
});

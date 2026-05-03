import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@chart-kit/core": fileURLToPath(
        new URL("./packages/core/src/index.ts", import.meta.url)
      ),
      "@chart-kit/svg-renderer": fileURLToPath(
        new URL("./packages/svg-renderer/src/index.ts", import.meta.url)
      )
    }
  },
  test: {
    environment: "node",
    include: ["packages/**/test/**/*.test.ts", "src/**/*.test.ts"],
    passWithNoTests: false
  }
});

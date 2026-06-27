import { describe, expect, it } from "vitest";

import { getPackageExistsStatus } from "./check-npm-package-exists.mjs";

describe("npm package existence checker", () => {
  it("returns published status when the package version exists", async () => {
    await expect(
      getPackageExistsStatus({
        name: "react-native-chart-kit",
        npmView: async () => ({ exists: true, value: { version: "7.0.0" } }),
        version: "7.0.0"
      })
    ).resolves.toMatchObject({
      code: 0,
      status: "published"
    });
  });

  it("returns missing status for npm not-found responses", async () => {
    await expect(
      getPackageExistsStatus({
        name: "react-native-chart-kit",
        npmView: async () => ({
          error: "E404 Not Found",
          errorKind: "not-found",
          exists: false
        }),
        version: "7.0.0"
      })
    ).resolves.toMatchObject({
      code: 1,
      status: "missing"
    });
  });

  it("fails registry errors instead of treating them as missing packages", async () => {
    await expect(
      getPackageExistsStatus({
        name: "react-native-chart-kit",
        npmView: async () => ({
          error: "ETIMEDOUT registry.npmjs.org",
          errorKind: "registry-error",
          exists: false
        }),
        version: "7.0.0"
      })
    ).resolves.toMatchObject({
      code: 2,
      status: "registry-error"
    });
  });
});

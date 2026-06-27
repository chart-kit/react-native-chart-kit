import { describe, expect, it } from "vitest";

import {
  getPackageExistsStatus,
  parseCliArgs
} from "./check-npm-package-exists.mjs";

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

  it("retries missing packages before returning published status", async () => {
    const attempts = [];
    const retries = [];

    await expect(
      getPackageExistsStatus({
        name: "react-native-chart-kit",
        npmView: async () => {
          attempts.push("attempt");

          if (attempts.length < 3) {
            return {
              error: "E404 Not Found",
              errorKind: "not-found",
              exists: false
            };
          }

          return { exists: true, value: { version: "7.0.0" } };
        },
        onRetry: (retry) => retries.push(retry),
        retries: 3,
        retryDelayMs: 10,
        sleepFn: async () => undefined,
        version: "7.0.0"
      })
    ).resolves.toMatchObject({
      code: 0,
      status: "published"
    });

    expect(attempts).toHaveLength(3);
    expect(retries).toHaveLength(2);
    expect(retries[0]).toMatchObject({
      attempt: 1,
      delayMs: 10,
      maxRetries: 3,
      result: { status: "missing" }
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

  it("parses retry CLI options", () => {
    expect(
      parseCliArgs([
        "react-native-chart-kit",
        "7.0.0",
        "--retries",
        "12",
        "--retry-delay-ms=10000"
      ])
    ).toEqual({
      name: "react-native-chart-kit",
      retries: 12,
      retryDelayMs: 10000,
      version: "7.0.0"
    });
  });
});

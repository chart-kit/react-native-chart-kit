import { describe, expect, it } from "vitest";

import {
  buildSkiaNativeCommandPlan,
  getPackageNameFromSpec,
  parseSkiaNativeArgs
} from "./run-skia-native-release-check.mjs";

describe("Skia native release check runner", () => {
  it("parses the required platform and safe defaults", () => {
    expect(parseSkiaNativeArgs(["--platform", "android"])).toMatchObject({
      dryRun: false,
      keepTemp: false,
      platform: "android",
      skiaPackage: "@shopify/react-native-skia"
    });
  });

  it("supports dry-run, temp workspace, artifact, and custom package spec", () => {
    expect(
      parseSkiaNativeArgs([
        "--platform",
        "all",
        "--dry-run",
        "--keep-temp",
        "--temp-dir",
        "/tmp/chartkit",
        "--artifact",
        "docs/release/artifacts/skia.md",
        "--skia-package",
        "@shopify/react-native-skia@2"
      ])
    ).toMatchObject({
      artifact: "docs/release/artifacts/skia.md",
      dryRun: true,
      keepTemp: true,
      platform: "all",
      skiaPackage: "@shopify/react-native-skia@2",
      tempDir: "/tmp/chartkit"
    });
  });

  it("rejects missing or invalid platforms", () => {
    expect(() => parseSkiaNativeArgs([])).toThrow("--platform");
    expect(() =>
      parseSkiaNativeArgs(["--platform", "web"])
    ).toThrow("--platform must be one of ios, android, or all");
  });

  it("extracts package names from versioned npm specs", () => {
    expect(getPackageNameFromSpec("@shopify/react-native-skia@2")).toBe(
      "@shopify/react-native-skia"
    );
    expect(getPackageNameFromSpec("left-pad@1.3.0")).toBe("left-pad");
  });

  it("builds a temporary-workspace command plan", () => {
    const plan = buildSkiaNativeCommandPlan({
      archivePath: "/tmp/chartkit-skia.tar",
      platform: "ios",
      skiaPackage: "@shopify/react-native-skia@2",
      workspaceDir: "/tmp/chartkit-skia"
    });

    expect(plan.map((step) => step.command)).toEqual([
      "git",
      "tar",
      "npm",
      "npm",
      "npm",
      "node"
    ]);
    expect(plan[2].args).toEqual(["ci"]);
    expect(plan[3].args).toContain("@shopify/react-native-skia@2");
    expect(plan[4].args).toEqual([
      "ls",
      "@shopify/react-native-skia",
      "--workspace=@chart-kit/expo-showcase",
      "--depth=0"
    ]);
    expect(plan[5].args).toEqual([
      "scripts/run-expo-native-release-check.mjs",
      "--platform",
      "ios",
      "--app-dir",
      "apps/expo-showcase"
    ]);
  });
});

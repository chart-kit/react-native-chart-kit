import { describe, expect, it } from "vitest";

import {
  buildVerifiedOutput,
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
      renderer: "svg",
      skiaPackage: "@shopify/react-native-skia"
    });
  });

  it("supports dry-run, temp workspace, artifact, renderer, and custom package spec", () => {
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
        "--renderer",
        "skia",
        "--skia-package",
        "@shopify/react-native-skia@2"
      ])
    ).toMatchObject({
      artifact: "docs/release/artifacts/skia.md",
      dryRun: true,
      keepTemp: true,
      platform: "all",
      renderer: "skia",
      skiaPackage: "@shopify/react-native-skia@2",
      tempDir: "/tmp/chartkit"
    });
  });

  it("rejects missing or invalid platforms", () => {
    expect(() => parseSkiaNativeArgs([])).toThrow("--platform");
    expect(() =>
      parseSkiaNativeArgs(["--platform", "web"])
    ).toThrow("--platform must be one of ios, android, or all");
    expect(() =>
      parseSkiaNativeArgs(["--platform", "ios", "--renderer", "canvas"])
    ).toThrow("--renderer must be one of svg or skia");
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
    expect(plan[3].cwd.endsWith("/tmp/chartkit-skia/apps/expo-showcase")).toBe(
      true
    );
    expect(plan[3].args).toContain("@shopify/react-native-skia@2");
    expect(plan[3].args).toContain("--workspaces=false");
    expect(plan[4].args).toEqual([
      "ls",
      "@shopify/react-native-skia",
      "--depth=0",
      "--workspaces=false"
    ]);
    expect(plan[5].args).toEqual([
      "scripts/run-expo-native-release-check.mjs",
      "--platform",
      "ios",
      "--app-dir",
      "apps/expo-showcase"
    ]);
  });

  it("injects and typechecks the showcase when Skia renderer mode is requested", () => {
    const plan = buildSkiaNativeCommandPlan({
      archivePath: "/tmp/chartkit-skia.tar",
      platform: "android",
      renderer: "skia",
      skiaPackage: "@shopify/react-native-skia",
      workspaceDir: "/tmp/chartkit-skia"
    });

    expect(plan.map((step) => step.command)).toEqual([
      "git",
      "tar",
      "npm",
      "npm",
      "npm",
      "node",
      "npm",
      "node"
    ]);
    expect(plan[5].args).toEqual([
      "scripts/prepare-skia-showcase-renderer-preview.mjs",
      "--app-dir",
      "apps/expo-showcase"
    ]);
    expect(plan[6].args).toEqual([
      "--workspace",
      "@chart-kit/expo-showcase",
      "run",
      "typecheck"
    ]);
  });

  it("summarizes Android Skia install output", () => {
    expect(
      buildVerifiedOutput({
        output: [
          "@shopify/react-native-skia@2.6.2",
          "Skia showcase renderer preview injected: yes",
          "> Configure project :shopify_react-native-skia",
          "BUILD SUCCESSFUL in 1m"
        ].join("\n"),
        platform: "android",
        renderer: "skia",
        skiaPackage: "@shopify/react-native-skia"
      })
    ).toEqual(
      [
        "- Installed package: `@shopify/react-native-skia@2.6.2`",
        "- Showcase renderer mode: skia",
        "- Skia Gradle project configured: yes",
        "- Release build successful: yes",
        "- Showcase Skia renderer injected: yes"
      ].join("\n")
    );
  });

  it("summarizes iOS Skia install output", () => {
    const summary = buildVerifiedOutput({
      output: [
        "@shopify/react-native-skia@2.6.2",
        "Auto-linking React Native modules for target `ChartKitShowcase`: RNSVG and react-native-skia",
        "** BUILD SUCCEEDED **"
      ].join("\n"),
      platform: "ios",
      skiaPackage: "@shopify/react-native-skia"
    });

    expect(summary).toContain("Skia CocoaPods target autolinked: yes");
    expect(summary).toContain("Release build successful: yes");
  });
});

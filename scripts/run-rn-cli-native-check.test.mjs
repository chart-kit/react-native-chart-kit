import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();

const runDryRun = (...args) =>
  execFileSync(
    process.execPath,
    [
      join(repoRoot, "scripts/run-rn-cli-native-check.mjs"),
      "--dry-run",
      "--skip-package-build",
      "--work-dir",
      "/tmp/chartkit-rn-cli-native-check-test",
      ...args
    ],
    {
      cwd: repoRoot,
      encoding: "utf8"
    }
  );

describe("RN CLI native check script", () => {
  it("prints Android transient native-project commands in dry run", () => {
    const output = runDryRun("--platform", "android");

    expect(output).toContain("rnc-cli init ChartKitRnCliNative");
    expect(output).toContain("--skip-install");
    expect(output).toContain("npm install");
    expect(output).toContain("./gradlew assembleRelease");
    expect(output).not.toContain("xcodebuild");
  });

  it("prints iOS transient native-project commands in dry run", () => {
    const output = runDryRun("--platform", "ios");

    expect(output).toContain("rnc-cli init ChartKitRnCliNative");
    expect(output).toContain("pod install");
    expect(output).toContain("xcodebuild -workspace");
    expect(output).not.toContain("./gradlew assembleRelease");
  });

  it("can write dry-run output to a local log file", () => {
    const logFile = "/tmp/chartkit-rn-cli-native-check-test.log";
    const output = runDryRun("--platform", "android", "--log-file", logFile);
    const log = readFileSync(logFile, "utf8");

    expect(output).toContain("./gradlew assembleRelease");
    expect(log).toContain("# RN CLI Native Check Log");
    expect(log).toContain("./gradlew assembleRelease");
  });
});

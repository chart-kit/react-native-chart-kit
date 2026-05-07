import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();

const runGateReportJson = () =>
  JSON.parse(
    execFileSync(
      process.execPath,
      [join(repoRoot, "scripts/check-release-gates.mjs"), "--json"],
      {
        cwd: repoRoot,
        encoding: "utf8"
      }
    )
  );

describe("release gate checker", () => {
  it("uses evidence manifest summaries for manifest-backed blockers", () => {
    const report = runGateReportJson();
    const skiaManifest = JSON.parse(
      readFileSync(
        join(repoRoot, "docs/release/evidence/skia-renderer-evidence.json"),
        "utf8"
      )
    );
    const skiaCheck = report.checks.find(
      (check) => check.id === "blocker:skia-backend"
    );

    expect(skiaCheck).toMatchObject({
      evidence:
        "docs/release/evidence/skia-renderer-evidence.json; docs/release/evidence/skia-renderer-matrix.json",
      message: skiaManifest.summary,
      status: "block"
    });
    expect(skiaCheck?.detail).toContain(
      "6 incomplete Skia renderer evidence rows"
    );
  });

  it("surfaces incomplete native runtime matrix rows", () => {
    const report = runGateReportJson();
    const nativeRuntimeCheck = report.checks.find(
      (check) => check.id === "blocker:native-runtime-qa"
    );

    expect(nativeRuntimeCheck).toMatchObject({
      evidence:
        "docs/release/evidence/native-runtime-qa.json; docs/release/evidence/native-runtime-matrix.json",
      status: "block"
    });
    expect(nativeRuntimeCheck?.detail).toContain(
      "16 incomplete native runtime matrix rows"
    );
  });

  it("surfaces incomplete native accessibility matrix rows", () => {
    const report = runGateReportJson();
    const nativeAccessibilityCheck = report.checks.find(
      (check) => check.id === "blocker:native-accessibility-qa"
    );

    expect(nativeAccessibilityCheck).toMatchObject({
      evidence:
        "docs/release/evidence/native-accessibility-qa.json; docs/release/evidence/native-accessibility-matrix.json",
      status: "block"
    });
    expect(nativeAccessibilityCheck?.detail).toContain(
      "16 incomplete native accessibility matrix rows"
    );
  });

  it("surfaces incomplete native performance matrix rows", () => {
    const report = runGateReportJson();
    const nativePerformanceCheck = report.checks.find(
      (check) => check.id === "blocker:native-performance"
    );

    expect(nativePerformanceCheck).toMatchObject({
      evidence:
        "docs/release/evidence/native-performance-benchmark.json; docs/release/evidence/native-performance-matrix.json",
      status: "block"
    });
    expect(nativePerformanceCheck?.detail).toContain(
      "18 incomplete native performance matrix rows"
    );
  });

  it("accepts complete RN CLI native example evidence", () => {
    const report = runGateReportJson();
    const rnCliCheck = report.checks.find(
      (check) => check.id === "blocker:rn-cli-example"
    );

    expect(rnCliCheck).toMatchObject({
      evidence: "docs/release/evidence/rn-cli-example-evidence.json",
      status: "pass"
    });
    expect(rnCliCheck?.detail).toBe("");
  });

  it("validates evidence matrix structure", () => {
    const report = runGateReportJson();

    expect(
      report.checks
        .filter((check) => check.id.startsWith("matrix:"))
        .map((check) => [check.id, check.status])
    ).toEqual([
      ["matrix:skia-backend", "pass"],
      ["matrix:native-runtime-qa", "pass"],
      ["matrix:native-accessibility-qa", "pass"],
      ["matrix:native-performance", "pass"]
    ]);
  });

  it("validates native QA matrix showcase launch targets", () => {
    const report = runGateReportJson();

    expect(
      report.checks
        .filter((check) =>
          [
            "matrix:native-runtime-qa",
            "matrix:native-accessibility-qa",
            "matrix:native-performance"
          ].includes(check.id)
        )
        .map((check) => [check.id, check.status, check.detail])
    ).toEqual([
      ["matrix:native-runtime-qa", "pass", ""],
      ["matrix:native-accessibility-qa", "pass", ""],
      ["matrix:native-performance", "pass", ""]
    ]);
  });

  it("validates release evidence manifest consistency", () => {
    const report = runGateReportJson();

    expect(
      report.checks
        .filter((check) => check.id.startsWith("manifest:"))
        .map((check) => [check.id, check.status])
    ).toEqual([
      ["manifest:developer-preview-publish", "pass"],
      ["manifest:native-workflow-evidence", "pass"],
      ["manifest:rn-cli-example", "pass"],
      ["manifest:skia-backend", "pass"],
      ["manifest:native-runtime-qa", "pass"],
      ["manifest:native-accessibility-qa", "pass"],
      ["manifest:native-performance", "pass"]
    ]);
  });

  it("validates completed release manifest artifact links", () => {
    const report = runGateReportJson();

    expect(
      report.checks
        .filter((check) => check.id.startsWith("manifest:"))
        .map((check) => [check.id, check.status, check.detail])
    ).toEqual([
      ["manifest:developer-preview-publish", "pass", ""],
      ["manifest:native-workflow-evidence", "pass", ""],
      ["manifest:rn-cli-example", "pass", ""],
      ["manifest:skia-backend", "pass", ""],
      ["manifest:native-runtime-qa", "pass", ""],
      ["manifest:native-accessibility-qa", "pass", ""],
      ["manifest:native-performance", "pass", ""]
    ]);
  });

  it("checks the generated native QA checklist is synchronized", () => {
    const report = runGateReportJson();

    expect(
      report.checks.find(
        (check) => check.id === "generated:native-qa-checklists"
      )
    ).toMatchObject({
      evidence:
        "docs/release/native-qa-checklists.md; scripts/generate-native-qa-checklists.mjs",
      message:
        "Generated native QA checklist is in sync with evidence matrices",
      status: "pass"
    });
  });

  it("tracks completed Developer Preview npm publish state", () => {
    const report = runGateReportJson();
    const publishManifest = JSON.parse(
      readFileSync(
        join(repoRoot, "docs/release/evidence/npm-publish-evidence.json"),
        "utf8"
      )
    );

    expect(
      report.checks.find(
        (check) => check.id === "blocker:developer-preview-publish"
      )
    ).toMatchObject({
      evidence: "docs/release/evidence/npm-publish-evidence.json",
      message: publishManifest.summary,
      status: "pass"
    });
  });

  it("validates owner gate manifest structure", () => {
    const report = runGateReportJson();

    expect(
      report.checks.find((check) => check.id === "owner-gates:manifest")
    ).toMatchObject({
      evidence: "docs/release/evidence/owner-gates.json",
      message: "Owner gate manifest is structurally valid",
      status: "pass"
    });
  });

  it("checks native release workflow artifact upload wiring", () => {
    const report = runGateReportJson();

    expect(
      report.checks.find(
        (check) => check.id === "workflow:native-release-artifacts"
      )
    ).toMatchObject({
      evidence: ".github/workflows/native-release.yml",
      message: "Native release workflow archives Android and iOS evidence logs",
      status: "pass"
    });
  });

  it("checks npm publish workflow auth and manifest safety", () => {
    const report = runGateReportJson();

    expect(
      report.checks.find((check) => check.id === "workflow:publish-safety")
    ).toMatchObject({
      evidence: ".github/workflows/publish.yml",
      message:
        "Publish workflow validates npm auth and uses the release package manifest",
      status: "pass"
    });
  });
});

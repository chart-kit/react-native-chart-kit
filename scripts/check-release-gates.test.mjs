import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { validateReleaseEvidenceManifest } from "./release-gate-validation.mjs";

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

const runPreviewGateReportJson = () =>
  JSON.parse(
    execFileSync(
      process.execPath,
      [join(repoRoot, "scripts/check-release-gates.mjs"), "--preview", "--json"],
      {
        cwd: repoRoot,
        encoding: "utf8"
      }
    )
  );

describe("release gate checker", () => {
  it("accepts complete Skia renderer evidence", () => {
    const report = runGateReportJson();
    const skiaCheck = report.checks.find(
      (check) => check.id === "blocker:skia-backend"
    );

    expect(skiaCheck).toMatchObject({
      message:
        "Skia renderer preview boundary, local parity, native install/build, native parity, and SVG-vs-Skia comparison evidence are complete for Developer Preview.",
      status: "pass"
    });
    expect(skiaCheck?.detail).toBe("");
  });

  it("keeps matrix-backed QA out of the active release gate", () => {
    const report = runGateReportJson();
    const ids = report.checks.map((check) => check.id);

    expect(ids).not.toContain("blocker:native-runtime-qa");
    expect(ids).not.toContain("blocker:native-accessibility-qa");
    expect(ids).not.toContain("blocker:native-performance");
    expect(ids.some((id) => id.startsWith("matrix:"))).toBe(false);
  });

  it("accepts archived evidence manifests outside active gate requirements", async () => {
    await expect(
      validateReleaseEvidenceManifest({
        manifest: {
          archiveNote:
            "Historical evidence only. Use smoke-test checks for active preview readiness.",
          completedEntries: [],
          requiredFor: [],
          schemaVersion: 1,
          status: "archived",
          summary: "Archived native QA matrix evidence."
        }
      })
    ).resolves.toEqual([]);
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

  it("validates release evidence manifest consistency", () => {
    const report = runGateReportJson();

    expect(
      report.checks
        .filter((check) => check.id.startsWith("manifest:"))
        .map((check) => [check.id, check.status])
    ).toEqual([
      ["manifest:package-publish-boundary", "pass"],
      ["manifest:developer-preview-publish", "pass"],
      ["manifest:native-workflow-evidence", "pass"],
      ["manifest:rn-cli-example", "pass"],
      ["manifest:skia-backend", "pass"]
    ]);
  });

  it("validates completed release manifest artifact links", () => {
    const report = runGateReportJson();

    expect(
      report.checks
        .filter((check) => check.id.startsWith("manifest:"))
        .map((check) => [check.id, check.status, check.detail])
    ).toEqual([
      ["manifest:package-publish-boundary", "pass", ""],
      ["manifest:developer-preview-publish", "pass", ""],
      ["manifest:native-workflow-evidence", "pass", ""],
      ["manifest:rn-cli-example", "pass", ""],
      ["manifest:skia-backend", "pass", ""]
    ]);
  });

  it("passes the simplified Developer Preview gate without H6 or matrix blockers", () => {
    const report = runPreviewGateReportJson();

    expect(report.preview).toBe(true);
    expect(report.totals.block).toBe(0);
    expect(report.totals.fail).toBe(0);
    expect(
      report.checks.some((check) => check.id === "blocker:h6-owner-approval")
    ).toBe(false);
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

  it("warns when the local source version is prepared but not yet published", () => {
    const report = runPreviewGateReportJson();
    const packageJson = JSON.parse(
      readFileSync(join(repoRoot, "package.json"), "utf8")
    );

    expect(
      report.checks.find(
        (check) => check.id === "publish:source-version-evidence"
      )
    ).toMatchObject({
      evidence: "package.json; docs/release/evidence/npm-publish-evidence.json",
      status: "warn"
    });
    expect(
      report.checks.find(
        (check) => check.id === "publish:source-version-evidence"
      )?.detail
    ).toContain(`package.json is ${packageJson.version}`);
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

  it("documents every pending H6 owner decision in the H6 docs", () => {
    const ownerGates = JSON.parse(
      readFileSync(
        join(repoRoot, "docs/release/evidence/owner-gates.json"),
        "utf8"
      )
    );
    const h6Gate = ownerGates.gates.find((gate) => gate.id === "h6");
    const memo = readFileSync(
      join(repoRoot, "docs/release/h6-owner-decision-memo.md"),
      "utf8"
    ).toLowerCase();
    const finalizationChecklist = readFileSync(
      join(repoRoot, "docs/release/h6-finalization-checklist.md"),
      "utf8"
    ).toLowerCase();
    const decisionTextByLabel = {
      "deprecation policy": "deprecation policy",
      "docs freeze": "docs freeze",
      "final changelog": "final changelog",
      "final semver": "final semver",
      "pro and skia package plan": "pro and skia package plan",
      "release candidate approval": "rc timing",
      "release claims": "release claims",
      "visual baseline freeze": "visual baseline freeze"
    };

    expect(
      h6Gate.pendingDecisions
        .map((decision) => decision.toLowerCase())
        .sort()
    ).toEqual(Object.keys(decisionTextByLabel).sort());

    for (const expectedText of Object.values(decisionTextByLabel)) {
      expect(memo).toContain(expectedText);
      expect(finalizationChecklist).toContain(expectedText);
    }
  });

  it("validates package manifest Developer Preview publish boundary", () => {
    const report = runGateReportJson();

    expect(
      report.checks.find(
        (check) => check.id === "manifest:package-publish-boundary"
      )
    ).toMatchObject({
      evidence: "docs/release/evidence/package-manifest.json",
      message:
        "Package manifest uses explicit Developer Preview publish boundary",
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

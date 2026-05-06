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
      evidence: "docs/release/evidence/skia-renderer-evidence.json",
      message: skiaManifest.summary,
      status: "block"
    });
  });

  it("surfaces pending native runtime matrix rows", () => {
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
      "16 pending native runtime matrix rows"
    );
  });
});

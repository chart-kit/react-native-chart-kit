import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { validateRuntimeMatrixArtifacts } from "./release-runtime-artifacts.mjs";

const repoRoot = process.cwd();
const readRepoText = (relativePath) =>
  readFile(path.join(repoRoot, relativePath), "utf8");

const buildMatrix = ({
  evidence = ["docs/release/artifacts/ios-line-charts.png"],
  notes = "Manual runtime checks passed.",
  status = "pass"
} = {}) => ({
  rows: [
    {
      evidence,
      id: "ios-line-charts",
      pageId: "line-charts",
      platform: "ios",
      review: {
        buildSurface: "Release simulator build",
        device: "iPhone 17 simulator / iOS 26.0",
        reviewedAt: "2026-05-06",
        reviewedBy: "QA"
      },
      notes,
      status
    }
  ]
});

describe("runtime artifact validation", () => {
  it("accepts checked-in partial runtime matrix artifacts", async () => {
    const matrix = JSON.parse(
      await readRepoText("docs/release/evidence/native-runtime-matrix.json")
    );

    expect(validateRuntimeMatrixArtifacts(matrix)).toEqual([]);
  });

  it("does not allow launch-smoke screenshots as final runtime evidence", () => {
    const errors = validateRuntimeMatrixArtifacts(
      buildMatrix({
        evidence: ["docs/release/artifacts/ios-runtime-smoke.png"],
        notes: "Release simulator smoke pass."
      })
    );

    expect(errors.join("; ")).toContain("row-specific evidence");
    expect(errors.join("; ")).toContain(
      "must not use release smoke artifact docs/release/artifacts/ios-runtime-smoke.png"
    );
    expect(errors.join("; ")).toContain("notes describe incomplete QA");
  });

  it("does not allow page-smoke screenshots as final runtime evidence", () => {
    const errors = validateRuntimeMatrixArtifacts(
      buildMatrix({
        evidence: ["docs/release/artifacts/ios-runtime-bar-charts.png"]
      })
    );

    expect(errors.join("; ")).toContain("row-specific evidence");
    expect(errors.join("; ")).toContain(
      "must not use release smoke artifact docs/release/artifacts/ios-runtime-bar-charts.png"
    );
  });

  it("accepts row-specific runtime pass evidence", () => {
    const errors = validateRuntimeMatrixArtifacts(
      buildMatrix({
        evidence: [
          "docs/release/artifacts/ios-line-charts.png",
          "docs/release/artifacts/ios-line-charts.log"
        ]
      })
    );

    expect(errors).toEqual([]);
  });

  it("accepts external row evidence for manual recordings", () => {
    const errors = validateRuntimeMatrixArtifacts(
      buildMatrix({
        evidence: ["https://example.com/native-runtime/ios-line-charts.mov"]
      })
    );

    expect(errors).toEqual([]);
  });
});

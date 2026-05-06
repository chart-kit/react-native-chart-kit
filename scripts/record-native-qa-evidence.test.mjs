import { copyFile, mkdtemp, mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";

import {
  listNativeQaRows,
  recordNativeQaEvidence
} from "./record-native-qa-evidence.mjs";

const repoRoot = process.cwd();
const matrixFiles = [
  "native-accessibility-matrix.json",
  "native-performance-matrix.json",
  "native-runtime-matrix.json",
  "skia-renderer-matrix.json"
];

const createTempRepo = async () => {
  const tempRepo = await mkdtemp(join(tmpdir(), "chartkit-native-qa-"));
  const evidenceDir = join(tempRepo, "docs/release/evidence");

  await mkdir(evidenceDir, { recursive: true });

  for (const matrixFile of matrixFiles) {
    await copyFile(
      join(repoRoot, "docs/release/evidence", matrixFile),
      join(evidenceDir, matrixFile)
    );
  }

  return tempRepo;
};

describe("native QA evidence recorder", () => {
  it("lists actionable rows for a native evidence matrix", async () => {
    const rows = await listNativeQaRows({
      matrixName: "runtime",
      repoRoot
    });

    expect(rows[0]).toMatchObject({
      id: "ios-line-charts",
      status: "pending",
      target: "iOS / Line Charts"
    });
    expect(rows).toHaveLength(16);
  });

  it("requires evidence before marking a row as pass", async () => {
    await expect(
      recordNativeQaEvidence({
        matrixName: "runtime",
        repoRoot,
        rowId: "ios-line-charts",
        status: "pass"
      })
    ).rejects.toThrow("--evidence is required");
  });

  it("updates one matrix row and regenerates the native QA checklist", async () => {
    const tempRepo = await createTempRepo();
    const result = await recordNativeQaEvidence({
      evidence: ["docs/release/artifacts/ios-line-charts-runtime.md"],
      matrixName: "runtime",
      notes: "Release simulator pass",
      repoRoot: tempRepo,
      rowId: "ios-line-charts",
      status: "pass",
      updated: "2026-05-06"
    });
    const matrix = JSON.parse(
      await readFile(
        join(tempRepo, "docs/release/evidence/native-runtime-matrix.json"),
        "utf8"
      )
    );
    const checklist = await readFile(
      join(tempRepo, "docs/release/native-qa-checklists.md"),
      "utf8"
    );

    expect(result).toMatchObject({
      dryRun: false,
      matrixPath: "docs/release/evidence/native-runtime-matrix.json",
      status: "partial"
    });
    expect(matrix.lastUpdated).toBe("2026-05-06");
    expect(matrix.rows[0]).toMatchObject({
      evidence: ["docs/release/artifacts/ios-line-charts-runtime.md"],
      notes: "Release simulator pass",
      status: "pass"
    });
    expect(checklist).toContain("| Runtime QA | 16 | 1 | 15 | 0 | 0 | 0 |");
    expect(checklist).toContain(
      "`docs/release/artifacts/ios-line-charts-runtime.md`"
    );
  });

  it("supports dry-run without writing matrix changes", async () => {
    const tempRepo = await createTempRepo();
    const result = await recordNativeQaEvidence({
      dryRun: true,
      evidence: ["docs/release/artifacts/ios-line-charts-runtime.md"],
      matrixName: "runtime",
      repoRoot: tempRepo,
      rowId: "ios-line-charts",
      status: "pass",
      updated: "2026-05-06"
    });
    const matrix = JSON.parse(
      await readFile(
        join(tempRepo, "docs/release/evidence/native-runtime-matrix.json"),
        "utf8"
      )
    );

    expect(result.dryRun).toBe(true);
    expect(matrix.rows[0]).toMatchObject({
      evidence: [],
      status: "pending"
    });
  });

  it("records Skia matrix evidence without regenerating the native QA checklist", async () => {
    const tempRepo = await createTempRepo();
    const result = await recordNativeQaEvidence({
      evidence: ["docs/release/artifacts/skia-ios-install.md"],
      matrixName: "skia",
      repoRoot: tempRepo,
      rowId: "ios-skia-native-install",
      status: "pass",
      updated: "2026-05-06"
    });
    const matrix = JSON.parse(
      await readFile(
        join(tempRepo, "docs/release/evidence/skia-renderer-matrix.json"),
        "utf8"
      )
    );

    await expect(
      readFile(join(tempRepo, "docs/release/native-qa-checklists.md"), "utf8")
    ).rejects.toThrow();
    expect(result).toMatchObject({
      checklistPath: undefined,
      matrixPath: "docs/release/evidence/skia-renderer-matrix.json",
      status: "partial"
    });
    expect(matrix.rows[0]).toMatchObject({
      evidence: ["docs/release/artifacts/skia-ios-install.md"],
      status: "pass"
    });
  });
});

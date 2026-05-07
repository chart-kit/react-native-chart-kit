import {
  copyFile,
  mkdtemp,
  mkdir,
  readFile,
  writeFile
} from "node:fs/promises";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";

import {
  listNativeQaRows,
  recordNativeQaEvidence
} from "./record-native-qa-evidence.mjs";
import { validateEvidenceMatrix } from "./release-gate-validation.mjs";

const repoRoot = process.cwd();
const matrixFiles = [
  "native-accessibility-matrix.json",
  "native-accessibility-qa.json",
  "native-performance-benchmark.json",
  "native-performance-matrix.json",
  "native-runtime-matrix.json",
  "native-runtime-qa.json",
  "skia-renderer-evidence.json",
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

const createArtifact = async (repoRoot, relativePath) => {
  const artifactPath = join(repoRoot, relativePath);

  await mkdir(dirname(artifactPath), { recursive: true });
  await writeFile(artifactPath, "manual evidence\n", "utf8");
};

describe("native QA evidence recorder", () => {
  it("lists actionable rows for a native evidence matrix", async () => {
    const rows = await listNativeQaRows({
      matrixName: "runtime",
      repoRoot
    });

    expect(rows[0]).toMatchObject({
      id: "ios-line-charts",
      launchUrl: "chartkitshowcase://showcase?view=charts&page=line-area",
      showcasePageId: "line-area",
      status: "partial",
      target: "iOS / Line Charts"
    });
    expect(rows).toHaveLength(16);
  });

  it("can include required check details for manual QA rows", async () => {
    const [runtimeRow] = await listNativeQaRows({
      includeDetails: true,
      matrixName: "runtime",
      repoRoot
    });
    const [performanceRow] = await listNativeQaRows({
      includeDetails: true,
      matrixName: "performance",
      repoRoot
    });
    const [skiaRow] = await listNativeQaRows({
      includeDetails: true,
      matrixName: "skia",
      repoRoot
    });

    expect(runtimeRow).toMatchObject({
      id: "ios-line-charts",
      launchUrl: "chartkitshowcase://showcase?view=charts&page=line-area",
      requiredCheckGroups: ["global", "line"]
    });
    expect(runtimeRow.checks).toContain(
      "line: tap selection can be enabled without scrub"
    );
    expect(performanceRow.checks).toContain("metric: initial render time");
    expect(performanceRow).toMatchObject({
      expectedStoryMetrics: {
        chartType: "line",
        seriesCount: 1,
        totalPoints: 100,
        visiblePoints: 100
      },
      launchUrl:
        "chartkitshowcase://showcase?story=v2-perf-line-100&visual=1",
      showcaseStoryId: "v2-perf-line-100"
    });
    expect(performanceRow.checks).toContain(
      "scenario: expected story metrics chart line; 100 total; 100 visible; 1 series"
    );
    expect(skiaRow.checks).toContain(
      "scenario: evidence Install optional Skia renderer dependencies, run native release build, and verify the SVG default path still works without static Skia imports."
    );
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

    await expect(
      recordNativeQaEvidence({
        matrixName: "runtime",
        repoRoot,
        rowId: "ios-line-charts",
        status: "partial"
      })
    ).rejects.toThrow("--evidence is required");
  });

  it("requires repo-relative evidence files to exist before marking a row as pass", async () => {
    await expect(
      recordNativeQaEvidence({
        evidence: ["docs/release/artifacts/missing-runtime.md"],
        matrixName: "runtime",
        notes: "Release simulator pass",
        repoRoot,
        review: {
          buildSurface: "Release simulator build",
          device: "iPhone 17 simulator / iOS 26.0",
          reviewedBy: "QA"
        },
        rowId: "ios-line-charts",
        status: "pass"
      })
    ).rejects.toThrow("Evidence file does not exist");
  });

  it("requires review context before marking a row as pass", async () => {
    await expect(
      recordNativeQaEvidence({
        evidence: ["docs/release/artifacts/ios-runtime-smoke.png"],
        matrixName: "runtime",
        notes: "Release simulator pass",
        repoRoot,
        rowId: "ios-line-charts",
        status: "pass"
      })
    ).rejects.toThrow("--status pass requires --reviewed-by");

    await expect(
      recordNativeQaEvidence({
        evidence: ["docs/release/artifacts/ios-runtime-smoke.png"],
        matrixName: "runtime",
        repoRoot,
        review: {
          buildSurface: "Release simulator build",
          device: "iPhone 17 simulator / iOS 26.0",
          reviewedBy: "QA"
        },
        rowId: "ios-line-charts",
        status: "pass"
      })
    ).rejects.toThrow("--notes is required");
  });

  it("treats pass rows without review metadata as invalid release evidence", async () => {
    const tempRepo = await createTempRepo();
    const matrix = JSON.parse(
      await readFile(
        join(tempRepo, "docs/release/evidence/native-runtime-matrix.json"),
        "utf8"
      )
    );
    const errors = await validateEvidenceMatrix({
      ...matrix,
      rows: [
        {
          ...matrix.rows[0],
          evidence: ["docs/release/artifacts/ios-runtime-smoke.png"],
          notes: undefined,
          status: "pass"
        },
        ...matrix.rows.slice(1)
      ]
    });

    expect(errors).toContain(
      "ios-line-charts pass row is missing review.reviewedBy"
    );
    expect(errors).toContain(
      "ios-line-charts pass row is missing review.buildSurface"
    );
    expect(errors).toContain("ios-line-charts pass row must include notes");
  });

  it("updates one matrix row and regenerates the native QA checklist", async () => {
    const tempRepo = await createTempRepo();
    await createArtifact(
      tempRepo,
      "docs/release/artifacts/ios-line-charts-runtime.md"
    );
    const result = await recordNativeQaEvidence({
      evidence: ["docs/release/artifacts/ios-line-charts-runtime.md"],
      matrixName: "runtime",
      notes: "Release simulator pass",
      repoRoot: tempRepo,
      review: {
        buildSurface: "Release simulator build",
        device: "iPhone 17 simulator / iOS 26.0",
        reviewedBy: "QA"
      },
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
      manifestPath: "docs/release/evidence/native-runtime-qa.json",
      manifestStatus: "partial",
      matrixPath: "docs/release/evidence/native-runtime-matrix.json",
      status: "partial"
    });
    expect(matrix.lastUpdated).toBe("2026-05-06");
    expect(matrix.rows[0]).toMatchObject({
      evidence: ["docs/release/artifacts/ios-line-charts-runtime.md"],
      notes: "Release simulator pass",
      review: {
        buildSurface: "Release simulator build",
        device: "iPhone 17 simulator / iOS 26.0",
        reviewedAt: "2026-05-06",
        reviewedBy: "QA"
      },
      status: "pass"
    });
    expect(checklist).toContain("| Runtime QA | 16 | 1 | 15 | 0 | 0 | 0 | 0 |");
    expect(checklist).toContain(
      "`docs/release/artifacts/ios-line-charts-runtime.md`"
    );
    const manifest = JSON.parse(
      await readFile(
        join(tempRepo, "docs/release/evidence/native-runtime-qa.json"),
        "utf8"
      )
    );
    expect(manifest).toMatchObject({
      lastUpdated: "2026-05-06",
      status: "partial"
    });
    expect(manifest.missingEvidence).toContain(
      "ios-bar-charts is partial; evidence is required before this matrix can be complete."
    );
  });

  it("records partial row evidence without treating the row as passed", async () => {
    const tempRepo = await createTempRepo();
    await createArtifact(
      tempRepo,
      "docs/release/artifacts/ios-line-charts-smoke.png"
    );
    const result = await recordNativeQaEvidence({
      evidence: ["docs/release/artifacts/ios-line-charts-smoke.png"],
      matrixName: "runtime",
      notes: "Release simulator launch smoke only",
      repoRoot: tempRepo,
      rowId: "ios-line-charts",
      status: "partial",
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
      manifestStatus: "partial",
      status: "partial"
    });
    expect(matrix.rows[0]).toMatchObject({
      evidence: ["docs/release/artifacts/ios-line-charts-smoke.png"],
      notes: "Release simulator launch smoke only",
      status: "partial"
    });
    expect(checklist).toContain("| Runtime QA | 16 | 0 | 16 | 0 | 0 | 0 | 0 |");
    expect(checklist).toContain(
      "`docs/release/artifacts/ios-line-charts-smoke.png`"
    );
  });

  it("supports dry-run without writing matrix changes", async () => {
    const tempRepo = await createTempRepo();
    await createArtifact(
      tempRepo,
      "docs/release/artifacts/ios-line-charts-runtime.md"
    );
    const beforeMatrix = JSON.parse(
      await readFile(
        join(tempRepo, "docs/release/evidence/native-runtime-matrix.json"),
        "utf8"
      )
    );
    const result = await recordNativeQaEvidence({
      dryRun: true,
      evidence: ["docs/release/artifacts/ios-line-charts-runtime.md"],
      matrixName: "runtime",
      notes: "Release simulator pass",
      repoRoot: tempRepo,
      review: {
        buildSurface: "Release simulator build",
        device: "iPhone 17 simulator / iOS 26.0",
        reviewedBy: "QA"
      },
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
    expect(matrix.rows[0]).toEqual(beforeMatrix.rows[0]);
  });

  it("records Skia matrix evidence and regenerates the release QA checklist", async () => {
    const tempRepo = await createTempRepo();
    await createArtifact(
      tempRepo,
      "docs/release/artifacts/skia-ios-install.md"
    );
    const result = await recordNativeQaEvidence({
      evidence: ["docs/release/artifacts/skia-ios-install.md"],
      matrixName: "skia",
      notes: "Native Skia install verified",
      repoRoot: tempRepo,
      review: {
        buildSurface: "Release simulator build with optional Skia dependency",
        device: "iPhone 17 simulator / iOS 26.0",
        reviewedBy: "QA"
      },
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

    const checklist = await readFile(
      join(tempRepo, "docs/release/native-qa-checklists.md"),
      "utf8"
    );

    expect(result).toMatchObject({
      checklistPath: "docs/release/native-qa-checklists.md",
      manifestPath: "docs/release/evidence/skia-renderer-evidence.json",
      manifestStatus: "partial",
      matrixPath: "docs/release/evidence/skia-renderer-matrix.json",
      status: "partial"
    });
    expect(matrix.rows[0]).toMatchObject({
      evidence: ["docs/release/artifacts/skia-ios-install.md"],
      review: {
        buildSurface: "Release simulator build with optional Skia dependency",
        device: "iPhone 17 simulator / iOS 26.0",
        reviewedAt: "2026-05-06",
        reviewedBy: "QA"
      },
      status: "pass"
    });
    expect(checklist).toContain(
      "| Skia Renderer | 8 | 5 | 3 | 0 | 0 | 0 | 0 |"
    );
    expect(checklist).toContain("`ios-skia-native-install`");
  });

  it("marks aggregate evidence complete when the last matrix row passes", async () => {
    const tempRepo = await createTempRepo();
    await createArtifact(
      tempRepo,
      "docs/release/artifacts/ios-line-charts-runtime.md"
    );

    const matrixPath = join(
      tempRepo,
      "docs/release/evidence/native-runtime-matrix.json"
    );
    const matrix = JSON.parse(await readFile(matrixPath, "utf8"));
    const preparedRows = matrix.rows.map((row) =>
      row.id === "ios-line-charts"
        ? row
        : {
            ...row,
            evidence: [`https://example.test/${row.id}.mp4`],
            notes: "Seeded completed row",
            review: {
              buildSurface: "Release simulator build",
              device: "Native QA device",
              reviewedAt: "2026-05-06",
              reviewedBy: "QA"
            },
            status: "pass"
          }
    );

    await writeFile(
      matrixPath,
      `${JSON.stringify(
        {
          ...matrix,
          rows: preparedRows,
          status: "partial"
        },
        null,
        2
      )}\n`,
      "utf8"
    );

    const result = await recordNativeQaEvidence({
      evidence: ["docs/release/artifacts/ios-line-charts-runtime.md"],
      matrixName: "runtime",
      notes: "Release simulator pass",
      repoRoot: tempRepo,
      review: {
        buildSurface: "Release simulator build",
        device: "iPhone 17 simulator / iOS 26.0",
        reviewedBy: "QA"
      },
      rowId: "ios-line-charts",
      status: "pass",
      updated: "2026-05-06"
    });
    const manifest = JSON.parse(
      await readFile(
        join(tempRepo, "docs/release/evidence/native-runtime-qa.json"),
        "utf8"
      )
    );

    expect(result).toMatchObject({
      manifestStatus: "complete",
      status: "complete"
    });
    expect(manifest).toMatchObject({
      lastUpdated: "2026-05-06",
      missingEvidence: [],
      status: "complete",
      summary:
        "Native runtime QA matrix is complete for required iOS and Android showcase pages."
    });
  });
});

import { spawnSync } from "node:child_process";
import { copyFile, mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";

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
  const tempRepo = await mkdtemp(join(tmpdir(), "chartkit-native-qa-cli-"));
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

describe("native QA evidence recorder CLI", () => {
  it("passes review metadata through when marking a row as pass", async () => {
    const tempRepo = await createTempRepo();
    await createArtifact(
      tempRepo,
      "docs/release/artifacts/ios-line-charts-runtime.md"
    );

    const result = spawnSync(
      process.execPath,
      [
        join(repoRoot, "scripts/record-native-qa-evidence.mjs"),
        "--matrix",
        "runtime",
        "--row",
        "ios-line-charts",
        "--status",
        "pass",
        "--evidence",
        "docs/release/artifacts/ios-line-charts-runtime.md",
        "--reviewed-by",
        "QA",
        "--device",
        "iPhone 17 simulator / iOS 26.0",
        "--build-surface",
        "Release simulator build",
        "--notes",
        "Release simulator pass",
        "--updated",
        "2026-05-06"
      ],
      { cwd: tempRepo, encoding: "utf8" }
    );
    const matrix = JSON.parse(
      await readFile(
        join(tempRepo, "docs/release/evidence/native-runtime-matrix.json"),
        "utf8"
      )
    );

    expect(result.stderr).toBe("");
    expect(result.status).toBe(0);
    expect(result.stdout).toContain(
      "Updated docs/release/evidence/native-runtime-matrix.json row ios-line-charts to pass."
    );
    expect(matrix.rows[0]).toMatchObject({
      review: {
        buildSurface: "Release simulator build",
        device: "iPhone 17 simulator / iOS 26.0",
        reviewedAt: "2026-05-06",
        reviewedBy: "QA"
      },
      status: "pass"
    });
  });
});

import { copyFile, mkdir, mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  listNativeWorkflowEvidence,
  recordNativeWorkflowEvidence
} from "./record-native-workflow-evidence.mjs";

const repoRoot = process.cwd();

const createTempRepo = async () => {
  const tempRepo = await mkdtemp(join(tmpdir(), "chartkit-native-workflow-"));
  const evidenceDir = join(tempRepo, "docs/release/evidence");

  await mkdir(evidenceDir, { recursive: true });
  await copyFile(
    join(repoRoot, "docs/release/evidence/native-release-workflow.json"),
    join(evidenceDir, "native-release-workflow.json")
  );

  return tempRepo;
};

describe("native workflow evidence recorder", () => {
  it("lists current native workflow evidence status", async () => {
    const evidence = await listNativeWorkflowEvidence({ repoRoot });

    expect(evidence).toMatchObject({
      status: "partial"
    });
    expect(evidence.missingEvidence).toContain(
      "green native release workflow run on the release candidate commit"
    );
  });

  it("requires workflow run and both platform artifacts before marking complete", async () => {
    await expect(
      recordNativeWorkflowEvidence({
        commit: "abc123",
        repoRoot,
        runUrl: "https://github.com/example/repo/actions/runs/1"
      })
    ).rejects.toThrow("--android-artifact, --ios-artifact required");
  });

  it("records a green workflow run without mutating during dry-run", async () => {
    const tempRepo = await createTempRepo();
    const result = await recordNativeWorkflowEvidence({
      androidArtifact:
        "https://github.com/example/repo/actions/runs/1/artifacts/android",
      commit: "abc123",
      dryRun: true,
      iosArtifact:
        "https://github.com/example/repo/actions/runs/1/artifacts/ios",
      repoRoot: tempRepo,
      runUrl: "https://github.com/example/repo/actions/runs/1"
    });
    const manifest = JSON.parse(
      await readFile(
        join(tempRepo, "docs/release/evidence/native-release-workflow.json"),
        "utf8"
      )
    );

    expect(result).toMatchObject({
      dryRun: true,
      status: "complete"
    });
    expect(manifest.status).toBe("partial");
  });

  it("marks workflow evidence complete with archived platform artifacts", async () => {
    const tempRepo = await createTempRepo();
    const result = await recordNativeWorkflowEvidence({
      androidArtifact:
        "https://github.com/example/repo/actions/runs/1/artifacts/android",
      commit: "abc123",
      date: "2026-05-06",
      iosArtifact:
        "https://github.com/example/repo/actions/runs/1/artifacts/ios",
      repoRoot: tempRepo,
      runUrl: "https://github.com/example/repo/actions/runs/1"
    });
    const manifest = JSON.parse(
      await readFile(
        join(tempRepo, "docs/release/evidence/native-release-workflow.json"),
        "utf8"
      )
    );

    expect(result).toMatchObject({
      dryRun: false,
      status: "complete"
    });
    expect(manifest).toMatchObject({
      lastUpdated: "2026-05-06",
      missingEvidence: [],
      status: "complete"
    });
    expect(manifest.completedEntries.at(-1)).toMatchObject({
      artifacts: [
        "https://github.com/example/repo/actions/runs/1/artifacts/ios",
        "https://github.com/example/repo/actions/runs/1/artifacts/android"
      ],
      commit: "abc123",
      result: "workflow-pass",
      runUrl: "https://github.com/example/repo/actions/runs/1",
      scope: "native-release-workflow"
    });
  });
});

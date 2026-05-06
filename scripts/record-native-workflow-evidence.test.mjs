import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  writeFile
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
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

const createArtifact = async (repoRoot, relativePath) => {
  const artifactPath = join(repoRoot, relativePath);

  await mkdir(dirname(artifactPath), { recursive: true });
  await writeFile(artifactPath, "workflow evidence\n", "utf8");
};

describe("native workflow evidence recorder", () => {
  it("lists current native workflow evidence status", async () => {
    const evidence = await listNativeWorkflowEvidence({ repoRoot });

    expect(evidence).toMatchObject({
      status: "complete"
    });
    expect(evidence.missingEvidence).toEqual([]);
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

  it("requires a git commit SHA and GitHub Actions run URL", async () => {
    await expect(
      recordNativeWorkflowEvidence({
        androidArtifact:
          "https://github.com/example/repo/actions/runs/1/artifacts/android",
        commit: "not a sha",
        iosArtifact:
          "https://github.com/example/repo/actions/runs/1/artifacts/ios",
        repoRoot,
        runUrl: "https://github.com/example/repo/actions/runs/1"
      })
    ).rejects.toThrow("--commit must be a short or full git commit SHA");

    await expect(
      recordNativeWorkflowEvidence({
        androidArtifact:
          "https://github.com/example/repo/actions/runs/1/artifacts/android",
        commit: "abc123",
        iosArtifact:
          "https://github.com/example/repo/actions/runs/1/artifacts/ios",
        repoRoot,
        runUrl: "https://example.test/native-run"
      })
    ).rejects.toThrow("--run-url must be a GitHub Actions run URL");
  });

  it("requires GitHub artifact URLs to belong to the recorded run", async () => {
    await expect(
      recordNativeWorkflowEvidence({
        androidArtifact:
          "https://github.com/example/repo/actions/runs/2/artifacts/android",
        commit: "abc123",
        iosArtifact:
          "https://github.com/example/repo/actions/runs/1/artifacts/ios",
        repoRoot,
        runUrl: "https://github.com/example/repo/actions/runs/1"
      })
    ).rejects.toThrow("GitHub artifact URLs must belong");
  });

  it("records a green workflow run without mutating during dry-run", async () => {
    const tempRepo = await createTempRepo();
    const beforeManifest = JSON.parse(
      await readFile(
        join(tempRepo, "docs/release/evidence/native-release-workflow.json"),
        "utf8"
      )
    );
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
    expect(manifest).toEqual(beforeManifest);
  });

  it("requires local artifact evidence files to exist when artifact values are not URLs", async () => {
    const tempRepo = await createTempRepo();

    await expect(
      recordNativeWorkflowEvidence({
        androidArtifact:
          "docs/release/artifacts/native-workflow/android-release.log",
        commit: "abc123",
        iosArtifact: "docs/release/artifacts/native-workflow/ios-release.log",
        repoRoot: tempRepo,
        runUrl: "https://github.com/example/repo/actions/runs/1"
      })
    ).rejects.toThrow("Artifact evidence must be an external URL");
  });

  it("accepts existing local workflow artifact files", async () => {
    const tempRepo = await createTempRepo();

    await createArtifact(
      tempRepo,
      "docs/release/artifacts/native-workflow/ios-release.log"
    );
    await createArtifact(
      tempRepo,
      "docs/release/artifacts/native-workflow/android-release.log"
    );

    const result = await recordNativeWorkflowEvidence({
      androidArtifact:
        "docs/release/artifacts/native-workflow/android-release.log",
      commit: "abc123",
      dryRun: true,
      iosArtifact: "docs/release/artifacts/native-workflow/ios-release.log",
      repoRoot: tempRepo,
      runUrl: "https://github.com/example/repo/actions/runs/1"
    });

    expect(result).toMatchObject({
      dryRun: true,
      status: "complete"
    });
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

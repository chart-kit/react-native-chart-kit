import { mkdir, readFile, writeFile, mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";

import {
  approveOwnerGate,
  listOwnerGates
} from "./record-owner-gate-decision.mjs";

const repoRoot = process.cwd();

const h4PendingDecisions = [
  "final free-vs-Pro feature boundary",
  "@chart-kit/pro package split",
  "@chart-kit/skia-renderer packaging",
  "license enforcement timing",
  "which preview interactions remain free at beta",
  "CandlestickChart beta visibility"
];

const createTempRepo = async ({ h4Open = false } = {}) => {
  const tempRepo = await mkdtemp(join(tmpdir(), "chartkit-owner-gates-"));
  const releaseDir = join(tempRepo, "docs/release");
  const evidenceDir = join(releaseDir, "evidence");

  await mkdir(evidenceDir, { recursive: true });
  const ownerGates = JSON.parse(
    await readFile(
      join(repoRoot, "docs/release/evidence/owner-gates.json"),
      "utf8"
    )
  );

  if (h4Open) {
    ownerGates.gates = ownerGates.gates.map((gate) =>
      gate.id === "h4"
        ? {
            evidence: gate.evidence,
            id: gate.id,
            name: gate.name,
            pendingDecisions: h4PendingDecisions,
            requiredFor: gate.requiredFor,
            status: "open"
          }
        : gate
    );
  }

  await writeFile(
    join(evidenceDir, "owner-gates.json"),
    JSON.stringify(ownerGates, null, 2),
    "utf8"
  );
  await writeFile(join(releaseDir, "h4-pro-scope.md"), "# H4\n", "utf8");
  await writeFile(
    join(releaseDir, "h4-owner-decision-memo.md"),
    "# H4 Decision\n",
    "utf8"
  );
  await writeFile(
    join(releaseDir, "h5-beta-gate-evidence.md"),
    "# H5 Evidence\n",
    "utf8"
  );
  await writeFile(
    join(releaseDir, "h5-owner-decision-memo.md"),
    "# H5 Decision\n",
    "utf8"
  );
  await mkdir(join(tempRepo, "docs/internal"), { recursive: true });
  await writeFile(
    join(tempRepo, "docs/internal/completion-audit.md"),
    "# Completion Audit\n",
    "utf8"
  );

  return tempRepo;
};

describe("owner gate decision recorder", () => {
  it("lists owner gates and pending decision counts", async () => {
    const gates = await listOwnerGates({ repoRoot });

    expect(gates.map((gate) => [gate.id, gate.status])).toEqual([
      ["h4", "approved"],
      ["h5", "approved"],
      ["h6", "not-started"]
    ]);
    expect(gates[0].pendingDecisions ?? []).toHaveLength(0);
  });

  it("requires all pending decisions before approving a gate", async () => {
    const tempRepo = await createTempRepo({ h4Open: true });

    await expect(
      approveOwnerGate({
        approvedAt: "2026-05-06",
        approvedBy: "owner",
        decisions: ["ship pro separately"],
        gateId: "h4",
        repoRoot: tempRepo
      })
    ).rejects.toThrow("h4 requires 6 decisions");
  });

  it("records approved gate metadata and clears pending decisions", async () => {
    const tempRepo = await createTempRepo({ h4Open: true });
    const decisions = [
      "free-vs-Pro boundary approved",
      "@chart-kit/pro ships separately",
      "@chart-kit/skia-renderer ships separately",
      "no beta license enforcement",
      "simple press remains free",
      "CandlestickChart remains Financial Preview"
    ];
    const result = await approveOwnerGate({
      approvedAt: "2026-05-06",
      approvedBy: "owner",
      decisions,
      evidence: ["docs/release/h4-pro-scope.md"],
      gateId: "h4",
      repoRoot: tempRepo
    });
    const manifest = JSON.parse(
      await readFile(
        join(tempRepo, "docs/release/evidence/owner-gates.json"),
        "utf8"
      )
    );

    expect(result.gate).toMatchObject({
      approvedAt: "2026-05-06",
      approvedBy: "owner",
      decisions,
      status: "approved"
    });
    expect(manifest.lastUpdated).toBe("2026-05-06");
    expect(manifest.gates[0].pendingDecisions).toBeUndefined();
  });

  it("blocks H5 approval until H4 is approved", async () => {
    const tempRepo = await createTempRepo({ h4Open: true });

    await expect(
      approveOwnerGate({
        approvedAt: "2026-05-06",
        approvedBy: "owner",
        decisions: [
          "publish Developer Preview",
          "native evidence gaps accepted for Developer Preview",
          "known issues accepted",
          "next tag approved"
        ],
        gateId: "h5",
        repoRoot: tempRepo
      })
    ).rejects.toThrow("H5 cannot be approved yet");
  });

  it("supports dry-run without writing approval", async () => {
    const tempRepo = await createTempRepo({ h4Open: true });
    const result = await approveOwnerGate({
      approvedAt: "2026-05-06",
      approvedBy: "owner",
      decisions: [
        "free-vs-Pro boundary approved",
        "@chart-kit/pro ships separately",
        "@chart-kit/skia-renderer ships separately",
        "no beta license enforcement",
        "simple press remains free",
        "CandlestickChart remains Financial Preview"
      ],
      dryRun: true,
      gateId: "h4",
      repoRoot: tempRepo
    });
    const manifest = JSON.parse(
      await readFile(
        join(tempRepo, "docs/release/evidence/owner-gates.json"),
        "utf8"
      )
    );

    expect(result.dryRun).toBe(true);
    expect(manifest.gates[0]).toMatchObject({
      status: "open"
    });
  });

  it("blocks H6 approval until H4, H5, and release evidence manifests are complete", async () => {
    const tempRepo = await createTempRepo();

    await expect(
      approveOwnerGate({
        approvedAt: "2026-05-06",
        approvedBy: "owner",
        decisions: [
          "Release candidate approved.",
          "Final semver approved.",
          "Final changelog approved.",
          "Docs freeze approved.",
          "Visual baseline freeze approved.",
          "Deprecation policy approved."
        ],
        gateId: "h6",
        repoRoot: tempRepo
      })
    ).rejects.toThrow("H6 cannot be approved yet");
  });
});

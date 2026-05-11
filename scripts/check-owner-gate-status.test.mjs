import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { getOwnerGateStatusCheck } from "./check-owner-gate-status.mjs";

const createTempRepo = async () => {
  const tempRepo = await mkdtemp(join(tmpdir(), "chartkit-gate-status-"));
  const evidenceDir = join(tempRepo, "docs/release/evidence");

  await mkdir(evidenceDir, { recursive: true });
  await writeFile(
    join(evidenceDir, "owner-gates.json"),
    JSON.stringify(
      {
        gates: [
          { id: "h5", status: "approved" },
          { id: "h6", status: "not-started" }
        ],
        schemaVersion: 1
      },
      null,
      2
    ),
    "utf8"
  );

  return tempRepo;
};

describe("owner gate status checker", () => {
  it("passes when the gate has the expected status", async () => {
    const repoRoot = await createTempRepo();

    await expect(
      getOwnerGateStatusCheck({
        expectedStatus: "approved",
        gateId: "h5",
        repoRoot
      })
    ).resolves.toMatchObject({
      code: 0,
      status: "match"
    });
  });

  it("fails when the gate has a different status", async () => {
    const repoRoot = await createTempRepo();

    await expect(
      getOwnerGateStatusCheck({
        expectedStatus: "approved",
        gateId: "h6",
        repoRoot
      })
    ).resolves.toMatchObject({
      code: 1,
      status: "mismatch"
    });
  });

  it("fails unknown gates as usage errors", async () => {
    const repoRoot = await createTempRepo();

    await expect(
      getOwnerGateStatusCheck({
        expectedStatus: "approved",
        gateId: "h7",
        repoRoot
      })
    ).resolves.toMatchObject({
      code: 2,
      status: "unknown-gate"
    });
  });
});

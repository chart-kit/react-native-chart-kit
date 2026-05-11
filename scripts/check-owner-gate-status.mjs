#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ownerGatesPath = "docs/release/evidence/owner-gates.json";

const readOwnerGates = async (repoRoot) =>
  JSON.parse(await readFile(path.join(repoRoot, ownerGatesPath), "utf8"));

export const getOwnerGateStatusCheck = async ({
  expectedStatus,
  gateId,
  repoRoot = process.cwd()
}) => {
  if (!gateId || !expectedStatus) {
    return {
      code: 2,
      message:
        "Usage: node scripts/check-owner-gate-status.mjs <gate-id> <expected-status>",
      status: "invalid-args"
    };
  }

  const manifest = await readOwnerGates(repoRoot);
  const gate = (manifest.gates ?? []).find((candidate) => candidate.id === gateId);

  if (!gate) {
    return {
      code: 2,
      message: `Unknown owner gate: ${gateId}`,
      status: "unknown-gate"
    };
  }

  const actualStatus = gate.status ?? "open";

  if (actualStatus !== expectedStatus) {
    return {
      code: 1,
      message: `${gateId} owner gate is ${actualStatus}; expected ${expectedStatus}.`,
      status: "mismatch"
    };
  }

  return {
    code: 0,
    message: `${gateId} owner gate is ${expectedStatus}.`,
    status: "match"
  };
};

export const main = async () => {
  const [gateId, expectedStatus] = process.argv.slice(2);
  const result = await getOwnerGateStatusCheck({ expectedStatus, gateId });
  const output = result.code === 0 ? console.log : console.error;

  output(result.message);
  process.exit(result.code);
};

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(2);
  });
}

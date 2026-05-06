import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const defaultRepoRoot = process.cwd();
const ownerGatesPath = "docs/release/evidence/owner-gates.json";
const h6EvidenceManifestPaths = [
  "docs/release/evidence/native-release-workflow.json",
  "docs/release/evidence/native-runtime-qa.json",
  "docs/release/evidence/native-accessibility-qa.json",
  "docs/release/evidence/native-performance-benchmark.json",
  "docs/release/evidence/skia-renderer-evidence.json"
];

const readOwnerGates = async (repoRoot) =>
  JSON.parse(await readFile(path.join(repoRoot, ownerGatesPath), "utf8"));

const readJson = async (repoRoot, relativePath) =>
  JSON.parse(await readFile(path.join(repoRoot, relativePath), "utf8"));

const writeOwnerGates = async (repoRoot, manifest) =>
  writeFile(
    path.join(repoRoot, ownerGatesPath),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8"
  );

const parseArgs = (argv) => {
  const options = {
    decisions: [],
    evidence: []
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const readValue = () => {
      const value = argv[index + 1];

      if (!value || value.startsWith("--")) {
        throw new Error(`${arg} requires a value`);
      }

      index += 1;
      return value;
    };

    if (arg === "--approved-at") {
      options.approvedAt = readValue();
    } else if (arg === "--approved-by") {
      options.approvedBy = readValue();
    } else if (arg === "--decision") {
      options.decisions.push(readValue());
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--evidence") {
      options.evidence.push(readValue());
    } else if (arg === "--gate") {
      options.gateId = readValue();
    } else if (arg === "--list") {
      options.list = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
};

const today = () => new Date().toISOString().slice(0, 10);

const getH6ApprovalBlockers = async ({ manifest, repoRoot }) => {
  const blockers = [];
  const gates = manifest.gates ?? [];
  const h4 = gates.find((gate) => gate.id === "h4");
  const h5 = gates.find((gate) => gate.id === "h5");

  if (h4?.status !== "approved") {
    blockers.push("H4 must be approved before H6");
  }

  if (h5?.status !== "approved") {
    blockers.push("H5 must be approved before H6");
  }

  for (const manifestPath of h6EvidenceManifestPaths) {
    let evidenceManifest;

    try {
      evidenceManifest = await readJson(repoRoot, manifestPath);
    } catch {
      blockers.push(`${manifestPath} must exist before H6`);
      continue;
    }

    if (evidenceManifest.status !== "complete") {
      blockers.push(`${manifestPath} must be complete before H6`);
    }

    if (Array.isArray(evidenceManifest.missingEvidence)) {
      for (const missing of evidenceManifest.missingEvidence) {
        blockers.push(`${manifestPath} missing: ${missing}`);
      }
    }
  }

  return blockers;
};

const getH5ApprovalBlockers = ({ manifest }) => {
  const h4 = (manifest.gates ?? []).find((gate) => gate.id === "h4");

  return h4?.status === "approved" ? [] : ["H4 must be approved before H5"];
};

export const listOwnerGates = async ({ repoRoot = defaultRepoRoot } = {}) => {
  const manifest = await readOwnerGates(repoRoot);

  return (manifest.gates ?? []).map((gate) => ({
    id: gate.id,
    name: gate.name,
    pendingDecisions: gate.pendingDecisions ?? [],
    status: gate.status ?? "open"
  }));
};

export const approveOwnerGate = async ({
  approvedAt = today(),
  approvedBy,
  decisions,
  dryRun = false,
  evidence = [],
  gateId,
  repoRoot = defaultRepoRoot
}) => {
  if (!gateId) {
    throw new Error("--gate is required");
  }

  if (!approvedBy) {
    throw new Error("--approved-by is required");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(approvedAt)) {
    throw new Error("--approved-at must use YYYY-MM-DD");
  }

  if (!Array.isArray(decisions) || decisions.length === 0) {
    throw new Error("At least one --decision is required");
  }

  const manifest = await readOwnerGates(repoRoot);
  const gateIndex = (manifest.gates ?? []).findIndex(
    (gate) => gate.id === gateId
  );

  if (gateIndex === -1) {
    throw new Error(`Unknown owner gate: ${gateId}`);
  }

  const gate = manifest.gates[gateIndex];
  const pendingDecisions = gate.pendingDecisions ?? [];

  if (decisions.length < pendingDecisions.length) {
    throw new Error(
      `${gateId} requires ${pendingDecisions.length} decisions; received ${decisions.length}`
    );
  }

  if (gateId === "h6") {
    const h6Blockers = await getH6ApprovalBlockers({ manifest, repoRoot });

    if (h6Blockers.length > 0) {
      throw new Error(`H6 cannot be approved yet: ${h6Blockers.join("; ")}`);
    }
  }

  if (gateId === "h5") {
    const h5Blockers = getH5ApprovalBlockers({ manifest });

    if (h5Blockers.length > 0) {
      throw new Error(`H5 cannot be approved yet: ${h5Blockers.join("; ")}`);
    }
  }

  const nextGate = {
    ...gate,
    approvedAt,
    approvedBy,
    decisions,
    evidence: [...new Set([...(gate.evidence ?? []), ...evidence])],
    status: "approved"
  };
  delete nextGate.pendingDecisions;

  const nextManifest = {
    ...manifest,
    gates: [...manifest.gates],
    lastUpdated: approvedAt
  };
  nextManifest.gates[gateIndex] = nextGate;

  if (!dryRun) {
    await writeOwnerGates(repoRoot, nextManifest);
  }

  return {
    dryRun,
    gate: nextGate,
    path: ownerGatesPath
  };
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));

  if (options.list) {
    const gates = await listOwnerGates();

    for (const gate of gates) {
      console.log(
        `${gate.id}\t${gate.status}\t${gate.name}\t${
          gate.pendingDecisions.length
        } pending decisions`
      );
    }

    return;
  }

  const result = await approveOwnerGate({
    approvedAt: options.approvedAt,
    approvedBy: options.approvedBy,
    decisions: options.decisions,
    dryRun: options.dryRun,
    evidence: options.evidence,
    gateId: options.gateId
  });

  console.log(
    `${result.dryRun ? "Would approve" : "Approved"} ${result.gate.id} in ${
      result.path
    }.`
  );
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    await main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

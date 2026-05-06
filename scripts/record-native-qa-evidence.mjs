import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { generateNativeQaChecklist } from "./generate-native-qa-checklists.mjs";

const defaultRepoRoot = process.cwd();
const checklistPath = "docs/release/native-qa-checklists.md";
const validStatuses = new Set([
  "blocked",
  "fail",
  "not-applicable",
  "partial",
  "pass",
  "pending"
]);
const matrixConfigs = {
  accessibility: {
    label: "Accessibility QA",
    completeSummary:
      "Native accessibility QA matrix is complete for required VoiceOver and TalkBack showcase pages.",
    manifestPath: "docs/release/evidence/native-accessibility-qa.json",
    path: "docs/release/evidence/native-accessibility-matrix.json"
  },
  performance: {
    label: "Native Performance",
    completeSummary:
      "Native performance matrix is complete for required iOS and Android release scenarios.",
    manifestPath: "docs/release/evidence/native-performance-benchmark.json",
    path: "docs/release/evidence/native-performance-matrix.json"
  },
  runtime: {
    label: "Runtime QA",
    completeSummary:
      "Native runtime QA matrix is complete for required iOS and Android showcase pages.",
    manifestPath: "docs/release/evidence/native-runtime-qa.json",
    path: "docs/release/evidence/native-runtime-matrix.json"
  },
  skia: {
    label: "Skia Renderer",
    completeSummary:
      "Skia renderer native install, renderer parity, and performance evidence matrix is complete.",
    manifestPath: "docs/release/evidence/skia-renderer-evidence.json",
    path: "docs/release/evidence/skia-renderer-matrix.json"
  }
};

const readJson = async (repoRoot, relativePath) =>
  JSON.parse(await readFile(path.join(repoRoot, relativePath), "utf8"));

const writeJson = async (repoRoot, relativePath, value) =>
  writeFile(
    path.join(repoRoot, relativePath),
    `${JSON.stringify(value, null, 2)}\n`,
    "utf8"
  );

const parseArgs = (argv) => {
  const options = {
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

    if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--details") {
      options.details = true;
    } else if (arg === "--evidence") {
      options.evidence.push(readValue());
    } else if (arg === "--list") {
      options.list = true;
    } else if (arg === "--matrix") {
      options.matrix = readValue();
    } else if (arg === "--notes") {
      options.notes = readValue();
    } else if (arg === "--row") {
      options.rowId = readValue();
    } else if (arg === "--status") {
      options.status = readValue();
    } else if (arg === "--updated") {
      options.updated = readValue();
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
};

const getMatrixConfig = (matrixName) => {
  const config = matrixConfigs[matrixName];

  if (!config) {
    throw new Error(
      `Unknown matrix "${matrixName}". Use one of: ${Object.keys(
        matrixConfigs
      ).join(", ")}.`
    );
  }

  return config;
};

const getToday = () => new Date().toISOString().slice(0, 10);

const pathExists = async (repoRoot, relativePath) => {
  try {
    await access(path.join(repoRoot, relativePath));
    return true;
  } catch {
    return false;
  }
};

const isExternalEvidenceLink = (value) => /^https?:\/\//.test(value);

const getMatrixStatus = (rows) => {
  if (rows.every((row) => row.status === "pass")) {
    return "complete";
  }

  if (rows.some((row) => row.status === "fail")) {
    return "fail";
  }

  if (rows.some((row) => row.status === "blocked")) {
    return "blocked";
  }

  if (rows.some((row) => ["partial", "pass"].includes(row.status))) {
    return "partial";
  }

  return "pending";
};

const getManifestStatus = (matrixStatus) => {
  if (matrixStatus === "complete") {
    return "complete";
  }

  if (matrixStatus === "blocked" || matrixStatus === "fail") {
    return "blocked";
  }

  return "partial";
};

const getManifestMissingEvidence = (rows) =>
  rows
    .filter((row) => row.status !== "pass")
    .map(
      (row) =>
        `${row.id} is ${row.status}; evidence is required before this matrix can be complete.`
    );

const syncEvidenceManifest = async ({
  config,
  matrix,
  matrixStatus,
  repoRoot,
  updated
}) => {
  const manifest = await readJson(repoRoot, config.manifestPath);
  const manifestStatus = getManifestStatus(matrixStatus);
  const complete = manifestStatus === "complete";
  const nextManifest = {
    ...manifest,
    lastUpdated: updated,
    missingEvidence: complete ? [] : getManifestMissingEvidence(matrix.rows),
    status: manifestStatus,
    summary: complete ? config.completeSummary : manifest.summary
  };

  return nextManifest;
};

const getRowTarget = (matrix, row) => {
  const page = matrix.pages?.find((item) => item.id === row.pageId);
  const platform = matrix.platforms?.find((item) => item.id === row.platform);
  const assistiveTech = matrix.assistiveTech?.find(
    (item) => item.id === row.assistiveTechId
  );
  const scenario = matrix.scenarios?.find((item) => item.id === row.scenarioId);

  return [
    platform?.label ??
      assistiveTech?.label ??
      row.platform ??
      row.assistiveTechId,
    page?.title ?? scenario?.label ?? row.pageId ?? row.scenarioId
  ]
    .filter(Boolean)
    .join(" / ");
};

const getRowRequiredCheckGroups = (matrix, row) => {
  const page = matrix.pages?.find((item) => item.id === row.pageId);

  return Array.isArray(page?.requiredCheckGroups)
    ? page.requiredCheckGroups
    : [];
};

const getRowRequiredChecks = (matrix, row) => {
  const requiredCheckGroups = getRowRequiredCheckGroups(matrix, row);
  const groupChecks = requiredCheckGroups.flatMap((groupId) => {
    const checks = matrix.checkGroups?.[groupId] ?? [];

    return checks.map((check) => `${groupId}: ${check}`);
  });
  const scenario = matrix.scenarios?.find((item) => item.id === row.scenarioId);
  const scenarioChecks = [
    scenario?.requiredDataSize
      ? `scenario: data size ${scenario.requiredDataSize}`
      : "",
    scenario?.interaction
      ? `scenario: interaction ${scenario.interaction}`
      : "",
    scenario?.requiredEvidence
      ? `scenario: evidence ${scenario.requiredEvidence}`
      : ""
  ].filter(Boolean);
  const metricChecks = Array.isArray(matrix.metrics)
    ? matrix.metrics.map((metric) => `metric: ${metric}`)
    : [];

  return [...groupChecks, ...scenarioChecks, ...metricChecks];
};

export const listNativeQaRows = async ({
  includeDetails = false,
  matrixName,
  repoRoot = defaultRepoRoot
}) => {
  const config = getMatrixConfig(matrixName);
  const matrix = await readJson(repoRoot, config.path);

  return matrix.rows.map((row) => ({
    checks: includeDetails ? getRowRequiredChecks(matrix, row) : [],
    evidence: row.evidence ?? [],
    id: row.id,
    requiredCheckGroups: includeDetails
      ? getRowRequiredCheckGroups(matrix, row)
      : [],
    status: row.status,
    target: getRowTarget(matrix, row)
  }));
};

export const recordNativeQaEvidence = async ({
  dryRun = false,
  evidence = [],
  matrixName,
  notes,
  repoRoot = defaultRepoRoot,
  rowId,
  status,
  updated = getToday()
}) => {
  const config = getMatrixConfig(matrixName);

  if (!rowId) {
    throw new Error("--row is required");
  }

  if (!validStatuses.has(status)) {
    throw new Error(
      `--status must be one of: ${[...validStatuses].sort().join(", ")}`
    );
  }

  if (["partial", "pass"].includes(status) && evidence.length === 0) {
    throw new Error(
      "--evidence is required when --status partial or pass is used"
    );
  }

  if (["partial", "pass"].includes(status)) {
    const missingLocalEvidence = [];

    for (const evidenceItem of evidence) {
      if (
        !isExternalEvidenceLink(evidenceItem) &&
        !(await pathExists(repoRoot, evidenceItem))
      ) {
        missingLocalEvidence.push(evidenceItem);
      }
    }

    if (missingLocalEvidence.length > 0) {
      throw new Error(
        `Evidence file does not exist: ${missingLocalEvidence.join(", ")}`
      );
    }
  }

  const matrix = await readJson(repoRoot, config.path);
  const rowIndex = matrix.rows.findIndex((row) => row.id === rowId);

  if (rowIndex === -1) {
    throw new Error(`Unknown ${config.label} row: ${rowId}`);
  }

  const nextRow = {
    ...matrix.rows[rowIndex],
    evidence,
    status
  };

  if (notes) {
    nextRow.notes = notes;
  } else {
    delete nextRow.notes;
  }

  const nextRows = [...matrix.rows];
  nextRows[rowIndex] = nextRow;
  const nextMatrix = {
    ...matrix,
    lastUpdated: updated,
    rows: nextRows,
    status: getMatrixStatus(nextRows)
  };
  const nextManifest = await syncEvidenceManifest({
    config,
    matrix: nextMatrix,
    matrixStatus: nextMatrix.status,
    repoRoot,
    updated
  });

  if (!dryRun) {
    await writeJson(repoRoot, config.path, nextMatrix);
    await writeJson(repoRoot, config.manifestPath, nextManifest);
    await writeFile(
      path.join(repoRoot, checklistPath),
      await generateNativeQaChecklist({ repoRoot }),
      "utf8"
    );
  }

  return {
    checklistPath,
    dryRun,
    manifestPath: config.manifestPath,
    manifestStatus: nextManifest.status,
    matrixPath: config.path,
    row: nextRow,
    status: nextMatrix.status
  };
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));

  if (!options.matrix) {
    throw new Error("--matrix is required");
  }

  if (options.list) {
    const rows = await listNativeQaRows({
      includeDetails: options.details,
      matrixName: options.matrix
    });

    for (const row of rows) {
      console.log(
        `${row.id}\t${row.status}\t${row.target}\t${
          row.evidence.length > 0 ? row.evidence.join(", ") : "no evidence"
        }`
      );

      if (options.details) {
        for (const check of row.checks) {
          console.log(`  - ${check}`);
        }
      }
    }

    return;
  }

  const result = await recordNativeQaEvidence({
    dryRun: options.dryRun,
    evidence: options.evidence,
    matrixName: options.matrix,
    notes: options.notes,
    rowId: options.rowId,
    status: options.status,
    updated: options.updated
  });

  console.log(
    `${result.dryRun ? "Would update" : "Updated"} ${result.matrixPath} row ${
      result.row.id
    } to ${result.row.status}.`
  );

  if (!result.dryRun) {
    console.log(`Regenerated ${result.checklistPath}.`);
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    await main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { generateNativeQaChecklist } from "./generate-native-qa-checklists.mjs";
import {
  getNativeQaManifestStatus,
  getNativeQaMatrixConfig,
  getNativeQaMatrixStatus,
  getNativeQaMissingEvidence,
  validNativeQaStatuses
} from "./native-qa-matrix-config.mjs";

const defaultRepoRoot = process.cwd();
const checklistPath = "docs/release/native-qa-checklists.md";

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
    evidence: [],
    review: {}
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
    } else if (arg === "--build-surface") {
      options.review.buildSurface = readValue();
    } else if (arg === "--device") {
      options.review.device = readValue();
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
    } else if (arg === "--reviewed-by") {
      options.review.reviewedBy = readValue();
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

const syncEvidenceManifest = async ({
  config,
  matrix,
  matrixStatus,
  repoRoot,
  updated
}) => {
  const manifest = await readJson(repoRoot, config.manifestPath);
  const manifestStatus = getNativeQaManifestStatus(matrixStatus);
  const complete = manifestStatus === "complete";
  const nextManifest = {
    ...manifest,
    lastUpdated: updated,
    missingEvidence: complete ? [] : getNativeQaMissingEvidence(matrix.rows),
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

const createShowcaseLaunchUrl = ({ pageId, storyId }) => {
  const params = new URLSearchParams();
  params.set("view", "charts");

  if (storyId) {
    params.set("story", storyId);
  } else if (pageId) {
    params.set("page", pageId);
  } else {
    return "";
  }

  return `chartkitshowcase://showcase?${params.toString()}`;
};

const getRowLaunchTarget = (matrix, row) => {
  const page = matrix.pages?.find((item) => item.id === row.pageId);
  const scenario = matrix.scenarios?.find((item) => item.id === row.scenarioId);
  const showcasePageId = page?.showcasePageId;
  const showcaseStoryId = scenario?.showcaseStoryId;

  return {
    launchUrl: createShowcaseLaunchUrl({
      pageId: showcasePageId,
      storyId: showcaseStoryId
    }),
    showcasePageId,
    showcaseStoryId
  };
};

const getRowRequiredCheckGroups = (matrix, row) =>
  matrix.pages?.find((item) => item.id === row.pageId)?.requiredCheckGroups ??
  [];

const getRowExpectedStoryMetrics = (matrix, row) =>
  matrix.scenarios?.find((item) => item.id === row.scenarioId)
    ?.expectedStoryMetrics;

const formatExpectedStoryMetrics = (metrics) => {
  if (!metrics) {
    return "";
  }

  return [
    metrics.chartType && `chart ${metrics.chartType}`,
    Number.isFinite(metrics.totalPoints) &&
      `${metrics.totalPoints.toLocaleString("en-US")} total`,
    Number.isFinite(metrics.visiblePoints) &&
      `${metrics.visiblePoints.toLocaleString("en-US")} visible`,
    Number.isFinite(metrics.seriesCount) &&
      `${metrics.seriesCount.toLocaleString("en-US")} series`
  ]
    .filter(Boolean)
    .join("; ");
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
    scenario?.expectedStoryMetrics
      ? `scenario: expected story metrics ${formatExpectedStoryMetrics(
          scenario.expectedStoryMetrics
        )}`
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
  const config = getNativeQaMatrixConfig(matrixName);
  const matrix = await readJson(repoRoot, config.path);

  return matrix.rows.map((row) => ({
    checks: includeDetails ? getRowRequiredChecks(matrix, row) : [],
    evidence: row.evidence ?? [],
    expectedStoryMetrics: includeDetails
      ? getRowExpectedStoryMetrics(matrix, row)
      : undefined,
    id: row.id,
    ...getRowLaunchTarget(matrix, row),
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
  review = {},
  rowId,
  status,
  updated = getToday()
}) => {
  const config = getNativeQaMatrixConfig(matrixName);

  if (!rowId) {
    throw new Error("--row is required");
  }

  if (!validNativeQaStatuses.has(status)) {
    throw new Error(
      `--status must be one of: ${[...validNativeQaStatuses].sort().join(", ")}`
    );
  }

  if (["partial", "pass"].includes(status) && evidence.length === 0) {
    throw new Error(
      "--evidence is required when --status partial or pass is used"
    );
  }

  if (status === "pass") {
    const missingReviewFields = [
      ["reviewedBy", "--reviewed-by"],
      ["device", "--device"],
      ["buildSurface", "--build-surface"]
    ]
      .filter(([field]) => typeof review[field] !== "string" || !review[field])
      .map(([, arg]) => arg);

    if (missingReviewFields.length > 0) {
      throw new Error(
        `--status pass requires ${missingReviewFields.join(", ")}`
      );
    }

    if (!notes) {
      throw new Error("--notes is required when --status pass is used");
    }
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

  if (notes) nextRow.notes = notes;
  else delete nextRow.notes;

  if (status === "pass") {
    nextRow.review = {
      buildSurface: review.buildSurface,
      device: review.device,
      reviewedAt: updated,
      reviewedBy: review.reviewedBy
    };
  } else {
    delete nextRow.review;
  }

  const nextRows = [...matrix.rows];
  nextRows[rowIndex] = nextRow;
  const nextMatrix = {
    ...matrix,
    lastUpdated: updated,
    rows: nextRows,
    status: getNativeQaMatrixStatus(nextRows)
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
        if (row.launchUrl) {
          console.log(`  launch: ${row.launchUrl}`);
        }

        if (row.showcasePageId) {
          console.log(`  showcase page: ${row.showcasePageId}`);
        }

        if (row.showcaseStoryId) {
          console.log(`  showcase story: ${row.showcaseStoryId}`);
        }

        if (row.expectedStoryMetrics) {
          console.log(
            `  expected story metrics: ${formatExpectedStoryMetrics(
              row.expectedStoryMetrics
            )}`
          );
        }

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
